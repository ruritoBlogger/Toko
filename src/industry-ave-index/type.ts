import * as t from 'io-ts'

export const PropsCodec = t.type({
  announcementDate: t.string,
  capitalAdequacyRatio: t.number,
  roe: t.number,
  roa: t.number,
  per: t.number,
  pbr: t.number,
  eps: t.number,
})

export type Props = t.TypeOf<typeof PropsCodec>
