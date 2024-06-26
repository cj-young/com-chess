import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import ProfileGameModal from "../../components/ProfileGameModal";
import { socket } from "../../config/socket";
import { useUserContext } from "../../contexts/UserContext";
import Loading from "../Loading";
import "./styles.scss";

type Props = {
  setProfileKey: React.Dispatch<React.SetStateAction<string>>;
};

type PastGame =
  | {
      type: "live";
      opponent: string;
      minutes: number;
      increment: number;
      whiteUsername: string;
      blackUsername: string;
      color: string;
      readonly _id: string;
      winner: string;
    }
  | {
      type: "bot";
      difficulty: string;
      color: string;
      readonly _id: string;
      winner: string;
    };

export default function Profile({ setProfileKey }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [joinedAt, setJoinedAt] = useState<Date>();
  const [isSelf, setIsSelf] = useState(false);
  const [pastGames, setPastGames] = useState<PastGame[]>();
  const [username, setUsername] = useState<string>();
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const { username: usernameParam } = useParams();
  const { friends } = useUserContext();

  function handleRemoveFriend() {
    socket.emit("friendRemove", username);
  }

  function handleAddFriend() {
    socket.emit("friendRequest", username);
    setFriendRequestSent(true);
  }

  useEffect(() => {
    socket.on("notification", (notification) => {
      if (
        notification.type === "friendAccept" ||
        notification.type === "friendDidDecline" ||
        notification.type === "friendWasDeclined"
      ) {
        setFriendRequestSent(false);
      }
    });
  }, []);

  useEffect(() => {
    (async () => {
      setProfileKey(usernameParam || "");
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/user/${usernameParam}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          }
        }
      );
      const data = await response.json();
      setJoinedAt(new Date(data.joinedAt));
      setIsSelf(data.isSelf);
      setIsLoading(false);
      setUsername(data.username);
      setPastGames(data.pastGames);
    })();
  }, [usernameParam]);

  return isLoading ? (
    <Loading />
  ) : (
    <div className="profile">
      <Navbar />
      <div className="profile__container">
        <div className="profile__left">
          <div className="profile__name">
            <div className="profile__name__top">
              <h2>{username}</h2>
              {!isSelf && (
                <div className="profile__buttons">
                  {friends && username && friends.includes(username) ? (
                    <button
                      className="profile__remove-friend"
                      onClick={handleRemoveFriend}
                    >
                      Remove Friend
                    </button>
                  ) : friendRequestSent ? (
                    <div className="profile__friend-request-sent">
                      Friend Request Sent
                    </div>
                  ) : (
                    <button
                      className="profile__add-friend"
                      onClick={handleAddFriend}
                    >
                      Add Friend
                    </button>
                  )}
                  <button
                    className="profile__play"
                    onClick={() => setShowModal(true)}
                  >
                    Play
                  </button>
                </div>
              )}
            </div>
            <div className="joined-at">
              Joined{" "}
              {joinedAt?.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                timeZone: "EST"
              })}
            </div>
          </div>
          <h3>Past Games</h3>
          <ul className="profile__past-games">
            {pastGames && pastGames.length ? (
              pastGames.map((game, i) => (
                <li className="past-game" key={i}>
                  <Link
                    to={`/analyze/${game.type === "bot" ? "1" : "0"}${
                      game._id
                    }`}
                  >
                    <span className="name">
                      {game.type === "bot"
                        ? game.difficulty[0].toUpperCase() +
                          game.difficulty.slice(1) +
                          " Bot"
                        : game.color === "black"
                        ? game.whiteUsername
                        : game.blackUsername}
                    </span>
                    <span
                      className={`${
                        game.winner === null
                          ? "draw"
                          : game.winner === game.color
                          ? "win"
                          : "loss"
                      }`}
                    >
                      {game.winner === null
                        ? "Draw"
                        : game.winner === game.color
                        ? "Win"
                        : "Loss"}
                    </span>
                  </Link>
                </li>
              ))
            ) : (
              <div className="no-games">Past games will appear here</div>
            )}
          </ul>
        </div>

        {isSelf && (
          <div className="profile__friends">
            <h3>Friends</h3>
            <ul className="profile__friends__list">
              {friends.map((friend, i) => (
                <li key={i}>
                  <Link to={`/user/${friend}`}>{friend}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {showModal && username && (
        <ProfileGameModal
          close={() => setShowModal(false)}
          username={username}
        />
      )}
    </div>
  );
}
