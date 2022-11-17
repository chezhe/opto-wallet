import { ScrollView, StyleSheet, useWindowDimensions } from 'react-native'
import { Project } from 'types'
import { Text, View } from 'components/Themed'
import _ from 'lodash'
import ProjectItem from 'components/Project/Item'
import Colors from 'theme/Colors'
import Fonts from 'theme/Fonts'

export default function DAppBlock({
  title,
  subtitle,
  projects,
  goProject,
}: {
  title: string
  subtitle?: string
  projects: Project[]
  goProject: (project: Project) => void
}) {
  const { width } = useWindowDimensions()
  const chunkProjects = _.chunk(projects, 3)
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {chunkProjects.map((chunk, idx) => {
          return (
            <View key={idx} style={{ flexDirection: 'column' }}>
              {chunk.map((project) => {
                return (
                  <ProjectItem
                    key={project.title}
                    project={project}
                    goProject={goProject}
                    style={{
                      width: width - 50,
                      backgroundColor: 'transparent',
                    }}
                  />
                )
              })}
            </View>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    paddingLeft: 20,
    fontFamily: Fonts.heading,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray9,
    paddingLeft: 20,
    marginBottom: 10,
  },
})
