import { Text, View } from 'components/Themed'
import { Image, Pressable, ScrollView, StyleSheet } from 'react-native'
import icons from 'utils/icons'
import { useState } from 'react'
import { Chain, Wallet } from 'types'
import Box from 'components/common/Box'
import Colors from 'theme/Colors'
import Fonts from 'theme/Fonts'
import Radio from 'components/common/Radio'
import { KeyAltPlus } from 'iconoir-react-native'
import useColorScheme from 'hooks/useColorScheme'
import { i18n } from 'locale'
import Button from 'components/common/Button'
import useWallet from 'hooks/useWallet'
import WalletFactory from 'chain/WalletFactory'
import Avatar from 'components/common/Avatar'

export default function WalletsByChain({
  onSelect,
  onAdd,
}: {
  onSelect: (w: Wallet) => void
  onAdd?: (c: Chain) => void
}) {
  const { wallet, walletList } = useWallet()

  const [selected, setSelected] = useState(wallet?.chain)
  const theme = useColorScheme()

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: Colors[theme].background,
        },
      ]}
    >
      <Box
        direction="column"
        pad="medium"
        gap="medium"
        style={{ paddingTop: 20 }}
      >
        {WalletFactory.getChains().map((t) => {
          const isActive = selected === t.chain
          return (
            <Pressable
              key={t.chain}
              style={styles.chainItem}
              onPress={() => setSelected(t.chain)}
            >
              <Image
                source={t.icon}
                style={[styles.chain, isActive && styles.activeChain]}
              />
              {isActive && <View style={[styles.dot]}></View>}
            </Pressable>
          )
        })}
      </Box>
      <ScrollView
        style={styles.walletList}
        contentContainerStyle={styles.walletListContent}
      >
        {walletList
          .filter((w) => w.chain === selected)
          .map((w) => {
            return (
              <Pressable
                key={w.address}
                onPress={() => onSelect(w)}
                style={{
                  marginBottom: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <View
                  style={[
                    styles.walletItem,
                    {
                      backgroundColor: Colors[theme].tabBarBg,
                      borderLeftColor:
                        wallet?.address === w.address
                          ? Colors.main
                          : Colors[theme].tabBarBg,
                    },
                  ]}
                >
                  <Box direction="row">
                    {w.isLedger && (
                      <Image
                        source={
                          theme === 'light'
                            ? icons.LEDGER_DARK
                            : icons.LEDGER_WHITE
                        }
                        style={{ width: 16, height: 16, marginRight: 6 }}
                      />
                    )}
                    <Text style={styles.walletAddress} numberOfLines={1}>
                      {WalletFactory.formatAddress(w)}
                    </Text>
                  </Box>

                  <Avatar
                    wallet={w}
                    size={36}
                    style={{ marginRight: 6 }}
                    borderColor={Colors[theme].borderColor}
                  />
                </View>
              </Pressable>
            )
          })}
        {onAdd && (
          <Button
            label={i18n.t('Add wallet')}
            size="small"
            style={{ paddingVertical: 8 }}
            disabled={!selected}
            icon={
              <KeyAltPlus width={24} height={24} color={Colors[theme].link} />
            }
            onPress={() => selected && onAdd(selected)}
          />
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flex: 1,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  chain: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#999',
  },
  activeChain: {
    borderWidth: 2,
    borderColor: Colors.main,
  },
  walletList: {
    flex: 1,
    borderLeftColor: Colors.gray9,
    borderLeftWidth: StyleSheet.hairlineWidth,
  },
  walletItem: {
    backgroundColor: Colors.main,
    paddingVertical: 5,
    paddingLeft: 10,
    height: 50,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
    borderLeftWidth: 6,
  },
  walletAddress: {
    fontSize: 18,
    fontFamily: Fonts.variable,
    maxWidth: 180,
  },
  walletListContent: {
    padding: 20,
  },
  dot: {
    position: 'absolute',
    top: 15,
    left: 58,
    width: 4,
    height: 20,
    backgroundColor: Colors.main,
  },
  chainItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})
