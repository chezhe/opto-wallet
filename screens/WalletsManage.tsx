import { i18n } from 'locale'
import { Pressable, StyleSheet } from 'react-native'
import ScreenHeader from 'components/common/ScreenHeader'
import { View } from 'components/Themed'
import { Chain, RootStackScreenProps } from 'types'
import Fonts from 'theme/Fonts'
import WalletsByChain from 'components/Assets/WalletsByChain'
import { KeyAltRemove } from 'iconoir-react-native'
import Colors from 'theme/Colors'
import { Modalize } from 'react-native-modalize'
import { useRef } from 'react'
import ConfirmModal from 'components/Modals/ConfirmModal'
import useAuth from 'hooks/useAuth'
import { Portal } from 'react-native-portalize'
import { useAppDispatch } from 'store/hooks'

export default function WalletsManage({
  navigation,
}: RootStackScreenProps<'WalletsManage'>) {
  const confirmDeleteRef = useRef<Modalize>()
  const auth = useAuth()
  const dispatch = useAppDispatch()
  const onConfirmLogout = async () => {
    dispatch({
      type: 'wallet/logout',
    })
    dispatch({
      type: 'asset/reset',
    })
    dispatch({
      type: 'setting/reset',
    })
    navigation.popToTop()
    navigation.navigate('Start', { new: true })
  }

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={i18n.t('Wallets')}
        rightEle={
          <Pressable
            hitSlop={15}
            onPress={() => confirmDeleteRef.current?.open()}
          >
            <KeyAltRemove
              width={24}
              height={24}
              color={Colors.link}
              strokeWidth={2}
            />
          </Pressable>
        }
      />
      <WalletsByChain
        onSelect={(w) => navigation.navigate('WalletDetail', { wallet: w })}
        onAdd={(chain: Chain) =>
          navigation.navigate('Start', {
            new: false,
            chain,
          })
        }
      />
      <Portal>
        <Modalize
          ref={confirmDeleteRef}
          adjustToContentHeight
          closeOnOverlayTap
          withHandle={false}
        >
          <ConfirmModal
            title="Logout"
            icon={<KeyAltRemove width={40} height={40} color={Colors.black} />}
            iconWrapColor={Colors.red}
            subtitle="Make sure you have a backup of your private key before you delete this wallet"
            onCancel={() => confirmDeleteRef?.current?.close()}
            onConfirm={async () => {
              confirmDeleteRef.current?.close()
              auth(onConfirmLogout)
            }}
          />
        </Modalize>
      </Portal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    padding: 15,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contentContainer: {
    padding: 20,
  },
  itemText: {
    fontSize: 20,
    fontFamily: Fonts.variable,
    marginLeft: 10,
  },
})
