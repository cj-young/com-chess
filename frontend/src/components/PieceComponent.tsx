import { useEffect, useMemo, useRef, useState } from "react";
import Piece from "../utils/Piece";
import { letterSquare } from "../utils/squareConverters";
import PawnPromoter from "./PawnPromoter";
import { Color, Move } from "../types";

type Props = {
  piece: Piece;
  boardRef: React.RefObject<HTMLDivElement | null>;
  setHoverSquare: React.Dispatch<React.SetStateAction<string | null>>;
  setPawnPromoter: React.Dispatch<React.SetStateAction<JSX.Element | null>>;
  selectedPiece: Piece | null;
  setSelectedPiece: React.Dispatch<React.SetStateAction<Piece | null>>;
  legalMoves: string[];
  orientation: Color;
  makeMove: (move: Move) => void;
  canDrag: boolean;
};

export default function PieceComponent({
  piece,
  boardRef,
  setHoverSquare,
  setPawnPromoter,
  selectedPiece,
  setSelectedPiece,
  legalMoves,
  orientation,
  makeMove,
  canDrag,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [mousePosition, setMousePosition] = useState<{
    x: number;
    y: number;
  }>();
  const pieceRef = useRef<HTMLDivElement>(null);
  const [pieceTop, pieceLeft] = useMemo(() => {
    if (!pieceRef.current || !boardRef.current || !mousePosition) return [0, 0];
    const width = pieceRef.current.offsetWidth;
    const height = pieceRef.current.offsetHeight;
    const boardRect = boardRef.current.getBoundingClientRect();
    const top = mousePosition.y - height / 2 - boardRect.top;
    const left = mousePosition.x - width / 2 - boardRect.left;

    return [top, left];
  }, [pieceRef.current, mousePosition, isDragging]);

  const selectedPieceRef = useRef<null | Piece>(null);
  selectedPieceRef.current = selectedPiece;
  const legalMovesRef = useRef<string[]>([]);
  legalMovesRef.current = legalMoves;

  const rank = piece.numRank;
  const file = piece.numFile;

  const handleMouseMoveRef = useRef<((e: MouseEvent) => void) | null>(null);
  const handleMouseUpRef = useRef<((e: MouseEvent) => void) | null>(null);

  useEffect(() => {
    return () => {
      if (handleMouseMoveRef.current) {
        document.removeEventListener("mousemove", handleMouseMoveRef.current);
      }
      if (handleMouseUpRef.current) {
        document.removeEventListener("mouseup", handleMouseUpRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (piece !== selectedPiece) setIsDragging(false);
  }, [selectedPiece]);

  function handleMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    if (canDrag) e.stopPropagation();
    e.preventDefault();
    setPawnPromoter(null);
    if (!canDrag) return;
    setIsDragging(true);
    const upWillDeselect = selectedPieceRef.current?.square === piece.square;
    setSelectedPiece(piece);
    setMousePosition({ x: e.clientX, y: e.clientY });

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    function handleMouseMove(e: MouseEvent) {
      e.preventDefault();
      if (!canDrag) {
        setIsDragging(false);
        return;
      }
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (boardRef.current && pieceRef.current && legalMovesRef.current) {
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
          if (newSquare === piece.square) {
            setHoverSquare(null);
          } else {
            if (legalMovesRef.current.includes(newSquare)) {
              setHoverSquare(newSquare);
            }
          }
        }
      }
    }

    function handleMouseUp(e: MouseEvent) {
      e.preventDefault();
      e.stopPropagation();
      setHoverSquare(null);
      if (!canDrag) {
        setIsDragging(false);
        return;
      }
      if (boardRef.current && pieceRef.current && legalMovesRef.current) {
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
          if (newSquare === piece.square) {
            if (upWillDeselect) setSelectedPiece(null);
          } else {
            if (legalMovesRef.current.includes(newSquare)) {
              if (
                piece.type === "pawn" &&
                ((piece.color === "white" && newSquare[1] === "8") ||
                  (piece.color === "black" && newSquare[1] === "1"))
              ) {
                setPawnPromoter(
                  <PawnPromoter
                    from={piece.square}
                    to={newSquare}
                    color={piece.color}
                    close={() => setPawnPromoter(null)}
                    makeMove={makeMove}
                    orientation={orientation}
                  />
                );
              } else {
                makeMove({ to: newSquare, from: piece.square });
              }
            }
            setSelectedPiece(null);
          }
        }
      }
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }
  }

  function handleTouchStart(e: React.TouchEvent<HTMLDivElement>) {
    if (canDrag) e.stopPropagation();
    setPawnPromoter(null);
    if (!canDrag) return;
    setIsDragging(true);
    const touch = e.touches[0];
    const upWillDeselect = selectedPieceRef.current?.square === piece.square;
    setSelectedPiece(piece);
    setMousePosition({ x: touch.clientX, y: touch.clientY });

    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: false });

    function handleTouchMove(e: TouchEvent) {
      e.preventDefault();
      if (!canDrag) {
        setIsDragging(false);
        return;
      }
      const touch = e.touches[0];
      setMousePosition({ x: touch.clientX, y: touch.clientY });

      if (boardRef.current && pieceRef.current && legalMovesRef.current) {
        const squareSize = boardRef.current.offsetWidth / 8;
        const boardRect = boardRef.current.getBoundingClientRect();

        let newFile = Math.floor((touch.clientX - boardRect.left) / squareSize);
        let newRank = Math.floor((touch.clientY - boardRect.top) / squareSize);

        if (orientation === "black") {
          newFile = 7 - newFile;
          newRank = 7 - newRank;
        }

        if (newRank < 8 && newFile < 8 && newRank >= 0 && newFile >= 0) {
          const newSquare = letterSquare(newRank, newFile);
          if (newSquare === piece.square) {
            setHoverSquare(null);
          } else {
            if (legalMovesRef.current.includes(newSquare)) {
              setHoverSquare(newSquare);
            }
          }
        }
      }
    }

    function handleTouchEnd(e: TouchEvent) {
      e.preventDefault();
      setHoverSquare(null);
      if (!canDrag) {
        setIsDragging(false);
        return;
      }
      const touch = e.changedTouches[0];
      if (boardRef.current && pieceRef.current && legalMovesRef.current) {
        const squareSize = boardRef.current.offsetWidth / 8;
        const boardRect = boardRef.current.getBoundingClientRect();

        let newFile = Math.floor((touch.clientX - boardRect.left) / squareSize);
        let newRank = Math.floor((touch.clientY - boardRect.top) / squareSize);

        if (orientation === "black") {
          newFile = 7 - newFile;
          newRank = 7 - newRank;
        }

        if (newRank < 8 && newFile < 8 && newRank >= 0 && newFile >= 0) {
          const newSquare = letterSquare(newRank, newFile);
          if (newSquare === piece.square) {
            if (upWillDeselect) setSelectedPiece(null);
          } else {
            if (legalMovesRef.current.includes(newSquare)) {
              if (
                piece.type === "pawn" &&
                ((piece.color === "white" && newSquare[1] === "8") ||
                  (piece.color === "black" && newSquare[1] === "1"))
              ) {
                setPawnPromoter(
                  <PawnPromoter
                    from={piece.square}
                    to={newSquare}
                    color={piece.color}
                    close={() => setPawnPromoter(null)}
                    makeMove={makeMove}
                    orientation={orientation}
                  />
                );
              } else {
                makeMove({ to: newSquare, from: piece.square });
              }
            }
            setSelectedPiece(null);
          }
        }
      }
      setIsDragging(false);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    }
  }

  return (
    <div
      className="piece"
      style={{
        top: isDragging
          ? pieceTop
          : `calc((100% / 8) * ${orientation === "white" ? rank : 7 - rank})`,
        left: isDragging
          ? pieceLeft
          : `calc((100% / 8) * ${orientation === "white" ? file : 7 - file})`,
        zIndex: isDragging ? "1000" : "2",
        cursor: isDragging ? "grabbing" : canDrag ? "pointer" : "default",
        touchAction: "none",
        userSelect: "none",
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      ref={pieceRef}
    >
      <img src={piece.image} alt={`${piece.color} ${piece.type}`} />
    </div>
  );
}
