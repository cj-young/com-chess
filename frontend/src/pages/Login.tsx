import { AnimatePresence } from "framer-motion";
import { FormEvent, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import googleLogo from "../assets/google-icon.svg";
import logo from "../assets/logo-light.svg";
import ErrorPopup from "../components/ErrorPopup";
import LoginDemoNotification from "../components/LoginDemoNotification";
import Spinner from "../components/Spinner";
import { useAuthContext } from "../contexts/AuthContext";
import "../styles/Login.scss";

export default function Login() {
  const [searchParams, _setSearchParams] = useSearchParams();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(
    searchParams.get("error") ?? ""
  );
  const [errorKey, setErrorKey] = useState(0);
  const [loading, setLoading] = useState(false);

  const [wasDemoNotificationClosed, setWasDemoNotificationClosed] =
    useState(false);

  const isDemoNotificationOpen =
    !wasDemoNotificationClosed &&
    searchParams.get("demoIdentifier") &&
    searchParams.get("demoPassword");

  const { logInLocal, logInGoogle } = useAuthContext();

  function handleSubmit(e?: FormEvent<HTMLFormElement>) {
    if (e) e.preventDefault();
    submitLoginData(identifier, password);
  }

  async function submitLoginData(
    identifierToSend: string,
    passwordToSend: string
  ) {
    setLoading(true);
    try {
      await logInLocal(identifierToSend, passwordToSend);
    } catch (error) {
      const newErrorMessage: string =
        error instanceof Error ? error.message : String(error);
      setErrorMessage(newErrorMessage);
      setErrorKey((prevErrorKey) => prevErrorKey + 1);
    } finally {
      setLoading(false);
    }
  }

  function handleApplyDemo() {
    const demoIdentifier = searchParams.get("demoIdentifier");
    const demoPassword = searchParams.get("demoPassword");
    setWasDemoNotificationClosed(true);
    if (!demoIdentifier || !demoPassword) return;
    setIdentifier(demoIdentifier);
    setPassword(demoPassword);
    submitLoginData(demoIdentifier, demoPassword);
    handleSubmit();
  }

  function handleGoogleLogin() {
    logInGoogle();
  }

  return (
    <div className="login">
      <AnimatePresence initial={false} mode="wait">
        {errorMessage && <ErrorPopup message={errorMessage} key={errorKey} />}
      </AnimatePresence>
      <AnimatePresence>
        {isDemoNotificationOpen && (
          <LoginDemoNotification onApply={handleApplyDemo} />
        )}
      </AnimatePresence>
      <img src={logo} alt="Com.chess" className="logo" />
      <div className="login-container">
        <form className="local-login" onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <input
              type="text"
              name="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Username or Email"
              required
            />
          </div>
          <div className="input-wrapper">
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>
          <button type="submit">
            {loading ? (
              <Spinner size={`calc(var(--fs-400) * 1.5)`} />
            ) : (
              "Log In"
            )}
          </button>
        </form>
        <hr />
        <div className="provider-logins">
          <button
            className="provider-logins--google"
            onClick={handleGoogleLogin}
          >
            <img src={googleLogo} alt="Google logo" />
            <span>Log in with Google</span>
          </button>
        </div>
      </div>
      <div className="sign-up-msg">
        Don't have an account? <Link to="/signup">Sign up</Link>
      </div>
    </div>
  );
}
