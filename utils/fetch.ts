import { request } from 'graphql-request'
import { Chain } from 'types'
import API from 'configure/api'
import { getBuildVersion } from './helper'
import { DEFAULT_CURRENCY_RATE } from 'configure/setting'

export const post = async (url: string, json: object) => {
  const body = JSON.stringify(json)
  try {
    const response = await fetch(url, {
      method: 'POST',
      body,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    const responseJson = await response.json()

    console.log('✅POST - ', url, json)

    return responseJson
  } catch (error) {
    console.log('❌POST - ', url, json)
    throw error
  }
}

export const graphFetcher = (host: string, query: string, headers: any) => {
  return request(host, query, headers)
}

export const fetcher = async (url: string, headers = {}) => {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), 30000)
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers,
    })
    clearTimeout(id)
    console.log('✅GET - ', url)
    return response.json()
  } catch (error) {
    console.log('❌GET - ', url)
    throw error
  }
}

export const fetchFixer = async () => {
  return fetcher(`${API.indexer}/api/fixer`)
    .then((data) => data.rates)
    .catch(() => DEFAULT_CURRENCY_RATE)
}

export const fetchDApp = async (chain: Chain) => {
  return fetcher(`${API.indexer}/api/dapps?chain=${chain}`).then((data) => {
    return data
  })
}

export const fetchConfigure = async () => {
  return await fetcher(
    `${API.indexer}/api/configure?version=${getBuildVersion()}`
  )
}

export const searchDapps = (chain: Chain, keyword: string) => {
  return fetcher(
    `${API.indexer}/api/dapps/search?chain=${chain}&keyword=${keyword}`
  )
    .then((data) => data)
    .catch(() => [])
}
