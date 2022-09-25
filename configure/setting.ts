import { Currency } from 'types'

export const CURRENCY_SYMBOL = {
  [Currency.USD]: '$',
  [Currency.EUR]: '€',
  [Currency.CNY]: '¥',
}

export const DEFAULT_CURRENCY_RATE = {
  [Currency.CNY]: 6.734698,
  [Currency.EUR]: 0.94989,
  [Currency.USD]: 1,
}

export const DEFAULT_EDITOR_CHOICES = [
  {
    title: 'Rainbow Bridge',
    oneliner:
      'The Rainbow Bridge is the official bridge for transferring tokens between Ethereum, NEAR and the Aurora networks. ',
    logo: 'https://awesome-near.s3.amazonaws.com/rainbow-bridge.jpg',
    website: 'https://rainbowbridge.app/',
    banner: 'https://xoth.deno.dev/editor/rainbow.jpg',
  },
  {
    title: 'Ref Finance',
    oneliner: 'Multi-purpose DeFi platform built on NEAR Protocol.',
    logo: 'https://awesome-near.s3.amazonaws.com/ref-finance.jpg',
    website: 'https://app.ref.finance',
    dapp: 'https://app.ref.finance',
    banner: 'https://xoth.deno.dev/editor/ref.jpg',
  },
  {
    title: 'Astro DAO',
    oneliner: 'Launch your DAO in less than 10 minutes without a line of code.',
    logo: 'https://awesome-near.s3.amazonaws.com/astrodao.jpg',
    website: 'https://astrodao.com/',
    dapp: 'https://app.astrodao.com/',
    banner: 'https://xoth.deno.dev/editor/astro.jpg',
  },
  {
    title: 'Jumbo Exchange',
    oneliner: 'UI/UX Friendly AMM built on NEAR.',
    logo: 'https://awesome-near.s3.amazonaws.com/jumbo-exchange.jpg',
    website: 'https://jumbo.exchange/',
    dapp: 'https://jumbo.exchange/',
    banner: 'https://xoth.deno.dev/editor/jumbo.jpg',
  },
]
