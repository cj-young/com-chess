import { useState } from "react";
import "../styles/ChooseBot.scss";
import { useBotGameContext } from "../contexts/BotGameContext";

type BotLevel = null | "easy" | "medium" | "hard" | "impossible";

export default function ChooseBot() {
  const [botLevel, setBotLevel] = useState<BotLevel>(null);

  const { startGame } = useBotGameContext();

  function handleSubmit() {
    if (botLevel) startGame(botLevel);
  }

  return (
    <div className="choose-bot">
      <h1>Choose Bot</h1>
      <div className="bot-choices">
        {["easy", "medium", "hard", "impossible"].map((level, i) => (
          <div className="bot-choice" key={i}>
            <input
              type="radio"
              name="opponent"
              value={level}
              id={level}
              checked={botLevel === level}
              onChange={() => setBotLevel(level as BotLevel)}
            />
            <label htmlFor={level}>
              {level[0].toUpperCase() + level.slice(1)}
            </label>
          </div>
        ))}
      </div>
      <button className={botLevel ? "" : "inactive"} onClick={handleSubmit}>
        Create Game
      </button>
    </div>
  );
}
