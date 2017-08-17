import CookieStore from '../src'
import Cookie from '../src/cookie'
import makeArray from 'make-array'
import test from 'ava'
import delay from 'delay'

const only = true

const DEFAULT_FROM = {
  domain: 'foo.com',
  path: '/index/abc'
}

;[
{
  d: 'basic, hostOnly, default-cookie-path, path not match',
  // set from
  s: {
    from: DEFAULT_FROM,

    // cookie to be set
    c: {
      name: 'foo',
      value: 'bar',
      // ...options
    }
  },

  // read from
  r: [{
    // defaults to s.from

    // cookie expected
    c: {
      name: 'foo',
      value: 'bar',
      hostOnly: true,
      path: '/index'
    },

    h: 'foo=bar'
  }, {
    from: {
      domain: 'foo.com',
      path: '/abc'
    },

    c: {
      name: 'foo',
      isNull: true
    }
  }]
},

{
  d: 'non-host-only top domain should be saved as .foo.com | root path',
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
      domain: '.foo.com',
      path: '/'
    }
  }
},

{
  d: 'cookie.set: invalid domain',
  s: {
    from: DEFAULT_FROM,
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
},

{
  d: 'maxAge | expires',
  s: {
    from: DEFAULT_FROM,
    c: [{
      name: 'foo',
      value: 'bar',
      maxAge: 19
    }, {
      name: 'foo2',
      value: 'bar',
      expires: new Date(+ new Date + 19)
    }, {
      name: 'foo3',
      value: 'bar',
      maxAge: 30
    }, {
      name: 'foo4',
      value: 'bar',
      expires: + new Date + 50
    }]
  },
  dl: 20,
  r: {
    c: [{
      name: 'foo',
      isNull: true
    }, {
      name: 'foo2',
      isNull: true
    }, {
      name: 'foo3',
      value: 'bar'
    }, {
      name: 'foo4',
      value: 'bar'
    }]
  }
},

{
  d: 'c.from errors',
  s: [{
    from: {
      domain: 'foo.com'
    },
    e: 'NO_PATH'
  }, {
    from: {
      path: '/'
    },
    e: 'NO_DOMAIN'
  }]
}

].forEach(({
  d,
  s,
  dl,
  r,
  only
}) => {

  const _test = only
    ? test.only
    : test

  _test(d, async t => {
    const cs = new CookieStore
    makeArray(s).forEach(({
      from: _from,
      c,
      e
    }) => {

      let cookie

      try {
        cookie = cs.from(_from)
      } catch (error) {
        if (!e) {
          t.fail('expected error:' + e.stack)
          return
        }

        t.is(error.code, e, 'cs.from: error code not match')
        return
      }

      if (e) {
        t.fail('cs.from: should have errors')
        return
      }


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
            t.fail('expected error:' + e.stack)
            return
          }

          t.is(error.code, e, 'cookie.set: error code not match')
          return
        }

        if (e) {
          t.fail('cookie.set: should have errors')
          return
        }

        t.is(ret instanceof Cookie, true, 'the return type of cookie.set() is wrong')
      })

    })

    if (!r) {
      return
    }

    function test_result () {
      makeArray(r).forEach(({
        from: _from,
        c,
        h: header
      }) => {

        if (!_from) {
          _from = makeArray(s.from)[0]
        }

        const cookie = cs.from(_from)

        makeArray(c).forEach(expected => {
          const c = cookie.get(expected.name)

          if (expected.isNull) {
            t.is(c, null, 'cookie should be null')
            return
          }

          if (c === null) {
            t.fail('cookie should not be null')
            return
          }

          Object.keys(expected).forEach(key => {
            t.is(c[key], expected[key], 'cookie property not match')
          })
        })

        if (header) {
          t.is(cookie.toHeader(), header, 'header not match')
        }

      })
    }

    dl
      ? delay(dl).then(test_result)
      : test_result()

  })
})


test('maxAge must be a number', async t => {
  const cs = new CookieStore
  const cookie = cs.from(DEFAULT_FROM)
  const c = cookie.set('foo', 'bar')

  c.maxAge = '100'
  t.is(c.expiryTime, undefined, 'should ignore string')

  c.maxAge = {}
  t.is(c.expiryTime, undefined, 'should ignore object')

  c.maxAge = 50

  await delay(1)
  t.is(cookie.get('foo').value, 'bar', 'should not expire')

  await delay(50)
  t.is(cookie.get('foo'), null, 'should expire')
})


test('restart', async t => {
  const cs = new CookieStore
  const cookie = cs.from(DEFAULT_FROM)

  cookie.set('foo', 'bar')
  cs.restart()

  t.is(cookie.get('foo'), null, 'should filter out session cookie')
})
