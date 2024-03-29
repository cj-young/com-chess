import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { useAuthContext } from "../contexts/AuthContext";

const REDIRECT_ERROR_MESSAGE =
  "OAuth login failed, make sure third party (cross-origin) cookies are enabled.";

export default function Redirect() {
  const { getUser } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        await getUser();
        navigate("/");
      } catch (error) {
        const queryParams = new URLSearchParams();
        queryParams.set("error", REDIRECT_ERROR_MESSAGE);
        navigate({
          pathname: "/login",
          search: `?${queryParams.toString()}`
        });
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
