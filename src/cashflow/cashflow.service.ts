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
            `DB access failed when reject same CashFlow with findOne finantialID: ${finantialID}`,
          ),
      ),
      TE.chain((result) =>
        // NOTE: 存在する場合 = 重複データありなので失敗扱い
        TE.fromOptionK(
          () =>
            new ConflictException(
              `Cashflow already existed when reject same cashflow: ${JSON.stringify(
                result,
              )}`,
            ),
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
            new InternalServerErrorException(
              `DB access failed when addCashFlow with insert Cashflow ${JSON.stringify(
                correctProps,
              )}`,
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
              `DB access failed when addCashFlow with findOne props: ${JSON.stringify(
                props,
              )}`,
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
            new InternalServerErrorException(
              `DB access failed when updateCashFlow with save Cashflow props: ${JSON.stringify(
                updateTarget,
              )}, id: ${id}`,
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
      () =>
        new InternalServerErrorException(
          `DB access failed when getCashFlowList with find`,
        ),
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
            `DB access failed when getCashFlow with findOne id: ${id}, finantialID: ${finantialID}`,
          ),
      ),
      // NOTE: findOneのresultはCashflowではなくOption<Cashflow>
      TE.chainOptionK(
        () =>
          new NotFoundException(
            `Cashflow id: ${id}, finantialID: ${finantialID}  is not found when getCashFlow`,
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
              `DB access failed when deleteCashFlow with delete id: ${targetCompany.id}`,
            ),
        ),
      ),
      TE.map(() => id),
    )
  }
}
