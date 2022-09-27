import Address from 'components/common/Address'
import Box from 'components/common/Box'
import { Text } from 'components/Themed'
import { QrCode } from 'iconoir-react-native'
import { Pressable, StyleSheet } from 'react-native'
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
  return (
    <Pressable onPress={onSelect}>
      <Box justify="space-between" pad="medium" style={styles.item}>
        <Box direction="column" align="flex-start" gap="small">
          <Text style={styles.name}>{item.alias}</Text>
          <Address wallet={item} fontSize={16} numberOfLines={3} />
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
