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
import { Cashflow } from './../entities'
import type { Props } from './type'
import { PropsCodec } from './type'

@Injectable()
export class CashflowService {
  constructor(
    @InjectRepository(Cashflow)
    private readonly cashflowRepository: Repository<Cashflow>,
  ) {}

  rejectSameCashflow(
    props: Props,
    finantialID: number,
  ): TE.TaskEither<HttpException, Props> {
    return pipe(
      TE.tryCatch(
        () =>
          this.cashflowRepository.findOne({
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
          () => new ConflictException(`Cashflow ${result} is already existed.`),
        )(() => O.some(props))(),
      ),
    )
  }

  addCashflow(
    props: Props,
    finantialID: number,
  ): TE.TaskEither<HttpException, Cashflow> {
    return pipe(
      validateProps(props, 'Cashflow', PropsCodec),
      TE.chain(() => this.rejectSameCashflow(props, finantialID)),
      TE.chain((correctProps) =>
        TE.tryCatch(
          () =>
            this.cashflowRepository.insert(
              Object.assign(correctProps, { finantialID: finantialID }),
            ),
          () =>
            new NotFoundException(
              `DB access failed with insert Cashflow ${correctProps}`,
            ),
        ),
      ),
      TE.chain((payload) => selectIdentifyNumberFromInsert(payload)),
      TE.chain((insertedObjectID) =>
        TE.tryCatch(
          () =>
            this.cashflowRepository.findOne({
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

  updateCashflow(
    props: Props,
    id: number,
    finantialID: number,
  ): TE.TaskEither<HttpException, Cashflow> {
    return pipe(
      validateProps(props, 'Cashflow', PropsCodec),
      TE.chain(() => this.rejectSameCashflow(props, finantialID)),
      TE.chain(() => this.getCashflow(id, finantialID)),
      TE.chain((updateTarget) =>
        TE.tryCatch(
          () =>
            this.cashflowRepository.save({
              ...props,
              finantialID: finantialID,
              id: updateTarget.id,
            }),
          () =>
            new NotFoundException(
              `DB access failed with save Cashflow props: ${updateTarget}, id: ${id}`,
            ),
        ),
      ),
    )
  }

  getCashflowList(
    finantialID: number,
  ): TE.TaskEither<HttpException, Cashflow[]> {
    return TE.tryCatch(
      () =>
        this.cashflowRepository.find({
          where: { finantialID: finantialID },
        }),
      () => new InternalServerErrorException(`DB access failed with find`),
    )
  }

  getCashflow(
    id: number,
    finantialID: number,
  ): TE.TaskEither<HttpException, Cashflow> {
    return pipe(
      TE.tryCatch(
        () =>
          this.cashflowRepository.findOne({
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
      // NOTE: findOneのresultはCashflowではなくOption<Cashflow>
      TE.chainOptionK(
        () =>
          new NotFoundException(
            `Cashflow id: ${id}, finantialID: ${finantialID}  is not found`,
          ),
      )((payload) => O.fromNullable(payload)),
    )
  }

  deleteCashflow(
    id: number,
    finantialID: number,
  ): TE.TaskEither<HttpException, number> {
    return pipe(
      this.getCashflow(id, finantialID),
      TE.chain((targetCompany) =>
        TE.tryCatch(
          () => this.cashflowRepository.delete(targetCompany.id),
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
