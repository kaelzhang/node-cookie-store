import {
  cleanCookieDomain,
  pathMatch,
  domainMatch,
  formatDomain,
  error
} from './utils'

import parseDomain from 'parse-domain'


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
    this.persistant = false

    maxAge
      ? this.maxAge = maxAge
      : this.expires = expires

    this.domain = domain
    this.path = path

    this.value = value
  }

  match (domain, path) {
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
      if (!maxAge) {
        return
      }

      this.persistant = true
      this.expiryTime = this.creationTime + maxAge
    }
  },

  expires: {
    set (expires) {
      if (!expires) {
        return
      }

      this.persistant = true
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

      if (!parsed) {
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

  httpOnly: {
    set (httpOnly) {
      // Set once
      if ('_httpOnly' in this) {
        return
      }

      this._httpOnly = !!httpOnly
    },

    get () {
      return this._httpOnly
    }
  }
})
