import { StackActions, useRoute } from '@react-navigation/native'
import Address from 'components/common/Address'
import Box from 'components/common/Box'
import Heading from 'components/common/Heading'
import ScreenHeader from 'components/common/ScreenHeader'
import { View } from 'components/Themed'
import useColorScheme from 'hooks/useColorScheme'
import { i18n } from 'locale'
import Colors from 'theme/Colors'
import { StyleSheet } from 'react-native'
import Styles from 'theme/Styles'
import { RootStackScreenProps, SettingItem, Wallet } from 'types'
import SettingBlock from 'components/Settings/SettingBlock'
import { Archive, Trash } from 'iconoir-react-native'
import { useRef } from 'react'
import { Portal } from 'react-native-portalize'
import { Modalize } from 'react-native-modalize'
import ConfirmModal from 'components/Modals/ConfirmModal'
import WalletAPI from 'chain/WalletAPI'
import { useAppDispatch, useAppSelector } from 'store/hooks'
import useAuth from 'hooks/useAuth'
import Toast from 'utils/toast'

export default function WalletDetail({
  navigation,
}: RootStackScreenProps<'WalletDetail'>) {
  const { params } = useRoute()
  const wallet = (params as any)?.wallet as Wallet
  const wallets = useAppSelector((state) => state.wallet.list)
  const confirmDeleteRef = useRef<Modalize>()
  const exportKeyRef = useRef<Modalize>()

  const theme = useColorScheme()
  const dispatch = useAppDispatch()

  const onConfirmDelete = async () => {
    await WalletAPI.deleteWallet(wallet)
    dispatch({
      type: 'wallet/remove',
      payload: wallet,
    })
    dispatch({
      type: 'asset/deleteWalletToken',
      payload: wallet.address,
    })
    if (wallets.length <= 1) {
      dispatch({
        type: 'setting/updateBioAuth',
        payload: false,
      })
      dispatch({
        type: 'setting/setupPINCode',
        payload: '',
      })
      navigation.dispatch(StackActions.popToTop())
      navigation.navigate('Root', { screen: 'Home' })
      navigation.navigate('Start', { new: true })
    } else {
      navigation.goBack()
    }
    setTimeout(() => {
      Toast.success('Wallet deleted')
    }, 1000)
  }

  const auth = useAuth()

  const onConfirmExport = async () => {
    navigation.goBack()
    navigation.navigate('WalletExport', {
      wallet,
    })
  }

  let actions: SettingItem[] = [
    {
      icon: Trash,
      title: 'Delete',
      value: '',
      onPress: async () => {
        confirmDeleteRef?.current?.open()
      },
    },
  ]

  if (!wallet.isLedger) {
    actions = [
      {
        icon: Archive,
        title: 'Export',
        value: '',
        onPress: () => {
          exportKeyRef?.current?.open()
        },
      },
      ...actions,
    ]
  }

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader title={i18n.t('Wallet')} />
      <View style={Styles.page}>
        <Box
          direction="column"
          align="flex-start"
          backgroundColor={Colors[theme].cardBackground}
          pad="medium"
          gap="small"
          style={{ borderRadius: 4, marginBottom: 20 }}
        >
          <Heading level={3}>{i18n.t('Wallet Address')}</Heading>
          <Address
            wallet={wallet}
            ellipsis={false}
            fontSize={16}
            numberOfLines={2}
          />
        </Box>

        <SettingBlock title="" items={actions} />
      </View>
      <Portal>
        <Modalize
          ref={exportKeyRef}
          adjustToContentHeight
          closeOnOverlayTap
          withHandle={false}
        >
          <ConfirmModal
            title="Export"
            icon={<Archive width={40} height={40} color={Colors.black} />}
            iconWrapColor={Colors.green}
            subtitle="Make sure you keep your private key safe"
            onCancel={() => exportKeyRef?.current?.close()}
            onConfirm={async () => {
              exportKeyRef?.current?.close()
              auth(onConfirmExport)
            }}
          />
        </Modalize>
        <Modalize
          ref={confirmDeleteRef}
          adjustToContentHeight
          closeOnOverlayTap
          withHandle={false}
        >
          <ConfirmModal
            title="Delete"
            icon={<Trash width={40} height={40} color={Colors.black} />}
            iconWrapColor={Colors.red}
            subtitle="Make sure you have a backup of your private key before you delete this wallet"
            onCancel={() => confirmDeleteRef?.current?.close()}
            onConfirm={async () => {
              confirmDeleteRef.current?.close()
              auth(onConfirmDelete)
            }}
          />
        </Modalize>
      </Portal>
    </View>
  )
}

const styles = StyleSheet.create({
  address: {
    fontSize: 16,
  },
})
