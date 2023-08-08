import applyMoves from "./applyMoves";
import canMove from "./canMove";
import generateStartingPosition from "./generateStartingPosition";
import isInCheck from "./isInCheck";
import generateLegalMoves from "./moveFunctions/generateLegalMoves";
import Piece from "./Piece";
import { numFile, numRank } from "./squareConverters";

const pieceSymbols = {
  pawn: "",
  knight: "N",
  bishop: "B",
  rook: "R",
  queen: "Q",
  king: "K"
};

export default function movesToAlgebraic(
  moves: {
    from: string;
    to: string;
    promoteTo?: "knight" | "bishop" | "rook" | "queen";
  }[]
) {
  let board: (Piece | null)[][] = Array.from({ length: 8 }, () =>
    Array.from({ length: 8 }, () => null)
  );

  let pieces = generateStartingPosition();
  for (let piece of pieces) {
    if (!piece.active) continue;
    board[piece.numRank][piece.numFile] = piece;
  }

  const res = [];
  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    const currentMoves = moves.slice(0, i + 1);
    const piece = board[numRank(move.from)][numFile(move.from)];
    if (!piece) throw new Error("Invalid moves");

    if (piece.type === "king") {
      let castleRes = "";
      if (move.from[0] === "e" && move.to[0] === "g") {
        castleRes = "O-O";
      } else if (move.from[0] === "e" && move.to[0] === "c") {
        castleRes = "O-O-O";
      }

      if (castleRes.length > 0) {
        pieces = applyMoves(pieces, [move]);
        const isCheck = isInCheck(
          pieces,
          (i + 1) % 2 === 0 ? "white" : "black"
        );
        const opponentCanMove = canMove(pieces, currentMoves);
        res.push(`${castleRes}${isCheck ? (opponentCanMove ? "+" : "#") : ""}`);
        board = Array.from({ length: 8 }, () =>
          Array.from({ length: 8 }, () => null)
        );
        for (let piece of pieces) {
          if (!piece.active) continue;
          board[piece.numRank][piece.numFile] = piece;
        }
        continue;
      }
    }

    const lastMove = moves[i - 1];
    let enPassantSquare = null;
    if (lastMove) {
      const lastPiece = board[numRank(lastMove.to)][numFile(lastMove.to)];
      if (lastPiece?.type === "pawn") {
        if (lastMove.from[1] === "2" && lastMove.to[1] === "4") {
          enPassantSquare = `${lastMove.to}3`;
        } else if (lastMove.from[1] === "7" && lastMove.to[1] === "5") {
          enPassantSquare = `${lastMove.to}6`;
        }
      }
    }

    let isCapture = false;
    if (
      board[numRank(move.to)][numFile(move.to)] !== null ||
      (piece?.type === "pawn" && move.to === enPassantSquare)
    ) {
      isCapture = true;
    }

    // Find all pieces of the same type that can move to the same square
    const ambiguousPieces = pieces
      .filter((p) => {
        p.active === true &&
          p.color === piece.color &&
          p.type === piece.type &&
          piece.type !== "pawn" &&
          p.square !== piece.square;
      })
      .filter((p) =>
        generateLegalMoves(pieces, p, currentMoves).includes(piece.square)
      );

    let specifiedRank = "";
    let specifiedFile = "";

    for (let ambiguousPiece of ambiguousPieces) {
      if (ambiguousPiece.square[0] !== piece.square[0]) {
        specifiedRank = piece.square[0];
      }

      if (ambiguousPiece.square[1] !== piece.square[1]) {
        specifiedFile = piece.square[1];
      }
    }

    const captureString = piece.type === "pawn" ? `${piece.square[0]}x` : "x";
    pieces = applyMoves(pieces, [move]);

    const isCheck = isInCheck(pieces, (i + 1) % 2 === 0 ? "white" : "black");
    const opponentCanMove = canMove(pieces, currentMoves);

    res.push(
      `${pieceSymbols[piece.type]}${specifiedRank}${specifiedFile}${
        isCapture ? captureString : ""
      }${move.to}${move.promoteTo ? `=${pieceSymbols[piece.type]}` : ""}${
        isCheck ? (opponentCanMove ? "+" : "#") : ""
      }`
    );

    board = Array.from({ length: 8 }, () =>
      Array.from({ length: 8 }, () => null)
    );
    for (let piece of pieces) {
      if (!piece.active) continue;
      board[piece.numRank][piece.numFile] = piece;
    }
  }

  return res;
}
