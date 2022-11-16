import NFT from 'components/Assets/NFT'
import { View } from 'components/Themed'
import useColorScheme from 'hooks/useColorScheme'
import { i18n } from 'locale'
import { useState } from 'react'
import {
  Animated,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native'
import {
  NavigationState,
  Route,
  SceneMap,
  SceneRendererProps,
  TabView,
} from 'react-native-tab-view'
import Colors from 'theme/Colors'
import Fonts from 'theme/Fonts'
import TokenList from './TokenList'

export default function AssetsTab({
  isUpdatingTokenList,
}: {
  isUpdatingTokenList: boolean
}) {
  const [index, setIndex] = useState(0)

  const { width } = useWindowDimensions()
  const theme = useColorScheme()

  const routes = [
    { key: 'token', title: i18n.t('Token') },
    { key: 'nft', title: 'NFT' },
  ]

  const renderScene = SceneMap({
    token: () => <TokenList isUpdatingTokenList={isUpdatingTokenList} />,
    nft: NFT,
  })

  const renderTabBar = (
    props: SceneRendererProps & { navigationState: NavigationState<Route> }
  ) => {
    const inputRange = props.navigationState.routes.map((x, i) => i)

    return (
      <View style={styles.tabBar}>
        {props.navigationState.routes.map((route, i) => {
          const opacity = props.position.interpolate({
            inputRange,
            outputRange: inputRange.map((inputIndex: number) =>
              inputIndex === i ? 1 : 0.3
            ),
          })

          return (
            <Pressable
              key={i}
              style={[
                styles.tabItem,
                {
                  borderColor:
                    index === i
                      ? Colors[theme].text
                      : Colors[theme].bannerBackground,
                },
              ]}
              onPress={() => {
                setIndex(i)
              }}
            >
              <Animated.Text
                style={[
                  styles.heading,
                  {
                    opacity,
                    color: Colors[theme].text,
                  },
                ]}
              >
                {route.title}
              </Animated.Text>
            </Pressable>
          )
        })}
      </View>
    )
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors[theme].cardBackground,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
      }}
    >
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width }}
        style={{ paddingTop: 0 }}
        renderTabBar={renderTabBar}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  heading: {
    fontFamily: Fonts.heading,
    fontSize: 18,
    lineHeight: 42,
    textAlign: 'center',
  },
  tabBar: {
    flexDirection: 'row',
  },
  tabItem: {
    borderBottomWidth: 2,
    flex: 1,
  },
})
