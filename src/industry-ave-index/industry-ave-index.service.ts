import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as TE from 'fp-ts/TaskEither'
import { Repository } from 'typeorm'

import { selectIdentifyNumberFromInsert, validateProps } from '../utils'
import { IndustryAveIndex } from './../entities/industry-ave-index.entity'
import type { Props } from './type'
import { PropsCodec } from './type'

@Injectable()
export class IndustryAveIndexService {
  constructor(
    @InjectRepository(IndustryAveIndex)
    private readonly industryAveIndexRepository: Repository<IndustryAveIndex>,
  ) {}

  findSameIndex(
    announcementDate: Date,
    industryID: number,
  ): TE.TaskEither<HttpException, boolean> {
    return pipe(
      TE.tryCatch(
        () =>
          this.industryAveIndexRepository.findOne({
            where: { announcementDate, industryID },
          }),
        () =>
          new InternalServerErrorException(
            `DB access failed with findOne announcementDate: ${announcementDate}, industryID: ${industryID}`,
          ),
      ),
      TE.map((result) => !!result),
    )
  }

  addIndex(props: Props): TE.TaskEither<HttpException, IndustryAveIndex> {
    return pipe(
      validateProps(props, PropsCodec),
      TE.map(() =>
        this.findSameIndex(props.announcementDate, props.industryID),
      ),
      TE.map((isIndexExist) =>
        pipe(
          isIndexExist
            ? E.left(
                new ConflictException(
                  `IndustryAveIndex props: ${props} is already existed.`,
                ),
              )
            : E.right(true),
          TE.fromEither,
        ),
      ),
      // mapが流れてくる === データの重複が無いと判断
      // FIXME: 汚い
      TE.bind('payload', () =>
        pipe(
          TE.tryCatch(
            () => this.industryAveIndexRepository.insert(props),
            () =>
              new InternalServerErrorException(
                `DB access failed with insert props: ${props}`,
              ),
          ),
        ),
      ),
      TE.bind('insertedObjectID', ({ payload }) =>
        selectIdentifyNumberFromInsert(payload),
      ),
      TE.map(({ insertedObjectID }) =>
        TE.tryCatch(
          () =>
            this.industryAveIndexRepository.findOne({
              where: {
                id: insertedObjectID,
              },
            }),
          () =>
            new InternalServerErrorException(
              `DB access failed with findOne props: ${props}`,
            ),
        ),
      ),
      TE.flatten,
    )
  }

  updateIndex(
    id: number,
    props: Props,
  ): TE.TaskEither<HttpException, IndustryAveIndex> {
    return pipe(
      validateProps(props, PropsCodec),
      TE.map(() =>
        this.findSameIndex(props.announcementDate, props.industryID),
      ),
      TE.map((isSameIndexExist) =>
        pipe(
          isSameIndexExist
            ? E.left(
                new ConflictException(
                  `IndustryAveIndex props: ${props} is already existed.`,
                ),
              )
            : E.right(true),
          TE.fromEither,
        ),
      ),
      // mapが流れてくる === 名前の重複が無い
      TE.bind('updateTarget', () => this.getIndex(id)),
      TE.map(({ updateTarget }) =>
        TE.tryCatch(
          () =>
            this.industryAveIndexRepository.save({
              ...props,
              id: updateTarget.id,
            }),
          () =>
            new InternalServerErrorException(
              `DB access failed with save props: ${props}, ID: ${updateTarget.id}`,
            ),
        ),
      ),
      TE.flatten,
    )
  }

  getIndexList(): TE.TaskEither<HttpException, IndustryAveIndex[]> {
    return TE.tryCatch(
      () => this.industryAveIndexRepository.find(),
      () => new InternalServerErrorException(`DB access failed with find`),
    )
  }

  getIndex(id: number): TE.TaskEither<HttpException, IndustryAveIndex> {
    return pipe(
      TE.Do,
      TE.bind('payload', () =>
        TE.tryCatch(
          () =>
            this.industryAveIndexRepository.findOne({
              where: {
                id: id,
              },
            }),
          () =>
            new InternalServerErrorException(
              `DB access failed with findOne id: ${id}`,
            ),
        ),
      ),
      // NOTE:
      // findOneの返り値はIndustryAveIndexと評価されるが
      // 実際はundefinedが入るためnullチェックを挟む
      TE.map(({ payload }) =>
        TE.fromOptionK(
          () =>
            new NotFoundException(`industryAveIndex id: ${id} is not found`),
        )(() => O.fromNullable(payload))(),
      ),
      TE.flatten,
    )
  }

  deleteIndex(id: number): TE.TaskEither<HttpException, number> {
    return pipe(
      this.getIndex(id),
      // FIXME: bindする必要は無いが、mapだと削除されない
      TE.bind('result', (targetIndex) =>
        TE.tryCatch(
          () => this.industryAveIndexRepository.delete(targetIndex.id),
          () =>
            new InternalServerErrorException(
              `DB access failed with delete id: ${targetIndex.id}`,
            ),
        ),
      ),
      TE.map(() => id),
    )
  }
}
