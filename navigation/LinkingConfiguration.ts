import { LinkingOptions } from '@react-navigation/native'
import * as Linking from 'expo-linking'

import { RootStackParamList } from 'types'

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/'), 'https://xoth.deno.dev', 'xoth://'],
  config: {
    screens: {
      Root: {
        screens: {
          Home: 'Home',
          Setting: 'Setting',
        },
      },
      NotFound: '*',
    },
  },
}

export default linking
