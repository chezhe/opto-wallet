import { request } from 'graphql-request'
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
        'app-version': getBuildVersion(),
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
  const id = setTimeout(() => controller.abort(), 60000)
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        ...headers,
        'app-version': getBuildVersion(),
      },
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
  return fetcher(`${API.host}/api/fixer`)
    .then((data) => data.rates)
    .catch(() => DEFAULT_CURRENCY_RATE)
}

export const fetchConfigure = async () => {
  return await fetcher(`${API.host}/api/configure`)
}
