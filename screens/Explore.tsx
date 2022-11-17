import { useRef, useState } from 'react'
import { Portal } from 'react-native-portalize'
import { Modalize } from 'react-native-modalize'
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import SearchInput from 'components/common/SearchInput'
import DAppBlock from 'components/DApp/DAppBlock'

import { View } from 'components/Themed'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import { useAppSelector } from 'store/hooks'
import { Project, RootTabScreenProps } from 'types'
import StarredModal from 'components/Modals/StarredModal'
import { i18n } from 'locale'
import { Heart } from 'iconoir-react-native'
import EditorChoice from 'components/DApp/EditorChoice'
import { Empty } from 'components/common/Placeholder'
import useWallet from 'hooks/useWallet'
import icons from 'utils/icons'

export default function Explore({ navigation }: RootTabScreenProps<'Explore'>) {
  const [scrolled, setScrolled] = useState(false)
  const starredRef = useRef<any>()
  const { wallet } = useWallet()
  const chainDapps = useAppSelector((state) => state.dapp[wallet?.chain!])

  const goProject = (project: Project) => {
    navigation.navigate('DAppView', { project })
  }
  const theme = useColorScheme()
  const { width } = useWindowDimensions()
  const insets = useSafeAreaInsets()

  const divider = [styles.divider, { width: width - 40 }]

  const dividerStyle = [
    divider,
    {
      borderBottomColor: Colors[theme].borderColor,
    },
  ]

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: Colors[theme].background,
        },
      ]}
    >
      <View
        style={[
          styles.header,
          scrolled && {
            borderBottomColor: Colors[theme].borderColor,
            paddingBottom: 10,
            ...styles.scrolledHeader,
          },
        ]}
      >
        <SearchInput
          placeholder={i18n.t('Search awesome DApps')}
          defaultKeyword=""
          searchFor="DApp"
          onFocus={() => {
            navigation.navigate('SearchDApp')
          }}
          onSearch={(keyword) => {}}
        />
        <TouchableOpacity
          style={[styles.filterWrap, { backgroundColor: Colors.sun }]}
          onPress={() => {
            starredRef.current?.open()
          }}
          activeOpacity={0.9}
        >
          <Heart width={20} height={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        onScroll={({ nativeEvent }) => {
          setScrolled(nativeEvent.contentOffset.y > 3)
        }}
        scrollEventThrottle={300}
        onScrollToTop={({ nativeEvent }) => {
          setScrolled(false)
        }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 50 }}
      >
        <EditorChoice items={chainDapps?.edited || []} />
        {chainDapps?.catalogues?.map((cata) => {
          return [
            <DAppBlock
              key={cata.title}
              title={cata.title}
              subtitle={cata.subtitle}
              projects={cata.items}
              goProject={goProject}
            />,
            <View style={dividerStyle} key={`${cata.title}-divider`} />,
          ]
        })}
        {chainDapps?.catalogues?.length === 0 && (
          <Empty
            title={`No DApps for ${wallet?.chain}`}
            source={icons.DASHBOARD}
            style={{ marginTop: 150 }}
          />
        )}
      </ScrollView>

      <Portal>
        <Modalize ref={starredRef} adjustToContentHeight>
          <StarredModal
            navigation={navigation}
            onClose={() => starredRef?.current.close()}
          />
        </Modalize>
      </Portal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginLeft: 20,
  },
  header: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  filterWrap: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.gray9,
    borderRadius: 21,
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 20,
    top: -1,
  },
  scrolledHeader: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
})
