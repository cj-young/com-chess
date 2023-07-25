import { useState, useEffect, useRef } from "react";
import Queue from "../utils/Queue";
import { AnimatePresence } from "framer-motion";
import FriendRequestNotification from "./FriendRequestNotification";
import { socket } from "../config/socket";

export default function Notifications() {
  const notificationQueue = useRef(new Queue<React.ReactNode>()).current;
  const [visibleNotification, setVisibleNotification] =
    useState<React.ReactNode | null>(null);

  const updateVisibleNotification = () => {
    setVisibleNotification(notificationQueue.first?.data ?? null);
  };

  const removeNotification = () => {
    notificationQueue.dequeue();
    updateVisibleNotification();
  };

  useEffect(() => {
    socket.on("friendRequestSuccess", (message) => {
      console.error(message);
    });
    socket.on("friendRequestFailure", (message) => {
      console.error(message);
    });
    socket.on("friendRequest", (username) => {
      notificationQueue.enqueue(
        <FriendRequestNotification
          username={username}
          remove={removeNotification}
          key={notificationQueue.first ? notificationQueue.first.id : -1}
        />
      );
      updateVisibleNotification();
    });
    return () => {
      socket.off("friendRequestSuccess");
      socket.off("friendRequestFailure");
      socket.off("friendRequest");
    };
  }, []);

  return (
    <AnimatePresence initial={false} mode="wait">
      {visibleNotification ?? <></>}
    </AnimatePresence>
  );
}
