import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { socket } from "../../../config/socket";
import "./styles.scss";

type Props = {
  remove: () => Promise<void>;
  username: string;
  minutes: number;
  increment: number;
};

const dropIn = {
  hidden: {
    y: "-100%",
    opacity: 1
  },
  visible: {
    y: "0",
    opacity: 1,
    transition: {
      duration: 0.025,
      type: "spring",
      damping: 12,
      stiffness: 100
    }
  },
  exit: {
    opacity: 0
  }
};

export default function GameRequestNotification({
  remove,
  username,
  minutes,
  increment
}: Props) {
  const navigate = useNavigate();

  function handleAccept() {
    socket.emit("gameAccept", username);
    remove();
    navigate("/play/live");
  }

  function handleDecline() {
    socket.emit("gameDecline", username);
    remove();
  }

  return (
    <motion.div
      className="game-request-notification"
      variants={dropIn}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <span>
        <b>{username}</b> invited you to play a{" "}
        <b>
          {minutes} | {increment}
        </b>{" "}
        game
      </span>
      <div className="buttons">
        <button className="accept" onClick={handleAccept}>
          Accept
        </button>
        <button className="decline" onClick={handleDecline}>
          Decline
        </button>
      </div>
    </motion.div>
  );
}
