const { default: isURL } = require("validator/lib/isURL");
const applyMoves = require("./applyMoves");
const generateStartingPosition = require("./generateStartingPosition");
const squareToIndex = require("./moveVerification/squareToIndex");
const { numSquare } = require("./squareConverters");

const pieceToLetter = new Map([
  [
    "white",
    new Map([
      ["pawn", "P"],
      ["knight", "N"],
      ["bishop", "B"],
      ["rook", "R"],
      ["queen", "Q"],
      ["king", "K"]
    ])
  ],
  [
    "black",
    new Map([
      ["pawn", "p"],
      ["knight", "n"],
      ["bishop", "b"],
      ["rook", "r"],
      ["queen", "q"],
      ["king", "k"]
    ])
  ]
]);

module.exports = (moves) => {
  const pieces = applyMoves(generateStartingPosition(), moves);

  const whiteCanCastle = {
    kingSide: true,
    queenSide: true
  };
  const blackCanCastle = {
    kingSide: true,
    queenSide: true
  };

  const aRookWhite = "a1";
  const aRookBlack = "a8";
  const hRookWhite = "h1";
  const hRookBlack = "h8";
  const kingPosWhite = "e1";
  const kingPosBlack = "e8";

  for (let move of moves) {
    if (move.from === kingPosWhite || move.to === kingPosWhite) {
      whiteCanCastle.kingSide = false;
      whiteCanCastle.queenSide = false;
    } else if (move.from === aRookWhite || move.to === aRookWhite) {
      whiteCanCastle.queenSide = false;
    } else if (move.from === hRookWhite || move.to === hRookWhite) {
      whiteCanCastle.kingSide = false;
    } else if (move.from === kingPosBlack || move.to === kingPosBlack) {
      blackCanCastle.kingSide = false;
      blackCanCastle.queenSide = false;
    } else if (move.from === aRookBlack || move.to === aRookBlack) {
      blackCanCastle.queenSide = false;
    } else if (move.from === hRookBlack || move.to === hRookBlack) {
      blackCanCastle.kingSide = false;
    }
  }

  // Get en passant square if exists
  let enPassantSquare = null;
  const lastMove = moves[moves.length - 1];
  if (lastMove?.from[1] === "2" && lastMove?.to[1] === "4") {
    for (let piece of pieces) {
      if (piece.type === "pawn" && piece.square === lastMove.to) {
        enPassantSquare = lastMove.from[0] + "3";
        break;
      }
    }
  } else if (lastMove?.from[1] === "7" && lastMove?.to[1] === "5") {
    for (let piece of pieces) {
      if (piece.type === "pawn" && piece.square === lastMove.to) {
        enPassantSquare = lastMove.from[0] + "6";
        break;
      }
    }
  }

  // Create pieces section of FEN
  const board = Array.from({ length: 8 }, () =>
    Array.from({ length: 8 }, () => null)
  );

  for (let piece of pieces) {
    if (!piece.active) continue;
    const [rank, file] = numSquare(piece.square);
    board[rank][file] = piece;
  }

  const rows = Array.from({ length: 8 }, () => "");
  for (let row = 0; row < board.length; row++) {
    let numBlank = 0;
    for (let col = 0; col < board[row].length; col++) {
      if (!board[row][col]) {
        numBlank++;
      } else {
        if (numBlank > 0) rows[row] += numBlank;
        const piece = board[row][col];
        rows[row] += pieceToLetter.get(piece.color).get(piece.type);
        numBlank = 0;
      }
    }
    if (numBlank > 0) rows[row] += numBlank;
  }

  const piecesFEN = rows.join("/");
  const turnFEN = moves.length % 2 === 0 ? "w" : "b";
  let castleFEN = "";
  if (whiteCanCastle.kingSide) castleFEN += "K";
  if (whiteCanCastle.queenSide) castleFEN += "Q";
  if (blackCanCastle.kingSide) castleFEN += "k";
  if (blackCanCastle.queenSide) castleFEN += "q";
  if (castleFEN.length === 0) castleFEN = "-";

  const enPassantFEN = enPassantSquare !== null ? enPassantSquare : "-";

  // Find last pawn move *** Only looks at pawns that are still active. If the last pawn is no longer active, then it must have been captured, in which case the last capture will be used instead anyway
  const lastPawnMove = findLastActivePawnMove(pieces, moves);

  // Find last capture
  const lastCapture = findLastCapture(moves);

  const halfMovesFEN = Math.max(
    moves.length - Math.max(lastPawnMove, lastCapture) - 1,
    0
  );
  const fullMovesFEN = moves.length;

  return `${piecesFEN} ${turnFEN} ${castleFEN} ${enPassantFEN} ${halfMovesFEN} ${fullMovesFEN}`;
};

function findLastActivePawnMove(pieces, moves) {
  const pawnSquares = new Set();
  for (let piece of pieces) {
    if (piece.active && piece.type === "pawn") pawnSquares.add(piece.square);
  }

  let lastPawnMove = 0;
  for (let i = moves.length - 1; i >= 0; i--) {
    if (pawnSquares.has(moves[i].to)) {
      lastPawnMove = i;
      break;
    }
  }

  return lastPawnMove;
}

function findLastCapture(moves) {
  const board = Array.from({ length: 64 }, () => null);

  // Convert square strings to bitboard indices for easy processing
  const pieces = generateStartingPosition().map((piece) => ({
    ...piece,
    square: Number(squareToIndex(piece.square)),
    numFile: undefined,
    numRank: undefined
  }));
  moves = moves.map((move) => ({
    ...move,
    from: Number(squareToIndex(move.from)),
    to: Number(squareToIndex(move.to))
  }));

  for (let piece of pieces) {
    board[piece.square] = piece;
  }

  let enPassantSquare = null;
  let lastCapture = 0;
  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    const piece = board[move.from];
    if (board[move.to] !== null) {
      lastCapture = i;
    } else if (move.to === enPassantSquare && piece?.type === "pawn") {
      lastCapture = i;
      if (move.to > move.from) {
        board[move.to - 8] = null;
      } else {
        board[move.to + 8] = null;
      }
    } else if (piece?.type === "king") {
      if (
        (move.from === 4 && move.to === 2) ||
        (move.from === 60 && move.to === 58)
      ) {
        const rook = board[move.to - 2];
        board[move.to - 2] = null;
        board[move.from - 1] = rook;
      } else if (
        (move.from === 4 && move.to === 6) ||
        (move.from === 60 && move.to === 62)
      ) {
        const rook = board[move.to + 1];
        board[move.to + 1] = null;
        board[move.from + 1] = rook;
      }
    }

    if (piece?.type === "pawn" && Math.abs(move.to - move.from === 16)) {
      if (move.to > move.from) {
        enPassantSquare = move.from + 8;
      } else {
        enPassantSquare = move.from - 8;
      }
    } else {
      enPassantSquare = null;
    }

    board[move.from] = null;
    board[move.to] = piece;
  }

  return lastCapture;
}
