import Cookie, {
  SYMBOL_KEY
} from './cookie'


export default class Store {
  constructor () {
    this._store = Object.create(null)
  }

  // Get the cookie by key, and check if expired
  _getByKey (key) {
    const cookie = this._store[key]

    if (!cookie) {
      return null
    }

    const expired = cookie.persistent
      ? cookie.expiryTime < new Date
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


  // @param `Object` data
  // @param `Function` checker
  set (data, checker) {
    const {
      name,
      domain,
      path
    } = data

    const key = serialize(name, domain, path)
    const cookie = this._getByKey(key)

    // Cookie does not exist
    if (!cookie) {
      return this._create(key, data, checker)
    }

    // Cookie exists
    if (!checker(cookie)) {
      // But the curruent domain/path could not modify the cookie
      return null
    }

    cookie.value = data.value

    return cookie
  }

  _create (key, data, checker) {
    const cookie = new Cookie(data)
    cookie[SYMBOL_KEY] = key

    return checker(cookie)
      ? this._store[key] = cookie
      : null
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
