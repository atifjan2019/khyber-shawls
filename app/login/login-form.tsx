'use client';

import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { loginAction, type LoginState } from '@/app/(auth)/actions';

const initialState: LoginState = { error: undefined };

export default function LoginForm() {
  const search = useSearchParams();
  const callbackUrl = search.get('callbackUrl') ?? '/dashboard';

  // Wrap the server action so we always pass callbackUrl
  const actionWithCallback = async (prev: LoginState, formData: FormData) => {
    formData.set('callbackUrl', callbackUrl);
    return loginAction(prev, formData);
  };

  // React 19: useActionState replaces useFormState
  const [state, formAction] = useActionState<LoginState, FormData>(
    actionWithCallback,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      {/* also include a hidden field so the value shows up if you submit w/o JS */}
      <input type="hidden" name="callbackUrl" value={callbackUrl} />

      <div>
        <label className="block text-sm font-medium">Email</label>
        <input name="email" type="email" required className="input" />
      </div>

      <div>
        <label className="block text-sm font-medium">Password</label>
        <input name="password" type="password" required className="input" />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button type="submit" className="rounded-md bg-black px-4 py-2 text-white">
        Log in
      </button>
    </form>
  );
}
