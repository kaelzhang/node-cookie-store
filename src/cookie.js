import {
  cleanCookieDomain,
  error
} from './utils'

export default class Cookie {
  constructor ({
    name,
    domain,
    path,
    maxAge,
    expires,
    secure,
    httpOnly,
    value
  }) {

    this.name = name

    this.httpOnly = httpOnly
    this.secureOnly = !!secure

    this.hostOnly = true
    this.persistant = false

    maxAge
      ? this.maxAge = maxAge
      : this.expires = expires

    this.domain = domain
    this.path = path

    this.value = value
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
      domain = cleanCookieDomain(domain)

      if (!domain) {
        error('invalid domain', 'INVALID_DOMAIN')
      }

      this._domain = domain
      this.hostOnly = !domain
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
    }

    get () {
      return this._httpOnly
    }
  }
})
