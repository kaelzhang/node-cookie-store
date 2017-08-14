import CookieStore from '../src'
import Cookie from '../src/cookie'
import test from 'ava'

test('basic', t => {
  const cs = new CookieStore()
  const cookie = cs.from({
    domain: 'bar.foo.com',
    path: '/index/abc'
  })

  const ret = cookie.set('foo', 'bar')
  t.is(ret instanceof Cookie, true, 'the return type of cookie.set() is wrong')
  t.is(cookie.get('foo').value, 'bar')
})
