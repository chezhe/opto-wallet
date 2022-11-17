import { parse } from 'svg-parser'
import Constants from 'expo-constants'

export const calcViewBox = (xml: string) => {
  try {
    const result = parse(xml)
    if (result.children.length) {
      const properties = (result.children[0] as any).properties
      if (!properties.viewBox) {
        return `0 0 ${properties.width} ${properties.height}`
      }
      return properties.viewBox
    }
  } catch (error) {}
  return undefined
}

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const getBuildVersion = () => {
  return Constants.manifest?.version || 'Unknown'
}
