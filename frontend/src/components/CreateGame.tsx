import { useState, ChangeEvent, FocusEvent, useMemo } from "react";
import "../styles/CreateGame.scss";

export default function CreateGame() {
  const [minutes, setMinutes] = useState("10");
  const [increment, setIncrement] = useState("0");
  const [opponent, setOpponent] = useState("");

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
        <div className="opponent-choice">
          <input
            type="radio"
            name="opponent"
            value="Username1"
            id="Username1"
            checked={opponent === "Username1"}
            onChange={handleOpponentChange("Username1")}
          />
          <label htmlFor="Username1">Username1</label>
        </div>
        <div className="opponent-choice">
          <input
            type="radio"
            name="opponent"
            value="Username2"
            id="Username2"
            checked={opponent === "Username2"}
            onChange={handleOpponentChange("Username2")}
          />
          <label htmlFor="Username2">Username2</label>
        </div>
        <div className="opponent-choice">
          <input
            type="radio"
            name="opponent"
            value="Username3"
            id="Username3"
            checked={opponent === "Username3"}
            onChange={handleOpponentChange("Username3")}
          />
          <label htmlFor="Username3">Username3</label>
        </div>
        <div className="opponent-choice">
          <input
            type="radio"
            name="opponent"
            value="Username4"
            id="Username4"
            checked={opponent === "Username4"}
            onChange={handleOpponentChange("Username4")}
          />
          <label htmlFor="Username4">Username4</label>
        </div>
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
