import { useAuthContext } from "../contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

interface Props {
  auth: boolean;
}

export default function ProtectedRoutes({ auth }: Props) {
  const { user } = useAuthContext();

  if (auth) return user ? <Outlet /> : <Navigate to="/login" />;
  else return user ? <Navigate to="/" /> : <Outlet />;
}
