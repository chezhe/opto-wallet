import Address from 'components/common/Address'
import Avatar from 'components/common/Avatar'
import Box from 'components/common/Box'
import { Text } from 'components/Themed'
import { QrCode, UserCircleAlt } from 'iconoir-react-native'
import { Pressable, StyleSheet } from 'react-native'
import { useDispatch } from 'react-redux'
import Colors from 'theme/Colors'
import Fonts from 'theme/Fonts'
import { Contact } from 'types'

export default function ContactItem({
  item,
  isQRCodeVisible = true,
  onSelect,
  onQRCodePress,
}: {
  item: Contact
  isQRCodeVisible?: boolean
  onSelect: () => void
  onQRCodePress?: (item: Contact) => void
}) {
  const dispatch = useDispatch()
  const onAvatarLoaded = (avatar: string) => {
    dispatch({
      type: 'setting/updateContact',
      payload: {
        oldContact: item,
        newContact: {
          ...item,
          avatar,
        },
      },
    })
  }
  return (
    <Pressable onPress={onSelect}>
      <Box justify="space-between" pad="medium" style={styles.item}>
        <Box direction="row" align="center" gap="small">
          <Avatar
            wallet={item}
            size={40}
            placeholder={
              <UserCircleAlt width={40} height={40} color={Colors.gray9} />
            }
            onAvatarLoaded={onAvatarLoaded}
          />
          <Box direction="column" align="flex-start">
            <Text style={styles.name}>{item.alias}</Text>
            <Address wallet={item} fontSize={16} numberOfLines={3} />
          </Box>
        </Box>
        {isQRCodeVisible && (
          <Pressable
            onPress={() => {
              onQRCodePress && onQRCodePress(item)
            }}
          >
            <QrCode width={24} height={24} color={Colors.gray} />
          </Pressable>
        )}
      </Box>
    </Pressable>
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
