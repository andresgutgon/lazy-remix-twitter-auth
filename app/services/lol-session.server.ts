import { createCookieSessionStorage } from '@remix-run/node';
import invariant from 'tiny-invariant'

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set")
const { getSession, commitSession, destroySession } = createCookieSessionStorage({
  cookie: {
    name: '__session',
    secrets: [process.env.SESSION_SECRET],
    secure: true,
  },
})

export { getSession, commitSession, destroySession }
