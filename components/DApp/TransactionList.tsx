import type { Transaction } from '@near-wallet-selector/core'
import {
  Action as RawAction,
  Transaction as RawTransaction,
} from 'near-api-js/lib/transaction'
import { FlatList, StyleSheet, useWindowDimensions } from 'react-native'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import { View } from 'components/Themed'
import InfoItem from 'components/common/InfoItem'

export default function TransactionList({
  transactions,
}: {
  transactions: (RawTransaction | Transaction)[]
}) {
  const length = transactions.length
  const theme = useColorScheme()
  const { height } = useWindowDimensions()
  return (
    <FlatList
      data={transactions}
      keyExtractor={(item, index) => index.toString()}
      style={{
        maxHeight: height * 0.4,
        borderWidth: StyleSheet.hairlineWidth,
        padding: 10,
        borderRadius: 8,
      }}
      renderItem={({ item, index }) => {
        return (
          <View
            style={[
              styles.item,
              {
                borderBottomColor: Colors[theme].borderColor,
                borderBottomWidth:
                  length - 1 === index ? 0 : StyleSheet.hairlineWidth,
              },
            ]}
          >
            <InfoItem title="Signer ID" value={item.signerId} />
            <InfoItem title="Receiver ID" value={item.receiverId} />
            <InfoItem
              title="Actions"
              value={item.actions.map((a) => {
                let methodName = ''
                if ((a as RawAction).functionCall) {
                  methodName = (a as RawAction).functionCall.methodName
                } else {
                  methodName = (a as any)?.params?.methodName
                }
                return methodName
              })}
            />
          </View>
        )
      }}
    />
  )
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    paddingHorizontal: 10,
  },
  item: {
    paddingVertical: 0,
  },
})
