import { useRef, useState, useMemo } from "react";
import "../styles/Board.scss";
import flipIcon from "../assets/repeat-solid.svg";
import leftIcon from "../assets/angle-left-solid.svg";
import rightIcon from "../assets/angle-right-solid.svg";
import PieceComponent from "./PieceComponent";
import SquareHighlight from "./SquareHighlight";
import { letterSquare } from "../utils/squareConverters";
import PawnPromoter from "./PawnPromoter";
import Piece from "../utils/Piece";
import generateLegalMoves from "../utils/moveFunctions/generateLegalMoves";

type Move = {
  to: string;
  from: string;
  promoteTo?: "knight" | "bishop" | "rook" | "queen";
};

type Props = {
  pieces: Piece[];
  moves: Move[];
  orientation: "white" | "black";
  setOrientation: React.Dispatch<React.SetStateAction<"white" | "black">>;
  prevMove: () => void;
  nextMove: () => void;
  moveIndex: number;
  showPieces: boolean;
  showControls: boolean;
  makeMove: (move: Move) => void;
  modal: React.ReactNode;
  canDragCB: (piece: Piece) => boolean;
};

export default function Board({
  pieces,
  moves,
  orientation,
  setOrientation,
  prevMove,
  nextMove,
  moveIndex,
  showPieces,
  showControls,
  makeMove,
  modal,
  canDragCB,
}: Props) {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [hoverSquare, setHoverSquare] = useState<string | null>(null);
  const [pawnPromoter, setPawnPromoter] = useState<JSX.Element | null>(null);
  const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);

  const legalMoves = useMemo(() => {
    if (selectedPiece) {
      return generateLegalMoves(pieces, selectedPiece, moves);
    } else {
      return [];
    }
  }, [selectedPiece]);

  const isUpToDate = useMemo(() => {
    return moveIndex === moves.length - 1;
  }, [moves, moveIndex]);

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    setPawnPromoter(null);
    if (!selectedPiece) return;
    if (boardRef.current) {
      const squareSize = boardRef.current.offsetWidth / 8;
      const boardRect = boardRef.current.getBoundingClientRect();
      let newFile = Math.floor((e.clientX - boardRect.left) / squareSize);
      let newRank = Math.floor((e.clientY - boardRect.top) / squareSize);
      if (orientation === "black") {
        newFile = 7 - newFile;
        newRank = 7 - newRank;
      }
      if (newRank < 8 && newFile < 8 && newRank >= 0 && newFile >= 0) {
        const newSquare = letterSquare(newRank, newFile);
        if (newSquare === selectedPiece.square) return;
        if (legalMoves.includes(newSquare)) {
          if (
            selectedPiece.type === "pawn" &&
            ((selectedPiece.color === "white" && newSquare[1] === "8") ||
              (selectedPiece.color === "black" && newSquare[1] === "1"))
          ) {
            setPawnPromoter(
              <PawnPromoter
                from={selectedPiece.square}
                to={newSquare}
                color={selectedPiece.color}
                close={() => setPawnPromoter(null)}
              />
            );
          } else {
            makeMove({ to: newSquare, from: selectedPiece.square });
          }
        }
        setSelectedPiece(null);
      }
    }
  }

  function handleFlipBoard() {
    setOrientation((prevOrientation) =>
      prevOrientation === "white" ? "black" : "white"
    );
  }

  return (
    <div className="board-container">
      <div className="board" ref={boardRef} onClick={handleClick}>
        <div className="squares">
          {Array(8)
            .fill(null)
            .map((_row, i) => {
              return (
                <div className="row" key={i}>
                  {Array(8)
                    .fill(null)
                    .map((_square, j) => (
                      <div className="square" key={j}></div>
                    ))}
                </div>
              );
            })}
        </div>
        {showPieces && (
          <>
            <div className="pieces">
              {pieces.map(
                (piece, i) =>
                  piece.active && (
                    <PieceComponent
                      piece={piece}
                      key={i}
                      boardRef={boardRef}
                      setHoverSquare={setHoverSquare}
                      setPawnPromoter={setPawnPromoter}
                      selectedPiece={selectedPiece}
                      setSelectedPiece={setSelectedPiece}
                      legalMoves={legalMoves}
                      orientation={orientation}
                      makeMove={makeMove}
                      canDrag={canDragCB(piece)}
                    />
                  )
              )}
            </div>
            {selectedPiece && (
              <SquareHighlight
                square={selectedPiece.square}
                type="selectedPiece"
              />
            )}
            {moveIndex >= 0 && (
              <>
                <SquareHighlight
                  square={moves[moveIndex].from}
                  type="previousMove"
                />
                <SquareHighlight
                  square={moves[moveIndex].to}
                  type="previousMove"
                />
              </>
            )}
            {legalMoves.map((legalMove, i) => (
              <SquareHighlight square={legalMove} type="legalMove" key={i} />
            ))}
            {hoverSquare && (
              <SquareHighlight square={hoverSquare} type="hoverSquare" />
            )}
            {modal}
          </>
        )}
        {pawnPromoter}
      </div>
      {showControls && (
        <div className="controls">
          <button className="flip-board" onClick={handleFlipBoard}>
            <img src={flipIcon} alt="Flip board" />
          </button>
          <div className="right-buttons">
            <button
              className={`prev-move ${moveIndex >= 0 ? "" : "disabled"}`}
              onClick={prevMove}
              aria-disabled={moveIndex < 0}
            >
              <img src={leftIcon} alt="View previous move" />
            </button>
            <button
              className={`next-move ${isUpToDate ? "disabled" : ""}`}
              onClick={nextMove}
              aria-disabled={!isUpToDate}
            >
              <img src={rightIcon} alt="View next move" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
