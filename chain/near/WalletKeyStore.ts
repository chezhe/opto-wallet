import { KeyPair } from 'near-api-js'
import { KeyStore } from 'near-api-js/lib/key_stores/keystore'
import { SecureKeyStore } from 'types'

export class WalletKeyStore extends KeyStore {
  readonly keyStore: SecureKeyStore | undefined
  constructor(keyStore?: SecureKeyStore | undefined) {
    super()
    this.keyStore = keyStore
  }

  async getKey(networkId: string, accountId: string): Promise<KeyPair> {
    return KeyPair.fromString(this.keyStore?.privateKey ?? '')
  }

  async removeKey(networkId: string, accountId: string): Promise<void> {}

  async setKey(
    networkId: string,
    accountId: string,
    keyPair: KeyPair
  ): Promise<void> {}

  async getNetworks(): Promise<string[]> {
    if (this.keyStore) {
      return [this.keyStore.networkType]
    }
    return []
  }

  async getAccounts(networkId: string): Promise<string[]> {
    if (this.keyStore) {
      return [this.keyStore.address]
    }
    return []
  }

  async clear() {}
}
