import { StackActions, useRoute } from '@react-navigation/native'
import Address from 'components/common/Address'
import Box from 'components/common/Box'
import ScreenHeader from 'components/common/ScreenHeader'
import { View } from 'components/Themed'
import { i18n } from 'locale'
import Colors from 'theme/Colors'
import { StyleSheet } from 'react-native'
import Styles from 'theme/Styles'
import { Chain, RootStackScreenProps, SettingItem, Wallet } from 'types'
import SettingBlock from 'components/Settings/SettingBlock'
import { Archive, KeyAlt, Trash, UserCircleAlt } from 'iconoir-react-native'
import { useRef } from 'react'
import { Portal } from 'react-native-portalize'
import { Modalize } from 'react-native-modalize'
import ConfirmModal from 'components/Modals/ConfirmModal'
import { useAppDispatch, useAppSelector } from 'store/hooks'
import useAuth from 'hooks/useAuth'
import Toast from 'utils/toast'
import BaseWallet from 'chain/BaseWallet'
import SetAvatarModal from 'components/Modals/SetAvatarModal'
import FastImage from 'react-native-fast-image'
import icons from 'utils/icons'

export default function WalletDetail({
  navigation,
}: RootStackScreenProps<'WalletDetail'>) {
  const { params } = useRoute()
  const wallet = (params as any)?.wallet as Wallet
  const wallets = useAppSelector((state) => state.wallet.list)
  const setAvatarRef = useRef<Modalize>()
  const confirmDeleteRef = useRef<Modalize>()
  const exportKeyRef = useRef<Modalize>()

  const dispatch = useAppDispatch()

  const onConfirmDelete = async () => {
    await BaseWallet.deleteWallet(wallet)

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
      Toast.success(i18n.t('Wallet deleted'))
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
    actions.splice(1, 0, {
      icon: Archive,
      title: 'Export',
      value: '',
      onPress: () => {
        exportKeyRef?.current?.open()
      },
    })
  }

  if (wallet.chain === Chain.NEAR) {
    actions.splice(0, 0, {
      icon: UserCircleAlt,
      title: 'Nravatar',
      value: '',
      onPress: async () => {
        setAvatarRef?.current?.open()
      },
    })
    actions.splice(1, 0, {
      icon: KeyAlt,
      title: 'Authorized Apps',
      value: '',
      onPress: async () => {
        navigation.navigate('AuthorizedApps')
      },
    })
  }

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader title={i18n.t('Wallet')} />
      <View style={Styles.page}>
        <Box
          direction="column"
          align="center"
          justify="center"
          gap="medium"
          style={{ paddingBottom: 30 }}
        >
          {wallet.chain === Chain.NEAR && (
            <FastImage
              source={wallet?.avatar ? { uri: wallet.avatar } : icons.NRAVATAR}
              style={{ ...styles.avatar, borderColor: Colors.white }}
            />
          )}
          <Address
            wallet={wallet}
            ellipsis={false}
            fontSize={18}
            numberOfLines={3}
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
        <Modalize
          ref={setAvatarRef}
          adjustToContentHeight
          closeOnOverlayTap
          withHandle={false}
        >
          <SetAvatarModal
            onClose={() => setAvatarRef?.current?.close()}
            onConfirm={(avatar) => {
              navigation.goBack()
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
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: StyleSheet.hairlineWidth,
  },
})
