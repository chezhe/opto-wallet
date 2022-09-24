import { Image, ImageSourcePropType, StyleSheet, ViewStyle } from 'react-native'
import { Text, View } from 'components/Themed'
import Fonts from 'theme/Fonts'
import { EmojiLookTop } from 'iconoir-react-native'
import Colors from 'theme/Colors'
import icons from 'utils/icons'
import { CircleFade } from 'react-native-animated-spinkit'

export function Empty({
  title,
  icon,
  style = {},
}: {
  title: string
  icon?: ImageSourcePropType
  style?: ViewStyle
}) {
  return (
    <View style={[styles.content, style]}>
      <Image source={icons.GHOST} style={styles.image} />
      <Text style={styles.placeholder}>{title}</Text>
    </View>
  )
}

export function Loading({ title }: { title: string }) {
  return (
    <View style={styles.content}>
      <CircleFade size={100} color={Colors.gray9} />
      <Text style={styles.placeholder}>{title}</Text>
    </View>
  )
}

export function ComingSoon({
  title = 'Coming Soon',
  source,
}: {
  title?: string
  source?: ImageSourcePropType
}) {
  return (
    <View style={[styles.content, { justifyContent: 'flex-start' }]}>
      {source ? (
        <Image
          source={source}
          style={{
            width: 200,
            height: 200,
          }}
        />
      ) : (
        <EmojiLookTop
          width={100}
          height={100}
          color={Colors.gray9}
          strokeWidth={1}
        />
      )}
      <Text style={[styles.placeholder, { marginTop: 20 }]}>{title}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 50,
    marginTop: 50,
  },
  image: {
    width: 150,
    height: 150,
  },
  placeholder: {
    fontSize: 20,
    color: '#999',
    fontFamily: Fonts.heading,
    marginTop: 10,
    textAlign: 'center',
  },
})
