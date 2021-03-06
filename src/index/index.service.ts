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

import {
  printException,
  selectIdentifyNumberFromInsert,
  validateProps,
} from '../utils'
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
        (e) =>
          printException(
            e,
            new InternalServerErrorException(
              `DB access failed when reject same index with findOne finantialID: ${finantialID}`,
            ),
          ),
      ),
      TE.chain((result) =>
        // NOTE: 存在する場合 = 重複データありなので失敗扱い
        TE.fromOptionK(
          () =>
            new ConflictException(
              `Index already existed when reject same index: ${JSON.stringify(
                result,
              )}`,
            ),
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
          (e) =>
            printException(
              e,
              new InternalServerErrorException(
                `DB access failed when addIndex with insert Index ${JSON.stringify(
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
            this.indexRepository.findOne({
              where: { id: insertedObjectID },
            }),
          (e) =>
            printException(
              e,
              new InternalServerErrorException(
                `DB access failed when addIndex with findOne props: ${JSON.stringify(
                  props,
                )}`,
              ),
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
          (e) =>
            printException(
              e,
              new InternalServerErrorException(
                `DB access failed when updateIndex with save Index props: ${JSON.stringify(
                  updateTarget,
                )}, id: ${id}`,
              ),
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
      (e) =>
        printException(
          e,
          new InternalServerErrorException(
            `DB access failed when getIndexList with find`,
          ),
        ),
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
        (e) =>
          printException(
            e,
            new InternalServerErrorException(
              `DB access failed when getIndex with findOne id: ${id}, finantialID: ${finantialID}`,
            ),
          ),
      ),
      // NOTE: findOneのresultはIndexではなくOption<IncomeIndex>
      TE.chainOptionK(
        () =>
          new NotFoundException(
            `Index id: ${id}, finantialID: ${finantialID}  is not found when getIndex`,
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
          (e) =>
            printException(
              e,
              new InternalServerErrorException(
                `DB access failed when deleteIndex with delete id: ${targetCompany.id}`,
              ),
            ),
        ),
      ),
      TE.map(() => id),
    )
  }
}
