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
        (e) =>
          printException(
            e,
            new InternalServerErrorException(
              `DB access failed when reject same Index with findOne announcementDate: ${props.announcementDate}, industryID: ${industryID}`,
            ),
          ),
      ),
      TE.chain((result) =>
        // NOTE: 存在する場合 = 重複データありなので失敗扱い
        TE.fromOptionK(
          () =>
            new ConflictException(
              `IndustryAveIndex already existed when reject same index: ${JSON.stringify(
                result,
              )}`,
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
      validateProps(props, 'IndustryAveIndex', PropsCodec),
      TE.chain(() => this.rejectSameIndex(props, industryID)),
      TE.chain((correctProps) =>
        TE.tryCatch(
          () =>
            this.industryAveIndexRepository.insert(
              Object.assign(correctProps, { industryID: industryID }),
            ),
          (e) =>
            printException(
              e,
              new InternalServerErrorException(
                `DB access failed when addIndex with insert IndustryAveIndex: ${JSON.stringify(
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
            this.industryAveIndexRepository.findOne({
              where: {
                id: insertedObjectID,
              },
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
    industryID: number,
  ): TE.TaskEither<HttpException, IndustryAveIndex> {
    return pipe(
      validateProps(props, 'IndustryAveIndex', PropsCodec),
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
          (e) =>
            printException(
              e,
              new InternalServerErrorException(
                `DB access failed when updateIndex with save IndustryAveIndex props: ${JSON.stringify(
                  updateTarget,
                )}, industryID: ${industryID}, id: ${id}`,
              ),
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
        (e) =>
          printException(
            e,
            new InternalServerErrorException(
              `DB access failed when getIndex with findOne id: ${id}`,
            ),
          ),
      ),
      // NOTE: findOneのresultはIndustryAveIndexではなくOption<IndustryAveIndex>
      TE.chainOptionK(
        () =>
          new NotFoundException(
            `industryAveIndex id: ${id} is not found when getIndex`,
          ),
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
      // NOTE: maybeCurrentIndexはIndustryAveIndexではなくOption<IndustryAveIndex>
      TE.chainOptionK(
        () =>
          new NotFoundException(
            `industryAveIndex industryID: ${industryID} is not found when getCurrentIndex`,
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
          (e) =>
            printException(
              e,
              new InternalServerErrorException(
                `DB access failed when deleteIndex with delete id: ${targetIndex.id}`,
              ),
            ),
        ),
      ),
      TE.map(() => id),
    )
  }
}
