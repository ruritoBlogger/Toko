import * as t from 'io-ts'

export const PropsCodec = t.type({
  salesCF: t.number,
  investmentCF: t.number,
  financialCF: t.number,
  cashEquivalent: t.number,
})

export type Props = t.TypeOf<typeof PropsCodec>
