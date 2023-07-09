import { motion } from "framer-motion";
import "../styles/FriendRequestNotification.scss";

type Props = {
  accept: () => void;
  decline: () => void;
  username: string;
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

export default function FriendRequestNotification({
  accept,
  decline,
  username
}: Props) {
  return (
    <motion.div
      className="friend-request-notification"
      variants={dropIn}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <span>
        <b>{username}</b> sent you a friend request
      </span>
      <div className="buttons">
        <button className="accept" onClick={accept}>
          Accept
        </button>
        <button className="decline" onClick={decline}>
          Decline
        </button>
      </div>
    </motion.div>
  );
}
