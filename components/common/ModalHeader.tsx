import { Platform, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Fonts from 'theme/Fonts'
import { Text, View } from 'components/Themed'

export default function ModalHeader({ title }: { title: string }) {
  const insets = useSafeAreaInsets()
  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: Platform.OS === 'android' ? insets.top + 15 : 15,
        },
      ]}
    >
      <Text style={styles.headerText}>{title}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#333',
    padding: 15,
    width: '100%',
  },
  headerText: {
    textAlign: 'center',
    color: 'white',
    fontFamily: Fonts.heading,
    fontSize: 18,
  },
})
