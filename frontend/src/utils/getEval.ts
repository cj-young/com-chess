type Move = {
  from: string;
  to: string;
  promoteTo?: "knight" | "bishop" | "rook" | "queen";
};

type Line = {
  eval: number;
  moves: Move[];
  leadingMoves: Move[];
  type: "mate" | "cp";
};

export default function getEval(line: Line): {
  adv: string;
  isWinning: "black" | "white";
} {
  let res: string;
  let isWinning: "black" | "white";
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
