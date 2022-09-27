import { CHAINS } from 'chain/common/constants'
import Box from 'components/common/Box'
import ScreenHeader from 'components/common/ScreenHeader'
import { Text, View } from 'components/Themed'
import useColorScheme from 'hooks/useColorScheme'
import { NavArrowRight } from 'iconoir-react-native'
import { i18n } from 'locale'
import { Image, Pressable, ScrollView, StyleSheet } from 'react-native'
import Colors from 'theme/Colors'
import Fonts from 'theme/Fonts'
import Styles from 'theme/Styles'
import { Chain, RootStackScreenProps } from 'types'

export default function Networks({
  navigation,
}: RootStackScreenProps<'Networks'>) {
  const theme = useColorScheme()
  return (
    <View style={Styles.fill}>
      <ScreenHeader title={i18n.t('Networks')} />
      <ScrollView style={Styles.scrollview}>
        <Box direction="column" gap="small" full>
          {CHAINS.map((chain) => {
            return (
              <Pressable
                key={chain.chain}
                style={[
                  styles.chainWrap,
                  {
                    backgroundColor: Colors[theme].cardBackground,
                  },
                ]}
                onPress={() =>
                  navigation.navigate('ChainNetworks', { chain: chain.chain })
                }
              >
                <Box pad="medium" direction="row" gap="medium">
                  <Image source={chain.icon} style={styles.chainLogo} />
                  <Text style={styles.chainName}>{chain.chain}</Text>
                </Box>

                <NavArrowRight width={24} height={24} color={Colors.gray9} />
              </Pressable>
            )
          })}
        </Box>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  chainWrap: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    paddingRight: 10,
  },
  chainLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  chainName: {
    fontSize: 18,
    fontFamily: Fonts.heading,
  },
})
