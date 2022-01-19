import * as t from 'io-ts'
import * as tt from 'io-ts-types'

export const PropsCodec = t.type({
  announcementDate: tt.date,
})

export type Props = t.TypeOf<typeof PropsCodec>
