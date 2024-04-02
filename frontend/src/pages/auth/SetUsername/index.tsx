import { AnimatePresence } from "framer-motion";
import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import Spinner from "../../../components/Spinner";
import ErrorPopup from "../../../components/notifications/ErrorPopup";
import { useAuthContext } from "../../../contexts/AuthContext";
import "./styles.scss";

export default function SetUsername() {
  const [username, setUsername] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorKey, setErrorKey] = useState(0);
  const [loading, setLoading] = useState(false);

  const { updateUsername } = useAuthContext();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUsername(username);
      return <Navigate to="/" />;
    } catch (error) {
      const newErrorMessage: string =
        error instanceof Error ? error.message : String(error);
      setErrorMessage(newErrorMessage);
      setErrorKey((prevErrorKey) => prevErrorKey + 1);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="set-username">
      <AnimatePresence initial={false} mode="wait">
        {errorMessage && <ErrorPopup message={errorMessage} key={errorKey} />}
      </AnimatePresence>
      <form className="input-container" onSubmit={handleSubmit}>
        <div className="input-wrapper">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Create your username"
          />
        </div>
        <button type="submit" aria-label="submit">
          {loading && <Spinner size={`calc(var(--fs-400) * 1.5)`} />}
          <span style={{ opacity: loading ? 0 : 1 }}>Submit</span>
        </button>
      </form>
    </div>
  );
}
