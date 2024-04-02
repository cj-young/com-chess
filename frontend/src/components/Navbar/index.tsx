import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import hamburgerIcon from "../../assets/bars-solid-light.svg";
import friendsImg from "../../assets/friends.svg";
import logo from "../../assets/logo-light.svg";
import exitIcon from "../../assets/xmark-solid-light.svg";
import { useAuthContext } from "../../contexts/AuthContext";
import { useUserContext } from "../../contexts/UserContext";
import FriendsMenu from "../FriendsMenu";
import "./styles.scss";

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
