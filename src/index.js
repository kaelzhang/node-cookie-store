import Cookie from './cookie'
import Store from './store'
import
import {
  error
} from './utils'


const cleanSessionCookie = cookie => cookie.persistant

export default class CookieStore {
  constructor () {
    this._store = new Store()
  }

  from ({
    domain,
    path
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
    store
  }) {

    this._domain = domain
    this._path = path
    this._store
  }

  set (key, value, options) {

  }

  get (key) {

  }

  setCookie (header) {

  }
}


CookieStore.Cookie = Cookie
