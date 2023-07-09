import { useState, useEffect, useRef } from "react";
import Queue from "../utils/Queue";
import { AnimatePresence } from "framer-motion";

export default function Notifications() {
  const notificationQueue = useRef(new Queue<React.ReactNode>());
  const [visibleNotification, setVisibleNotification] =
    useState<React.ReactNode | null>(null);

  //Websockets will enqueue notifications using notificationQueue ref, then setVisibleNotification to display it
  //Notifications themselves will have callback functions that handle user input, which will dequeue the notification and display a new one if it exists

  return (
    <AnimatePresence initial={false} mode="wait">
      {visibleNotification ?? <></>}
    </AnimatePresence>
  );
}
