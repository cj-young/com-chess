import { useMemo } from "react";
import { numSquare } from "../utils/squareConverters";

type Props = {
  to: string;
  from: string;
  boardRef: React.MutableRefObject<HTMLDivElement | null>;
  orientation: "white" | "black";
};

export default function BoardArrow({ to, from, boardRef, orientation }: Props) {
  function getCoords(square: string): [number, number] {
    if (boardRef.current) {
      const squareSize = 100 / 8;
      const convertedSquare = numSquare(square);

      let x = squareSize * convertedSquare[1] + squareSize / 2;
      if (orientation === "black") x = 100 - x;
      let y = squareSize * convertedSquare[0] + squareSize / 2;
      if (orientation === "black") y = 100 - y;

      return [x, y];
    } else {
      return [0, 0];
    }
  }

  const [fromX, fromY] = useMemo(() => getCoords(from), [from, orientation]);
  const [toX, toY] = useMemo(() => getCoords(to), [to, orientation]);
  const position = useMemo(() => {
    const length = Math.sqrt((toX - fromX) ** 2 + (toY - fromY) ** 2);

    let angle;
    if (toX - fromX === 0) {
      angle = fromY > toY ? 90 : 270;
    } else {
      angle = Math.atan((fromY - toY) / (toX - fromX)) * (180 / Math.PI);
    }

    if (toX < fromX) angle += 180;
    const width = 3.5;
    const headLength = 5;
    const headWidth = 7;

    const x1 = fromX - width / 2;
    const y1 = fromY;
    const x2 = x1;
    const y2 = y1 - length + headLength;
    const x3 = x1 - (headWidth - width) / 2;
    const y3 = y2;
    const x4 = fromX;
    const y4 = fromY - length;
    const x5 = x3 + headWidth;
    const y5 = y3;
    const x6 = x1 + width;
    const y6 = y5;
    const x7 = x6;
    const y7 = y1;

    const points = `${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4} ${x5},${y5} ${x6},${y6} ${x7},${y7}`;

    return { points, angle };
  }, [toX, toY, fromX, fromY, boardRef, orientation]);

  return (
    <svg
      className="arrow"
      viewBox="0 0 100 100"
      style={{
        position: "absolute",
        zIndex: 1000,
        inset: 0,
        pointerEvents: "none",
      }}
    >
      <polygon
        points={position.points}
        transform={`rotate(${
          orientation === "white" ? -position.angle + 90 : -position.angle + 90
        } ${fromX} ${fromY})`}
        style={{
          opacity: 0.75,
          pointerEvents: "none",
          fill: "var(--clr-accent)",
        }}
      />
    </svg>
  );
}
