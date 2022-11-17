import { Currency } from 'types'

export const CURRENCY_SYMBOL = {
  [Currency.USD]: '$',
  [Currency.EUR]: '€',
  [Currency.CNY]: '¥',
  [Currency.JPY]: '¥',
}

export const DEFAULT_CURRENCY_RATE = {
  [Currency.CNY]: 7.116041,
  [Currency.EUR]: 1.02668,
  [Currency.USD]: 1,
  [Currency.JPY]: 145.36504,
}

export const PAGE_SIZE = 20
