import { useState, ChangeEvent, FocusEvent, useMemo } from "react";
import "../styles/CreateGame.scss";
import { useUserContext } from "../contexts/UserContext";
import { socket } from "../config/socket";

export default function CreateGame() {
  const [minutes, setMinutes] = useState("10");
  const [increment, setIncrement] = useState("0");
  const [opponent, setOpponent] = useState("");

  const { friends } = useUserContext();

  const canCreate = useMemo<boolean>(() => {
    return opponent.length > 0 && minutes.length > 0 && increment.length > 0;
  }, [minutes, increment, opponent]);

  function handleMinutesChange(e: ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    if (/^\d*$/.test(e.target.value)) {
      setMinutes(e.target.value);
    }
  }

  function handleMinutesBlur(e: FocusEvent<HTMLInputElement>) {
    if (+minutes > 60) setMinutes("60");
  }

  function handleIncrementChange(e: ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    if (/^\d*$/.test(e.target.value)) {
      setIncrement(e.target.value);
    }
  }

  function handleIncrementBlur(e: FocusEvent<HTMLInputElement>) {
    if (+increment > 30) setIncrement("30");
  }

  function handleOpponentChange(newOpponent: string): () => void {
    return () => {
      setOpponent(newOpponent);
    };
  }

  function handleCreateGame() {
    if (!canCreate) return;
    socket.emit("gameRequest", { username: opponent, minutes, increment });
  }

  return (
    <div className="create-game">
      <h2>Create a game</h2>
      <h3>Time Controls</h3>
      <div className="time-controls">
        <div className="time-controls__input">
          <input
            type="text"
            className="time-controls__minutes"
            name="minutes"
            inputMode="numeric"
            placeholder="00"
            value={minutes}
            onChange={handleMinutesChange}
            onBlur={handleMinutesBlur}
          />
          <label htmlFor="minutes">Minutes</label>
        </div>
        <div className="time-controls__input">
          <input
            type="text"
            className="time-controls__increment"
            name="increment"
            inputMode="numeric"
            placeholder="00"
            value={increment}
            onChange={handleIncrementChange}
            onBlur={handleIncrementBlur}
          />
          <label htmlFor="increment">Increment</label>
        </div>
      </div>
      <h3>Opponent</h3>
      <div className="choose-opponent">
        {friends.map((friend, i) => (
          <div className="opponent-choice" key={i}>
            <input
              type="radio"
              name="opponent"
              value={friend}
              id={friend}
              checked={opponent === friend}
              onChange={handleOpponentChange(friend)}
            />
            <label htmlFor={friend}>{friend}</label>
          </div>
        ))}
      </div>
      <button
        onClick={handleCreateGame}
        className={canCreate ? "" : "inactive"}
      >
        Create Game
      </button>
    </div>
  );
}
