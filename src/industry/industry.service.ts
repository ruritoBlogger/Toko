import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
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
        (error) => new InternalServerErrorException(error),
      ),
      TE.map((result) => !!result),
    )
  }

  addIndustry(name: string): TE.TaskEither<HttpException, Industry> {
    return pipe(
      this.findIndustryByName(name),
      TE.bind('canIndustryCreate', (isIndustryExist) =>
        pipe(
          isIndustryExist
            ? E.left(new ConflictException('industry is already existed.'))
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
            (error) => new InternalServerErrorException(error),
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
          (error) => new InternalServerErrorException(error),
        ),
      ),
      TE.flatten,
    )
  }

  getIndustyList() {
    return this.industryRepository.find()
  }
}
