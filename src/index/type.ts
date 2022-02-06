import * as t from 'io-ts'

export const PropsCodec = t.type({
  capitalAdequacyRatio: t.number,
  roe: t.number,
  roa: t.number,
  per: t.number,
  pbr: t.number,
  eps: t.number,
  pcfr: t.number,
  yieldGap: t.number,
})

export type Props = t.TypeOf<typeof PropsCodec>
