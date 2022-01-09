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

import { Industry } from '../entities/'
import { selectIdentifyNumberFromInsert } from '../utils/validateIdentify'
import type { Props } from './type'

@Injectable()
export class IndustryService {
  constructor(
    @InjectRepository(Industry)
    private readonly industryRepository: Repository<Industry>,
  ) {}

  findIndustryByName(props: Props): TE.TaskEither<HttpException, boolean> {
    return pipe(
      TE.tryCatch(
        () => this.industryRepository.findOne({ where: { name: props.name } }),
        () =>
          new InternalServerErrorException(
            `DB access failed with findOne name: ${props.name}`,
          ),
      ),
      TE.map((result) => !!result),
    )
  }

  addIndustry(props: Props): TE.TaskEither<HttpException, Industry> {
    return pipe(
      this.findIndustryByName(props),
      TE.map((isIndustryExist) =>
        pipe(
          isIndustryExist
            ? E.left(
                new ConflictException(
                  `industry ${props.name} is already existed.`,
                ),
              )
            : E.right(true),
          TE.fromEither,
        ),
      ),
      // mapが流れてくる(=前のbindでE.leftが流れてこない)時点で処理が成功していると判断
      // FIXME: ゴリ押しコードはつらいのら〜〜〜
      TE.bind('payload', () =>
        pipe(
          TE.tryCatch(
            () => this.industryRepository.insert(props),
            () =>
              new InternalServerErrorException(
                `DB access failed with insert props: ${props.name}`,
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
            this.industryRepository.findOne({
              where: {
                id: insertedObjectID,
              },
            }),
          () =>
            new InternalServerErrorException(
              `DB access failed with findOne id: ${insertedObjectID}`,
            ),
        ),
      ),
      TE.flatten,
    )
  }

  updateIndustry(
    id: number,
    props: Props,
  ): TE.TaskEither<HttpException, Industry> {
    return pipe(
      this.findIndustryByName(props),
      TE.map((isSameNameIndustryExist) =>
        pipe(
          isSameNameIndustryExist
            ? E.left(
                new ConflictException(
                  `industry ${props.name} is already existed.`,
                ),
              )
            : E.right(true),
          TE.fromEither,
        ),
      ),
      // mapが流れてくる時点で名前被りがないと判断
      TE.bind('updateTarget', () => this.getIndustry(id)),
      TE.map(({ updateTarget }) =>
        TE.tryCatch(
          () =>
            this.industryRepository.save({
              id: updateTarget.id,
              name: props.name,
            }),
          () =>
            new InternalServerErrorException(
              `DB access failed with save id: ${updateTarget.id}, name: ${props.name}`,
            ),
        ),
      ),
      TE.flatten,
    )
  }

  getIndustyList(): TE.TaskEither<HttpException, Industry[]> {
    return TE.tryCatch(
      () => this.industryRepository.find(),
      () => new InternalServerErrorException('DB access failed with find'),
    )
  }

  getIndustry(id: number): TE.TaskEither<HttpException, Industry> {
    return pipe(
      TE.Do,
      TE.bind('payload', () =>
        TE.tryCatch(
          () =>
            this.industryRepository.findOne({
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
      // findOneの返り値はIndustryと評価されるが、
      // 実際はundefinedが入るためnullチェックを挟む
      TE.map(({ payload }) =>
        TE.fromOptionK(
          () => new NotFoundException(`industry id: ${id} is not found`),
        )(() => O.fromNullable(payload))(),
      ),
      TE.flatten,
    )
  }

  deleteIndustry(id: number): TE.TaskEither<HttpException, number> {
    return pipe(
      this.getIndustry(id),
      // FIXME: bindする必要はないが、mapだと削除されない
      TE.bind('result', (targetIndustry) =>
        TE.tryCatch(
          () => this.industryRepository.delete(targetIndustry.id),
          () =>
            new InternalServerErrorException(
              `DB access failed with delete id: ${targetIndustry.id}`,
            ),
        ),
      ),
      TE.map(() => id),
    )
  }
}
