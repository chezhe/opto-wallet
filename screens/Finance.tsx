import { i18n } from 'locale'
import {
  Animated,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native'
import Staking from 'components/Finance/Staking'
import { View } from 'components/Themed'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import Fonts from 'theme/Fonts'
import {
  TabView,
  SceneMap,
  SceneRendererProps,
  NavigationState,
  Route,
} from 'react-native-tab-view'
import { useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Market from 'components/Finance/Market'
import NFT from 'components/Finance/NFT'
import { useAppSelector } from 'store/hooks'

export default function Finance() {
  const DEFAULT_ROUTES = [
    { key: 'staking', title: i18n.t('Staking') },
    { key: 'market', title: i18n.t('Market') },
    { key: 'nft', title: 'NFT' },
  ]

  const { isNFTEnabled } = useAppSelector((state) => state.setting)
  const { width } = useWindowDimensions()
  const [index, setIndex] = useState(0)
  const [routes] = useState(
    DEFAULT_ROUTES.filter((t) => {
      if (t.key === 'nft') {
        return isNFTEnabled
      }
      return true
    })
  )

  const renderScene = SceneMap({
    staking: Staking,
    market: Market,
    nft: NFT,
  })
  const insets = useSafeAreaInsets()
  const theme = useColorScheme()
  
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
                  borderColor: index === i ? Colors[theme].text : 'transparent',
                },
              ]}
              onPress={() => {
                setIndex(i)
              }}
            >
              <Animated.Text
                style={[styles.heading, { opacity, color: Colors[theme].text }]}
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
    <View style={{ flex: 1, backgroundColor: Colors[theme].screenBackground }}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width }}
        style={{ paddingTop: insets.top }}
        renderTabBar={renderTabBar}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  heading: {
    fontFamily: Fonts.heading,
    fontSize: 30,
    lineHeight: 40,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingLeft: 10,
  },
  tabItem: {
    marginHorizontal: 10,
    borderBottomWidth: 4,
  },
})
