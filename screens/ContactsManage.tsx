import { Empty } from 'components/common/Placeholder'
import ScreenHeader from 'components/common/ScreenHeader'
import AddressQRModal from 'components/Modals/AddressQRModal'
import ContactItem from 'components/Settings/ContactItem'
import { View } from 'components/Themed'
import useColorScheme from 'hooks/useColorScheme'
import { i18n } from 'locale'
import { AddCircledOutline } from 'iconoir-react-native'
import { useRef, useState } from 'react'
import { FlatList, Pressable, StyleSheet } from 'react-native'
import { Modalize } from 'react-native-modalize'
import { Portal } from 'react-native-portalize'
import { useAppSelector } from 'store/hooks'
import Colors from 'theme/Colors'
import Fonts from 'theme/Fonts'
import { Contact, RootStackScreenProps } from 'types'

export default function ContactsManage({
  navigation,
}: RootStackScreenProps<'ContactsManage'>) {
  const [contact, setContact] = useState<Contact>()
  const receiveRef = useRef<Modalize>(null)
  const theme = useColorScheme()
  const contacts = useAppSelector((state) => state.setting.contacts)

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader
        title={i18n.t('Contacts')}
        rightEle={
          <Pressable
            onPress={() => {
              navigation.navigate('NewContact', {})
            }}
            hitSlop={20}
          >
            <AddCircledOutline
              width={24}
              height={24}
              color={Colors[theme].link}
            />
          </Pressable>
        }
      />
      {contacts.length === 0 ? (
        <Empty title="No contacts yet" style={{ marginTop: 100 }} />
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(t) => t.address}
          renderItem={({ item }) => {
            return (
              <ContactItem
                item={item}
                onSelect={() => {
                  navigation.navigate('NewContact', { contact: item })
                }}
                isQRCodeVisible
                onQRCodePress={() => {
                  setContact(item)
                  setTimeout(() => {
                    receiveRef.current?.open()
                  }, 100)
                }}
              />
            )
          }}
          contentContainerStyle={{ padding: 20 }}
        />
      )}
      <Portal>
        <Modalize
          ref={receiveRef}
          adjustToContentHeight
          closeOnOverlayTap
          handlePosition="inside"
          handleStyle={{ backgroundColor: Colors.gray9 }}
        >
          <AddressQRModal
            wallet={contact}
            onClose={() => {
              receiveRef.current?.close()
              setContact(undefined)
            }}
          />
        </Modalize>
      </Portal>
    </View>
  )
}

const styles = StyleSheet.create({
  item: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.gray9,
  },
  name: {
    fontSize: 18,
    fontFamily: Fonts.heading,
  },
})
