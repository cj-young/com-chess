import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Line, Move } from "../types";
import Piece from "../utils/Piece";
import canMove from "../utils/canMove";
import getEval from "../utils/getEval";
import isInCheck from "../utils/isInCheck";
import moveToUCI from "../utils/moveToUCI";
import uciToMove from "../utils/uciToMove";

type Options = {
  numTopMoves: number;
};

export default function useStockfish(
  moves: Move[],
  moveIndex: number,
  pieces: Piece[],
  { numTopMoves }: Options
) {
  const [isStockfishReady, setIsStockfishReady] = useState(false);
  const [didMate, setDidMate] = useState<string | null>(null);
  // Buffer required to ensure all top moves are received before display
  const [bufferMoves, setBufferMoves] = useState<Line[]>([]);
  const [topMoves, setTopMoves] = useState<Line[]>([]);
  const isNewMoves = useRef(false);
  const [posEval, setPosEval] = useState<{ adv: string; isWinning: string }>({
    adv: "+0.00",
    isWinning: "white"
  });

  const stockfishRef = useRef<Worker>();

  const bufferMovesRef = useRef<Line[]>();
  bufferMovesRef.current = bufferMoves;

  function infoToLine(info: string, leadingMoves: Move[]): Line {
    const parts = info.split(" ");
    const firstMoveIndex = parts.indexOf("pv") + 1;
    const isWhiteTurn = leadingMoves.length % 2 === 0;
    return {
      eval: +parts[9] * (isWhiteTurn ? 1 : -1),
      moves: parts
        .slice(firstMoveIndex, Math.min(firstMoveIndex + 10, parts.length - 2))
        .map(uciToMove),
      leadingMoves,
      type: parts[8] === "mate" ? "mate" : "cp"
    };
  }

  useEffect(() => {
    const stockfish = new Worker("/stockfishtest/stockfish.js");

    const messageCB = (e: MessageEvent) => {
      const response = e.data;
      if (response === "readyok") {
        setIsStockfishReady(true);
      }
    };

    stockfish.addEventListener("message", messageCB);

    stockfish.postMessage("uci");
    stockfish.postMessage("isready");

    stockfishRef.current = stockfish;

    return () => {
      stockfish.removeEventListener("message", messageCB);
      stockfish.postMessage("quit");
    };
  }, []);

  useEffect(() => {
    if (!stockfishRef.current || !isStockfishReady) return;

    if (!canMove(pieces, moves)) {
      if (isInCheck(pieces, moves.length % 2 === 0 ? "white" : "black")) {
        setDidMate(moves.length % 2 === 0 ? "black" : "white");
        setBufferMoves([]);
        setTopMoves([]);
        return;
      }
    }

    setTopMoves([]);
    setBufferMoves([]);
    setDidMate(null);

    const currentId = Date.now().toString();
    const stockfish = stockfishRef.current;
    stockfish.postMessage(
      `position startpos move ${moves
        .slice(0, moveIndex + 1)
        .map(moveToUCI)
        .join(" ")} id ${currentId}`
    );
    stockfish.postMessage(`setoption name MultiPV value ${numTopMoves}`);
    stockfish.postMessage("go depth 18");
    isNewMoves.current = true;

    const messageCB = (e: MessageEvent) => {
      const response = e.data;
      if (response.startsWith("info")) {
        const depth = +response.split(" ")[2];
        if (isNewMoves.current) {
          if (depth !== 1) {
            return;
          } else isNewMoves.current = false;
        }
        if (depth < 4) return;
        const line = infoToLine(response, moves.slice(0, moveIndex + 1));
        const lineRank = +response.split(" ")[6] - 1;

        if (lineRank === 1 && bufferMovesRef.current) {
          setTopMoves([...bufferMovesRef.current]);
        }

        setBufferMoves((prevBufferMoves) => [
          ...prevBufferMoves.slice(0, lineRank),
          line,
          ...prevBufferMoves.slice(lineRank + 1)
        ]);
      }
    };

    stockfish.addEventListener("message", messageCB);

    return () => {
      stockfish.postMessage("stop");
      stockfish.removeEventListener("message", messageCB);
    };
  }, [moves, stockfishRef.current, isStockfishReady, moveIndex]);

  useEffect(() => {
    if (didMate) {
      setPosEval({ adv: "#", isWinning: didMate });
    } else if (topMoves.length > 0) {
      setPosEval(getEval(topMoves[0]));
    }
  }, [topMoves, didMate]);

  useLayoutEffect(() => {
    setTopMoves([]);
  }, [moves]);

  return { topMoves, posEval };
}
