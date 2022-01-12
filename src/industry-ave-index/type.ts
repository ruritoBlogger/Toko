import * as t from 'io-ts'
import * as tt from 'io-ts-types'

export const PropsCodec = t.type({
  industryID: t.number,
  announcementDate: t.union([tt.date, t.string]),
  capitalAdequacyRatio: t.number,
  roe: t.number,
  roa: t.number,
  per: t.number,
  pbr: t.number,
  eps: t.number,
  pcfr: t.number,
  yieldGap: t.number,
  ebitda: t.number,
  ev: t.number,
  ev_ebitda: t.number,
})

export type Props = t.TypeOf<typeof PropsCodec>
