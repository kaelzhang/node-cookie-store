[![Build Status](https://travis-ci.org/kaelzhang/node-cookie-store.svg?branch=master)](https://travis-ci.org/kaelzhang/node-cookie-store)
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

const cookie = cs.from({
  domain: 'bar.foo.com',
  path: '/a'
})

cookie.set('foo', 'a', {
  domain: '.foo.com'
})

cookie.get('foo')
// 'a'
```

## cs.from({domain, path})

Returns `Cookie` the cookie handle for specific domain and path

## cs.restart()

Restarts the cookie store, and filters out session cookies.

## cookie.set(key, value, options)

- **key** `String`
- **value** `String`
- **options** `Object=`
  - domain
  - path

## cookie.setCookie(setCookieHeader)

- **setCookieHeader** `String` the value of the HTTP Set-Cookie header.

## cookie.get(key)

- **key** `String`

## cookie.remove(key)

## cookie.toHeader()

Returns `String` the value of HTTP Cookie header

## cookie.applyResponse({status, headers})

- **status** `Number`
- **headers** `Object`

## License

MIT
