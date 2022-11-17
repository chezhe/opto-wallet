import Box from 'components/common/Box'
import SearchInput from 'components/common/SearchInput'
import { Text, View } from 'components/Themed'
import useColorScheme from 'hooks/useColorScheme'
import { i18n } from 'locale'
import { GraphUp, Trash } from 'iconoir-react-native'
import { FlatList, Pressable, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAppDispatch, useAppSelector } from 'store/hooks'
import Colors from 'theme/Colors'
import { DApp, Project, RootStackScreenProps } from 'types'
import { useEffect, useState } from 'react'
import useWallet from 'hooks/useWallet'
import ProjectItem from 'components/Project/Item'

export default function SearchDApp({
  navigation,
}: RootStackScreenProps<'SearchDApp'>) {
  const keywords = useAppSelector((state) => state.dapp.searchHistory ?? [])

  const { walletApi } = useWallet()
  const [hotSearches, setHotSearches] = useState<DApp[]>([])
  const theme = useColorScheme()
  const insets = useSafeAreaInsets()
  const dispatch = useAppDispatch()

  useEffect(() => {
    walletApi
      ?.getHotSearchDApps()
      .then((dapps) => {
        setHotSearches(dapps)
      })
      .catch((e) => {})
  }, [walletApi])

  const onSearch = (_keyword: string) => {
    const keyword = _keyword.trim()
    if (keyword.length === 0) {
      return
    }
    if (keyword.startsWith('https://') || keyword.startsWith('http://')) {
      navigation.goBack()
      navigation.navigate('DAppView', {
        url: keyword,
      })
    } else if (keyword.trim().length > 0) {
      navigation.goBack()
      navigation.navigate('SearchDAppResult', {
        keyword,
      })
    }
    dispatch({
      type: 'dapp/searched',
      payload: keyword,
    })
  }

  const goProject = (project: Project) => {
    navigation.navigate('DAppView', {
      project,
    })
  }

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor:
            theme === 'light' ? 'white' : Colors[theme].screenBackground,
          paddingTop: insets.top,
        },
      ]}
    >
      <Box pad="medium" gap="medium" style={{ paddingVertical: 0 }}>
        <SearchInput
          placeholder={i18n.t('Search awesome DApps')}
          defaultKeyword=""
          searchFor="DApp"
          autoFocus
          onSearch={onSearch}
        />
        <Text
          style={{ color: Colors[theme].link, fontSize: 20 }}
          onPress={() => navigation.goBack()}
        >
          {i18n.t('Cancel')}
        </Text>
      </Box>
      {keywords.length !== 0 && (
        <Box
          align="center"
          justify="space-between"
          style={{ paddingHorizontal: 20, paddingVertical: 10 }}
        >
          <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
            {i18n.t('Search history')}
          </Text>
          <Pressable
            onPress={() => {
              dispatch({
                type: 'dapp/clearHistory',
              })
            }}
          >
            <Trash width={24} height={24} color={Colors.gray9} />
          </Pressable>
        </Box>
      )}
      {keywords.length === 0 && (
        <Text
          style={{ textAlign: 'center', color: Colors.gray9, marginTop: 15 }}
        >
          {i18n.t('No record found')}
        </Text>
      )}
      <Box gap="medium" style={{ flexWrap: 'wrap', paddingHorizontal: 20 }}>
        {keywords.map((t) => {
          return (
            <Pressable
              key={t}
              style={[
                styles.kwWrap,
                {
                  backgroundColor: Colors[theme].inputBackground,
                },
              ]}
              onPress={() => onSearch(t)}
            >
              <Text style={styles.keyword}>{t}</Text>
            </Pressable>
          )
        })}
      </Box>
      <Box
        direction="row"
        gap="small"
        pad="medium"
        style={{ paddingHorizontal: 20 }}
      >
        <GraphUp width={24} height={24} color={Colors.gray9} strokeWidth={2} />
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
          {i18n.t('People are searching')}
        </Text>
      </Box>
      <FlatList
        data={hotSearches.slice(0, 10)}
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
  header: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  keyword: {
    fontSize: 18,
  },
  kwWrap: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginVertical: 5,
  },
  listWrap: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  item: {
    width: '100%',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: Colors.gray9,
    paddingHorizontal: 10,
  },
})
