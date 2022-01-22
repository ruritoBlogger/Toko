import { HttpException, InternalServerErrorException } from '@nestjs/common'
import * as E from 'fp-ts/Either'
import { flow, pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import * as t from 'io-ts'
import { InsertResult } from 'typeorm'

const IdentifyCodec = t.type({
  id: t.number,
})

function decodeWith<T>(
  codec: t.Type<T>,
): (i: unknown) => TE.TaskEither<HttpException, T> {
  return flow(
    codec.decode,
    E.mapLeft(
      () => new InternalServerErrorException('cannot decode identifiers'),
    ),
    TE.fromEither,
  )
}

/**
 * InsertResultから追加に成功したデータのidを抜き出す
 * @param insertResult 抜き出したい元データ
 * @returns 抜き出したid(TaskEitherなので、idの抽出に失敗するとHttpExceptionが入る)
 */
export function selectIdentifyNumberFromInsert(
  insertResult: InsertResult,
): TE.TaskEither<HttpException, number> {
  return pipe(
    decodeWith(t.array(IdentifyCodec))(insertResult.identifiers),
    TE.map((ids) => ids.shift().id),
  )
}
