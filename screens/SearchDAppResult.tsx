import { useRoute } from '@react-navigation/native'
import { FlatList, StyleSheet } from 'react-native'

import { Empty, Loading } from 'components/common/Placeholder'
import ScreenHeader from 'components/common/ScreenHeader'
import ProjectItem from 'components/Project/Item'
import { View } from 'components/Themed'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import { useAppSelector } from 'store/hooks'
import { Project, RootStackScreenProps } from 'types'
import Fonts from 'theme/Fonts'
import { i18n } from 'locale'
import { useEffect, useState } from 'react'
import { searchDapps } from 'utils/fetch'

export default function SearchDAppResult({
  navigation,
}: RootStackScreenProps<'SearchDAppResult'>) {
  const { params } = useRoute()
  const wallet = useAppSelector((state) => state.wallet.current)
  const [searching, setSearching] = useState(true)
  const keyword = (params as any).keyword as string
  const [result, setResult] = useState<Project[]>([])

  const theme = useColorScheme()

  useEffect(() => {
    searchDapps(wallet?.chain!, keyword)
      .then((res) => {
        setSearching(false)
        setResult(res)
      })
      .catch(() => {
        setSearching(false)
      })
  }, [keyword, wallet?.chain])

  const goProject = (project: Project) => {
    navigation.navigate('DAppView', {
      project,
    })
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors[theme].screenBackground }}>
      <ScreenHeader title={i18n.t('Search result')} />
      {!searching && result.length === 0 && <Empty title="No DApps Found" />}
      {searching && <Loading title="Searching..." />}
      <FlatList
        data={result.slice(0, 30)}
        renderItem={({ item }: { item: Project }) => {
          return (
            <ProjectItem
              project={item}
              style={styles.item}
              goProject={goProject}
            />
          )
        }}
        keyExtractor={(t) => t.title}
        style={styles.listWrap}
        contentContainerStyle={styles.content}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listWrap: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 50,
  },
  item: {
    width: '100%',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 30,
    fontFamily: Fonts.heading,
    color: '#999',
  },
  emptyIcon: {
    width: 70,
    height: 70,
  },
})
