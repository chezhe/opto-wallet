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
import {
  Image,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native'
import { Modalize } from 'react-native-modalize'
import { Portal } from 'react-native-portalize'
import { useAppDispatch, useAppSelector } from 'store/hooks'
import Colors from 'theme/Colors'
import { Chain, Contact, RootStackScreenProps } from 'types'
import Toast from 'utils/toast'
import WalletFactory from 'chain/WalletFactory'

export default function NewContact({
  navigation,
}: RootStackScreenProps<'NewContact'>) {
  const { params } = useRoute()
  const contact = (params as any)?.contact as Contact | undefined
  const [name, setName] = useState(contact?.alias ?? '')
  const [address, setAddress] = useState(contact?.address ?? '')
  const [chain, setChain] = useState(contact?.chain || Chain.NEAR)

  const [nameFocus, setNameFocus] = useState(false)
  const [addressFocus, setAddressFocus] = useState(false)
  const qrscanRef = useRef<Modalize>(null)

  const contacts = useAppSelector((state) => state.setting.contacts)
  const theme = useColorScheme()
  const dispatch = useAppDispatch()

  const isEdit = !!contact

  const onDelete = () => {
    dispatch({
      type: 'setting/removeContact',
      payload: contact,
    })
    Toast.success('Contact deleted')
    navigation.goBack()
  }

  const onAdd = async () => {
    try {
      const _name = _.trim(name)
      if (!_name) {
        throw new Error(i18n.t('Invalid name'))
      }
      if (!isEdit && contacts.some((t) => t.address === address)) {
        throw new Error(i18n.t('Contact already exists'))
      }
      if (!chain) {
        throw new Error(i18n.t('Invalid chain'))
      }
      const newContact: Contact = {
        alias: _name,
        address,
        chain,
        networkType: WalletFactory.getNetworkTypeByAddress(address, chain),
      }
      if (isEdit) {
        dispatch({
          type: 'setting/updateContact',
          payload: {
            oldContact: contact,
            newContact,
          },
        })
        Toast.success(i18n.t('Updated'))
      } else {
        dispatch({
          type: 'setting/addContact',
          payload: newContact,
        })
        Toast.success(i18n.t('Added'))
      }
      navigation.goBack()
    } catch (error) {
      Toast.error(error)
    }
  }

  const isDisabled = !name.trim() || !address.trim()

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader title={i18n.t(isEdit ? 'Edit Contact' : 'New Contact')} />

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
              borderBottomColor: addressFocus
                ? Colors[theme].text
                : Colors[theme].borderColor,
            }}
          >
            <AnimatedInput
              placeholder={i18n.t('Address')}
              autoCapitalize="none"
              value={address}
              onChangeText={setAddress}
              onFocus={() => setAddressFocus(true)}
              onBlur={() => setAddressFocus(false)}
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
            <Text>Chain</Text>
            <Box direction="column" gap="small" full>
              {WalletFactory.getChains().map((t) => {
                const isActive = chain === t.chain
                return (
                  <Pressable
                    key={t.chain}
                    style={{
                      ...styles.chainItem,
                      backgroundColor: isActive
                        ? Colors.main
                        : Colors[theme].tabBarBg,
                    }}
                    onPress={() => setChain(t.chain)}
                  >
                    <Image source={t.icon} style={styles.chain} />
                    <Text style={styles.chainName}>{t.chain}</Text>
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
              setAddress(data)
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
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 4,
  },
  chain: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#999',
  },
  chainName: {
    fontSize: 20,
    marginLeft: 10,
  },
})
