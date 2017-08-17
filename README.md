[![Build Status](https://travis-ci.org/kaelzhang/node-cookie-store.svg?branch=master)](https://travis-ci.org/kaelzhang/node-cookie-store)
[![Coverage](https://codecov.io/gh/kaelzhang/node-cookie-store/branch/master/graph/badge.svg)](https://codecov.io/gh/kaelzhang/node-cookie-store)
<!-- optional appveyor tst
[![Windows Build Status](https://ci.appveyor.com/api/projects/status/github/kaelzhang/node-cookie-store?branch=master&svg=true)](https://ci.appveyor.com/project/kaelzhang/node-cookie-store)
-->
<!-- optional npm version
[![NPM version](https://badge.fury.io/js/cookie-store.svg)](http://badge.fury.io/js/cookie-store)
-->
<!-- optional npm downloads
[![npm module downloads per month](http://img.shields.io/npm/dm/cookie-store.svg)](https://www.npmjs.org/package/cookie-store)
-->
<!-- optional dependency status
[![Dependency Status](https://david-dm.org/kaelzhang/node-cookie-store.svg)](https://david-dm.org/kaelzhang/node-cookie-store)
-->

# cookie-store

An [RFC-6265](https://tools.ietf.org/html/rfc6265) cookie store to implement the mechanism of HTTP cookie and Set-Cookie header fields as a browser do.

- A central store for different domains and paths
- Set cookies as if from a certain domain and path
- Get cookies as if from a certain domain and path

## Install

```sh
$ npm install cookie-store
```

## Usage

```js
const CookieStore = require('cookie-store')
const cs = new CookieStore()

const handler = cs.from({
  domain: 'bar.foo.com',
  path: '/a'
})

handler.set('foo', 'a', {
  domain: '.foo.com'
})

handler.get('foo').value
// 'a'
```

## cs.from({domain, path, http}) : Handler

- **domain** `String`
- **path** `String`
- **http** `Boolean=true` indicate that we will manipulate cookie via HTTP APIs. Defaults to `true`

Returns `Handler` the cookie handler for specific domain and path.

## cs.restart()

Restarts the cookie store, and filters out session cookies.

## handler.set(key, value, options)

- **key** `String`
- **value** `String`
- **options** `Object=`
  - domain `String=` Optional. If not specified, the cookie's [host-only-flag](https://tools.ietf.org/html/rfc6265#section-5.3) will be set to `true`
  - path `String=` Optional. If not specified, it will
  - httpOnly `Boolean=false` whether set the cookie's http-only-flag to `true`
  - maxAge `Number`
  - expires `Date|TimeStamp`

Set a cookie.

Returns
- `Cookie` if it has succeeded to set the cookie
- `null` if it fails to set the cookie

## handler.setCookie(setCookieHeader)

- **setCookieHeader** `String` the value of the HTTP Set-Cookie header.

Set a cookie via HTTP Set-Cookie header.

Returns `Cookie|null` as well as `handler.set()`

## handler.getAll(name)

Returns `Array.<Cookie>` all matched cookies which have name `name`.

## handler.get(name)

- **name** `String`

Searches and returns the most matching cookie according to the sorting rule:  [https://tools.ietf.org/html/rfc6265#section-5.4](https://tools.ietf.org/html/rfc6265#section-5.4)

Returns
- `Cookie` if an available cookie is found
- `null` if no matched cookie.

## handler.remove(name)

Removes all matched cookies of the name `name`.

## handler.toHeader()

Returns `String` the value of HTTP Cookie header

## Struct: Cookie

- name
- value
- domain
- path
- httpOnly
- hostOnly
- persistent
- expiryTime

The [RFC-6265](https://tools.ietf.org/html/rfc6265) cookie object.


## License

MIT
