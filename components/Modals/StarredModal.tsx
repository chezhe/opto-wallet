import FastImage from 'react-native-fast-image'
import { i18n } from 'locale'
import { StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import { useAppSelector } from 'store/hooks'
import { Project } from 'types'
import SheetHeader from 'components/common/SheetHeader'
import { View } from 'components/Themed'

export default function StarredModal({
  navigation,
  onClose,
}: {
  navigation: any
  onClose: () => void
}) {
  const starred = useAppSelector((state) => state.dapp.starred)
  const { height } = useWindowDimensions()
  const goProject = (project: Project) => {
    onClose()
    navigation.navigate('DAppView', {
      project,
    })
  }
  const theme = useColorScheme()
  return (
    <View
      style={[
        {
          borderTopLeftRadius: 10,
          borderTopRightRadius: 10,
          height: height * 0.6,
        },
      ]}
    >
      <SheetHeader title={i18n.t('Liked DApps')} />
      <View
        style={[
          styles.content,
          {
            backgroundColor: Colors[theme].modalBackground,
          },
        ]}
      >
        {starred.map((project: Project) => (
          <TouchableOpacity
            key={project.title}
            onPress={() => {
              goProject(project)
              onClose()
            }}
          >
            <FastImage source={{ uri: project.logo }} style={styles.logo} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    padding: 10,
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 4,
    margin: 4,
  },
})
