import { HttpException } from '@nestjs/common'

export const printException = (e: unknown, exception: HttpException) => {
  console.log(e)
  return exception
}
