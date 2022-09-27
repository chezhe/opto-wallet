import { i18n } from 'locale'
import {
  Animated,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native'
import NearStaking from 'components/Staking/NearStaking'
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
import Market from 'components/Staking/Market'
import { useAppSelector } from 'store/hooks'
import NoStaking from 'components/Staking/NoStaking'
import { Chain } from 'types'

export default function Finance() {
  const wallet = useAppSelector((state) => state.wallet.current)
  const { width } = useWindowDimensions()
  const [index, setIndex] = useState(0)
  const [routes] = useState([
    { key: 'staking', title: i18n.t('Staking') },
    { key: 'market', title: i18n.t('Market') },
  ])

  let staking = NoStaking
  if (wallet?.chain === Chain.NEAR) {
    staking = NearStaking
  }
  const renderScene = SceneMap({
    staking,
    market: Market,
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
              onPress={() => setIndex(i)}
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
