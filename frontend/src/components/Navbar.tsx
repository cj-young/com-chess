import { useEffect, useState } from "react";
import logo from "../assets/logo-light.svg";
import { Link } from "react-router-dom";
import "../styles/Navbar.scss";
import { useAuthContext } from "../contexts/AuthContext";
import friendsImg from "../assets/friends.svg";
import notificationsImg from "../assets/notifications.svg";
import FriendsMenu from "./FriendsMenu";
import { useUserContext } from "../contexts/UserContext";

export default function Navbar() {
  const { logOut, user } = useAuthContext();
  const [friendsExpanded, setFriendsExpanded] = useState(false);

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
          <button
            className="expand-friends"
            onClick={() =>
              setFriendsExpanded((prevFriendsExpanded) => !prevFriendsExpanded)
            }
            aria-expanded={friendsExpanded}
          >
            <img src={friendsImg} alt="Friends" />
          </button>
          {friendsExpanded && (
            <FriendsMenu friends={friends} updateFriends={updateFriends} />
          )}
        </div>
        <button className="notifications">
          <img src={notificationsImg} alt="Friends" />
          <div className="badge">2</div>
        </button>
        <button className="log-out" onClick={logOut}>
          Log Out
        </button>
      </div>
    </nav>
  );
}
