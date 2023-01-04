import { Authenticator } from "remix-auth"
import invariant from 'tiny-invariant'
import { FormStrategy } from "remix-auth-form"

import { sessionStorage } from "~/services/session.server"
import { verifyLogin } from "~/models/user.server"
import type { UserSession } from "~/models/user.server"
export const authenticator = new Authenticator<UserSession | null>(sessionStorage)

export const AUTH_STRATEGIES = {
  withPassword: 'email-password-strategy'
}
authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email") as string
    const password = form.get("password") as string
    return verifyLogin(email, password)
  }),
  AUTH_STRATEGIES.withPassword
)

export async function getMaybeUser(request: Request): Promise<UserSession | undefined> {
  const session = await sessionStorage.getSession(
    request.headers.get("cookie")
  )
  return session.get(authenticator.sessionKey)
}

export async function getUser(request: Request) {
  const user = await getMaybeUser(request)

  if (user) return user

  await authenticator.logout(request, { redirectTo: "/login" });
}

export async function getUserOrRedirect(request: Request): Promise<UserSession> {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  })

  invariant(user, "User must be present")

  return user
}
