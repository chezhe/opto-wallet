import { Text, View } from 'components/Themed'
import { i18n } from 'locale'
import { Modal } from 'react-native'
import { Circle } from 'react-native-animated-spinkit'
import Colors from 'theme/Colors'
import Fonts from 'theme/Fonts'

export default function ScreenLoading({
  visible,
  title,
}: {
  visible: boolean
  title?: string
}) {
  if (!visible) {
    return null
  }
  return (
    <Modal animationType="fade" transparent={true} visible>
      <View
        style={{
          backgroundColor: 'rgba(0,0,0,0.5)',
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            padding: 20,
            backgroundColor: 'rgba(255,255,255,0.3)',
            borderRadius: 15,
          }}
        >
          <Circle size={80} color="#e3e3e3" />
          <Text
            style={{
              fontFamily: Fonts.heading,
              fontSize: 20,
              marginTop: 10,
              color: Colors.white,
              textAlign: 'center',
            }}
          >
            {i18n.t(title || 'Loading')}
          </Text>
        </View>
      </View>
    </Modal>
  )
}
