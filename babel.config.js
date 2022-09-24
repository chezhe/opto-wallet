module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      'babel-preset-expo',
      {
        exclude: ['transform-exponentiation-operator'],
      },
    ],
    plugins: [
      'react-native-reanimated/plugin',
      '@babel/plugin-syntax-bigint',
      [
        'module-resolver',
        {
          alias: {
            hooks: './hooks',
            types: './types',
            components: './components',
            configure: './configure',
            assets: './assets',
            utils: './utils',
            screens: './screens',
            navigation: './navigation',
            store: './store',
            locale: './locale',
            theme: './theme',
            chain: './chain',
          },
        },
      ],
    ],
  }
}
