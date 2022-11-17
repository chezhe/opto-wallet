import { i18n } from 'locale'
import {
  CheckCircledOutline,
  WarningCircledOutline,
} from 'iconoir-react-native'
import { StyleSheet } from 'react-native'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import { LOGIN_ACCESS_TYPES } from 'types'
import Fonts from 'theme/Fonts'
import { Text, View } from 'components/Themed'

const limited = [
  'View the address of your permitted wallet',
  'View the balance of your permitted wallet',
  'Call methods on the smart contract on behalf of your permitted wallet',
]

const full = [
  'View the address of your permitted wallet',
  'View the balance of your permitted wallet',
  'Create new accounts',
  'Deploy smart contracts',
  'Detailed description of transaction',
  'Transfer tokens from your account to other accounts',
  'Stake and unstake NEAR tokens',
  'Create and delete access keys',
]

export default function AccessList({
  loginAccessType,
}: {
  loginAccessType: LOGIN_ACCESS_TYPES
}) {
  const isLimited = loginAccessType === LOGIN_ACCESS_TYPES.LIMITED_ACCESS
  const theme = useColorScheme()
  return (
    <View>
      {(isLimited ? limited : full).map((item, index) => {
        return (
          <View key={item} style={styles.accessRow}>
            <CheckCircledOutline
              width={16}
              height={16}
              color={Colors[theme].text}
            />
            <Text style={styles.accessText}>{i18n.t(item)}</Text>
          </View>
        )
      })}
      {!isLimited && (
        <View style={styles.accessRow}>
          <WarningCircledOutline
            width={16}
            height={16}
            color={Colors.dark.link}
          />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  accessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  accessText: {
    fontSize: 14,
    fontFamily: Fonts.variable,
    marginLeft: 10,
  },
})
