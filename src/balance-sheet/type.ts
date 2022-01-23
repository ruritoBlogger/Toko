import * as t from 'io-ts'

export const PropsCodec = t.type({
  totalAssets: t.number,
  netAssets: t.number,
  capitalStock: t.number,
  profitSurplus: t.number,
  cashEquivalent: t.number,
  netCash: t.number,
  depreciation: t.number,
  capitalInvestment: t.number,
  liabilities: t.number,
})

export type Props = t.TypeOf<typeof PropsCodec>
