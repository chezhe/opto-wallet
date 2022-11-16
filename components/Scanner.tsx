import { useNavigation } from '@react-navigation/native'
import useColorScheme from 'hooks/useColorScheme'
import { i18n } from 'locale'
import { AddUser, Scanning } from 'iconoir-react-native'
import { useRef, useState } from 'react'
import { Modalize } from 'react-native-modalize'
import { Portal } from 'react-native-portalize'
import Colors from 'theme/Colors'
import { CreateAccount } from 'types'
import Toast from 'utils/toast'
import Box from './common/Box'
import Icon from './common/Icon'
import InfoItem from './common/InfoItem'
import ConfirmModal from './Modals/ConfirmModal'
import QRScanModal from './Modals/QRScanModal'
import WalletConnect from './Modals/WalletConnect'
import useWallet from 'hooks/useWallet'
import WalletFactory from 'chain/WalletFactory'

export default function Scanner() {
  const { wallet, walletApi } = useWallet()

  const [wcUri, setWcUri] = useState('')
  const qrscanRef = useRef<Modalize>(null)
  const createAccountRef = useRef<Modalize>(null)
  const [newAccount, setNewAccount] = useState<CreateAccount>()

  const theme = useColorScheme()

  const navigation = useNavigation()

  const onScanned = async (data: string) => {
    qrscanRef.current?.close()

    try {
      if (data.startsWith('http')) {
        return navigation.navigate('DAppView', { url: data })
      } else if (data.startsWith('wc:')) {
        if (!walletApi?.isWCSupported()) {
          return Toast.error(i18n.t('WalletConnect is only available on NEAR'))
        }
        if (wcUri && wcUri !== data) {
          return Toast.error(
            i18n.t('Wallet connected already, disconnect current session first')
          )
        }
        setWcUri(data)
        return
      }
      const network = walletApi?.getNetwork()
      const isAddress = await walletApi?.isValidAddress(data, network?.type!)
      if (isAddress) {
        return navigation.navigate('Transfer', { receiver: data })
      }
      const result = JSON.parse(data)
      if (result.action === 'create') {
        if (!WalletFactory.canCreateWalletFromScan(wallet, data)) {
          return Toast.error(i18n.t('Please switch to NEAR wallet'))
        }
        setNewAccount(result)
        createAccountRef.current?.open()
      }
    } catch (error) {
      navigation.navigate('Transfer', { receiver: data })
    }
  }

  const onConfirmCreate = async () => {
    try {
      if (!newAccount) {
        throw new Error('Invalid parameters')
      }
      await walletApi?.createAccount(newAccount)

      createAccountRef?.current?.close()
      Toast.success(i18n.t('Account created successfully'))
    } catch (error) {
      Toast.error(error)
    }
  }

  return (
    <Box>
      <Icon
        icon={
          <Scanning
            width={24}
            height={24}
            color={Colors[theme].screenBackground}
            strokeWidth={2}
          />
        }
        onPress={() => {
          qrscanRef.current?.open()
        }}
      />
      <WalletConnect
        wcUri={wcUri}
        onReset={() => {
          setWcUri('')
        }}
      />
      <Portal>
        <Modalize
          ref={createAccountRef}
          adjustToContentHeight
          closeOnOverlayTap
          withHandle={false}
        >
          <ConfirmModal
            title="Create account"
            icon={<AddUser width={40} height={40} color={Colors.black} />}
            iconWrapColor={Colors.green}
            subtitle=""
            content={
              newAccount ? (
                <Box
                  direction="column"
                  align="flex-start"
                  style={{
                    paddingHorizontal: 10,
                    borderWidth: 2,
                    borderColor: Colors[theme].borderColor,
                    marginHorizontal: 10,
                  }}
                >
                  <InfoItem title="Account ID" value={newAccount.accountId} />
                  <InfoItem title="Public Key" value={newAccount.publicKey} />
                </Box>
              ) : null
            }
            onCancel={() => createAccountRef?.current?.close()}
            onConfirm={onConfirmCreate}
          />
        </Modalize>
        <Modalize
          ref={qrscanRef}
          adjustToContentHeight
          closeOnOverlayTap
          handlePosition="inside"
        >
          <QRScanModal
            onCancel={() => qrscanRef.current?.close()}
            onConfirm={onScanned}
          />
        </Modalize>
      </Portal>
    </Box>
  )
}
