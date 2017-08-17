import {
  cleanCookieDomain,
  pathMatch,
  domainMatch,
  formatDomain,
  error
} from './utils'

import parseDomain from 'parse-domain'


export const SYMBOL_KEY = Symbol.for('cookie-store:cookie:key')

// Implementation of Cookie
// https://tools.ietf.org/html/rfc6265#section-4.2
export default class Cookie {
  constructor ({
    name,
    domain,
    path,
    maxAge,
    expires,
    secure,
    httpOnly,
    hostOnly,
    value
  }) {

    this.name = name

    this.httpOnly = httpOnly
    this.secureOnly = !!secure

    this.hostOnly = hostOnly
    this.persistent = false

    maxAge
      ? this.maxAge = maxAge
      : this.expires = expires

    this.domain = domain
    this.path = path

    this.value = value
  }

  match (domain, path) {
    // console.log('match domain', domain, this.domain, this.hostOnly
    //   ? domain === this.domain
    //   : domainMatch(domain, this.domain))
    //
    // console.log('match path', path, this.path, pathMatch(path, this.path))

    if (!pathMatch(path, this.path)) {
      return false
    }

    return this.hostOnly
      ? domain === this.domain
      : domainMatch(domain, this.domain)
  }
}


Object.defineProperties(Cookie.prototype, {
  maxAge: {
    set (maxAge) {
      if (typeof maxAge !== 'number') {
        return
      }

      this.persistent = true
      this.expiryTime = new Date(Date.now() + maxAge)
    }
  },

  expires: {
    set (expires) {
      if (!expires) {
        return
      }

      if (typeof expires === 'number') {
        expires = new Date(expires)
      }

      this.persistent = true
      this.expiryTime = expires
    }
  },

  value: {
    set (value) {
      this._value = value

      const time = new Date
      this.creationTime = time

      if (!this.lastAccessTime) {
        this.lastAccessTime = time
      }
    },

    get () {
      this.lastAccessTime = new Date
      return this._value
    }
  },

  domain: {
    set (domain) {
      const parsed = parseDomain(domain)

      if (!parsed || !parsed.domain) {
        error('invalid domain', 'INVALID_DOMAIN')
      }

      this._domain = this.hostOnly
        ? domain
        : formatDomain(parsed)
    },

    get () {
      return this._domain
    }
  },

  [SYMBOL_KEY]: {
    writable: true
  }
})
