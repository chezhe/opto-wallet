import { useNavigation } from '@react-navigation/native'
import * as LocalAuthentication from 'expo-local-authentication'
import { useCallback } from 'react'
import { useAppSelector } from 'store/hooks'
import Toast from 'utils/toast'

export default function useAuth() {
  const bioAuthEnabled = useAppSelector((state) => state.setting.bioAuthEnabled)
  const pincode = useAppSelector((state) => state.setting.pincode)
  const navigation = useNavigation()

  return useCallback(
    async (onAuthed: () => void, onNoAuth = () => {}) => {
      try {
        if (bioAuthEnabled) {
          const result = await LocalAuthentication.authenticateAsync()
          if (!result.success) {
            navigation.navigate('PINCode', {
              onConfirmed: onAuthed,
            })
          } else {
            onAuthed()
          }
        } else if (pincode) {
          navigation.navigate('PINCode', {
            onConfirmed: onAuthed,
          })
        } else {
          onNoAuth()
        }
      } catch (error) {
        Toast.error(error)
      }
    },
    [bioAuthEnabled, pincode]
  )
}
