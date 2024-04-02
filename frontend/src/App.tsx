import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import Notifications from "./components/notifications/Notifications";
import { useAuthContext } from "./contexts/AuthContext";
import Analyze from "./pages/Analyze";
import Home from "./pages/Home/Home";
import Play from "./pages/Home/Play";
import Loading from "./pages/Loading";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Login from "./pages/auth/Login";
import Redirect from "./pages/auth/Redirect";
import SetUsername from "./pages/auth/SetUsername";
import SignUp from "./pages/auth/SignUp";
import BotGame from "./pages/games/BotGame";
import LiveGame from "./pages/games/LiveGame";
import ProtectedRoutes from "./utils/ProtectedRoutes";

export default function App() {
  const [initialLoading, setInitialLoading] = useState(true);
  const { user, getUser, setUser } = useAuthContext();
  const [analyzeKey, setAnalyzeKey] = useState("");
  const [profileKey, setProfileKey] = useState("");

  useEffect(() => {
    (async () => {
      try {
        await getUser();
      } catch (error) {
        setUser(null);
      }
      setInitialLoading(false);
    })();
  }, []);

  return (
    <div className="app">
      {user?.username && <Notifications />}
      <Routes>
        {initialLoading && <Route path="/*" element={<Loading />} />}
        <Route element={<ProtectedRoutes auth={true} />}>
          {user?.username ? (
            <>
              <Route path="/" element={<Home />} />
              <Route
                path="/user/:username"
                element={
                  <Profile key={profileKey} setProfileKey={setProfileKey} />
                }
              />
              <Route path="/play" element={<Play />} />
              <Route path="/play/live" element={<LiveGame />} />
              <Route path="/play/bot" element={<BotGame />} />
              <Route
                path="/analyze/"
                element={
                  <Analyze setAnalyzeKey={setAnalyzeKey} key={analyzeKey} />
                }
              />
              <Route
                path="/analyze/:gameId"
                element={
                  <Analyze setAnalyzeKey={setAnalyzeKey} key={analyzeKey} />
                }
              />
            </>
          ) : (
            <Route path="/*" element={<SetUsername />} />
          )}
        </Route>
        <Route element={<ProtectedRoutes auth={false} />}>
          <Route path="/login" element={<Login />}></Route>
          <Route path="/login/redirect" element={<Redirect />} />
          <Route path="/signup" element={<SignUp />} />
        </Route>
        <Route path="/*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
