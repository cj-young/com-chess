import { useMemo } from "react";
import "../styles/Clock.scss";
import { useLiveGameContext } from "../contexts/LiveGameContext";

type Props = {
  player: "top" | "bottom";
};

export default function Clock({ player }: Props) {
  const { orientation, gameInfo, blackTime, whiteTime } = useLiveGameContext();

  const clockColor = useMemo(() => {
    if (player === "bottom") return orientation;
    return orientation === "white" ? "black" : "white";
  }, [player, orientation]);

  const timeString = useMemo(() => {
    const time = clockColor === "white" ? whiteTime : blackTime;
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }, [blackTime, whiteTime, clockColor]);

  return (
    <div className={`clock ${player}`}>
      <div className="clock__left">
        <div className="clock__username">
          {clockColor === "white"
            ? gameInfo.blackUsername
            : gameInfo.whiteUsername}
        </div>
        <div className="clock__pieces"></div>
      </div>
      <div className="clock__time">{timeString}</div>
    </div>
  );
}
