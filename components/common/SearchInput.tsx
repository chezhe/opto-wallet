import { useRef, useState } from 'react'
import { StyleSheet, TextInput } from 'react-native'
import Colors from 'theme/Colors'
import useColorScheme from 'hooks/useColorScheme'
import { View } from 'components/Themed'
import { Search } from 'iconoir-react-native'

export default function SearchInput({
  placeholder,
  onSearch,
  onFocus,
  defaultKeyword = '',
  searchFor = '',
  clearKeyword = false,
  autoFocus,
}: {
  placeholder: string
  onSearch: (keyword: string) => void
  onFocus?: () => void
  defaultKeyword?: string
  searchFor?: string
  clearKeyword?: boolean
  autoFocus?: boolean
}) {
  const [keyword, setKeyword] = useState(defaultKeyword)
  const theme = useColorScheme()
  const inputRef = useRef<TextInput>(null)
  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: Colors[theme].bannerBackground,
        },
      ]}
    >
      <Search color={Colors.gray9} width={30} height={30} />
      <TextInput
        style={styles.input}
        value={keyword}
        ref={inputRef}
        onChangeText={(text) => setKeyword(text)}
        placeholder={placeholder}
        autoCapitalize="none"
        clearButtonMode="always"
        placeholderTextColor="#999"
        autoFocus={autoFocus}
        autoCorrect={false}
        onFocus={() => {
          if (onFocus) {
            inputRef.current?.blur()
            onFocus()
          }
        }}
        onEndEditing={() => {
          onSearch(keyword.trim())
          clearKeyword && setKeyword('')
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    height: 42,
    borderRadius: 22,
  },
  input: {
    flex: 1,
    lineHeight: 20,
    paddingHorizontal: 10,
    fontSize: 18,
    color: '#999',
  },
})
