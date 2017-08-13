export default class Store {
  constructor () {
    this._store = {}
  }

  get (name, domain, path) {
    const key = serialize(name, domain, path)
    return this._store[key]
  }
}


function serialize (name, domain, path) {
  return `${name};${domain};${path}`
}
