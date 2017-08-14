import Cookie from './cookie'

const SYMBOL_KEY = Symbol.for('cookie-store:cookie:key')


export default class Store {
  constructor () {
    this._store = Object.create(null)
  }

  get (name, domain, path) {
    const key = serialize(name, domain, path)
    return this._store[key]
  }

  // Get the cookie by key, and check if expired
  _getByKey (key) {
    const cookie = this._store[key]

    const expired = cookie.persistant
      ? cookie.expiryTime > new Date
      : false

    if (expired) {
      this._removeCookie(cookie)
      return null
    }

    return cookie
  }

  remove (remover) {
    this.forEach(cookie => {
      if (remover(cookie)) {
        this._removeCookie(cookie)
      }
    })
  }

  set (data, checker) {
    const {
      name,
      domain,
      path
    } = data

    const key = serialize(name, domain, path)
    const cookie = this._getByKey(key)

    if (!cookie) {
      return this._create(key, data)
    }

    if (!checker(cookie)) {
      return null
    }

    cookie.value = data.value

    return cookie
  }

  _create (key, data) {
    const cookie = new Cookie(data)
    cookie[SYMBOL_KEY] = key
    return this._store[key] = cookie
  }

  _removeCookie (cookie) {
    delete this._store[cookie[SYMBOL_KEY]]
  }

  clean (except) {
    this.forEach((cookie, key) => {
      if (!except(cookie)) {
        delete this._store[key]
      }
    })
  }

  forEach (iterator) {
    let key
    const store = this._store
    for (key in store) {
      const cookie = this._getByKey(key)

      if (cookie) {
        iterator(store[key], key)
      }
    }
  }

  filter (filter) {
    const collected = []
    this.forEach((cookie, key) => {
      if (filter(cookie)) {
        collected.push(cookie)
      }
    })

    return collected
  }
}


function serialize (name, domain, path) {
  return `${name};${domain};${path}`
}
