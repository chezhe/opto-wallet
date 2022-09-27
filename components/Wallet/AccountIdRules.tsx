import { i18n } from 'locale'
import { StyleSheet } from 'react-native'
import { Text, View } from 'components/Themed'

type Rule = {
  ul: string
  lis: string[]
}

export default function AccountIdRules({ rules }: { rules: Rule[] }) {
  const color = '#999'
  return (
    <View style={styles.container}>
      {rules.map((rule, index) => {
        return (
          <View key={rule.ul} style={styles.ulWrap}>
            <Text style={[{ color }]}>{i18n.t(rule.ul)}</Text>
            <View>
              {rule.lis.map((li, index) => {
                return (
                  <View key={li} style={styles.liWrap}>
                    <Text style={[{ color }]}>- {i18n.t(li)}</Text>
                  </View>
                )
              })}
            </View>
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {},
  ulWrap: {
    marginBottom: 15,
  },
  liWrap: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
})
