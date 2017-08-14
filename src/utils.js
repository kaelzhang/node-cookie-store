import {
  parse
} from 'url'

import parseDomain from 'parse-domain'
import setCookieParser from 'set-cookie-parser'


const DOT = '.'
const CHAR_CODE_DOT = DOT.charCodeAt(0)

const SLASH = '/'
const CHAR_CODE_SLASH = SLASH.charCodeAt(0)


export cleanCookieDomain = origin => {
  const parsed = parseDomain(origin)

  if (!parsed) {
    return null
  }

  const {
    subdomain,
    domain,
    tld
  } = parsed

  return subdomain
    // b.a.com -> b.a.com
    ? origin

    // a.com -> .a.com
    : `.${domain}.${tld}`
}


// The RFC-6265 Domain Matching
// https://tools.ietf.org/html/rfc6265#section-5.1.3
export domainMatch = (given, compareWith) => {
  if (given === compareWith) {
    return true
  }

  if (given.lastIndexOf(compareWith) !== 0) {
    return false
  }

  const startsWithDot = compareWith.indexOf(DOT) === 0
  if (startsWithDot) {
    compareWith = compareWith.slice(1)
  }

  const lastIndexNotIncluded = given.length - 1 - compareWith.length
  if (given.charCodeAt(lastIndexNotIncluded) === CHAR_CODE_DOT) {
    return true
  }

  return false
}


// The RFC-6265 Path-Match
// https://tools.ietf.org/html/rfc6265#section-5.1.4
export pathMatch = (given, compareWith) => {
  // Identical
  if (given === compareWith) {
    return true
  }

  // `given` must be the prefix of `compareWith`
  if (given.indexOf(compareWith) !== 0) {
    return false
  }

  // given: /abc/abc
  // compareWith: /abc/
  if (compareWith.charCodeAt(compareWith.length - 1) === CHAR_CODE_SLASH) {
    return true
  }

  // given: /abc/abc
  // compareWith: /abc
  if (compareWith.charCodeAt(given.length) === CHAR_CODE_SLASH) {
    return true
  }

  return false
}


export defaultPath = uri => {
  const pathname = parse(uri).pathname

  // > 2. If the uri-path is empty or if the first character of the uri-path is not a %x2F ("/") character, output %x2F ("/") and skip the remaining steps.

  // > 3. If the uri-path contains no more than one %x2F ("/") character, output %x2F ("/") and skip the remaining step.

  // Actually, pathname must not be empty nor have no slashes

  const splitted = pathname.split(SLASH)
  splitted.pop()

  return splitted.join(SLASH) || SLASH
}


export isValidCookiePath = uri => uri.indexOf(SLASH) === 0


export error = (message, code) => {
  const err = new Error(message)

  if (code) {
    err.code = code
  }

  throw err
}


export parseSetCookie = header => {
  return setCookieParser({
    headers: {
      'set-cookie': [header]
    }
  })[0]
}
