import BaseWallet from 'chain/BaseWallet'
import { useEffect, useState } from 'react'
import { useAppSelector } from 'store/hooks'
import WalletFactory from 'chain/WalletFactory'

export default function useWallet() {
  const [walletApi, setWalletApi] = useState<BaseWallet | undefined>()

  const { current, list } = useAppSelector((state) => state.wallet)

  useEffect(() => {
    if (current) {
      setWalletApi(WalletFactory.fromWallet(current))
    } else {
      setWalletApi(undefined)
    }
  }, [current?.address, current?.networkType])

  return {
    walletApi,
    wallet: current,
    walletList: list,
  }
}
