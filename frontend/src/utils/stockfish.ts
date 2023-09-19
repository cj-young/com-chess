import uciToMove from "./uciToMove";
import moveToUCI from "./moveToUCI";
import { Move } from "../types";

export function findBestMove(
  moves: Move[],
  sf: Worker,
  level: number
): Promise<Move> {
  const uciMoves = moves.map((move) => moveToUCI(move));
  const moveTime = 1000 + Math.floor(Math.random() * 1500);

  sf.postMessage(`position startpos move ${uciMoves.join(" ")}`);
  sf.postMessage(`setoption name Skill Level value ${level}`);
  sf.postMessage(`go movetime ${moveTime}`);

  return new Promise((resolve, reject) => {
    const onMessage = (e: MessageEvent) => {
      if (e.data.startsWith("bestmove")) {
        const bestMove = e.data.split(" ")[1];
        resolve(uciToMove(bestMove));
        sf.removeEventListener("message", onMessage);
      }
    };
    const onError = (e: ErrorEvent) => {
      sf.removeEventListener("error", onError);
      reject(e.message);
    };

    const onMessageError = (e: MessageEvent) => {
      sf.removeEventListener("messageerror", onMessageError);
      reject(e.data);
    };
    sf.addEventListener("message", onMessage);
    sf.addEventListener("error", onError);
    sf.addEventListener("messageerror", onMessageError);
  });
}

export const stockfishLevels = new Map([
  ["easy", 0],
  ["medium", 5],
  ["hard", 10],
  ["impossible", 20],
]);
