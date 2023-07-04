import { useEffect } from "react";
import Spinner from "../components/Spinner";
import { useAuthContext } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

export default function Redirect() {
  const { getUser } = useAuthContext();

  useEffect(() => {
    (async () => {
      try {
        await getUser();
        return <Navigate to="/" />;
      } catch (error) {
        return <Navigate to="/login" />;
      }
    })();
  }, []);

  return (
    <div
      className="callback"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%"
      }}
    >
      <Spinner size="2rem" />
    </div>
  );
}
