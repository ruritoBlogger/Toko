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
import { FinantialStatements } from './../entities'
import type { Props } from './type'
import { PropsCodec } from './type'

@Injectable()
export class FinantialStatementsService {
  constructor(
    @InjectRepository(FinantialStatements)
    private readonly finantialStatementsRepository: Repository<FinantialStatements>,
  ) {}

  rejectSameStatements(
    props: Props,
    companyID: number,
  ): TE.TaskEither<HttpException, Props> {
    return pipe(
      TE.tryCatch(
        () =>
          this.finantialStatementsRepository.findOne({
            where: { announcementDate: props.announcementDate, companyID },
          }),
        () =>
          new InternalServerErrorException(
            `DB access failed with findOne announcementDate: ${props.announcementDate}, companyID: ${companyID}`,
          ),
      ),
      TE.chain((result) =>
        // NOTE: 存在する場合 = 重複データありなので失敗扱い
        TE.fromOptionK(
          () =>
            new ConflictException(
              `FinantialStatements ${result} is already existed.`,
            ),
        )(() => O.some(props))(),
      ),
    )
  }

  addStatements(
    props: Props,
    companyID: number,
  ): TE.TaskEither<HttpException, FinantialStatements> {
    return pipe(
      validateProps(props, 'FinantialStatements', PropsCodec),
      TE.chain(() => this.rejectSameStatements(props, companyID)),
      TE.chain((correctProps) =>
        TE.tryCatch(
          () =>
            this.finantialStatementsRepository.insert(
              Object.assign(correctProps, { companyID: companyID }),
            ),
          () =>
            new NotFoundException(
              `DB access failed with insert FinantialStatements ${correctProps}`,
            ),
        ),
      ),
      TE.chain((payload) => selectIdentifyNumberFromInsert(payload)),
      TE.chain((insertedObjectID) =>
        TE.tryCatch(
          () =>
            this.finantialStatementsRepository.findOne({
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

  updateStatements(
    props: Props,
    id: number,
    companyID: number,
  ): TE.TaskEither<HttpException, FinantialStatements> {
    return pipe(
      validateProps(props, 'FinantialStatements', PropsCodec),
      TE.chain(() => this.rejectSameStatements(props, companyID)),
      TE.chain(() => this.getStatements(id, companyID)),
      TE.chain((updateTarget) =>
        TE.tryCatch(
          () =>
            this.finantialStatementsRepository.save({
              ...props,
              companyID: companyID,
              id: updateTarget.id,
            }),
          () =>
            new NotFoundException(
              `DB access failed with save FinantialStatements props: ${updateTarget}, id: ${id}`,
            ),
        ),
      ),
    )
  }

  getStatementsList(
    companyID: number,
  ): TE.TaskEither<HttpException, FinantialStatements[]> {
    return TE.tryCatch(
      () =>
        this.finantialStatementsRepository.find({
          where: { companyID: companyID },
        }),
      () => new InternalServerErrorException(`DB access failed with find`),
    )
  }

  getStatements(
    id: number,
    companyID: number,
  ): TE.TaskEither<HttpException, FinantialStatements> {
    return pipe(
      TE.tryCatch(
        () =>
          this.finantialStatementsRepository.findOne({
            where: {
              id: id,
              companyID: companyID,
            },
          }),
        () =>
          new InternalServerErrorException(
            `DB access failed with findOne id: ${id}, companyID: ${companyID}`,
          ),
      ),
      // NOTE: findOneのresultはFinantialStatementsではなくOption<FinantialStatements>
      TE.chainOptionK(
        () =>
          new NotFoundException(
            `FinantialStatements id: ${id}, companyID: ${companyID}  is not found`,
          ),
      )((payload) => O.fromNullable(payload)),
    )
  }

  getCurrentStatements(
    companyID: number,
  ): TE.TaskEither<HttpException, FinantialStatements> {
    return pipe(
      this.getStatementsList(companyID),
      TE.map((statementsList) =>
        // NOTE: 一番announcementDateが最近のものを先頭にする
        statementsList
          .sort(
            (a, b) =>
              b.announcementDate.getTime() - a.announcementDate.getTime(),
          )
          .shift(),
      ),
      // NOTE: maybeStatementsはFinantialStatements型ではなくO.Option<FinantialStatements>型
      TE.chainOptionK(
        () =>
          new NotFoundException(
            `FinantialStatements companyID: ${companyID}  is not found`,
          ),
      )((maybeStatements) => O.fromNullable(maybeStatements)),
    )
  }

  deleteStatements(
    id: number,
    companyID: number,
  ): TE.TaskEither<HttpException, number> {
    return pipe(
      this.getStatements(id, companyID),
      TE.chain((targetCompany) =>
        TE.tryCatch(
          () => this.finantialStatementsRepository.delete(targetCompany.id),
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
