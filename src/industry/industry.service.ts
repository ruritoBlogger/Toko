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

@Injectable()
export class IndustryService {
  constructor(
    @InjectRepository(Industry)
    private readonly industryRepository: Repository<Industry>,
  ) {}

  findIndustryByName(name: string): TE.TaskEither<HttpException, boolean> {
    return pipe(
      TE.tryCatch(
        () => this.industryRepository.findOne({ where: { name } }),
        () =>
          new InternalServerErrorException(
            `DB access failed with findOne name: ${name}`,
          ),
      ),
      TE.map((result) => !!result),
    )
  }

  addIndustry(name: string): TE.TaskEither<HttpException, Industry> {
    return pipe(
      this.findIndustryByName(name),
      TE.map((isIndustryExist) =>
        pipe(
          isIndustryExist
            ? E.left(
                new ConflictException(`industry ${name} is already existed.`),
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
            () => this.industryRepository.insert(new Industry(name)),
            () =>
              new InternalServerErrorException(
                `DB access failed with insert name: ${name}`,
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
    name: string,
  ): TE.TaskEither<HttpException, Industry> {
    return pipe(
      this.findIndustryByName(name),
      TE.map((isSameNameIndustryExist) =>
        pipe(
          isSameNameIndustryExist
            ? E.left(
                new ConflictException(`industry ${name} is already existed.`),
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
            this.industryRepository.save({ id: updateTarget.id, name: name }),
          () =>
            new InternalServerErrorException(
              `DB access failed with save id: ${updateTarget.id}, name: ${name}`,
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
