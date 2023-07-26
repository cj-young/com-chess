import { useEffect } from "react";
import logo from "../assets/logo-light.svg";
import { Link } from "react-router-dom";
import "../styles/Navbar.scss";
import { useAuthContext } from "../contexts/AuthContext";
import friendsImg from "../assets/friends.svg";
import FriendsMenu from "./FriendsMenu";
import { useUserContext } from "../contexts/UserContext";

export default function Navbar() {
  const { logOut, user } = useAuthContext();

  const { friends, updateFriends } = useUserContext();

  useEffect(() => {
    updateFriends();
  }, []);

  return (
    <nav>
      <Link to="/">
        <img src={logo} alt="Com.chess" className="logo" />
      </Link>
      <div className="right-elements">
        <Link to={`/user/${user?.username}`} className="username">
          {user?.username}
        </Link>
        <div className="friends">
          <img src={friendsImg} alt="Friends" />
          <FriendsMenu friends={friends} />
        </div>
        <button className="log-out" onClick={logOut}>
          Log Out
        </button>
      </div>
    </nav>
  );
}
