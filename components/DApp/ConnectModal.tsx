import { i18n } from 'locale'
import { StyleSheet, Image } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import { ButtonType, Project } from 'types'
import Fonts from 'theme/Fonts'
import Button from 'components/common/Button'
import SheetHeader from 'components/common/SheetHeader'
import { Text, View } from 'components/Themed'
import useWallet from 'hooks/useWallet'

export default function DAppConnectModal({
  project,
  isConnecting,
  onRject,
  onConnect,
}: {
  project?: Project | { logo: string; url: string; title: string }
  isConnecting: boolean
  onRject: () => void
  onConnect: () => void
}) {
  const { wallet, walletApi } = useWallet()
  const insets = useSafeAreaInsets()
  const theme = useColorScheme()

  const title = project?.title || 'Unknown'

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
          <Text style={styles.description}>{i18n.t('Request')}</Text>
          <Text style={[styles.contractId, { color: Colors[theme].link }]}>
            {walletApi?.formattedAddress()}
          </Text>
          {wallet?.isLedger && isConnecting && (
            <Text
              style={{
                fontSize: 16,
                fontFamily: Fonts.heading,
                textAlign: 'center',
                color: Colors.red,
              }}
            >
              {i18n.t('Please confirm on your Ledger device')}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.buttonGroup}>
        {!isConnecting && (
          <Button
            label={i18n.t('Cancel')}
            style={{ marginHorizontal: 10 }}
            filled={false}
            onPress={onRject}
          />
        )}
        <Button
          label={i18n.t('Confirm')}
          type={ButtonType.PRIMARY}
          style={{ marginHorizontal: 10 }}
          filled={isConnecting}
          isLoading={isConnecting}
          onPress={onConnect}
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
