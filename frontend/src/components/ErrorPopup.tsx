import { useEffect } from "react";
import "../styles/ErrorPopup.scss";
import { motion } from "framer-motion";

type Props = {
  message: string;
  remove?: () => void;
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

export default function ErrorPopup({ message, remove }: Props) {
  if (remove) {
    useEffect(() => {
      const timeout = setTimeout(remove, 3000);

      return () => clearTimeout(timeout);
    });
  }

  return (
    <motion.div
      className={"error-message"}
      variants={dropIn}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {message}
    </motion.div>
  );
}
