import dayjs from 'dayjs'
import { DeleteCircledOutline } from 'iconoir-react-native'
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import { iNotification } from 'types'
import Fonts from 'theme/Fonts'
import { Text, View } from 'components/Themed'
import Markdown from 'react-native-markdown-renderer'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'

const markdownStyle = StyleSheet.create({
  text: {
    color: Colors.gray,
    fontFamily: Fonts.variable,
  },
})

export default function NotiItem({
  item,
  onOpen,
  onClose,
  isFull = true,
}: {
  item: iNotification
  onOpen: (noti: iNotification) => void
  onClose: () => void
  isFull?: boolean
}) {
  const theme = useColorScheme()

  const { date, request } = item.noti
  const { title, body } = request.content
  return (
    <Pressable
      onPress={() => {
        if (!isFull) {
          onOpen(item)
        }
      }}
    >
      <View
        style={[styles.item, { backgroundColor: Colors[theme].cardBackground }]}
      >
        {isFull && (
          <View
            style={{
              justifyContent: 'flex-end',
              width: '100%',
              flexDirection: 'row',
            }}
          >
            <Pressable
              onPress={(e) => {
                e.stopPropagation()
                onClose()
              }}
            >
              <DeleteCircledOutline
                width={24}
                height={24}
                color={Colors.gray}
              />
            </Pressable>
          </View>
        )}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.date}>
          {dayjs(date * (Platform.OS === 'android' ? 1 : 1000)).format(
            'MMM DD, YYYY HH:mm'
          )}
        </Text>
        {isFull ? (
          <View style={{ height: 450, marginTop: 10 }}>
            <ScrollView>
              <TouchableOpacity activeOpacity={1}>
                <TouchableWithoutFeedback>
                  <Markdown style={markdownStyle}>{body}</Markdown>
                </TouchableWithoutFeedback>
              </TouchableOpacity>
            </ScrollView>
          </View>
        ) : (
          <View style={{ maxHeight: 60, overflow: 'hidden' }}>
            <Text style={styles.body}>{body}</Text>
          </View>
        )}

        {!item.isRead && !isFull && <View style={styles.badge} />}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  item: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 4,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: Fonts.heading,
  },
  date: {
    fontSize: 12,
    fontFamily: Fonts.variable,
    color: Colors.gray9,
  },
  body: {
    fontSize: 16,
    color: Colors.gray,
  },
  badge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.red,
    position: 'absolute',
    right: 10,
    top: 10,
  },
})
