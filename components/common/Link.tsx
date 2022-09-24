import { Text } from 'components/Themed'
import { Pressable } from 'react-native'
import Colors from 'theme/Colors'
import * as WebBrowser from 'expo-web-browser'

export default function Link({ label, href }: { label: string; href: string }) {
  return (
    <Pressable
      onPress={() => {
        WebBrowser.openBrowserAsync(href)
      }}
    >
      <Text style={{ fontSize: 16, color: Colors.link }}>{label}</Text>
    </Pressable>
  )
}
