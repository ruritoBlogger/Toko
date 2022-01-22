import * as t from 'io-ts'

export const PropsCodec = t.type({
  totalSales: t.number,
  operatingIncome: t.number,
  ordinaryIncome: t.number,
  netIncome: t.number,
})

export type Props = t.TypeOf<typeof PropsCodec>
