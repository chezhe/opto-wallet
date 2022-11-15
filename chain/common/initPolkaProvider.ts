import { ApiPromise, WsProvider } from '@polkadot/api'

export default async function initPolkaProvider(rpc?: string) {
  const wsProvider = new WsProvider(rpc ?? 'wss://rpc.polkadot.io')
  const api = await ApiPromise.create({ provider: wsProvider })
  return api
}
