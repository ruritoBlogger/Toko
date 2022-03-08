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
import { Company } from './../entities'
import type { Props } from './type'
import { PropsCodec } from './type'

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  rejectSameCompanyWithCode(props: Props): TE.TaskEither<HttpException, Props> {
    return pipe(
      TE.tryCatch(
        () =>
          this.companyRepository.findOne({
            where: { identificationCode: props.identificationCode },
          }),
        () =>
          new InternalServerErrorException(
            `DB access failed when reject same company with code with findOne: ${JSON.stringify(
              props,
            )}`,
          ),
      ),
      TE.chain((result) =>
        // NOTE: 存在する場合 = 重複データありなので失敗扱い
        TE.fromOptionK(
          () =>
            new ConflictException(
              `Company already existed when reject same company with code: ${JSON.stringify(
                result,
              )}`,
            ),
        )(() => O.some(props))(),
      ),
    )
  }

  rejectSameCompanyWithName(props: Props): TE.TaskEither<HttpException, Props> {
    return pipe(
      TE.tryCatch(
        () =>
          this.companyRepository.findOne({
            where: { name: props.name },
          }),
        () =>
          new InternalServerErrorException(
            `DB access failed when reject some company with name with findOne: ${JSON.stringify(
              props,
            )}`,
          ),
      ),
      TE.chain((result) =>
        // NOTE: 存在する場合 = 重複データありなので失敗扱い
        TE.fromOptionK(
          () =>
            new ConflictException(
              `Company already existed when reject same company with name ${JSON.stringify(
                result,
              )}`,
            ),
        )(() => O.some(props))(),
      ),
    )
  }

  rejectSameCompany(props: Props): TE.TaskEither<HttpException, Props> {
    return pipe(
      this.rejectSameCompanyWithName(props),
      TE.chain((props) => this.rejectSameCompanyWithCode(props)),
    )
  }

  addCompany(props: Props): TE.TaskEither<HttpException, Company> {
    return pipe(
      validateProps(props, 'Company', PropsCodec),
      TE.chain(() => this.rejectSameCompany(props)),
      TE.chain((correctProps) =>
        TE.tryCatch(
          () => this.companyRepository.insert(correctProps),
          () =>
            new NotFoundException(
              `DB access failed when addCompany with insert Company ${JSON.stringify(
                correctProps,
              )}`,
            ),
        ),
      ),
      TE.chain((payload) => selectIdentifyNumberFromInsert(payload)),
      TE.chain((insertedObjectID) =>
        TE.tryCatch(
          () =>
            this.companyRepository.findOne({
              where: { id: insertedObjectID },
            }),
          () =>
            new InternalServerErrorException(
              `DB access failed when addCompany with findOne: ${JSON.stringify(
                props,
              )}`,
            ),
        ),
      ),
    )
  }

  updateCompany(
    props: Props,
    id: number,
  ): TE.TaskEither<HttpException, Company> {
    return pipe(
      validateProps(props, 'Company', PropsCodec),
      TE.chain(() => this.rejectSameCompany(props)),
      TE.chain(() => this.getCompany(id)),
      TE.chain((updateTarget) =>
        TE.tryCatch(
          () =>
            this.companyRepository.save({
              ...props,
              id: updateTarget.id,
            }),
          () =>
            new NotFoundException(
              `DB access failed when updateCompany with save Company props: ${JSON.stringify(
                updateTarget,
              )}, id: ${id}`,
            ),
        ),
      ),
    )
  }

  getCompanyList(): TE.TaskEither<HttpException, Company[]> {
    return TE.tryCatch(
      () => this.companyRepository.find(),
      () =>
        new InternalServerErrorException(
          `DB access failed when getCompanyList with find`,
        ),
    )
  }

  getCompany(id: number): TE.TaskEither<HttpException, Company> {
    return pipe(
      TE.tryCatch(
        () =>
          this.companyRepository.findOne({
            where: {
              id: id,
            },
          }),
        () =>
          new InternalServerErrorException(
            `DB access failed when getCompany with findOne id: ${id}`,
          ),
      ),
      // NOTE: findOneのresultはCompanyではなくOption<Company>
      TE.chainOptionK(
        () =>
          new NotFoundException(
            `company id: ${id} is not found when getCompany`,
          ),
      )((payload) => O.fromNullable(payload)),
    )
  }

  deleteCompany(id: number): TE.TaskEither<HttpException, number> {
    return pipe(
      this.getCompany(id),
      TE.chain((targetCompany) =>
        TE.tryCatch(
          () => this.companyRepository.delete(targetCompany.id),
          () =>
            new InternalServerErrorException(
              `DB access failed when deleteCompany with delete id: ${targetCompany.id}`,
            ),
        ),
      ),
      TE.map(() => id),
    )
  }
}
