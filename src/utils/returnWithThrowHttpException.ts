import { HttpException } from '@nestjs/common'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'

export function returnWithThrowHttpException<T>(
  target: E.Either<HttpException, T>,
): T {
  return pipe(
    target,
    E.getOrElseW((e) => {
      throw e
    }),
  )
}
