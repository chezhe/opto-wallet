import * as PubSub from 'pubsub-js'
import { PUB, ToastType } from 'types'

const DURATION = 1800

const toast = (type: ToastType, message: string, duration: number) => {
  PubSub.publish(PUB.TOAST_MESSAGE, {
    type,
    message,
    duration,
  })
}

export default class Toast {
  static error(error: unknown, duration = DURATION * 2) {
    if (error instanceof Error) {
      toast('error', error.message, duration)
      console.log('🐞', error.message)
    } else if (typeof error === 'string') {
      toast('error', error, duration)
    }
  }

  static success(message: string, duration = DURATION) {
    toast('success', message, duration)
  }

  static info(message: string, duration = DURATION) {
    toast('info', message, duration)
  }

  static warning(message: string, duration = DURATION) {
    toast('warning', message, duration)
  }

  static close() {
    PubSub.publish(PUB.TOAST_HIDE)
  }
}
