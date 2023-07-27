import { useEffect, useState } from "react";
import logo from "../assets/logo-light.svg";
import { Link } from "react-router-dom";
import "../styles/Navbar.scss";
import { useAuthContext } from "../contexts/AuthContext";
import friendsImg from "../assets/friends.svg";
import FriendsMenu from "./FriendsMenu";
import { useUserContext } from "../contexts/UserContext";
import hamburgerIcon from "../assets/bars-solid-light.svg";
import exitIcon from "../assets/xmark-solid-light.svg";

export default function Navbar() {
  const [mobileNavExpanded, setMobileNavExpanded] = useState(false);

  const { logOut, user } = useAuthContext();

  const { friends, updateFriends } = useUserContext();

  useEffect(() => {
    updateFriends();
  }, []);

  return (
    <nav className={mobileNavExpanded ? "mobile-nav-expanded" : ""}>
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
      <button
        className="toggle-mobile-nav"
        onClick={() =>
          setMobileNavExpanded(
            (prevMobileNavExpanded) => !prevMobileNavExpanded
          )
        }
      >
        <img
          src={mobileNavExpanded ? exitIcon : hamburgerIcon}
          alt="Toggle mobile navigation"
          aria-expanded={mobileNavExpanded}
        />
      </button>
    </nav>
  );
}
