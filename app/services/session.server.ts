import { createCookieSessionStorage } from '@remix-run/node'
import invariant from 'tiny-invariant'


invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set")

export const REMEMBER_DURATION = 60 * 60 * 24 * 7 // 7 days
export let sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
})

export function maxAgeSession(remember: string) {
  return remember === "on" ? REMEMBER_DURATION : undefined
}


export const { getSession, commitSession, destroySession } = sessionStorage
