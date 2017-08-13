import {
  domainMatch
} from './utils'

export default class Cookie {
  constructor ({
    domain,
    path,
    maxAge,
    expires,
    secure,
    httpOnly
  }) {

    const time = Date.now()

    this.creationTime =
    this.lastAccessTime = time

    this.httpOnly = httpOnly
    this.secureOnly = !!secure

    this.hostOnly = true
    this.persistant = false

    maxAge
      ? this.maxAge = maxAge
      : this.expires = expires

    this.domain = domain
    this.path = path
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

  domain: {
    set (domain) {
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
