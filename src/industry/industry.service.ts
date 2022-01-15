import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { pipe } from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as TE from 'fp-ts/TaskEither'
import { Repository } from 'typeorm'

import { Industry } from '../entities/'
import { selectIdentifyNumberFromInsert, validateProps } from '../utils'
import type { Props } from './type'
import { PropsCodec } from './type'

@Injectable()
export class IndustryService {
  constructor(
    @InjectRepository(Industry)
    private readonly industryRepository: Repository<Industry>,
  ) {}

  findIndustryByName(props: Props): TE.TaskEither<HttpException, Props> {
    return pipe(
      TE.tryCatch(
        () => this.industryRepository.findOne({ where: { name: props.name } }),
        () =>
          new InternalServerErrorException(
            `DB access failed with findOne name: ${props.name}`,
          ),
      ),
      TE.chain((result) =>
        // NOTE: 存在する場合 = 重複データありなので失敗扱い
        TE.fromOptionK(
          () =>
            new ConflictException(
              `industry ${result.name} is already existed.`,
            ),
        )(() => O.some(props))(),
      ),
    )
  }

  addIndustry(props: Props): TE.TaskEither<HttpException, Industry> {
    return pipe(
      validateProps(props, PropsCodec),
      TE.chain(() => this.findIndustryByName(props)),
      TE.chain((correctProps) =>
        TE.tryCatch(
          () => this.industryRepository.insert(correctProps),
          () =>
            new InternalServerErrorException(
              `DB access failed with insert props: ${correctProps.name}`,
            ),
        ),
      ),
      TE.chain((payload) => selectIdentifyNumberFromInsert(payload)),
      TE.chain((insertedObjectID) =>
        TE.tryCatch(
          () =>
            this.industryRepository.findOne({
              where: {
                id: insertedObjectID,
              },
            }),
          () =>
            new InternalServerErrorException(
              `DB access failed with findOne id: ${insertedObjectID}`,
            ),
        ),
      ),
    )
  }

  updateIndustry(
    id: number,
    props: Props,
  ): TE.TaskEither<HttpException, Industry> {
    return pipe(
      validateProps(props, PropsCodec),
      TE.chain(() => this.findIndustryByName(props)),
      TE.chain(() => this.getIndustry(id)),
      TE.chain((updateTarget) =>
        TE.tryCatch(
          () =>
            this.industryRepository.save({
              id: updateTarget.id,
              name: props.name,
            }),
          () =>
            new InternalServerErrorException(
              `DB access failed with save id: ${updateTarget.id}, name: ${props.name}`,
            ),
        ),
      ),
    )
  }

  getIndustyList(): TE.TaskEither<HttpException, Industry[]> {
    return TE.tryCatch(
      () => this.industryRepository.find(),
      () => new InternalServerErrorException('DB access failed with find'),
    )
  }

  getIndustry(id: number): TE.TaskEither<HttpException, Industry> {
    return pipe(
      TE.tryCatch(
        () =>
          this.industryRepository.findOne({
            where: {
              id: id,
            },
          }),
        () =>
          new InternalServerErrorException(
            `DB access failed with findOne id: ${id}`,
          ),
      ),
      // NOTE: findOneのresultはIndustryではなくOption<Industry>
      TE.chainOptionK(
        () => new NotFoundException(`industry id: ${id} is not found`),
      )((payload) => O.fromNullable(payload)),
    )
  }

  deleteIndustry(id: number): TE.TaskEither<HttpException, number> {
    return pipe(
      this.getIndustry(id),
      TE.chain((targetIndustry) =>
        TE.tryCatch(
          () => this.industryRepository.delete(targetIndustry.id),
          () =>
            new InternalServerErrorException(
              `DB access failed with delete id: ${targetIndustry.id}`,
            ),
        ),
      ),
      TE.map(() => id),
    )
  }
}
