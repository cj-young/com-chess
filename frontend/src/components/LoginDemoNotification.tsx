import { motion } from "framer-motion";
import "../styles/LoginDemoNotification.scss";

type Props = {
  onApply: () => any;
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

export default function LoginDemoNotification({ onApply }: Props) {
  return (
    <motion.div
      className="login-demo-notification"
      variants={dropIn}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <button className="apply-button" onClick={onApply}>
        Click here
      </button>
      <span>to log in with demo account</span>
    </motion.div>
  );
}
