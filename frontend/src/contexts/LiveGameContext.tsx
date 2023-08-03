import { createContext, useContext, useState, useMemo } from "react";
import applyMoves from "../utils/applyMoves";
import generateStartingPosition from "../utils/generateStartingPosition";
import Piece from "../utils/Piece";

type Props = {
  children: React.ReactNode;
};

type TLiveGameContext = {
  moves: Move[];
  setMoves: React.Dispatch<React.SetStateAction<Move[]>>;
  pieces: Piece[];
  makeMove: (move: Move) => void;
};

type Promotable = "knight" | "bishop" | "rook" | "queen";

type Move = {
  from: string;
  to: string;
  promoteTo?: Promotable;
};
const LiveGameContext = createContext<TLiveGameContext>({} as TLiveGameContext);

export function LiveGameContextProvider({ children }: Props) {
  const [moves, setMoves] = useState<Move[]>([]);
  const pieces = useMemo(() => {
    return applyMoves(generateStartingPosition(), moves);
  }, [moves]);

  function makeMove(move: Move) {
    setMoves((prevMoves) => [...prevMoves, move]);
  }
  return (
    <LiveGameContext.Provider value={{ moves, setMoves, pieces, makeMove }}>
      {children}
    </LiveGameContext.Provider>
  );
}

export function useLiveGameContext() {
  return useContext(LiveGameContext);
}
