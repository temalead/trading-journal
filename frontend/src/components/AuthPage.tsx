import { FormEvent } from "react";
import { AuthFormState } from "../types/forms";
import { Field } from "./Field";

type AuthPageProps = {
  authForm: AuthFormState;
  loading: boolean;
  message: string;
  setAuthForm: (updater: (current: AuthFormState) => AuthFormState) => void;
  submitAuth: (event: FormEvent<HTMLFormElement>) => void;
};

export function AuthPage({ authForm, loading, message, setAuthForm, submitAuth }: AuthPageProps) {
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="brand auth-brand">
          <div className="brand-mark">TJ</div>
          <div>
            <div className="brand-name">Collectivo</div>
            <div className="brand-caption">Trading Journal</div>
          </div>
        </div>

        <form className="auth-form" onSubmit={submitAuth}>
          <div>
            <h1>{authForm.mode === "register" ? "Create Account" : "Sign In"}</h1>
            <p>Your profile data is stored in this browser after login.</p>
          </div>

          {authForm.mode === "register" && (
            <Field
              label="Username"
              value={authForm.username}
              onChange={(value) => setAuthForm((current) => ({ ...current, username: value }))}
              required
            />
          )}
          <Field
            label="Email"
            value={authForm.email}
            onChange={(value) => setAuthForm((current) => ({ ...current, email: value }))}
            type="email"
            required
          />
          <Field
            label="Password"
            value={authForm.password}
            onChange={(value) => setAuthForm((current) => ({ ...current, password: value }))}
            type="password"
            required
          />
          <button className="primary-button" disabled={loading} type="submit">
            {loading ? "Please wait..." : authForm.mode === "register" ? "Create Account" : "Sign In"}
          </button>
          <button
            className="secondary-button"
            type="button"
            onClick={() =>
              setAuthForm((current) => ({
                ...current,
                mode: current.mode === "register" ? "login" : "register",
              }))
            }
          >
            {authForm.mode === "register" ? "I Have An Account" : "Create Account"}
          </button>
        </form>
      </section>
      {message && <div className="toast show">{message}</div>}
    </main>
  );
}
