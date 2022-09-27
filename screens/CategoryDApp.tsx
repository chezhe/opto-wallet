import { useRoute } from '@react-navigation/native'
import { useState } from 'react'
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native'

import ScreenHeader from 'components/common/ScreenHeader'
import ProjectItem from 'components/Project/Item'
import { View, Text } from 'components/Themed'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import { Category, Project, RootStackScreenProps } from 'types'
import { PAGE_SIZE } from 'chain/near/constants'
import Fonts from 'theme/Fonts'

export default function CategoryDApp({
  navigation,
}: RootStackScreenProps<'CategoryDApp'>) {
  const [page, setPage] = useState(1)
  const [activeChild, setActiveChild] = useState('')
  const { params } = useRoute()
  const category = (params as any).category as Category

  const goProject = (project: Project) => {
    navigation.navigate('DAppView', {
      project,
    })
  }

  const cateName = category.name.toUpperCase()
  const dapps: Project[] = []
  const _dapps = dapps.filter((d: Project) => {
    if (activeChild) {
      return d.categories.includes(activeChild.toUpperCase())
    }
    return true
  })

  const theme = useColorScheme()
  const activeTag = {
    backgroundColor: Colors[theme].link,
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors[theme].screenBackground }}>
      <ScreenHeader title={category.name} />
      <View style={styles.rowWrap}>
        {category.children.map((child) => {
          const isActive = child.name === activeChild
          return (
            <TouchableOpacity
              key={child.name}
              style={[styles.tag, isActive && activeTag]}
              onPress={() =>
                setActiveChild(child.name === activeChild ? '' : child.name)
              }
            >
              <View style={styles.tagWrap}>
                <Text
                  style={[
                    styles.tagText,
                    {
                      color: isActive ? 'white' : Colors[theme].link,
                    },
                  ]}
                >
                  {`#${child.name}`}
                </Text>
              </View>
            </TouchableOpacity>
          )
        })}
      </View>
      <FlatList
        data={_dapps.slice(0, PAGE_SIZE * page)}
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
        onMomentumScrollEnd={({ nativeEvent }) => {
          if (nativeEvent.contentOffset.y > 0) {
            setPage(page + 1)
          }
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  listWrap: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  item: {
    width: '100%',
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
  },
  tag: {
    marginRight: 10,
    marginBottom: 10,
  },
  tagText: {
    fontSize: 16,
    fontFamily: Fonts.heading,
  },
  activeTagText: {
    color: 'white',
  },
  tagWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
})
