import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../../contexts/AuthContext";
import Loading from "../../Loading";

const REDIRECT_ERROR_MESSAGE =
  "OAuth login failed, make sure third party (cross-origin) cookies are enabled and not isolated.";

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

  return <Loading />;
}
