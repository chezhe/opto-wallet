import { View } from 'components/Themed'
import { CheckCircledOutline, Circle } from 'iconoir-react-native'
import Colors from 'theme/Colors'

export default function Radio({
  checked,
  disabled,
  size = 24,
}: {
  checked: boolean
  disabled?: boolean
  size?: number
}) {
  return checked ? (
    <View
      style={{
        backgroundColor: Colors.green,
        borderRadius: 12,
      }}
    >
      <CheckCircledOutline width={size} height={size} color={Colors.white} />
    </View>
  ) : disabled ? null : (
    <Circle width={size} height={size} color={Colors.green} />
  )
}
