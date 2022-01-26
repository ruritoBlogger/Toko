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

import { selectIdentifyNumberFromInsert, validateProps } from '../utils'
import { Index } from './../entities'
import type { Props } from './type'
import { PropsCodec } from './type'

@Injectable()
export class IndexService {
  constructor(
    @InjectRepository(Index)
    private readonly indexRepository: Repository<Index>,
  ) {}

  rejectSameIndex(
    props: Props,
    finantialID: number,
  ): TE.TaskEither<HttpException, Props> {
    return pipe(
      TE.tryCatch(
        () =>
          this.indexRepository.findOne({
            where: { finantialID: finantialID },
          }),
        () =>
          new InternalServerErrorException(
            `DB access failed with findOne finantialID: ${finantialID}`,
          ),
      ),
      TE.chain((result) =>
        // NOTE: 存在する場合 = 重複データありなので失敗扱い
        TE.fromOptionK(
          () => new ConflictException(`Index ${result} is already existed.`),
        )(() => O.some(props))(),
      ),
    )
  }

  addIndex(
    props: Props,
    finantialID: number,
  ): TE.TaskEither<HttpException, Index> {
    return pipe(
      validateProps(props, 'Index', PropsCodec),
      TE.chain(() => this.rejectSameIndex(props, finantialID)),
      TE.chain((correctProps) =>
        TE.tryCatch(
          () =>
            this.indexRepository.insert(
              Object.assign(correctProps, { finantialID: finantialID }),
            ),
          () =>
            new NotFoundException(
              `DB access failed with insert Index ${correctProps}`,
            ),
        ),
      ),
      TE.chain((payload) => selectIdentifyNumberFromInsert(payload)),
      TE.chain((insertedObjectID) =>
        TE.tryCatch(
          () =>
            this.indexRepository.findOne({
              where: { id: insertedObjectID },
            }),
          () =>
            new InternalServerErrorException(
              `DB access failed with findOne props: ${props}`,
            ),
        ),
      ),
    )
  }

  updateIndex(
    props: Props,
    id: number,
    finantialID: number,
  ): TE.TaskEither<HttpException, Index> {
    return pipe(
      validateProps(props, 'Index', PropsCodec),
      TE.chain(() => this.rejectSameIndex(props, finantialID)),
      TE.chain(() => this.getIndex(id, finantialID)),
      TE.chain((updateTarget) =>
        TE.tryCatch(
          () =>
            this.indexRepository.save({
              ...props,
              finantialID: finantialID,
              id: updateTarget.id,
            }),
          () =>
            new NotFoundException(
              `DB access failed with save Index props: ${updateTarget}, id: ${id}`,
            ),
        ),
      ),
    )
  }

  getIndexList(finantialID: number): TE.TaskEither<HttpException, Index[]> {
    return TE.tryCatch(
      () =>
        this.indexRepository.find({
          where: { finantialID: finantialID },
        }),
      () => new InternalServerErrorException(`DB access failed with find`),
    )
  }

  getIndex(
    id: number,
    finantialID: number,
  ): TE.TaskEither<HttpException, Index> {
    return pipe(
      TE.tryCatch(
        () =>
          this.indexRepository.findOne({
            where: {
              id: id,
              finantialID: finantialID,
            },
          }),
        () =>
          new InternalServerErrorException(
            `DB access failed with findOne id: ${id}, finantialID: ${finantialID}`,
          ),
      ),
      // NOTE: findOneのresultはIndexではなくOption<IncomeIndex>
      TE.chainOptionK(
        () =>
          new NotFoundException(
            `Index id: ${id}, finantialID: ${finantialID}  is not found`,
          ),
      )((payload) => O.fromNullable(payload)),
    )
  }

  deleteIndex(
    id: number,
    finantialID: number,
  ): TE.TaskEither<HttpException, number> {
    return pipe(
      this.getIndex(id, finantialID),
      TE.chain((targetCompany) =>
        TE.tryCatch(
          () => this.indexRepository.delete(targetCompany.id),
          () =>
            new InternalServerErrorException(
              `DB access failed with delete id: ${targetCompany.id}`,
            ),
        ),
      ),
      TE.map(() => id),
    )
  }
}
