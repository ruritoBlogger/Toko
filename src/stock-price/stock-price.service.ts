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
import { StockPrice } from './../entities'
import type { Props } from './type'
import { PropsCodec } from './type'

@Injectable()
export class StockPriceService {
  constructor(
    @InjectRepository(StockPrice)
    private readonly stockPriceRepository: Repository<StockPrice>,
  ) {}

  rejectSamePrice(
    props: Props,
    companyID: number,
  ): TE.TaskEither<HttpException, Props> {
    return pipe(
      TE.tryCatch(
        () =>
          this.stockPriceRepository.findOne({
            where: { date: props.date, companyID },
          }),
        (e) =>
          printException(
            e,
            new InternalServerErrorException(
              `DB access failed when reject same price with findOne announcementDate: ${props.date}, companyID: ${companyID}`,
            ),
          ),
      ),
      TE.chain((result) =>
        // NOTE: 存在する場合 = 重複データありなので失敗扱い
        TE.fromOptionK(
          () =>
            new ConflictException(
              `StockPrice already existed when reject same price: ${JSON.stringify(
                result,
              )}`,
            ),
        )(() => O.some(props))(),
      ),
    )
  }

  addPrice(
    props: Props,
    companyID: number,
  ): TE.TaskEither<HttpException, StockPrice> {
    return pipe(
      validateProps(props, 'StockPrice', PropsCodec),
      TE.chain(() => this.rejectSamePrice(props, companyID)),
      TE.chain((correctProps) =>
        TE.tryCatch(
          () =>
            this.stockPriceRepository.insert(
              Object.assign(correctProps, { companyID: companyID }),
            ),
          (e) =>
            printException(
              e,
              new InternalServerErrorException(
                `DB access failed when addPrice with insert StockPrice ${JSON.stringify(
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
            this.stockPriceRepository.findOne({
              where: { id: insertedObjectID },
            }),
          (e) =>
            printException(
              e,
              new InternalServerErrorException(
                `DB access failed when addPrice with findOne props: ${JSON.stringify(
                  props,
                )}`,
              ),
            ),
        ),
      ),
    )
  }

  updatePrice(
    props: Props,
    id: number,
    companyID: number,
  ): TE.TaskEither<HttpException, StockPrice> {
    return pipe(
      validateProps(props, 'StockPrice', PropsCodec),
      TE.chain(() => this.rejectSamePrice(props, companyID)),
      TE.chain(() => this.getPrice(id, companyID)),
      TE.chain((updateTarget) =>
        TE.tryCatch(
          () =>
            this.stockPriceRepository.save({
              ...props,
              companyID: companyID,
              id: updateTarget.id,
            }),
          (e) =>
            printException(
              e,
              new InternalServerErrorException(
                `DB access failed when updatePrice with save StockPrice props: ${JSON.stringify(
                  updateTarget,
                )}, id: ${id}`,
              ),
            ),
        ),
      ),
    )
  }

  getPriceList(companyID: number): TE.TaskEither<HttpException, StockPrice[]> {
    return TE.tryCatch(
      () =>
        this.stockPriceRepository.find({
          where: { companyID: companyID },
        }),
      (e) =>
        printException(
          e,
          new InternalServerErrorException(
            `DB access failed when getPriceList with find`,
          ),
        ),
    )
  }

  getPrice(
    id: number,
    companyID: number,
  ): TE.TaskEither<HttpException, StockPrice> {
    return pipe(
      TE.tryCatch(
        () =>
          this.stockPriceRepository.findOne({
            where: {
              id: id,
              companyID: companyID,
            },
          }),
        (e) =>
          printException(
            e,
            new InternalServerErrorException(
              `DB access failed when getPrice with findOne id: ${id}, companyID: ${companyID}`,
            ),
          ),
      ),
      // NOTE: findOneのresultはStockPriceではなくOption<StockPrice>
      TE.chainOptionK(
        () =>
          new NotFoundException(
            `StockPrice id: ${id}, companyID: ${companyID}  is not found when getPrice`,
          ),
      )((payload) => O.fromNullable(payload)),
    )
  }

  getCurrentPrice(companyID: number): TE.TaskEither<HttpException, StockPrice> {
    return pipe(
      this.getPriceList(companyID),
      TE.map((statementsList) =>
        // NOTE: 一番dateが最近のものを先頭にする
        statementsList
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .shift(),
      ),
      // NOTE: maybePriceはStockPrice型ではなくO.Option<StockPrice>型
      TE.chainOptionK(
        () =>
          new NotFoundException(
            `StockPrice companyID: ${companyID}  is not found when getCurrentPrice`,
          ),
      )((maybePrice) => O.fromNullable(maybePrice)),
    )
  }

  deletePrice(
    id: number,
    companyID: number,
  ): TE.TaskEither<HttpException, number> {
    return pipe(
      this.getPrice(id, companyID),
      TE.chain((targetCompany) =>
        TE.tryCatch(
          () => this.stockPriceRepository.delete(targetCompany.id),
          (e) =>
            printException(
              e,
              new InternalServerErrorException(
                `DB access failed when deletePrice with delete id: ${targetCompany.id}`,
              ),
            ),
        ),
      ),
      TE.map(() => id),
    )
  }
}
