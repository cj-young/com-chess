import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ProtectedRoutes from "./utils/ProtectedRoutes";
import NotFound from "./pages/NotFound";
import SignUp from "./pages/SignUp";
import { useAuthContext } from "./contexts/AuthContext";
import SetUsername from "./pages/SetUsername";
import { useEffect, useState } from "react";
import Loading from "./pages/Loading";
import Redirect from "./pages/Redirect";
import Profile from "./pages/Profile";
import Play from "./pages/Play";
import Notifications from "./components/Notifications";
import LiveGame from "./pages/LiveGame";
import BotGame from "./pages/BotGame";

export default function App() {
  const [initialLoading, setInitialLoading] = useState(true);
  const { user, getUser, setUser } = useAuthContext();

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
              <Route path="/user/:username" element={<Profile />} />
              <Route path="/play" element={<Play />} />
              <Route path="/play/live" element={<LiveGame />} />
              <Route path="/play/bot" element={<BotGame />} />
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
