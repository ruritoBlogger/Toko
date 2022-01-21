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
import { IndustryAveIndex } from './../entities'
import type { Props } from './type'
import { PropsCodec } from './type'

@Injectable()
export class IndustryAveIndexService {
  constructor(
    @InjectRepository(IndustryAveIndex)
    private readonly industryAveIndexRepository: Repository<IndustryAveIndex>,
  ) {}

  rejectSameIndex(
    props: Props,
    industryID: number,
  ): TE.TaskEither<HttpException, Props> {
    return pipe(
      TE.tryCatch(
        () =>
          this.industryAveIndexRepository.findOne({
            where: { announcementDate: props.announcementDate, industryID },
          }),
        () =>
          new InternalServerErrorException(
            `DB access failed with findOne announcementDate: ${props.announcementDate}, industryID: ${industryID}`,
          ),
      ),
      TE.chain((result) =>
        // NOTE: 存在する場合 = 重複データありなので失敗扱い
        TE.fromOptionK(
          () =>
            new ConflictException(
              `IndustryAveIndex ${result} is already existed.`,
            ),
        )(() => O.some(props))(),
      ),
    )
  }

  addIndex(
    props: Props,
    industryID: number,
  ): TE.TaskEither<HttpException, IndustryAveIndex> {
    return pipe(
      validateProps(props, PropsCodec),
      TE.chain(() => this.rejectSameIndex(props, industryID)),
      TE.chain((correctProps) =>
        TE.tryCatch(
          () =>
            this.industryAveIndexRepository.insert(
              Object.assign(correctProps, { industryID: industryID }),
            ),
          () =>
            new NotFoundException(
              `DB access failed with insert IndustryAveIndex: ${correctProps}`,
            ),
        ),
      ),
      TE.chain((payload) => selectIdentifyNumberFromInsert(payload)),
      TE.chain((insertedObjectID) =>
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
    )
  }

  updateIndex(
    props: Props,
    id: number,
    industryID: number,
  ): TE.TaskEither<HttpException, IndustryAveIndex> {
    return pipe(
      validateProps(props, PropsCodec),
      TE.chain(() => this.rejectSameIndex(props, industryID)),
      TE.chain(() => this.getIndex(id, industryID)),
      TE.chain((updateTarget) =>
        TE.tryCatch(
          () =>
            this.industryAveIndexRepository.save({
              ...props,
              industryID: industryID,
              id: updateTarget.id,
            }),
          () =>
            new NotFoundException(
              `DB access failed with save IndustryAveIndex props: ${updateTarget}, industryID: ${industryID}, id: ${id}`,
            ),
        ),
      ),
    )
  }

  getIndexList(
    industryID: number,
  ): TE.TaskEither<HttpException, IndustryAveIndex[]> {
    return TE.tryCatch(
      () =>
        this.industryAveIndexRepository.find({
          where: { industryID: industryID },
        }),
      () => new InternalServerErrorException(`DB access failed with find`),
    )
  }

  getIndex(
    id: number,
    industryID: number,
  ): TE.TaskEither<HttpException, IndustryAveIndex> {
    return pipe(
      TE.tryCatch(
        () =>
          this.industryAveIndexRepository.findOne({
            where: {
              id: id,
              industryID: industryID,
            },
          }),
        () =>
          new InternalServerErrorException(
            `DB access failed with findOne id: ${id}`,
          ),
      ),
      // NOTE: findOneのresultはIndustryAveIndexではなくOption<IndustryAveIndex>
      TE.chainOptionK(
        () => new NotFoundException(`industryAveIndex id: ${id} is not found`),
      )((payload) => O.fromNullable(payload)),
    )
  }

  getCurrentIndex(
    industryID: number,
  ): TE.TaskEither<HttpException, IndustryAveIndex> {
    return pipe(
      this.getIndexList(industryID),
      TE.map((indexList) =>
        // NOTE: 一番announcementDateが最近のものを先頭にする
        indexList
          .sort(
            (a, b) =>
              b.announcementDate.getTime() - a.announcementDate.getTime(),
          )
          .shift(),
      ),
      TE.chainOptionK(
        () =>
          new NotFoundException(
            `industryAveIndex industryID: ${industryID} is not found`,
          ),
      )((maybeCurrentIndex) => O.fromNullable(maybeCurrentIndex)),
    )
  }

  deleteIndex(
    id: number,
    industryID: number,
  ): TE.TaskEither<HttpException, number> {
    return pipe(
      this.getIndex(id, industryID),
      TE.chain((targetIndex) =>
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
