import FastImage from 'react-native-fast-image'
import { useNavigation } from '@react-navigation/native'
import { i18n } from 'locale'
import { useState } from 'react'
import { Pressable, StyleSheet, useWindowDimensions } from 'react-native'
import Carousel from 'react-native-snap-carousel'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import { EditorChoiceDapp, Project } from 'types'
import Fonts from 'theme/Fonts'
import { Text, View } from 'components/Themed'

export default function EditorChoice({ items }: { items: EditorChoiceDapp[] }) {
  const [active, setActive] = useState(0)
  const { width } = useWindowDimensions()
  const theme = useColorScheme()
  const navigation = useNavigation()

  const goProject = (project: Project) => {
    navigation.navigate('DAppView', {
      project,
    })
  }

  if (items.length === 0) {
    return null
  }

  return (
    <View style={{ width }}>
      <Text style={styles.title}>{i18n.t("Editors' choice")}</Text>
      <Carousel
        layout={'default'}
        data={items}
        sliderWidth={width}
        itemWidth={width - 10}
        renderItem={({ item }: { item: any }) => {
          return (
            <View
              style={[
                styles.card,
                {
                  width: width - 20,
                },
              ]}
            >
              <Text style={styles.appName}>{item.title}</Text>
              <Text style={styles.oneliner} numberOfLines={1}>
                {item.oneliner}
              </Text>
              <FastImage source={{ uri: item.banner }} style={styles.banner} />
              <View style={[styles.wrap]}>
                <FastImage source={{ uri: item.logo }} style={styles.logo} />
                <Pressable
                  style={[
                    styles.button,
                    {
                      backgroundColor: Colors[theme].link,
                    },
                  ]}
                  onPress={() => goProject(item)}
                >
                  <Text style={{ color: Colors[theme].background }}>
                    {i18n.t('Open')}
                  </Text>
                </Pressable>
              </View>
            </View>
          )
        }}
        onSnapToItem={(index: number) => setActive(index)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: '700',
    paddingLeft: 20,
    fontFamily: Fonts.heading,
    marginVertical: 15,
  },
  card: {
    borderRadius: 5,
    // height: 250,
    padding: 20,
    paddingTop: 0,
  },
  appName: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 30,
  },
  oneliner: {
    fontSize: 12,
    lineHeight: 20,
    color: Colors.gray9,
  },
  banner: {
    height: 200,
    width: '100%',
    borderRadius: 10,
    marginTop: 10,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  wrap: {
    position: 'absolute',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    bottom: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderBottomEndRadius: 10,
    borderBottomStartRadius: 10,
  },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
  },
})
