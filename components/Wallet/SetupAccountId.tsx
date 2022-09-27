import { i18n } from 'locale'
import _ from 'lodash'
import { useState } from 'react'
import { ScrollView, StyleSheet, Switch, TouchableOpacity } from 'react-native'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import { initNear } from 'hooks/useClient'
import { ButtonType, Chain, NetworkType, NewWalletSetup, Wallet } from 'types'
import { accountExists } from 'chain/near/utils'
import { NEAR_NETWORKS } from 'chain/near/constants'
import Fonts from 'theme/Fonts'
import Button from 'components/common/Button'
import { Text, View } from 'components/Themed'
import AccountIdRules from './AccountIdRules'
import AnimatedInput from 'components/common/AnimatedInput'
import Box from 'components/common/Box'
import Radio from 'components/common/Radio'
import Heading from 'components/common/Heading'
import { getNetwork } from 'chain/common/network'

const rules = [
  {
    ul: 'Your account ID can contain any of the following',
    lis: [
      'Lowercase characters (a-z)',
      'Digits (0-9)',
      'Characters (_-) can be used as separators',
    ],
  },
  {
    ul: 'Your account ID CANNOT contain',
    lis: [
      'Characters symbol',
      'Fewer than 2 characters',
      'More than 64 characters',
    ],
  },
]

export default function SetupAccountId({
  onNext,
}: {
  onNext: ({
    accountId,
    networkType,
  }: Pick<NewWalletSetup, 'accountId' | 'networkType'>) => void
}) {
  const [newAccountId, setNewAccountId] = useState('')
  const [newNetworkType, setNewNetworkType] = useState(NetworkType.MAINNET)
  const [errorMsg, setErrorMsg] = useState('')
  const [accountIdFocused, setAccountIdFocused] = useState(false)
  const [isImplicit, setIsImplicit] = useState(false)
  const theme = useColorScheme()
  const network = NEAR_NETWORKS[newNetworkType]

  const checkAvailability = _.throttle(
    async (newNetworkType: NetworkType, newAccountId: string) => {
      try {
        const fakeWallet: Wallet = {
          chain: Chain.NEAR,
          networkType: newNetworkType,
          address: newAccountId + NEAR_NETWORKS[newNetworkType].suffix,
          publicKey: '',
        }
        const network = getNetwork(fakeWallet)
        if (!network) {
          throw new Error('Invalid network')
        }
        const near = await initNear(network)
        const isExist = await accountExists(
          near,
          newAccountId + NEAR_NETWORKS[newNetworkType].suffix
        )
        if (isExist) {
          setErrorMsg(i18n.t('Account already exists'))
        } else {
          setErrorMsg('')
        }
      } catch (error) {
        console.error(error)
      }
    },
    30
  )

  const networkSelector = (
    <Box direction="column" align="flex-start" gap="small">
      {Object.values(NetworkType).map((t) => {
        return (
          <TouchableOpacity
            key={t}
            activeOpacity={0.7}
            onPress={() => {
              setNewNetworkType(t)
              checkAvailability(t, newAccountId)
            }}
          >
            <View style={styles.radio}>
              <Radio checked={t === newNetworkType} />
              <Text style={styles.radioText}>{t}</Text>
            </View>
          </TouchableOpacity>
        )
      })}
    </Box>
  )

  return (
    <ScrollView style={styles.container}>
      <Heading>(1/3) {i18n.t('Account ID')}</Heading>
      <Box
        align="center"
        gap="medium"
        justify="flex-end"
        style={{ marginTop: 20 }}
      >
        <Text>Implicit</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isImplicit ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => setIsImplicit(!isImplicit)}
          value={isImplicit}
        />
      </Box>
      {isImplicit ? (
        networkSelector
      ) : (
        <Box direction="column" align="flex-start" gap="small">
          <Box
            full
            align="center"
            style={{
              paddingVertical: 4,
              borderBottomWidth: 1,
              marginTop: 20,
              borderBottomColor: accountIdFocused
                ? Colors[theme].text
                : Colors[theme].borderColor,
            }}
          >
            {!!newAccountId && !newAccountId.includes('.') && (
              <Text
                style={[
                  styles.suffix,
                  {
                    color: Colors[theme].text,
                    left: newAccountId.length * 12,
                  },
                ]}
              >{`${network.suffix}`}</Text>
            )}

            <AnimatedInput
              autoCapitalize="none"
              style={{}}
              value={newAccountId}
              placeholder={i18n.t('Account ID')}
              onChangeText={(text) => {
                setNewAccountId(text.trim().toLowerCase())
                if (text.match(/[a-z0-9_-]{2,64}/)) {
                  setErrorMsg('')
                  checkAvailability(newNetworkType, text)
                } else {
                  setErrorMsg(i18n.t('Invalid Account ID'))
                }
              }}
              onFocus={() => setAccountIdFocused(true)}
              onBlur={() => setAccountIdFocused(false)}
              autoCorrect={false}
            />
          </Box>
          <View style={styles.errWrap}>
            <Text style={{ color: !!errorMsg ? 'red' : 'green' }}>
              {errorMsg || (!!newAccountId && i18n.t('Valid Account ID'))}
            </Text>
          </View>
          {networkSelector}
          <AccountIdRules rules={rules} />
        </Box>
      )}
      <Button
        label={i18n.t('Next')}
        type={ButtonType.PRIMARY}
        disabled={isImplicit ? false : !(!!newAccountId && !errorMsg)}
        style={{ marginTop: 20 }}
        onPress={() => {
          if (isImplicit || !errorMsg) {
            onNext({
              accountId: isImplicit ? '' : newAccountId + network.suffix,
              networkType: newNetworkType,
            })
          }
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
  inputWrap: {
    width: '100%',
    flexDirection: 'row',
    padding: 10,
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 20,
    textAlign: 'right',
    fontFamily: Fonts.variable,
  },
  suffix: {
    fontSize: 20,
    fontFamily: Fonts.variable,
    position: 'absolute',
    opacity: 0.7,
  },
  errWrap: {
    height: 20,
    marginVertical: 10,
  },
  tip: {
    marginBottom: 10,
  },
  radio: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioText: {
    fontSize: 20,
    fontFamily: Fonts.variable,
    marginLeft: 8,
  },
})
