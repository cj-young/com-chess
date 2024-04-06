import { useEffect, useState } from "react";
import Spinner from "../../components/Spinner";
import "./styles.scss";

const MESSAGE_DELAY = 2500;
const MESSAGE =
  "The backend of this app is hosted on a free service, so loading may take up to a minute.";

export default function Loading() {
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowMessage(true);
    }, MESSAGE_DELAY);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="loading">
      {showMessage && <div className="loading__message">{MESSAGE}</div>}
      <Spinner size="2rem" />
    </div>
  );
}
