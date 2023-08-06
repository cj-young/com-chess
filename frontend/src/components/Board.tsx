import { useRef } from "react";
import "../styles/Board.scss";
import flipIcon from "../assets/repeat-solid.svg";
import leftIcon from "../assets/angle-left-solid.svg";
import rightIcon from "../assets/angle-right-solid.svg";
import PieceComponent from "./PieceComponent";
import { useLiveGameContext } from "../contexts/LiveGameContext";
import SquareHighlight from "./SquareHighlight";

export default function Board() {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const { pieces, selectedPiece, setSelectedPiece, orientation, moves } =
    useLiveGameContext();

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    console.log(e.target);
    if (e.target === boardRef.current) {
      setSelectedPiece(null);
    }
  }
  return (
    <div className="board-container">
      <div className="board" ref={boardRef} onClick={handleClick}>
        <div className="squares">
          {Array(8)
            .fill(null)
            .map((row, i) => {
              return (
                <div className="row" key={i}>
                  {Array(8)
                    .fill(null)
                    .map((square, j) => (
                      <div className="square" key={j}></div>
                    ))}
                </div>
              );
            })}
        </div>
        <div className="pieces">
          {pieces.map(
            (piece, i) =>
              piece.active && (
                <PieceComponent piece={piece} key={i} boardRef={boardRef} />
              )
          )}
        </div>
        {selectedPiece && (
          <SquareHighlight square={selectedPiece.square} type="selectedPiece" />
        )}
        {moves.length > 0 && (
          <>
            <SquareHighlight
              square={moves[moves.length - 1].from}
              type="previousMove"
            />
            <SquareHighlight
              square={moves[moves.length - 1].to}
              type="previousMove"
            />
          </>
        )}
      </div>
      <div className="controls">
        <button className="flip-board">
          <img src={flipIcon} alt="Flip board" />
        </button>
        <div className="right-buttons">
          <button className="prev-move">
            <img src={leftIcon} alt="View previous move" />
          </button>
          <button className="next-move">
            <img src={rightIcon} alt="View next move" />
          </button>
        </div>
      </div>
    </div>
  );
}
