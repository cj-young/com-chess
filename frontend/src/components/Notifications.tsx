import { useState, useEffect, useRef } from "react";
import Queue from "../utils/Queue";
import { AnimatePresence } from "framer-motion";
import FriendRequestNotification from "./FriendRequestNotification";
import { socket } from "../config/socket";
import MessageNotification from "./MessageNotification";
import { useUserContext } from "../contexts/UserContext";
import GameRequestNotification from "./GameRequestNotification";
import ErrorPopup from "./ErrorPopup";

type Notification =
  | {
      type:
        | "friendRequest"
        | "friendAccept"
        | "friendWasDeclined"
        | "friendDidDecline"
        | "gameDeclined"
        | "friendRemove"
        | "friendRemoveSuccess";
      from: string;
    }
  | { type: "gameRequest"; from: string; minutes: number; increment: number }
  | { type: "error"; error: string };

export default function Notifications() {
  const notificationQueue = useRef(new Queue<React.ReactNode>()).current;
  const [visibleNotification, setVisibleNotification] =
    useState<React.ReactNode | null>(null);
  const { updateFriends } = useUserContext();

  function updateVisibleNotification() {
    setVisibleNotification(notificationQueue.first?.data ?? null);
  }

  async function removeNotification() {
    notificationQueue.dequeue();
    updateVisibleNotification();
    await fetch(`${import.meta.env.VITE_BACKEND_URL}/notifications`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
  }

  function buildNotification(notification: Notification) {
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
        break;
      case "gameRequest":
        notificationComponent = (
          <GameRequestNotification
            remove={removeNotification}
            username={notification.from}
            key={notificationQueue.last ? notificationQueue.last.id : -1}
            minutes={notification.minutes}
            increment={notification.increment}
          />
        );
        break;
      case "gameDeclined":
        notificationComponent = (
          <MessageNotification
            remove={removeNotification}
            key={notificationQueue.last ? notificationQueue.last.id : -1}
          >
            <span>
              <b>{notification.from}</b> declined your game invite
            </span>
          </MessageNotification>
        );
        break;
      case "friendRemove":
        notificationComponent = (
          <MessageNotification
            remove={removeNotification}
            key={notificationQueue.last ? notificationQueue.last.id : -1}
          >
            <span>
              <b>{notification.from}</b> removed you as a friend
            </span>
          </MessageNotification>
        );
        updateFriends();
        break;
      case "friendRemoveSuccess":
        console.log("FRIEND REMOVE SUCCESS!!!!!!!!!!!!!!!");
        notificationComponent = (
          <MessageNotification
            remove={removeNotification}
            key={notificationQueue.last ? notificationQueue.last.id : -1}
          >
            <span>
              <b>{notification.from}</b> is no longer your friend
            </span>
          </MessageNotification>
        );
        updateFriends();
        break;
      case "error":
        notificationComponent = (
          <ErrorPopup
            message={notification.error}
            remove={removeNotification}
            key={notificationQueue.last ? notificationQueue.last.id : -1}
          />
        );
    }

    return notificationComponent;
  }

  useEffect(() => {
    (async () => {
      try {
        socket.on("notification", (notification) => {
          const notificationComponent = buildNotification(notification);
          if (notificationComponent) {
            notificationQueue.enqueue(notificationComponent);
            updateVisibleNotification();
          }
        });

        socket.on("error", (error) => {
          console.log(error);
          const errorNotification = buildNotification({ type: "error", error });
          notificationQueue.enqueue(errorNotification);
          updateVisibleNotification();
        });

        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/notifications`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        const { notifications } = data;

        notificationQueue.clear();
        for (let noti of notifications) {
          notificationQueue.enqueue(buildNotification(noti));
        }
        updateVisibleNotification();
      } catch (error) {
        console.error(error);
      }
    })();

    return () => {
      socket.off("notification");
      socket.off("error");
    };
  }, []);

  return (
    <AnimatePresence initial={false} mode="wait">
      {visibleNotification ?? <></>}
    </AnimatePresence>
  );
}
