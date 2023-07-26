import { useState, useEffect, FormEvent } from "react";
import { socket } from "../config/socket";
import "../styles/FriendsMenu.scss";

type Props = {
  friends: string[];
  updateFriends: () => Promise<void>;
};

export default function FriendsMenu({ friends, updateFriends }: Props) {
  const [receiver, setReceiver] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    socket.on("friendRequestFailure", (message) => {
      setError(message);
      setSuccessMessage("");
    });

    socket.on("friendRequestSuccess", (message) => {
      setSuccessMessage("Friend request sent to " + message);
      setError("");
    });

    return () => {
      socket.off("friendRequestFailure");
    };
  }, []);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    socket.emit("friendRequest", receiver);
    setError("");
    setSuccessMessage("");
  }

  return (
    <div className="friends-menu">
      <h2>Friends</h2>
      {friends.length > 0 && (
        <ul className="friends-list">
          {friends.map((friend, i) => (
            <li key={i}>
              <a href={`/user/${friend}`}>{friend}</a>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={handleSubmit}>
        <div className="friends-menu__input-wrapper">
          <input
            type="text"
            placeholder="Add friend"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
          />
        </div>
        <button className="button">Add</button>
      </form>
      <p className="friends-menu__error">{error}</p>
      <p className="friends-menu__message">{successMessage}</p>
    </div>
  );
}
