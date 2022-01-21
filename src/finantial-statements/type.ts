import * as t from 'io-ts'

export const PropsCodec = t.type({
  announcementDate: t.string,
  isFiscal: t.boolean,
})

export type Props = t.TypeOf<typeof PropsCodec>
