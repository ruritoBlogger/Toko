import { BadRequestException, HttpException } from '@nestjs/common'
import * as E from 'fp-ts/Either'
import { pipe } from 'fp-ts/function'
import * as TE from 'fp-ts/TaskEither'
import * as t from 'io-ts'

export function validateProps<T>(
  props: unknown,
  codec: t.Type<T>,
): TE.TaskEither<HttpException, T> {
  return pipe(
    codec.decode(props),
    E.getOrElseW(() =>
      E.left(
        new BadRequestException(
          `IndustryAveIndedx props: ${props} is invalid.`,
        ),
      ),
    ),
    TE.fromEither,
  )
}
