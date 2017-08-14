import Cookie from './cookie'
import Store from './store'
import
import {
  error,
  defaultPath,
  sortCookies,
  parseSetCookie
} from './utils'


const COOKIE_HEADER_DELIMITER = '; '
const cleanSessionCookie = cookie => cookie.persistant

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

    path = defaultPath(path)

    return new SubStore({
      domain,
      path,
      store: this._store
    })
  }

  restart () {
    this._store.clean(cleanSessionCookie)
  }
}


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

    this._match = cookie => cookie.match({
      domain: this._domain,
      path: this._path
    })
  }

  set (name, value, options) {
    return this._set({
      ...options,
      name,
      value
    })
  }

  setCookie (header) {
    const data = parseSetCookie(header)
    return this._set(data)
  }

  _set (data) {
    return this._store.set(data, this._match)
  }

  get (name) {
    const filtered = this._filterAndSort(cookie => {
      return cookie.name === name
        && this._match(cookie)
    })

    return sorted[0] || null
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
