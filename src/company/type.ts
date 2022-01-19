import * as t from 'io-ts'

export const PropsCodec = t.type({
  name: t.string,
  industryID: t.number,
  identificationCode: t.number,
})

export type Props = t.TypeOf<typeof PropsCodec>
