import { Color, Line } from "../types";

export default function getEval(line: Line): {
  adv: string;
  isWinning: Color;
} {
  let res: string;
  let isWinning: Color;
  if (line.type === "cp") {
    res = (line.eval / 100).toFixed(2);
    if (line.eval > 0) {
      res = "+" + res;
      isWinning = "white";
    } else {
      res = res.toString();
      isWinning = "black";
    }
  } else {
    res = "M" + Math.abs(line.eval);
    isWinning = line.eval > 0 ? "white" : "black";
  }

  return { adv: res, isWinning };
}
