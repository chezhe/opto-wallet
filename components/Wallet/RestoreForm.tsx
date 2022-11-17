import * as bip39 from 'bip39'
import Box from 'components/common/Box'
import Button from 'components/common/Button'
import Heading from 'components/common/Heading'
import useColorScheme from 'hooks/useColorScheme'
import { i18n } from 'locale'
import { useEffect, useMemo, useState } from 'react'
import {
  ScrollView,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Keyboard,
  KeyboardEvent,
  Platform,
} from 'react-native'
import Colors from 'theme/Colors'
import Fonts from 'theme/Fonts'
import { Text } from 'components/Themed'
import { Chain, NetworkType, WalletSource } from 'types'
import { capitalizeFirstLetter } from 'utils/format'
import dictionary from 'utils/words.json'
import WalletFactory from 'chain/WalletFactory'
import { KeyAltBack, NumberedListLeft } from 'iconoir-react-native'

export default function RestoreForm({
  isNew,
  onNext,
  chain,
  restoring,
}: {
  isNew: boolean
  onNext: ({
    value,
    source,
    networkType,
  }: {
    value: string
    source: WalletSource
    networkType: NetworkType
  }) => void
  chain: Chain
  restoring: boolean
}) {
  const [networkType, setNetworkType] = useState(NetworkType.MAINNET)
  const [source, setSource] = useState(WalletSource.MNEMONIC)
  const [value, setValue] = useState('')
  const [wordList, setWordList] = useState<string[]>([])
  const [wordListWrapBottom, setWordListWrapBottom] = useState(0)

  const theme = useColorScheme()

  const isValid = useMemo(() => {
    if (source === WalletSource.PRIVATE_KEY) {
      return !!value
    }
    return bip39.validateMnemonic(value.trim())
  }, [value, source])

  useEffect(() => {
    if (source === WalletSource.MNEMONIC) {
      const onHide = () => {
        setWordListWrapBottom(0)
      }
      const onShow = (event: KeyboardEvent) => {
        setWordListWrapBottom(event.endCoordinates.height)
      }
      const unsubHide = Keyboard.addListener('keyboardDidHide', onHide)
      const unsubShow = Keyboard.addListener('keyboardDidShow', onShow)

      return () => {
        unsubHide && unsubHide.remove()
        unsubShow && unsubShow.remove()
      }
    }
  }, [source])

  const onChangeText = (text: string) => {
    if (restoring) {
      return
    }
    setValue(text)

    const inputedWords = text
      .trim()
      .split(/\s+/)
      .map((part) => part.toLowerCase())

    const inputingWord = inputedWords[inputedWords.length - 1]
    if (inputingWord) {
      const wordList = dictionary.filter((t) => t.startsWith(inputingWord))
      if (wordList.length === 1 && wordList[0] === inputingWord) {
        setWordList([])
      } else {
        setWordList(wordList.slice(0, 10))
      }
    } else {
      setWordList([])
    }
  }

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{ flex: 1 }}
      enabled={Platform.OS === 'ios'}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingTop: 50,
        }}
      >
        <Box
          direction="column"
          align="center"
          style={{ paddingHorizontal: 20 }}
          full
        >
          <Heading>{i18n.t('Restore')}</Heading>
        </Box>

        <Box
          direction="column"
          gap="medium"
          style={{ marginTop: 20, paddingHorizontal: 20 }}
          full
        >
          <TextInput
            multiline
            autoCapitalize="none"
            numberOfLines={5}
            style={[styles.textarea, { color: Colors[theme].text }]}
            value={value}
            onChangeText={onChangeText}
            editable={!restoring}
            autoCorrect={false}
          />

          <Box direction="column" align="flex-start" full gap="small">
            <Text>{i18n.t('Type')}</Text>

            <Box direction="column" align="flex-start" full gap="small">
              <Pressable
                onPress={() => !restoring && setSource(WalletSource.MNEMONIC)}
                style={{
                  ...styles.source,
                  backgroundColor:
                    WalletSource.MNEMONIC === source
                      ? Colors.main
                      : Colors[theme].tabBarBg,
                }}
              >
                <Box gap="small">
                  <NumberedListLeft
                    width={24}
                    height={24}
                    color={
                      WalletSource.MNEMONIC === source ? '#fff' : Colors.gray
                    }
                  />
                  <Text style={styles.title}>{i18n.t('Mnemonic')}</Text>
                </Box>
              </Pressable>

              <Pressable
                onPress={() =>
                  !restoring && setSource(WalletSource.PRIVATE_KEY)
                }
                style={{
                  ...styles.source,
                  backgroundColor:
                    WalletSource.PRIVATE_KEY === source
                      ? Colors.main
                      : Colors[theme].tabBarBg,
                }}
              >
                <Box gap="small">
                  <KeyAltBack
                    width={24}
                    height={24}
                    color={
                      WalletSource.PRIVATE_KEY === source ? '#fff' : Colors.gray
                    }
                  />
                  <Text style={styles.title}>{i18n.t('Private Key')}</Text>
                </Box>
              </Pressable>
            </Box>
          </Box>

          {!WalletFactory.hasSameAddressByNetworkType(chain) && !isNew && (
            <Box direction="column" align="flex-start" full gap="small">
              <Text>Network</Text>

              <Box direction="column" align="flex-start" full gap="small">
                {[NetworkType.MAINNET, NetworkType.TESTNET].map((t, idx) => {
                  return (
                    <Pressable
                      key={t}
                      onPress={() => !restoring && setNetworkType(t)}
                      style={{
                        ...styles.source,
                        backgroundColor:
                          t === networkType
                            ? Colors.main
                            : Colors[theme].tabBarBg,
                      }}
                    >
                      <Text style={styles.title}>
                        {capitalizeFirstLetter(t)}
                      </Text>
                    </Pressable>
                  )
                })}
              </Box>
            </Box>
          )}

          <Button
            label={i18n.t('Confirm')}
            primary
            disabled={!isValid || restoring}
            isLoading={restoring}
            onPress={async () => {
              onNext({ value: value.trim(), source, networkType })
            }}
            style={{ marginTop: 20 }}
          />
        </Box>
      </ScrollView>

      {wordList.length !== 0 && wordListWrapBottom !== 0 && (
        <ScrollView
          style={{
            position: 'absolute',
            marginBottom: Platform.OS === 'android' ? 0 : wordListWrapBottom,
            bottom: 0,
            left: 0,
            padding: 10,
            backgroundColor: Colors[theme].bannerBackground,
            width: '100%',
          }}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
        >
          <Box gap="medium">
            {wordList.map((word) => {
              return (
                <Pressable
                  key={word}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    backgroundColor: Colors[theme].background,
                    borderRadius: 4,
                  }}
                  onPress={() => {
                    const inputedWords = value
                      .trim()
                      .split(/\s+/)
                      .map((part) => part.toLowerCase())

                    inputedWords.splice(inputedWords.length - 1, 1, word)
                    const text = inputedWords.join(' ') + ' '
                    onChangeText(text)
                  }}
                >
                  <Text style={{ fontSize: 18, fontFamily: Fonts.variable }}>
                    {word}
                  </Text>
                </Pressable>
              )
            })}
          </Box>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  textarea: {
    width: '100%',
    height: 120,
    borderColor: '#333',
    borderWidth: 2,
    borderRadius: 4,
    padding: 10,
    fontSize: 20,
    fontFamily: Fonts.variable,
    textAlignVertical: 'top',
  },
  title: {
    fontSize: 16,
    fontFamily: Fonts.heading,
  },
  source: {
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 4,
  },
})
