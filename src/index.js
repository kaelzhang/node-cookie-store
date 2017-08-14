import Cookie from './cookie'
import Store from './store'
import {
  error,
  defaultPath,
  sortCookies,
  parseSetCookie
} from './utils'


const COOKIE_HEADER_DELIMITER = '; '
const cleanSessionCookie = cookie => cookie.persistant


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

    this._match = cookie => cookie.match(this._domain, this._path)
  }

  set (name, value, options) {
    const data = {
      ...options,
      name,
      value
    }

    if (!data.domain) {
      data.domain = this._domain
    }

    if (!data.path) {
      data.path = this._path
    }

    return this._set(data)
  }

  setCookie (header) {
    const data = parseSetCookie(header)
    return this._set(data)
  }

  _set (data) {
    return this._store.set(data, this._match)
  }

  remove (name) {
    this._store.remove(cookie => {
      return cookie.name === name && this._match(cookie)
    })
  }

  get (name) {
    const filtered = this._filterAndSort(cookie => {
      return cookie.name === name && this._match(cookie)
    })

    return filtered[0] || null
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
