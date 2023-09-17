import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useUserContext } from "../contexts/UserContext";
import { useAuthContext } from "../contexts/AuthContext";
import "../styles/Profile.scss";
import Loading from "./Loading";

export default function Profile() {
  const [isLoading, setIsLoading] = useState(true);
  const [joinedAt, setJoinedAt] = useState<Date>();
  const [isSelf, setIsSelf] = useState(false);

  const { username } = useParams();
  const { friends } = useUserContext();
  const { user } = useAuthContext();

  useEffect(() => {
    (async () => {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/user/${username}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      setJoinedAt(data.joinedAt);
      setIsSelf(data.isSelf);
      setIsLoading(false);
      console.log(data);
    })();
  }, []);

  return isLoading ? (
    <Loading />
  ) : (
    <div className="profile">
      <Navbar />
      <div className="profile__container">
        <div className="profile__name">
          <h2>{username}</h2>
          {!isSelf && (
            <div className="profile__buttons">
              {username && !friends.includes(username) ? (
                <button className="profile__add-friend">Add Friend</button>
              ) : (
                <button className="profile__remove-friend">
                  Remove Friend
                </button>
              )}
              <button className="profile__play">Play</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
