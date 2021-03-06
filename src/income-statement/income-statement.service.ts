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
import { IncomeStatement } from './../entities'
import type { Props } from './type'
import { PropsCodec } from './type'

@Injectable()
export class IncomeStatementService {
  constructor(
    @InjectRepository(IncomeStatement)
    private readonly incomeStatementRepository: Repository<IncomeStatement>,
  ) {}

  rejectSameStatement(
    props: Props,
    finantialID: number,
  ): TE.TaskEither<HttpException, Props> {
    return pipe(
      TE.tryCatch(
        () =>
          this.incomeStatementRepository.findOne({
            where: { finantialID: finantialID },
          }),
        (e) =>
          printException(
            e,
            new InternalServerErrorException(
              `DB access failed when reject same income-statement with findOne finantialID: ${finantialID}`,
            ),
          ),
      ),
      TE.chain((result) =>
        // NOTE: 存在する場合 = 重複データありなので失敗扱い
        TE.fromOptionK(
          () =>
            new ConflictException(
              `IncomeStatement already existed when reject same income-statement props: ${JSON.stringify(
                result,
              )}`,
            ),
        )(() => O.some(props))(),
      ),
    )
  }

  addStatement(
    props: Props,
    finantialID: number,
  ): TE.TaskEither<HttpException, IncomeStatement> {
    return pipe(
      validateProps(props, 'IncomeStatement', PropsCodec),
      TE.chain(() => this.rejectSameStatement(props, finantialID)),
      TE.chain((correctProps) =>
        TE.tryCatch(
          () =>
            this.incomeStatementRepository.insert(
              Object.assign(correctProps, { finantialID: finantialID }),
            ),
          (e) =>
            printException(
              e,
              new InternalServerErrorException(
                `DB access failed when addIncomeStatement with insert IncomeStatement ${JSON.stringify(
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
            this.incomeStatementRepository.findOne({
              where: { id: insertedObjectID },
            }),
          (e) =>
            printException(
              e,
              new InternalServerErrorException(
                `DB access failed when addIncomeStatement with findOne props: ${JSON.stringify(
                  props,
                )}`,
              ),
            ),
        ),
      ),
    )
  }

  updateStatement(
    props: Props,
    id: number,
    finantialID: number,
  ): TE.TaskEither<HttpException, IncomeStatement> {
    return pipe(
      validateProps(props, 'IncomeStatement', PropsCodec),
      TE.chain(() => this.rejectSameStatement(props, finantialID)),
      TE.chain(() => this.getStatement(id, finantialID)),
      TE.chain((updateTarget) =>
        TE.tryCatch(
          () =>
            this.incomeStatementRepository.save({
              ...props,
              finantialID: finantialID,
              id: updateTarget.id,
            }),
          (e) =>
            printException(
              e,
              new InternalServerErrorException(
                `DB access failed with save IncomeStatement props: ${JSON.stringify(
                  updateTarget,
                )}, id: ${id}`,
              ),
            ),
        ),
      ),
    )
  }

  getStatementList(
    finantialID: number,
  ): TE.TaskEither<HttpException, IncomeStatement[]> {
    return TE.tryCatch(
      () =>
        this.incomeStatementRepository.find({
          where: { finantialID: finantialID },
        }),
      (e) =>
        printException(
          e,
          new InternalServerErrorException(
            `DB access failed when getIncomeStatementList with find`,
          ),
        ),
    )
  }

  getStatement(
    id: number,
    finantialID: number,
  ): TE.TaskEither<HttpException, IncomeStatement> {
    return pipe(
      TE.tryCatch(
        () =>
          this.incomeStatementRepository.findOne({
            where: {
              id: id,
              finantialID: finantialID,
            },
          }),
        (e) =>
          printException(
            e,
            new InternalServerErrorException(
              `DB access failed when getIncomeStatement with findOne id: ${id}, finantialID: ${finantialID}`,
            ),
          ),
      ),
      // NOTE: findOneのresultはIncomeStatementではなくOption<IncomeStatement>
      TE.chainOptionK(
        () =>
          new NotFoundException(
            `IncomeStatement id: ${id}, finantialID: ${finantialID}  is not found`,
          ),
      )((payload) => O.fromNullable(payload)),
    )
  }

  deleteStatement(
    id: number,
    finantialID: number,
  ): TE.TaskEither<HttpException, number> {
    return pipe(
      this.getStatement(id, finantialID),
      TE.chain((targetCompany) =>
        TE.tryCatch(
          () => this.incomeStatementRepository.delete(targetCompany.id),
          (e) =>
            printException(
              e,
              new InternalServerErrorException(
                `DB access failed when deleteIncomeStatement with delete id: ${targetCompany.id}`,
              ),
            ),
        ),
      ),
      TE.map(() => id),
    )
  }
}
