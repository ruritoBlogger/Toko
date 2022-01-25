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
import { BalanceSheet } from './../entities'
import type { Props } from './type'
import { PropsCodec } from './type'

@Injectable()
export class BalanceSheetService {
  constructor(
    @InjectRepository(BalanceSheet)
    private readonly balanceSheetRepository: Repository<BalanceSheet>,
  ) {}

  rejectSameSheet(
    props: Props,
    finantialID: number,
  ): TE.TaskEither<HttpException, Props> {
    return pipe(
      TE.tryCatch(
        () =>
          this.balanceSheetRepository.findOne({
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
          () =>
            new ConflictException(`BalanceSheet ${result} is already existed.`),
        )(() => O.some(props))(),
      ),
    )
  }

  addSheet(
    props: Props,
    finantialID: number,
  ): TE.TaskEither<HttpException, BalanceSheet> {
    return pipe(
      validateProps(props, PropsCodec),
      TE.chain(() => this.rejectSameSheet(props, finantialID)),
      TE.chain((correctProps) =>
        TE.tryCatch(
          () =>
            this.balanceSheetRepository.insert(
              Object.assign(correctProps, { finantialID: finantialID }),
            ),
          () =>
            new NotFoundException(
              `DB access failed with insert BalanceSheet ${correctProps}`,
            ),
        ),
      ),
      TE.chain((payload) => selectIdentifyNumberFromInsert(payload)),
      TE.chain((insertedObjectID) =>
        TE.tryCatch(
          () =>
            this.balanceSheetRepository.findOne({
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

  updateSheet(
    props: Props,
    id: number,
    finantialID: number,
  ): TE.TaskEither<HttpException, BalanceSheet> {
    return pipe(
      validateProps(props, PropsCodec),
      TE.chain(() => this.rejectSameSheet(props, finantialID)),
      TE.chain(() => this.getSheet(id, finantialID)),
      TE.chain((updateTarget) =>
        TE.tryCatch(
          () =>
            this.balanceSheetRepository.save({
              ...props,
              finantialID: finantialID,
              id: updateTarget.id,
            }),
          () =>
            new NotFoundException(
              `DB access failed with save BalanceSheet props: ${updateTarget}, id: ${id}`,
            ),
        ),
      ),
    )
  }

  getSheetList(
    finantialID: number,
  ): TE.TaskEither<HttpException, BalanceSheet[]> {
    return TE.tryCatch(
      () =>
        this.balanceSheetRepository.find({
          where: { finantialID: finantialID },
        }),
      () => new InternalServerErrorException(`DB access failed with find`),
    )
  }

  getSheet(
    id: number,
    finantialID: number,
  ): TE.TaskEither<HttpException, BalanceSheet> {
    return pipe(
      TE.tryCatch(
        () =>
          this.balanceSheetRepository.findOne({
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
      // NOTE: findOneのresultはBalanceSheetではなくOption<BalanceSheet>
      TE.chainOptionK(
        () =>
          new NotFoundException(
            `BalanceSheet id: ${id}, finantialID: ${finantialID}  is not found`,
          ),
      )((payload) => O.fromNullable(payload)),
    )
  }

  deleteSheet(
    id: number,
    finantialID: number,
  ): TE.TaskEither<HttpException, number> {
    return pipe(
      this.getSheet(id, finantialID),
      TE.chain((targetCompany) =>
        TE.tryCatch(
          () => this.balanceSheetRepository.delete(targetCompany.id),
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