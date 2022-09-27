import { StyleSheet } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import { useAppDispatch, useAppSelector } from 'store/hooks'
import { Project } from 'types'
import Toast from 'utils/toast'
import Icon from 'components/common/Icon'
import SheetHeader from 'components/common/SheetHeader'
import { View } from 'components/Themed'
import { useState } from 'react'
import * as Clipboard from 'expo-clipboard'
import {
  Check,
  Copy,
  Heart,
  RefreshDouble,
  ShareAndroid,
} from 'iconoir-react-native'
import { i18n } from 'locale'
import { formatUrlHost } from 'utils/format'

export default function OptionModal({
  project,
  currentUrl,
  onClose,
  onReload,
  onShare,
}: {
  project: Project
  currentUrl: string
  onClose: () => void
  onReload: () => void
  onShare: () => void
}) {
  const [isCopied, setIsCopied] = useState(false)

  const insets = useSafeAreaInsets()
  const distpatch = useAppDispatch()
  const starred = useAppSelector((state) => state.dapp.starred)
  const isStarred = starred.find((s: Project) => s.title === project?.title)
  const theme = useColorScheme()

  let title = project?.title
  if (!title) {
    title = formatUrlHost(currentUrl)
  }

  return (
    <View
      style={[
        styles.content,
        {
          paddingBottom: insets.bottom + 20,
          backgroundColor: Colors[theme].modalBackground,
        },
      ]}
    >
      <SheetHeader title={title} />
      <View style={styles.buttonGroup}>
        <Icon
          icon={
            <RefreshDouble
              width={25}
              height={25}
              color={Colors[theme].screenBackground}
            />
          }
          onPress={() => {
            onReload()
            onClose()
          }}
        />
        {!!project && (
          <Icon
            backgroundColor={isStarred ? Colors.red : ''}
            icon={
              <Heart
                width={25}
                height={25}
                color={Colors[theme].screenBackground}
              />
            }
            onPress={() => {
              distpatch({ type: 'dapp/star', payload: { project } })
              onClose()
              Toast.success(i18n.t('Liked'))
            }}
          />
        )}
        <Icon
          backgroundColor={isCopied ? '#00C781' : undefined}
          icon={
            isCopied ? (
              <Check
                width={25}
                height={25}
                color={Colors[theme].screenBackground}
              />
            ) : (
              <Copy
                width={25}
                height={25}
                color={Colors[theme].screenBackground}
              />
            )
          }
          onPress={async () => {
            try {
              setIsCopied(true)
              await Clipboard.setString(currentUrl)
              setTimeout(() => {
                setIsCopied(false)
              }, 1000)
            } catch (error) {
              setIsCopied(false)
              Toast.error(error)
            }
          }}
        />
        <Icon
          icon={
            <ShareAndroid
              width={25}
              height={25}
              color={Colors[theme].screenBackground}
            />
          }
          onPress={onShare}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  content: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  buttonGroup: {
    paddingTop: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
})
