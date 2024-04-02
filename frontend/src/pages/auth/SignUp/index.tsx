import { AnimatePresence } from "framer-motion";
import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import googleLogo from "../../../assets/google-icon.svg";
import logo from "../../../assets/logo-light.svg";
import Spinner from "../../../components/Spinner";
import ErrorPopup from "../../../components/notifications/ErrorPopup";
import { useAuthContext } from "../../../contexts/AuthContext";
import "./styles.scss";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorKey, setErrorKey] = useState(0);
  const { signUpLocal, logInGoogle } = useAuthContext();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      await signUpLocal(username, email, password, confirmPassword);
    } catch (error) {
      const newErrorMessage: string =
        error instanceof Error ? error.message : String(error);
      setErrorMessage(newErrorMessage);
      setErrorKey((prevErrorKey) => prevErrorKey + 1);
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    logInGoogle();
  }

  return (
    <div className="sign-up">
      <AnimatePresence initial={false} mode="wait">
        {errorMessage && <ErrorPopup message={errorMessage} key={errorKey} />}
      </AnimatePresence>
      <img src={logo} alt="Com.chess" className="logo" />
      <div className="sign-up-container">
        <form className="local-sign-up" onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <input
              type="text"
              name="email"
              value={email}
              onChange={(e) => {
                if (!loading) setEmail(e.target.value);
              }}
              placeholder="Email"
            />
          </div>
          <div className="input-wrapper">
            <input
              type="text"
              name="username"
              value={username}
              onChange={(e) => {
                if (!loading) setUsername(e.target.value);
              }}
              placeholder="Username"
            />
          </div>
          <div className="input-wrapper">
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => {
                if (!loading) setPassword(e.target.value);
              }}
              placeholder="Password"
            />
          </div>
          <div className="input-wrapper">
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => {
                if (!loading) setConfirmPassword(e.target.value);
              }}
              placeholder="Confirm Password"
            />
          </div>
          <button type="submit">
            {loading ? (
              <Spinner size={`calc(var(--fs-400) * 1.5)`} />
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <hr />

        <div className="provider-sign-ups">
          <button
            className="provider-sign-ups--google"
            onClick={handleGoogleLogin}
          >
            <img src={googleLogo} alt="Google logo" />
            <span>Sign up with Google</span>
          </button>
        </div>
      </div>
      <div className="log-in-msg">
        Already have an account? <Link to="/login">Log in</Link>
      </div>
    </div>
  );
}
