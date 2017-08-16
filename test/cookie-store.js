import CookieStore from '../src'
import Cookie from '../src/cookie'
import makeArray from 'make-array'
import test from 'ava'

const only = true

;[
{
  d: 'basic, hostOnly, default-cookie-path',
  // set from
  s: {
    from: {
      domain: 'bar.foo.com',
      path: '/index/abc'
    },

    // cookie to be set
    c: {
      name: 'foo',
      value: 'bar',
      // ...options
    }
  },

  // read from
  r: {
    // defaults to s.from

    // cookie expected
    c: {
      name: 'foo',
      value: 'bar',
      //
      hostOnly: true,
      path: '/index'
    },

    h: 'foo=bar'
  }
},

{
  d: 'non-host-only top domain should be saved as .foo.com',
  s: {
    from: {
      domain: 'foo.com',
      path: '/index'
    },
    c: {
      name: 'foo',
      value: 'bar',
      domain: 'foo.com'
    }
  },
  r: {
    c: {
      name: 'foo',
      value: 'bar',
      domain: '.foo.com'
    }
  }
},

{
  d: 'cookie.set: invalid domain',
  s: {
    from: {
      domain: 'foo.com',
      path: '/index'
    },
    c: [{
      name: 'foo',
      value: 'bar',
      domain: '.com',
      e: 'INVALID_DOMAIN'
    }, {
      name: 'foo',
      value: 'bar',
      domain: 'foo.will-never-be-a-tld',
      e: 'INVALID_DOMAIN'
    }]
  }
}

].forEach(({
  d,
  s,
  r,
  only
}) => {

  const _test = only
    ? test.only
    : test

  _test(d, t => {
    if (r && !r.from) {
      r.from = makeArray(s.from)[0]
    }

    const cs = new CookieStore
    makeArray(s).forEach(({
      from: _from,
      c,
      e
    }) => {

      const cookie = cs.from(_from)

      makeArray(c).forEach(({
        name,
        value,
        e,
        ...options
      }) => {

        let ret

        try {
          ret = cookie.set(name, value, options)
        } catch (error) {
          if (!e) {
            throw error
          }

          t.is(error.code, e, 'error code not match')
          return
        }

        if (e) {
          t.fail('should have errors')
        }

        t.is(ret instanceof Cookie, true, 'the return type of cookie.set() is wrong')
      })

    })

    if (!r) {
      return
    }

    makeArray(r).forEach(({
      from: _from,
      c,
      h: header
    }) => {

      const cookie = cs.from(_from)

      makeArray(c).forEach(expected => {
        const c = cookie.get(expected.name)

        if (expected.isNull) {
          t.is(c, null, 'cookie should be null')
          return
        }

        t.is(c === null, false, 'cookie should not be null')

        Object.keys(expected).forEach(key => {
          t.is(c[key], expected[key], 'cookie property not match')
        })
      })

      if (header) {
        t.is(cookie.toHeader(), header, 'header not match')
      }

    })
  })
})
