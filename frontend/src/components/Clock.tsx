import { useMemo } from "react";
import "../styles/Clock.scss";

type Props = {
  player: "top" | "bottom";
  time: number; // In seconds
};

export default function Clock({ player, time }: Props) {
  const timeString = useMemo(() => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }, [time]);

  return (
    <div className={`clock ${player}`}>
      <div className="clock__left">
        <div className="clock__username">Username</div>
        <div className="clock__pieces"></div>
      </div>
      <div className="clock__time">{timeString}</div>
    </div>
  );
}
