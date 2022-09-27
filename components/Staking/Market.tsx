import { useNavigation } from '@react-navigation/native'
import Box from 'components/common/Box'
import { ComingSoon } from 'components/common/Placeholder'
import { Text, View } from 'components/Themed'
import API from 'configure/api'
import useColorScheme from 'hooks/useColorScheme'
import { ArrowRight } from 'iconoir-react-native'
import { Image, Pressable, ScrollView, StyleSheet } from 'react-native'
import useSWR from 'swr'
import Colors from 'theme/Colors'
import Fonts from 'theme/Fonts'
import { MarketItem } from 'types'
import { fetcher } from 'utils/fetch'
import { getBuildVersion } from 'utils/helper'

export default function Market() {
  const { data: sections, error } = useSWR<
    { title: string; items: MarketItem[] }[]
  >(`${API.indexer}/api/market?version=${getBuildVersion()}`, fetcher)

  const theme = useColorScheme()
  const navigation = useNavigation()
  const isLoading = !sections && !error

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
      {sections?.map((section) => {
        return (
          <Box
            direction="column"
            gap="small"
            key={section.title}
            full
            align="flex-start"
            style={{ marginBottom: 20 }}
          >
            <Text style={styles.stitle}>{section.title}</Text>
            <Box direction="column" gap="small" full>
              {section.items.map((t) => {
                return (
                  <Pressable
                    key={t.title}
                    style={{ width: '100%' }}
                    onPress={() => {
                      navigation.navigate('DAppView', { url: t.url })
                    }}
                  >
                    <View
                      style={[
                        styles.card,
                        {
                          backgroundColor: Colors[theme].cardBackground,
                        },
                      ]}
                    >
                      <Box
                        direction="row"
                        align="center"
                        justify="center"
                        gap="small"
                      >
                        <Image source={{ uri: t.logo }} style={styles.image} />
                        <Box direction="column" align="flex-start">
                          <Text style={styles.ititle}>{t.title}</Text>
                          {!!t.subtitle && (
                            <Text style={styles.subtitle}>{t.subtitle}</Text>
                          )}
                        </Box>
                      </Box>
                      <View style={{ transform: [{ rotateZ: '-45deg' }] }}>
                        <ArrowRight
                          width={30}
                          height={30}
                          color={Colors.link}
                        />
                      </View>
                    </View>
                  </Pressable>
                )
              })}
            </Box>
          </Box>
        )
      })}
      {!isLoading && sections?.length === 0 && <ComingSoon />}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  stitle: {
    fontSize: 20,
    fontFamily: Fonts.heading,
  },
  ititle: {
    fontSize: 18,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray9,
  },
  card: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    width: '100%',
  },
  image: {
    height: 50,
    width: 50,
  },
})
