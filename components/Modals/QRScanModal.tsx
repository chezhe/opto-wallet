import { Camera, BarCodeScanningResult } from 'expo-camera'
import { Text, View } from 'components/Themed'
import { useEffect, useState } from 'react'
import { StyleSheet, useWindowDimensions } from 'react-native'
import Styles from 'theme/Styles'
import Button from 'components/common/Button'
import { i18n } from 'locale'
import Box from 'components/common/Box'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import { BarCodeScanner } from 'expo-barcode-scanner'

export default function QRScanModal({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void
  onConfirm: (result: string) => void
}) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [scanned, setScanned] = useState(false)

  useEffect(() => {
    Camera.requestCameraPermissionsAsync().then(({ status }) => {
      setHasPermission(status === 'granted')
    })
  }, [])

  const handleBarCodeScanned = ({ type, data }: BarCodeScanningResult) => {
    if (!scanned) {
      setScanned(true)
      onConfirm(data)
      setTimeout(() => {
        setScanned(false)
      }, 3000)
    }
  }

  const { width } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const theme = useColorScheme()

  return (
    <Box
      direction="column"
      style={{
        ...Styles.page,
        paddingBottom: insets.bottom,
        paddingTop: 30,
        backgroundColor: Colors[theme].modalBackground,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
      }}
    >
      {hasPermission ? (
        <Camera
          onBarCodeScanned={handleBarCodeScanned}
          style={{ width: width - 40, height: width - 40 }}
          barCodeScannerSettings={{
            barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
          }}
          ratio="1:1"
        />
      ) : (
        <View
          style={{
            width: width - 40,
            height: width - 40,
            backgroundColor: Colors.black,
          }}
        ></View>
      )}

      {hasPermission === null && (
        <Text style={styles.tip}>Requesting for camera permission</Text>
      )}
      {hasPermission === false && (
        <Text style={styles.tip}>No access to camera</Text>
      )}

      <Box gap="large" style={{ paddingHorizontal: 20, paddingVertical: 15 }}>
        <Button label={i18n.t('Cancel')} onPress={onCancel} />
      </Box>
    </Box>
  )
}

const styles = StyleSheet.create({
  tip: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 10,
  },
})
