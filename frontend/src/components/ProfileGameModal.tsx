import { useState, useMemo } from "react";
import "../styles/ProfileGameModal.scss";

type Props = {
  close: () => void;
};

export default function ProfileGameModal({ close }: Props) {
  const [minutes, setMinutes] = useState("10");
  const [increment, setIncrement] = useState("0");

  const canCreate = useMemo<boolean>(() => {
    return minutes.length > 0 && increment.length > 0 && +minutes > 0;
  }, [minutes, increment]);

  function handleMinutesChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    if (/^\d*$/.test(e.target.value)) {
      setMinutes(e.target.value);
    }
  }

  function handleMinutesBlur() {
    if (+minutes > 60) setMinutes("60");
    else if (+minutes <= 0) setMinutes("1");
  }

  function handleIncrementChange(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    if (/^\d*$/.test(e.target.value)) {
      setIncrement(e.target.value);
    }
  }

  function handleIncrementBlur() {
    if (+increment > 30) setIncrement("30");
  }

  return (
    <div className="profile__game-modal" onClick={close}>
      <div
        className="profile__game-modal__main"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="profile__game-modal__input">
          <input
            type="text"
            className="profile__game-modal__minutes"
            name="minutes"
            inputMode="numeric"
            placeholder="00"
            value={minutes}
            onChange={handleMinutesChange}
            onBlur={handleMinutesBlur}
          />
          <label htmlFor="minutes">Minutes</label>
        </div>
        <div className="profile__game-modal__input">
          <input
            type="text"
            className="profile__game-modal__increment"
            name="increment"
            inputMode="numeric"
            placeholder="00"
            value={increment}
            onChange={handleIncrementChange}
            onBlur={handleIncrementBlur}
          />
          <label htmlFor="increment">Increment</label>
        </div>
        <button>Create</button>
      </div>
    </div>
  );
}
