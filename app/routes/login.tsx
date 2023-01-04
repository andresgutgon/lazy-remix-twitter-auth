import { redirect } from "@remix-run/node";
import { maxAgeSession, getSession, commitSession } from "~/services/session.server"
import { authenticator, AUTH_STRATEGIES } from "~/services/auth.server"
import type { ActionArgs, LoaderArgs, MetaFunction } from "@remix-run/node";
import { Form, useSearchParams } from "@remix-run/react";

export async function loader({ request }: LoaderArgs) {
  return authenticator.isAuthenticated(request, { successRedirect: '/' })
}

export async function action({ request }: ActionArgs) {

  const clonedRequest = request.clone()
  const formData = await clonedRequest.formData()
  const user = await authenticator.authenticate(
    AUTH_STRATEGIES.withPassword,
    request,
    { failureRedirect: "/login" }
  )

  const session = await getSession(
    request.headers.get("cookie")
  )
  session.set(authenticator.sessionKey, user)
  const maxAge = maxAgeSession(formData.get("remember") as string)
  const headers = new Headers({
    "Set-Cookie": await commitSession(
      session,
      { maxAge }
    )
  })

  return redirect("/", { headers })
}

export const meta: MetaFunction = () => {
  return { title: "Login" }
};

export default function LoginPage() {
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get("redirectTo") || "/notes"

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <Form method="post" className="space-y-6" noValidate>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <div className="mt-1">
              <input
                id="email"
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
                required
                autoFocus={true}
                name="email"
                type="email"
                defaultValue='rachel@remix.run'
                autoComplete="email"
                aria-describedby="email-error"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="mt-1">
              <input
                className="w-full rounded border border-gray-500 px-2 py-1 text-lg"
                id="password"
                name="password"
                type="password"
                defaultValue='racheliscool'
                autoComplete="current-password"
                aria-describedby="password-error"
              />
            </div>
          </div>

          <input type="hidden" name="redirectTo" value={redirectTo} />
          <button
            type="submit"
            className="w-full rounded bg-blue-500  py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Log in
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="remember"
                className="ml-2 block text-sm text-gray-900"
              >
                Remember me
              </label>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
