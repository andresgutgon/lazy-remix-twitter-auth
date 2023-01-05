import { json, redirect } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import type { LoaderArgs, ActionFunction } from '@remix-run/node'
import { LoginButton } from '@telgram-auth/react'

import { getSession, commitSession, destroySession } from '~/services/lol-session.server'

export async function loader({ request }: LoaderArgs) {
  const session = await getSession(request.headers.get('Cookie'));

  if (session.has('user')) {
    return redirect('/');
  }

  const botUsername = process.env.TELEGRAM_BOT_USERNAME || '';

  const data = { error: session.get('error'), botUsername };
  console.log("BOT_DATA", data);

  return json(data, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
}

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get('Cookie'));

  return redirect('/', {
    headers: {
      'Set-Cookie': await destroySession(session),
    },
  });
}

export default function TelegramLogin() {
  const { botUsername, error } = useLoaderData();
  console.log('BOT', botUsername);


  return (
    <div>
      {error ? <div className="error">{error}</div> : null}
      <br />
      <LoginButton botUsername={botUsername} authCallbackUrl="/telegramAuth" />
    </div>
  )
}
