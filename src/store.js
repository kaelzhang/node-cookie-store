import Cookie from './cookie'

export default class Store {
  constructor () {
    this._store = Object.create(null)
  }

  get (name, domain, path) {
    const key = serialize(name, domain, path)
    return this._store[key]
  }

  set (data) {
    const {
      name,
      domain,
      path
    } = data

    const key = serialize(name, domain, path)
    const cookie = new Cookie(data)

    return this._store[key] = cookie
  }

  clean (fn) {
    let key
    const store = this._store
    for (key in store) {
      const cookie = store[key]

      if (!fn(cookie)) {
        delete store[key]
      }
    }
  }
}


function serialize (name, domain, path) {
  return `${name};${domain};${path}`
}
