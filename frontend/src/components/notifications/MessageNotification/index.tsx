import { motion } from "framer-motion";
import { ReactNode, useEffect } from "react";
import "./styles.scss";

type Props = {
  remove: () => void;
  children: ReactNode;
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

export default function MessageNotification({ remove, children }: Props) {
  useEffect(() => {
    const timeout = setTimeout(remove, 3000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <motion.div
      className="message-notification"
      variants={dropIn}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}
