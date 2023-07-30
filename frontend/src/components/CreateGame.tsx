import "../styles/CreateGame.scss";

export default function CreateGame() {
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
          />
          <label htmlFor="Username1">Username1</label>
        </div>
        <div className="opponent-choice">
          <input
            type="radio"
            name="opponent"
            value="Username2"
            id="Username2"
          />
          <label htmlFor="Username2">Username2</label>
        </div>
        <div className="opponent-choice">
          <input
            type="radio"
            name="opponent"
            value="Username3"
            id="Username3"
          />
          <label htmlFor="Username3">Username3</label>
        </div>
        <div className="opponent-choice">
          <input
            type="radio"
            name="opponent"
            value="Username4"
            id="Username4"
          />
          <label htmlFor="Username4">Username4</label>
        </div>
      </div>
      <button>Create Game</button>
    </div>
  );
}
