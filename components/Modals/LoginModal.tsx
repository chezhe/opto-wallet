import { i18n } from 'locale'
import { StyleSheet, Image } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import { useAppSelector } from 'store/hooks'
import { ButtonType, NearLogin, Project } from 'types'
import Fonts from 'theme/Fonts'
import Toast from 'utils/toast'
import Button from 'components/common/Button'
import SheetHeader from 'components/common/SheetHeader'
import { Text, View } from 'components/Themed'
import AccessList from '../DApp/AccessList'
import WalletAPI from 'chain/WalletAPI'
import { formatUrlHost, formatWalletAddress } from 'utils/format'

export default function LoginModal({
  project,
  onClose,
  nearLogin,
  setCurrentUrl,
}: {
  project?: Project
  onClose: () => void
  nearLogin?: NearLogin
  setCurrentUrl: (url: string) => void
}) {
  const wallet = useAppSelector((state) => state.wallet.current)
  const insets = useSafeAreaInsets()
  const theme = useColorScheme()

  let title = project?.title
  if (!title) {
    title = formatUrlHost(nearLogin?.successUrl)
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom + 20,
          backgroundColor: Colors[theme].modalBackground,
        },
      ]}
    >
      <SheetHeader title={title} />
      <View style={styles.content}>
        {!!project && (
          <Image source={{ uri: project.logo }} style={styles.projectLogo} />
        )}
        <View style={[styles.accessRow, { flexDirection: 'column' }]}>
          <Text style={[styles.contractId, { color: Colors[theme].link }]}>
            {nearLogin?.contractId}
          </Text>
          <Text style={styles.description}>{i18n.t('Request')}</Text>
          <Text style={[styles.contractId, { color: Colors[theme].link }]}>
            {formatWalletAddress(wallet)}
          </Text>
        </View>
        <View>
          <AccessList loginAccessType={nearLogin?.loginAccessType!} />
        </View>
      </View>
      <View style={styles.buttonGroup}>
        <Button
          label={i18n.t('Cancel')}
          style={{ marginHorizontal: 10 }}
          filled={false}
          onPress={onClose}
        />
        <Button
          label={i18n.t('Confirm')}
          type={ButtonType.PRIMARY}
          style={{ marginHorizontal: 10 }}
          filled={false}
          onPress={async () => {
            try {
              const allKey = await WalletAPI.connect(wallet!, nearLogin!)
              const publicKey = nearLogin?.publicKey
              const url = `${
                (nearLogin?.successUrl || '').split('#')[0]
              }?account_id=${
                wallet?.address
              }&public_key=${publicKey}&all_keys=${[allKey].join(',')}`
              setCurrentUrl(url)
              onClose()
            } catch (error) {
              Toast.error(error)
            }
          }}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  content: {
    padding: 20,

    flexDirection: 'column',
    alignItems: 'center',
  },
  description: {
    fontSize: 18,
    fontFamily: Fonts.variable,
    textAlign: 'center',
    marginLeft: 8,
  },
  accessRow: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingVertical: 5,
  },
  accessText: {
    fontSize: 12,
    fontFamily: Fonts.variable,
    marginLeft: 10,
  },
  buttonGroup: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 10,
  },
  contractId: {
    fontSize: 20,
    fontFamily: Fonts.variable,
    textAlign: 'center',
  },
})
