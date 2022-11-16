import FastImage from 'react-native-fast-image'
import { useNavigation } from '@react-navigation/native'
import Box from 'components/common/Box'
import { Text, View } from 'components/Themed'
import useColorScheme from 'hooks/useColorScheme'
import { ArrowRight } from 'iconoir-react-native'
import { Pressable, StyleSheet } from 'react-native'
import Colors from 'theme/Colors'
import { MarketItem } from 'types'

export default function MarketItemCard({
  item,
  onPress,
}: {
  item: MarketItem
  onPress: (item: MarketItem) => void
}) {
  const navigation = useNavigation()
  const theme = useColorScheme()
  return (
    <Pressable
      style={{ width: '100%' }}
      onPress={() => {
        onPress(item)
        navigation.navigate('DAppView', { project: item })
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
        <Box direction="row" align="center" justify="center" gap="small">
          <FastImage source={{ uri: item.logo }} style={styles.image} />
          <Box direction="column" align="flex-start">
            <Text style={styles.ititle}>{item.title}</Text>
            {!!item.subtitle && (
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            )}
          </Box>
        </Box>
        <View style={{ transform: [{ rotateZ: '-45deg' }] }}>
          <ArrowRight width={30} height={30} color={Colors.link} />
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  ititle: {
    fontSize: 18,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray9,
    marginTop: 4,
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
