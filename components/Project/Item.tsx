import {
  Image,
  StyleProp,
  StyleSheet,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native'
import FastImage from 'react-native-fast-image'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import { Project } from 'types'
import { Text } from 'components/Themed'

export default function ProjectItem({
  project,
  goProject,
  style,
}: {
  project: Project
  goProject: (project: Project) => void
  style?: StyleProp<ViewStyle>
}) {
  const theme = useColorScheme()
  const { width } = useWindowDimensions()
  return (
    <TouchableWithoutFeedback style={{}} onPress={() => goProject(project)}>
      <View
        style={[
          styles.wrap,
          { backgroundColor: Colors[theme].cardBackground },
          style,
        ]}
      >
        <FastImage source={{ uri: project.logo }} style={styles.logo} />
        <View>
          <Text style={styles.title}>{project.title}</Text>
          <Text
            style={[
              styles.oneliner,
              {
                maxWidth: width - 140,
              },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {project.oneliner}
          </Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  wrap: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 4,
    borderRadius: 4,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray9,
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    marginBottom: 5,
  },
  oneliner: {
    fontSize: 12,
    color: Colors.gray9,
  },
})
