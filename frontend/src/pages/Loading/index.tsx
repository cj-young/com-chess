import { CSSProperties, useEffect, useState } from "react";
import Spinner from "../../components/Spinner";

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
    <div
      className="callback"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        flexDirection: "column",
        gap: "1rem"
      }}
    >
      {showMessage && (
        <div
          style={
            {
              textAlign: "center",
              color: "var(--clr-text-primary)",
              fontSize: "var(--fs-500)",
              maxWidth: "50ch",
              textWrap: "balance"
            } as CSSProperties
          }
        >
          {MESSAGE}
        </div>
      )}
      <Spinner size="2rem" />
    </div>
  );
}
