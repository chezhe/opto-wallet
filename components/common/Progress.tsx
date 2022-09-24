import { StyleSheet } from 'react-native'
import Colors from 'theme/Colors'
import { View } from 'components/Themed'

export default function Progress({ value }: { value: number }) {
  return (
    <View style={styles.container}>
      <View style={[styles.progress, { width: `${value * 100}%` }]}></View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 2,
    backgroundColor: '#e3e3e3',
    width: '100%',
  },
  progress: {
    backgroundColor: Colors.link,
    height: 2,
  },
})
