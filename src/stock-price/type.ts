import * as t from 'io-ts'

export const PropsCodec = t.type({
  openingPrice: t.number,
  closingPrice: t.number,
  highPrice: t.number,
  lowPrice: t.number,
  date: t.string,
})

export type Props = t.TypeOf<typeof PropsCodec>
