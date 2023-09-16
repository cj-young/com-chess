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
  const turn = line.leadingMoves.length % 2 === 0 ? "white" : "black";
  const notTurn = turn === "white" ? "black" : "white";
  if (line.type === "cp") {
    res = (line.eval / 100).toFixed(2);
    if (line.eval > 0) {
      res = "+" + res;
      isWinning = turn;
    } else {
      res = res.toString();
      isWinning = notTurn;
    }
  } else {
    res = "M" + Math.abs(line.eval);
    isWinning = line.eval > 0 ? turn : notTurn;
  }

  return { adv: res, isWinning };
}
