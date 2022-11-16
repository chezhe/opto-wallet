import { View } from 'components/Themed'
import useColorScheme from 'hooks/useColorScheme'
import { FlatList, StyleSheet, useWindowDimensions } from 'react-native'
import Colors from 'theme/Colors'
import { BasePreviewSignParams } from 'types'
import SignKeyValue from './SignKeyValue'

export default function SignParamsList({
  previewSignParams,
  heightRatio = 0.4,
}: {
  previewSignParams: BasePreviewSignParams[]
  heightRatio?: number
}) {
  const length = previewSignParams.length
  const theme = useColorScheme()
  const { height } = useWindowDimensions()
  return (
    <FlatList
      data={previewSignParams}
      keyExtractor={(item, index) => index.toString()}
      style={{
        maxHeight: height * heightRatio,
        borderWidth: 2,
        padding: 10,
        width: '100%',
        borderColor: Colors[theme].borderColor,
      }}
      renderItem={({ item, index }) => {
        return (
          <View
            style={[
              styles.item,
              {
                borderBottomColor: Colors.green,
                borderBottomWidth: length - 1 === index ? 0 : 1,
              },
            ]}
          >
            {Object.keys(item).map((key) => {
              return <SignKeyValue key={key} title={key} value={item[key]} />
            })}
          </View>
        )
      }}
    />
  )
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    paddingHorizontal: 10,
  },
  item: {
    paddingVertical: 8,
  },
})
