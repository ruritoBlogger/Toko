import * as t from 'io-ts'

export const PropsCodec = t.type({
  totalAssets: t.number,
  netAssets: t.number,
  capitalStock: t.number,
  profitSurplus: t.number,
})

export type Props = t.TypeOf<typeof PropsCodec>
