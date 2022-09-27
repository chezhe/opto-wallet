import { useRoute } from '@react-navigation/native'
import AnimatedInput from 'components/common/AnimatedInput'
import Box from 'components/common/Box'
import Button from 'components/common/Button'
import Radio from 'components/common/Radio'
import ScreenHeader from 'components/common/ScreenHeader'
import QRScanModal from 'components/Modals/QRScanModal'
import { Text, View } from 'components/Themed'
import useColorScheme from 'hooks/useColorScheme'
import { i18n } from 'locale'
import { Scanning } from 'iconoir-react-native'
import _ from 'lodash'
import { useRef, useState } from 'react'
import { Keyboard, Pressable, ScrollView, StyleSheet } from 'react-native'
import { Modalize } from 'react-native-modalize'
import { Portal } from 'react-native-portalize'
import { useAppDispatch, useAppSelector } from 'store/hooks'
import Colors from 'theme/Colors'
import { Chain, CustomNetwork, NetworkType, RootStackScreenProps } from 'types'
import Toast from 'utils/toast'
import Fonts from 'theme/Fonts'

export default function NewNetwork({
  navigation,
}: RootStackScreenProps<'NewNetwork'>) {
  const { params } = useRoute()
  const chain = ((params as any)?.chain as Chain) || Chain.NEAR
  const network = (params as any)?.network as CustomNetwork | undefined
  const [name, setName] = useState(network?.name ?? '')
  const [nodeUrl, setNodeUrl] = useState(network?.nodeUrl ?? '')
  const [networkType, setNetworkType] = useState(
    network?.type ?? NetworkType.MAINNET
  )

  const [nameFocus, setNameFocus] = useState(false)
  const [nodeUrlFocus, setNodeUrlFocus] = useState(false)
  const qrscanRef = useRef<Modalize>(null)

  const networks = useAppSelector((state) => state.setting.networks || [])
  const theme = useColorScheme()
  const dispatch = useAppDispatch()

  const isEdit = !!network

  const onDelete = () => {
    dispatch({
      type: 'setting/removeNetwork',
      payload: network,
    })
    dispatch({
      type: 'wallet/networkDeleted',
      payload: network,
    })
    Toast.success(i18n.t('Deleted'))
    navigation.goBack()
  }

  const onAdd = async () => {
    try {
      const _name = _.trim(name)
      if (!_name) {
        throw new Error(i18n.t('Invalid name'))
      }
      if (
        ([NetworkType.MAINNET, NetworkType.TESTNET] as string[]).includes(_name)
      ) {
        throw new Error('Invalid Network Name')
      }
      if (!/[a-z0-9A-Z]{1,12}/.test(_name)) {
        throw new Error('Network Name must be 1-12 letters or numbers')
      }
      if (!isEdit && networks.some((t) => t.name === _name)) {
        throw new Error(i18n.t('Network already exists'))
      }
      // validate node if works
      const newNetwork: CustomNetwork = {
        name: _name,
        nodeUrl,
        chain,
        type: networkType,
      }
      if (isEdit) {
        dispatch({
          type: 'setting/updateNetwork',
          payload: {
            oldNetwork: network,
            newNetwork,
          },
        })
        dispatch({
          type: 'wallet/networkEdited',
          payload: {
            oldNetwork: network,
            newNetwork,
          },
        })
        Toast.success(i18n.t('Updated'))
      } else {
        dispatch({
          type: 'setting/addNetwork',
          payload: newNetwork,
        })
        Toast.success(i18n.t('Added'))
      }
      navigation.goBack()
    } catch (error) {
      Toast.error(error)
    }
  }

  const isDisabled = !name.trim() || !nodeUrl.trim()

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader title={i18n.t(isEdit ? 'Edit Network' : 'New Network')} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 20,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Box direction="column" gap="xxlarge" full>
          <Box
            full
            style={{
              paddingVertical: 4,
              borderBottomWidth: 1,
              borderBottomColor: nameFocus
                ? Colors[theme].text
                : Colors[theme].borderColor,
            }}
          >
            <AnimatedInput
              placeholder={i18n.t('Name')}
              value={name}
              onChangeText={(_text) => setName(_text)}
              onFocus={() => setNameFocus(true)}
              onBlur={() => setNameFocus(false)}
              placeholderTextColor={Colors.gray9}
              animatedLeft={0}
              maxLength={30}
              autoCorrect={false}
            />
          </Box>

          <Box
            full
            align="center"
            style={{
              paddingVertical: 4,
              borderBottomWidth: 1,
              borderBottomColor: nodeUrlFocus
                ? Colors[theme].text
                : Colors[theme].borderColor,
            }}
          >
            <AnimatedInput
              placeholder={i18n.t('Node url')}
              autoCapitalize="none"
              value={nodeUrl}
              onChangeText={async (_text) => {
                setNodeUrl(_text.trim())
              }}
              onFocus={() => setNodeUrlFocus(true)}
              onBlur={() => setNodeUrlFocus(false)}
              placeholderTextColor={Colors.gray9}
              numberOfLines={2}
              multiline
              animatedLeft={-4}
              autoCorrect={false}
            />
            <Pressable
              hitSlop={15}
              onPress={() => {
                qrscanRef.current?.open()
                Keyboard.dismiss()
              }}
            >
              <Scanning width={30} height={30} color={Colors[theme].link} />
            </Pressable>
          </Box>

          <Box direction="column" align="flex-start" gap="medium" full>
            <Text>{i18n.t('Network')}</Text>
            <Box direction="column" gap="medium">
              {[NetworkType.MAINNET, NetworkType.TESTNET].map((t) => {
                const isActive = networkType === t
                return (
                  <Pressable
                    key={t}
                    style={styles.chainItem}
                    onPress={() => setNetworkType(t)}
                  >
                    <Radio checked={isActive} />
                    <Text style={styles.networkType}>{t}</Text>
                  </Pressable>
                )
              })}
            </Box>
          </Box>

          <Box gap="medium">
            {isEdit && (
              <Button
                filled={false}
                label={i18n.t('Delete')}
                onPress={onDelete}
                size="medium"
              />
            )}
            <Button
              filled={!isEdit}
              label={i18n.t('Confirm')}
              primary
              onPress={onAdd}
              size={isEdit ? 'medium' : 'large'}
              disabled={isDisabled}
            />
          </Box>
        </Box>
      </ScrollView>
      <Portal>
        <Modalize
          ref={qrscanRef}
          adjustToContentHeight
          closeOnOverlayTap
          handlePosition="inside"
        >
          <QRScanModal
            onCancel={() => qrscanRef.current?.close()}
            onConfirm={(data: string) => {
              qrscanRef.current?.close()
              if (!data.startsWith('http')) {
                return Toast.error(i18n.t('Invalid node url'))
              }
              setNodeUrl(data)
            }}
          />
        </Modalize>
      </Portal>
    </View>
  )
}

const styles = StyleSheet.create({
  input: {
    fontSize: 16,
    padding: 8,
    flex: 1,
  },
  wrap: {
    borderBottomWidth: 1,
  },
  chainItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  chain: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#999',
    marginLeft: 20,
  },
  networkType: {
    fontSize: 18,
    fontFamily: Fonts.variable,
    marginLeft: 10,
  },
})
