import Button from 'components/common/Button'
import { Text, View } from 'components/Themed'
import API from 'configure/api'
import useColorScheme from 'hooks/useColorScheme'
import useWallet from 'hooks/useWallet'
import { i18n } from 'locale'
import { useEffect, useState } from 'react'
import {
  Linking,
  Modal,
  Platform,
  StyleSheet,
  useWindowDimensions,
} from 'react-native'
import Markdown from 'react-native-markdown-renderer'
import Colors from 'theme/Colors'
import Fonts from 'theme/Fonts'
import { ButtonType } from 'types'
import { fetcher } from 'utils/fetch'

interface Upgrade {
  outdated: boolean
  updates: {
    title: string
    message: string
    links: {
      android: string
      ios: string
      apk: string
    }
  }
}

const markdownStyle = StyleSheet.create({
  text: {
    color: Colors.black,
    fontFamily: Fonts.variable,
    fontSize: 16,
  },
  listUnorderedItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listOrderedItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listOrderedItemIcon: {
    marginLeft: 10,
    marginRight: 10,
  },
})

export default function UpgradeModal() {
  const [upgrade, setUpgrade] = useState<Upgrade>()
  const { wallet } = useWallet()

  useEffect(() => {
    if (wallet) {
      fetcher(`${API.host}/api/check-for-updates`)
        .then(setUpgrade)
        .catch(() => {})
    }
  }, [wallet])

  const theme = useColorScheme()
  const { width } = useWindowDimensions()

  if (!upgrade || !upgrade.outdated) {
    return null
  }

  const onUpdate = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL(upgrade.updates.links.ios)
    } else {
      Linking.openURL(upgrade.updates.links.android)
    }
  }

  const onClose = () => {
    setUpgrade(undefined)
  }

  return (
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
        }}
      >
        <View
          style={[
            styles.item,
            {
              backgroundColor: Colors.white,
              width: width * 0.9,
            },
          ]}
        >
          <Text style={styles.title}>{upgrade.updates.title}</Text>
          <View
            style={{ paddingHorizontal: 20, backgroundColor: Colors.white }}
          >
            <Markdown style={markdownStyle}>{upgrade.updates.message}</Markdown>
          </View>
          <View
            style={{
              ...styles.buttonGroup,
              backgroundColor: Colors.white,
            }}
          >
            <Button
              label={i18n.t('Later')}
              style={{
                width: 150,
                height: 40,
                paddingVertical: 5,
              }}
              filled={false}
              onPress={onClose}
              textColor={Colors.gray}
            />
            <Button
              label={i18n.t('Confirm')}
              type={ButtonType.PRIMARY}
              filled={false}
              style={{
                width: 150,
                height: 40,
                paddingVertical: 5,
              }}
              onPress={onUpdate}
            />
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  item: {
    borderRadius: 4,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: Fonts.heading,
    textAlign: 'center',
    lineHeight: 50,
    color: Colors.black,
  },
  date: {
    fontSize: 12,
    fontFamily: Fonts.variable,
    color: Colors.gray9,
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    width: '100%',
  },
})
