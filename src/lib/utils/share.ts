import { encode, decode } from 'js-base64'

export const createShareableUrl = (code: string): string => {
  const encodedCode = encode(code)
  return `${window.location.origin}/playground/shared/${encodedCode}`
}

export const decodeSharedCode = (encodedCode: string): string => {
  return decode(encodedCode)
}
