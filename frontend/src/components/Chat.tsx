import "../styles/Chat.scss";

export default function Chat() {
  return (
    <div className="chat">
      <h2>Chat</h2>
      <div className="chat__window"></div>
      <div className="chat__input-wrapper">
        <input
          type="text"
          className="chat__input"
          placeholder="Send a message"
        />
      </div>
    </div>
  );
}
