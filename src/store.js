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
      delete this._store[cookie[SYMBOL_KEY]]
      return null
    }

    return cookie
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

  clean (fn) {
    this.forEach((cookie, key) => {
      if (!fn(cookie)) {
        delete this._store[key]
      }
    })
  }

  forEach (fn) {
    let key
    const store = this._store
    for (key in store) {
      const cookie = this._getByKey(key)

      if (cookie) {
        fn(store[key], key)
      }
    }
  }

  filter (fn) {
    const collected = []
    this.forEach((cookie, key) => {
      if (fn(cookie)) {
        collected.push(cookie)
      }
    })

    return collected
  }
}


function serialize (name, domain, path) {
  return `${name};${domain};${path}`
}
