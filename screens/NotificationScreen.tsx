import { FlatList, Modal, StyleSheet } from 'react-native'

import { View } from 'components/Themed'
import ScreenHeader from 'components/common/ScreenHeader'
import useColorScheme from 'hooks/useColorScheme'
import Colors from 'theme/Colors'
import { i18n } from 'locale'
import { useAppDispatch, useAppSelector } from 'store/hooks'
import { iNotification } from 'types'
import NotiItem from 'components/common/NotiItem'
import Icon from 'components/common/Icon'
import { Erase } from 'iconoir-react-native'
import { Empty } from 'components/common/Placeholder'
import { useState } from 'react'
import Toast from 'utils/toast'
import { useRoute } from '@react-navigation/native'

export default function NotificationScreen({
  navigation,
}: {
  navigation: any
}) {
  const { params } = useRoute()
  const _noti = (params as any).noti as iNotification | undefined
  const theme = useColorScheme()
  const [noti, setNoti] = useState<iNotification | undefined>(_noti)
  const notis: iNotification[] = useAppSelector((state) => state.noti.list)
  const dispatch = useAppDispatch()

  const onOpen = (_noti: iNotification) => {
    setNoti(_noti)
    dispatch({
      type: 'noti/read',
      payload: _noti.noti.request.identifier,
    })
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[theme].screenBackground },
      ]}
    >
      <ScreenHeader
        title={i18n.t('Notifications')}
        rightEle={
          <Icon
            icon={<Erase width={25} height={25} color={Colors[theme].link} />}
            isTransparent
            onPress={() => {
              dispatch({
                type: 'noti/readAll',
              })
              Toast.success(i18n.t('All notifications have been read'))
            }}
          />
        }
      />

      {notis.length === 0 && <Empty title={i18n.t('No notifications')} />}
      <FlatList
        data={notis}
        keyExtractor={(t) => t.noti.request.identifier}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => {
          return (
            <NotiItem
              item={item}
              isFull={false}
              onOpen={onOpen}
              onClose={() => {}}
            />
          )
        }}
      />
      {noti && (
        <Modal
          animationType="fade"
          visible
          transparent
          presentationStyle="overFullScreen"
        >
          <View
            style={{
              backgroundColor: 'rgba(0,0,0,0.7)',
              flex: 1,
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20,
            }}
          >
            <NotiItem
              item={noti}
              isFull
              onOpen={onOpen}
              onClose={() => setNoti(undefined)}
            />
          </View>
        </Modal>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    width: '100%',
  },
})
