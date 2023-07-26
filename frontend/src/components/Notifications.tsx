import { useState, useEffect, useRef } from "react";
import Queue from "../utils/Queue";
import { AnimatePresence } from "framer-motion";
import FriendRequestNotification from "./FriendRequestNotification";
import { socket } from "../config/socket";
import MessageNotification from "./MessageNotification";
import { useUserContext } from "../contexts/UserContext";

export default function Notifications() {
  const notificationQueue = useRef(new Queue<React.ReactNode>()).current;
  const [visibleNotification, setVisibleNotification] =
    useState<React.ReactNode | null>(null);
  const { updateFriends } = useUserContext();

  const updateVisibleNotification = () => {
    setVisibleNotification(notificationQueue.first?.data ?? null);
  };

  const removeNotification = async () => {
    notificationQueue.dequeue();
    updateVisibleNotification();
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/notifications`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    });
  };

  useEffect(() => {
    socket.on("notification", (notification) => {
      let notificationComponent;
      switch (notification.type) {
        case "friendRequest":
          notificationComponent = (
            <FriendRequestNotification
              username={notification.from}
              remove={removeNotification}
              key={notificationQueue.last ? notificationQueue.last.id : -1}
            />
          );
          break;
        case "friendAccept":
          notificationComponent = (
            <MessageNotification
              remove={removeNotification}
              key={notificationQueue.last ? notificationQueue.last.id : -1}
            >
              <span>
                <b>{notification.from}</b> is now your friend
              </span>
            </MessageNotification>
          );
          updateFriends();
          break;
        case "friendDidDecline":
          notificationComponent = (
            <MessageNotification
              remove={removeNotification}
              key={notificationQueue.last ? notificationQueue.last.id : -1}
            >
              <span>
                You declined <b>{notification.from}</b>'s friend request
              </span>
            </MessageNotification>
          );
          break;
        case "friendWasDeclined":
          notificationComponent = (
            <MessageNotification
              remove={removeNotification}
              key={notificationQueue.last ? notificationQueue.last.id : -1}
            >
              <span>
                <b>{notification.from}</b> declined your friend request
              </span>
            </MessageNotification>
          );
      }
      if (notificationComponent) {
        notificationQueue.enqueue(notificationComponent);
        updateVisibleNotification();
      }
    });
    return () => {
      socket.off("notification");
    };
  }, []);

  return (
    <AnimatePresence initial={false} mode="wait">
      {visibleNotification ?? <></>}
    </AnimatePresence>
  );
}
