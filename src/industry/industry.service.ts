import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as T from 'fp-ts/Task'
import * as TE from 'fp-ts/TaskEither'
import { Industry } from 'src/entities/industry.entity'
import { InsertResult, Repository } from 'typeorm'

@Injectable()
export class IndustryService {
  constructor(
    @InjectRepository(Industry)
    private readonly industryRepository: Repository<Industry>,
  ) {}

  findIndustryByName(name: string): TE.TaskEither<Error, boolean> {
    return pipe(
      TE.tryCatch(
        () => this.industryRepository.findOne({ where: { name } }),
        (error) => new Error(`${error}`),
      ),
      TE.map((result) => !!result),
    )
  }

  addIndustry(name: string): TE.TaskEither<Error, InsertResult> {
    return pipe(
      this.findIndustryByName(name),
      TE.bind('canIndustryCreate', (isIndustryExist) =>
        pipe(
          isIndustryExist
            ? E.left(new Error('industry is already existed.'))
            : E.right(true),
          TE.fromEither,
        ),
      ),
      // mapが流れてくる(=前のbindWでE.leftが流れてこない)時点で処理が成功していると判断
      // FIXME: ゴリ押しコードはつらいのら〜〜〜
      TE.map(() =>
        pipe(
          TE.tryCatch(
            () => this.industryRepository.insert(new Industry(name)),
            (error) => new Error(`${error}`),
          ),
        ),
      ),
      TE.flatten,
    )
  }

  getIndustyList() {
    return this.industryRepository.find()
  }
}
