import { useAppSelector } from 'store/hooks'
import { Text, View } from 'components/Themed'
import { Image, Pressable, ScrollView, StyleSheet } from 'react-native'
import icons from 'utils/icons'
import { useState } from 'react'
import { Chain, Wallet } from 'types'
import Box from 'components/common/Box'
import Colors from 'theme/Colors'
import { formatWalletAddress } from 'utils/format'
import Fonts from 'theme/Fonts'
import Radio from 'components/common/Radio'
import { KeyAltPlus } from 'iconoir-react-native'
import useColorScheme from 'hooks/useColorScheme'
import { i18n } from 'locale'
import Button from 'components/common/Button'
import { CHAINS } from 'chain/common/constants'

export default function WalletsByChain({
  onSelect,
  onAdd,
}: {
  onSelect: (w: Wallet) => void
  onAdd?: (c: Chain) => void
}) {
  const wallet = useAppSelector((state) => state.wallet.current)
  const wallets = useAppSelector((state) => state.wallet.list)

  const [selected, setSelected] = useState(wallet?.chain ?? Chain.NEAR)
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
        {CHAINS.map((t) => {
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
        {wallets
          .filter((w) => w.chain === selected)
          .map((w) => {
            return (
              <Pressable
                key={formatWalletAddress(w)}
                onPress={() => onSelect(w)}
                style={{ marginBottom: 10 }}
              >
                <View style={[styles.walletItem]}>
                  <Box direction="row" gap="small">
                    {w.isLedger && (
                      <Image
                        source={icons.LEDGER_WHITE}
                        style={{ width: 16, height: 16 }}
                      />
                    )}
                    <Text style={styles.walletAddress}>
                      {formatWalletAddress(w)}
                    </Text>
                  </Box>
                  {wallet?.address === w.address && <Radio size={20} checked />}
                </View>
              </Pressable>
            )
          })}
        {onAdd && (
          <Button
            label={i18n.t('Add wallet')}
            size="small"
            style={{ paddingVertical: 8 }}
            icon={
              <KeyAltPlus width={24} height={24} color={Colors[theme].link} />
            }
            onPress={() => onAdd(selected)}
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
    borderColor: Colors.green,
  },
  walletList: {
    flex: 1,
    borderLeftColor: Colors.gray9,
    borderLeftWidth: StyleSheet.hairlineWidth,
  },
  walletItem: {
    backgroundColor: Colors.green,
    padding: 10,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walletAddress: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: Fonts.variable,
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
    backgroundColor: Colors.green,
  },
  chainItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})
