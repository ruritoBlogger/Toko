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
import {
  printException,
  selectIdentifyNumberFromInsert,
  validateProps,
} from '../utils'
import type { Props } from './type'
import { PropsCodec } from './type'

@Injectable()
export class IndustryService {
  constructor(
    @InjectRepository(Industry)
    private readonly industryRepository: Repository<Industry>,
  ) {}

  rejectSameIndustry(props: Props): TE.TaskEither<HttpException, Props> {
    return pipe(
      TE.tryCatch(
        () => this.industryRepository.findOne({ where: { name: props.name } }),
        (e) =>
          printException(
            e,
            new InternalServerErrorException(
              `DB access failed when reject same industry with findOne name: ${props.name}`,
            ),
          ),
      ),
      TE.chain((result) =>
        // NOTE: 存在する場合 = 重複データありなので失敗扱い
        TE.fromOptionK(
          () =>
            new ConflictException(
              `industry already existed when reject same industry: ${JSON.stringify(
                result,
              )}`,
            ),
        )(() => O.some(props))(),
      ),
    )
  }

  addIndustry(props: Props): TE.TaskEither<HttpException, Industry> {
    return pipe(
      validateProps(props, 'Industry', PropsCodec),
      TE.chain(() => this.rejectSameIndustry(props)),
      TE.chain((correctProps) =>
        TE.tryCatch(
          () => this.industryRepository.insert(correctProps),
          (e) =>
            printException(
              e,
              new InternalServerErrorException(
                `DB access failed when addIndustry with insert props: ${JSON.stringify(
                  correctProps,
                )}`,
              ),
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
          (e) =>
            printException(
              e,
              new InternalServerErrorException(
                `DB access failed when addIndustry with findOne id: ${insertedObjectID}`,
              ),
            ),
        ),
      ),
    )
  }

  updateIndustry(
    props: Props,
    id: number,
  ): TE.TaskEither<HttpException, Industry> {
    return pipe(
      validateProps(props, 'Industry', PropsCodec),
      TE.chain(() => this.rejectSameIndustry(props)),
      TE.chain(() => this.getIndustry(id)),
      TE.chain((updateTarget) =>
        TE.tryCatch(
          () =>
            this.industryRepository.save({
              id: updateTarget.id,
              name: props.name,
            }),
          (e) =>
            printException(
              e,
              new InternalServerErrorException(
                `DB access failed when updateIndustry with save id: ${updateTarget.id}, name: ${props.name}`,
              ),
            ),
        ),
      ),
    )
  }

  getIndustyList(): TE.TaskEither<HttpException, Industry[]> {
    return TE.tryCatch(
      () => this.industryRepository.find(),
      (e) =>
        printException(
          e,
          new InternalServerErrorException(
            'DB access failed when getIndustryList with find',
          ),
        ),
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
        (e) =>
          printException(
            e,
            new InternalServerErrorException(
              `DB access failed when getIndustry with findOne id: ${id}`,
            ),
          ),
      ),
      // NOTE: findOneのresultはIndustryではなくOption<Industry>
      TE.chainOptionK(
        () =>
          new NotFoundException(
            `industry id: ${id} is not found when getIndustry`,
          ),
      )((payload) => O.fromNullable(payload)),
    )
  }

  deleteIndustry(id: number): TE.TaskEither<HttpException, number> {
    return pipe(
      this.getIndustry(id),
      TE.chain((targetIndustry) =>
        TE.tryCatch(
          () => this.industryRepository.delete(targetIndustry.id),
          (e) =>
            printException(
              e,
              new InternalServerErrorException(
                `DB access failed when deleteIndustry with delete id: ${targetIndustry.id}`,
              ),
            ),
        ),
      ),
      TE.map(() => id),
    )
  }
}
