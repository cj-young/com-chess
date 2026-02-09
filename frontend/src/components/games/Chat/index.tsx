import { useEffect, useState } from "react";
import { socket } from "../../../config/socket";
import { useAuthContext } from "../../../contexts/AuthContext";
import "./styles.scss";

type Message = {
  from: string;
  message: string;
};

export default function Chat() {
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const { user } = useAuthContext();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const username = user?.username ?? "";

    if (inputMessage.length > 0) {
      socket.emit("liveChat", inputMessage);
      setMessages((prevMessages) => [
        { from: username, message: inputMessage },
        ...prevMessages,
      ]);
      setInputMessage("");
    }
  }

  useEffect(() => {
    socket.on("liveChat", (newMessage) => {
      setMessages((prevMessages) => [newMessage, ...prevMessages]);
    });

    return () => {
      socket.off("liveChat");
    };
  }, []);

  return (
    <div className="chat">
      <h2>Chat</h2>
      <div className="chat__window">
        <ul className="chat__messages">
          {messages.map((message, i) => (
            <li key={i}>
              <b>{message.from}</b>: {message.message}
            </li>
          ))}
        </ul>
      </div>
      <form className="chat__form" onSubmit={handleSubmit}>
        <div className="chat__input-wrapper">
          <input
            type="text"
            className="chat__input"
            placeholder="Send a message"
            aria-label="Chat message"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
          />
        </div>
        <button className="chat__input-button">Send</button>
      </form>
    </div>
  );
}
