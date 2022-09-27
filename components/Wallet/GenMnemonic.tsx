import { useEffect, useState } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import Fonts from 'theme/Fonts'
import Button from 'components/common/Button'
import { Text, View } from 'components/Themed'
import { ButtonType } from 'types'
import { i18n } from 'locale'
import _ from 'lodash'
import { WarningTriangleOutline } from 'iconoir-react-native'
import Heading from 'components/common/Heading'
import { generateMnemonic } from 'chain/common'

export default function GenMnemonic({
  onNext,
  steps,
  stepIndex,
}: {
  onNext: (mnemonic: string) => void
  steps: any[]
  stepIndex: number
}) {
  const [mnemonic, setMnemonic] = useState('')
  const [confirmTick, setConfirmTick] = useState(3)

  const theme = useColorScheme()

  useEffect(() => {
    if (!mnemonic) {
      generateMnemonic()
        .then((mnemonic) => {
          setMnemonic(mnemonic)
        })
        .catch(console.log)
    } else {
      if (confirmTick > 0) {
        setTimeout(() => {
          setConfirmTick(confirmTick - 1)
        }, 1000)
      }
    }
  }, [mnemonic, confirmTick])

  return (
    <ScrollView style={styles.container}>
      <Heading>
        ({stepIndex}/{steps.length}) {i18n.t('Mnemonic')}
      </Heading>
      <View style={{ marginTop: 20 }}>
        {_.chunk(mnemonic.split(' '), 3).map((words, index) => {
          return (
            <View key={index} style={styles.row}>
              {words.map((word, idx) => {
                return (
                  <View
                    key={`${word}-${idx}`}
                    style={[styles.wordWrap, { borderColor: '#999' }]}
                  >
                    <Text style={[styles.word, { color: Colors[theme].link }]}>
                      {word}
                    </Text>
                  </View>
                )
              })}
            </View>
          )
        })}
      </View>
      <View style={styles.tipWrap}>
        <WarningTriangleOutline width={18} height={18} color="red" />
        <Text style={styles.tip} numberOfLines={2}>
          {i18n.t('Please keep the seed phrase safe')}
        </Text>
      </View>
      <Button
        label={`${i18n.t('Confirm')} ${
          confirmTick > 0 ? `(${confirmTick}s)` : ''
        }`}
        type={ButtonType.PRIMARY}
        disabled={confirmTick > 0}
        style={{ width: '100%', marginTop: 40, marginHorizontal: 0 }}
        onPress={async () => {
          onNext(mnemonic)
        }}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wordWrap: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 4,
    paddingVertical: 8,
    marginHorizontal: 2,
    marginVertical: 2,
  },
  word: {
    fontFamily: Fonts.variable,
    fontSize: 16,
  },
  tipWrap: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tip: {
    fontSize: 16,
    marginLeft: 10,
    maxWidth: '100%',
  },
})
