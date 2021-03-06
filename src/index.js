import Cookie from './cookie'
import Store from './store'
import {
  error,
  defaultPath,
  sortCookies,
  parseSetCookie
} from './utils'


const COOKIE_HEADER_DELIMITER = '; '
const cleanSessionCookie = cookie => cookie.persistent


class SubStore {
  constructor ({
    domain,
    path,
    store,
    http
  }) {

    this._domain = domain
    this._path = path
    this._store = store
    this._http = http

    this._match = this._match.bind(this)
  }

  _match (cookie) {
    // domain and path should match
    return cookie.match(this._domain, this._path)
    // handle http-only-flag
    && (this._http || !cookie.httpOnly)
  }

  set (name, value, options) {
    const data = {
      ...options,
      name,
      value
    }

    return this._set(data)
  }

  setCookie (header) {
    const data = parseSetCookie(header)
    return this._set(data)
  }

  _set (data) {
    // > If the domain-attribute is empty.
    if (!data.domain) {
      // > Set the cookie's domain to the canonicalized request-host.
      data.domain = this._domain
      // > Set the cookie's host-only-flag to true.
      data.hostOnly = true
    }

    if (!data.path) {
      data.path = defaultPath(this._path)
    }

    return this._store.set(data, this._match)
  }

  remove (name) {
    this._store.remove(cookie => {
      return cookie.name === name && this._match(cookie)
    })
  }

  get (name) {
    return this.getAll(name)[0] || null
  }

  getAll (name) {
    return this._filterAndSort(cookie => {
      return cookie.name === name && this._match(cookie)
    })
  }

  _filterAndSort (fn) {
    return sortCookies(this._store.filter(fn))
  }

  toHeader () {
    return this._filterAndSort(this._match)
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join(COOKIE_HEADER_DELIMITER)
  }
}


export default class CookieStore {
  constructor () {
    this._store = new Store()
  }

  from ({
    domain,
    path,

    // Whether it is not from a non-HTTP api
    http = true
  } = {}) {

    if (!domain) {
      error('no domain specified', 'NO_DOMAIN')
    }

    if (!path) {
      error('no path specified', 'NO_PATH')
    }

    return new SubStore({
      domain,
      path,
      http,
      store: this._store
    })
  }

  restart () {
    this._store.clean(cleanSessionCookie)
  }
}
