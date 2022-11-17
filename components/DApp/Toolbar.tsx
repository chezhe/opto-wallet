import { useNavigation } from '@react-navigation/native'
import { Cancel, MoreHoriz, NavArrowLeft } from 'iconoir-react-native'
import { RefObject } from 'react'
import { Image, StyleSheet, TouchableOpacity } from 'react-native'
import WebView from 'react-native-webview'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import { Project } from 'types'
import { formatWebviewTitle } from 'utils/format'
import Fonts from 'theme/Fonts'
import { Text, View } from 'components/Themed'

export default function ToolBar({
  title,
  project,
  canGoBack,
  webviewRef,
  setIsOptionVisible,
}: {
  title: string
  project?: Project
  canGoBack: boolean
  webviewRef: RefObject<WebView>
  setIsOptionVisible: (isOptionVisible: boolean) => void
}) {
  const navigation = useNavigation()
  const theme = useColorScheme()
  const hitSlop = {
    left: 15,
    top: 15,
    right: 15,
    bottom: 15,
  }
  return (
    <View style={styles.header}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          if (canGoBack) {
            webviewRef.current?.goBack()
          }
        }}
      >
        <View style={styles.row}>
          {canGoBack && (
            <NavArrowLeft width={30} height={30} color={Colors[theme].link} />
          )}
          {!!project && (
            <Image source={{ uri: project.logo }} style={styles.projectLogo} />
          )}
          <Text style={styles.title}>
            {project?.title || formatWebviewTitle(title)}
          </Text>
        </View>
      </TouchableOpacity>
      <View style={[styles.menuWrap]}>
        <TouchableOpacity
          activeOpacity={0.9}
          hitSlop={hitSlop}
          onPress={() => setIsOptionVisible(true)}
        >
          <MoreHoriz width={20} height={20} color="white" />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          activeOpacity={0.9}
          hitSlop={hitSlop}
          onPress={() => navigation.goBack()}
        >
          <Cancel width={20} height={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuWrap: {
    backgroundColor: Colors.gray9,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 30,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: 'white',
    marginHorizontal: 10,
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.heading,
    color: Colors.link,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  projectLogo: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 5,
  },
})
