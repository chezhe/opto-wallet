import { ApiPromise } from '@polkadot/api'
import Decimal from 'decimal.js'
import _ from 'lodash'
import { AppDispatch } from 'store'
import { Chain, Wallet } from 'types'

export const updateAppChainTokenList = async ({
  client,
  wallet,
  dispatch,
}: {
  client: ApiPromise
  wallet: Wallet
  dispatch: AppDispatch
}) => {
  const { address, appchainId } = wallet
  client.query.system
    .account(address)
    .then((res) => {
      const result: any = res.toJSON()
      dispatch({
        payload: {
          chain: Chain.OCT,
          appchainId,
          balance: new Decimal(result?.data?.free).toString(),
        },
        type: 'asset/updateNativeTokenBalance',
      })
    })
    .catch(console.error)
}
