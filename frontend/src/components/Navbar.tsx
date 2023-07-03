import logo from "../assets/logo-light.svg";
import { Link } from "react-router-dom";
import "../styles/Navbar.scss";
import { useAuthContext } from "../contexts/AuthContext";

export default function Navbar() {
  const { logOut } = useAuthContext();

  return (
    <nav>
      <Link to="/">
        <img src={logo} alt="Com.chess" className="logo" />
      </Link>
      <div className="log-out" onClick={logOut}>
        Log Out
      </div>
    </nav>
  );
}
