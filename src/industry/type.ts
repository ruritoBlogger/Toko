import * as t from 'io-ts'

export const PropsCodec = t.type({
  name: t.string,
})

export type Props = t.TypeOf<typeof PropsCodec>
