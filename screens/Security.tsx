import ScreenHeader from 'components/common/ScreenHeader'
import * as LocalAuthentication from 'expo-local-authentication'
import SettingBlock from 'components/Settings/SettingBlock'
import { View } from 'components/Themed'
import { FaceId, KeyAlt } from 'iconoir-react-native'
import { ScrollView, Switch } from 'react-native'
import { useAppDispatch, useAppSelector } from 'store/hooks'
import Styles from 'theme/Styles'
import { RootStackScreenProps } from 'types'
import { i18n } from 'locale'
import Toast from 'utils/toast'
import useAuth from 'hooks/useAuth'

export default function Security({
  navigation,
}: RootStackScreenProps<'Security'>) {
  const isAuthEnabled = useAppSelector((state) => state.setting.bioAuthEnabled)

  const dispatch = useAppDispatch()
  const auth = useAuth()

  const onChange = async () => {
    try {
      const hasAuth = await LocalAuthentication.hasHardwareAsync()
      if (!hasAuth) {
        throw new Error(i18n.t('No hardware auth detected'))
      }
      const result = await LocalAuthentication.authenticateAsync()
      if (!result.success) {
        throw new Error(i18n.t('Auth failed'))
      }
      dispatch({
        type: 'setting/updateBioAuth',
        payload: !isAuthEnabled,
      })
      if (isAuthEnabled) {
        Toast.success(i18n.t('Auth disabled'))
      } else {
        Toast.success(i18n.t('Auth enabled'))
      }
    } catch (error) {
      Toast.error(error)
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader title={i18n.t('Security')} />

      <ScrollView style={Styles.page}>
        <SettingBlock
          title=""
          items={[
            {
              icon: KeyAlt,
              title: 'PIN Code',
              value: '',
              onPress: () => {
                navigation.navigate('PINCode', {
                  onConfirmed: () => {
                    navigation.goBack()
                    navigation.navigate('ChangePINCode')
                  },
                })
              },
            },
            {
              icon: FaceId,
              title: 'Bio Auth',
              noChevron: true,
              value: (
                <Switch
                  onValueChange={() => {
                    auth(onChange)
                  }}
                  value={isAuthEnabled}
                />
              ),
              onPress: () => {},
            },
          ]}
        />
      </ScrollView>
    </View>
  )
}
