import Box from 'components/common/Box'
import SearchInput from 'components/common/SearchInput'
import { Text, View } from 'components/Themed'
import useColorScheme from 'hooks/useColorScheme'
import { i18n } from 'locale'
import { Trash } from 'iconoir-react-native'
import { Pressable, StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAppDispatch, useAppSelector } from 'store/hooks'
import Colors from 'theme/Colors'
import { RootStackScreenProps } from 'types'

export default function SearchDApp({
  navigation,
}: RootStackScreenProps<'SearchDApp'>) {
  const keywords = useAppSelector((state) => state.dapp.searchHistory ?? [])

  const theme = useColorScheme()
  const insets = useSafeAreaInsets()
  const dispatch = useAppDispatch()

  const onSearch = (_keyword: string) => {
    const keyword = _keyword.trim()

    if (keyword.startsWith('https://')) {
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
})
