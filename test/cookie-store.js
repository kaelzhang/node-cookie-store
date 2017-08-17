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


const create = f => {
  const cs = new CookieStore
  const cookie = cs.from(f)
  return [cs, cookie]
}

// @returns `Boolean` whether should return
const tryCatch = (t, runner, messagePrefix, expectedErrorCode) => {
  try {
    runner()
  } catch (e) {
    if (!expectedErrorCode) {
      t.fail(`${messagePrefix}: unexpected error: ${e.stack}`)
      return true
    }

    t.is(e.code, expectedErrorCode, `${messagePrefix}: error code not match`)
    return true
  }

  if (expectedErrorCode) {
    t.fail(`${messagePrefix}: should have errors`)
    return true
  }
}


const testReturnType = (t, expect, to, description) => {
  t.is(expect instanceof to, true, `the return type of ${description} is wrong`)
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
    },

    h: {
      h: 'foo2=1',
      // e: setCookie error
    },

    // h: Set-Cookie header

    // r: cookie to be removed
  },

  // read from
  r: [{
    // Optional
    // from: defaults to s.from

    // cookie expected
    c: [{
      name: 'foo',
      value: 'bar',
      hostOnly: true,
      path: '/index'
    }, {
      name: 'foo2',
      value: '1',
      hostOnly: true,
      path: '/index'
    }],

    // expected header Set-Cookie
    // foo which has earlier creation time comes first
    h: 'foo=bar; foo2=1'
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
  d: 'if domain or path not matched, skip setting',
  s: {
    from: DEFAULT_FROM,
    c: [{
      name: 'foo',
      value: 'bar',
      domain: 'foo2.com',
      returnNull: true
    }, {
      name: 'foo2',
      value: 'bar',
      path: '/index/bcd',
      returnNull: true
    }]
  },
  r: {
    c: [{
      name: 'foo',
      isNull: true
    }, {
      name: 'foo2',
      isNull: true
    }]
  }
},

{
  d: 'set to an existing cookie',
  s: {
    from: DEFAULT_FROM,
    c: [{
      name: 'foo',
      value: 'bar'
    }, {
      name: 'foo',
      value: 'bar2'
    }]
  },
  r: {
    c: {
      name: 'foo',
      value: 'bar2'
    }
  }
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
  d: 'cookie.set(): invalid domain',
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
  d: 'cs.from() errors',
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
},

{
  d: 'remove cookies',
  s: [{
    from: DEFAULT_FROM,
    c: [{
      name: 'foo',
      bar: 'bar'
    }],

  }, {
    from: {
      domain: 'foo2.com',
      path: '/'
    },
    c: [{
      name: 'foo2',
      bar: 'bar'
    }],
    // basic remove
    // foo2 will be removed, but foo not
    r: ['foo', 'foo2']
  }],
  r: [
    // {
    //   from: DEFAULT_FROM,
    //   c: {
    //     name: 'foo',
    //     value: 'bar'
    //   }
    // },
    {
      from: {
        domain: 'foo2.com',
        path: '/'
      },
      c: {
        name: 'foo',
        isNull: true
      }
    }
  ]
},

{
  d: 'path length filtering and sorting',
  s: {
    from: {
      domain: 'foo.com',
      path: '/a/b/c/d/e'
    },
    c: [{
      name: 'foo',
      value: 'bar',
      path: '/a/b/c/d'
    }, {
      name: 'foo',
      value: 'bar2',
      path: '/a/'
    }, {
      name: 'foo',
      value: 'bar3',
      path: '/a/b/c'
    }, {
      name: 'foo',
      value: 'bar4',
      path: '/a/b/c/d/e/f',
      returnNull: true
    }]
  },
  r: {
    h: 'foo=bar; foo=bar3; foo=bar2'
  }
},

{
  d: 'domain filtering',
  s: {
    from: {
      domain: 'b.a.foo.com',
      path: '/index'
    },
    c: [{
      name: 'foo',
      value: 'bar',
      domain: 'b.foo.com',
      returnNull: true
    }, {
      name: 'foo2',
      value: 'bar',
      domain: 'ab.a.foo.com',
      returnNull: true
    }, {
      name: 'foo3',
      value: 'bar',
      domain: 'a.foo.com'
    }]
  },
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
    }]
  }
},

{
  d: 'must not override if domain/path not match',
  s: [{
    from: {
      domain: 'b.a.foo.com',
      path: '/a/b/c/d'
    },
    c: {
      name: 'foo',
      value: 'bar',
      domain: 'b.a.foo.com',
      path: '/a/b/c/d'
    }
  }, {
    // domain not match
    from: {
      domain: 'b.foo.com',
      path: '/a/b/c/d'
    },
    c: {
      name: 'foo',
      value: 'bar2',
      domain: 'b.a.foo.com',
      path: '/a/b/c/d',
      returnNull: true
    }
  }, {
    // could alter cookie of subpaths
    from: {
      domain: 'b.a.foo.com',
      path: '/a/b/c'
    },
    c: {
      name: 'foo',
      value: 'bar3',
      domain: 'b.a.foo.com',
      path: '/a/b/c/d',
      returnNull: true
    }
  }, {
    from: {
      domain: 'b.a.foo.com',
      path: '/a/b/c/de'
    },
    c: {
      name: 'foo',
      value: 'bar4',
      domain: 'b.a.foo.com',
      path: '/a/b/c/d',
      returnNull: true
    }
  }],
  r: {
    from: {
      domain: 'b.a.foo.com',
      path: '/a/b/c/d'
    },
    c: {
      name: 'foo',
      value: 'bar'
    }
  }
},

{
  d: 'non-http apis',
  s: [{
    from: DEFAULT_FROM,
    c: {
      name: 'foo',
      value: 'bar',
      httpOnly: true
    }
  }, {
    from: {
      ...DEFAULT_FROM,
      http: false
    },
    c: [{
      // try to override a httpOnly cookie
      name: 'foo',
      value: 'bar2',
      returnNull: true
    }, {
      // try to create a httpOnly cookie
      name: 'foo2',
      value: 'bar',
      httpOnly: true,
      returnNull: true
    }, {
      name: 'foo3',
      value: 'bar'
    }]
  }],
  r: [{
    from: DEFAULT_FROM,
    c: [{
      name: 'foo',
      value: 'bar'
    }, {
      name: 'foo2',
      isNull: true
    }, {
      name: 'foo3',
      value: 'bar'
    }]
  }, {
    from: {
      ...DEFAULT_FROM,
      http: false
    },
    c: [{
      name: 'foo',
      isNull: true
    }, {
      name: 'foo2',
      isNull: true
    }, {
      name: 'foo3',
      value: 'bar'
    }]
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
      e,
      h,
      r
    }) => {

      let cookie

      if (
        tryCatch(t, () => {
          cookie = cs.from(_from)
        }, `cs.from(${JSON.stringify(_from)})`, e)
      ) {
        return
      }

      makeArray(c).forEach(({
        name,
        value,
        returnNull,
        e,
        ...options
      }) => {

        let ret

        if (
          tryCatch(t, () => {
            ret = cookie.set(name, value, options)
          }, `cookie.set("${name}")`, e)
        ) {
          return
        }

        const m = `cookie.set(${name}, ${value}, ${JSON.stringify(options)})`

        if (returnNull) {
          t.is(ret, null, `the return value of ${m} should be null`)
          return
        }

        testReturnType(t, ret, Cookie, m)
      })

      makeArray(h).forEach(({
        h,
        e,
        returnNull
      }) => {
        let ret

        if (
          tryCatch(t, () => {
            ret = cookie.setCookie(h)
          }, `cookie.setCookie(${h})`, e)
        ) {
          return
        }

        const m = `cookie.setCookie("${h}")`

        if (returnNull) {
          t.is(ret, null, `the return value of ${m} should be null`)
          return
        }

        testReturnType(t, ret, Cookie, m)
      })

      makeArray(r).forEach(name => {
        cookie.remove(name)
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
          _from = makeArray(makeArray(s)[0].from)[0]
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

  c.maxAge = 100

  await delay(1)
  t.is(cookie.get('foo').value, 'bar', 'should not expire')

  await delay(100)
  t.is(cookie.get('foo'), null, 'should expire')
})


test('restart', async t => {
  const [cs, cookie] = create(DEFAULT_FROM)

  cookie.set('foo', 'bar')
  cs.restart()

  t.is(cookie.get('foo'), null, 'should filter out session cookie')
})


test('the error cs.from(NO-ARGS) should be NO_DOMAIN', async t => {
  const cs = new CookieStore

  tryCatch(t, () => {
    cs.from()
  }, 'cs.from(NOTHING)', 'NO_DOMAIN')
})
