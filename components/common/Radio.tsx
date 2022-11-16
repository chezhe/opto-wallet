import { View } from 'components/Themed'
import { CheckCircledOutline, Circle } from 'iconoir-react-native'
import Colors from 'theme/Colors'

export default function Radio({
  checked,
  disabled,
  color = Colors.green,
  size = 24,
}: {
  checked: boolean
  disabled?: boolean
  size?: number
  color?: string
}) {
  return checked ? (
    <View
      style={{
        backgroundColor: color || Colors.green,
        borderRadius: 12,
      }}
    >
      <CheckCircledOutline width={size} height={size} color={Colors.white} />
    </View>
  ) : disabled ? null : (
    <Circle width={size} height={size} color={color || Colors.green} />
  )
}
