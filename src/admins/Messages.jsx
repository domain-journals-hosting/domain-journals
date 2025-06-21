import { useEffect, useState } from "react";
import axios from "../api/axios";
import ReplyBox from "./ReplyBox";
import "../styles/messages.css";

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get("/message")
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("Fetch failed:", err))
      .finally(() => setLoading(false));
  }, []);

  const sendReply = async (replyText, msg) => {
    try {
      const response = await axios.post("/message/reply", {
        name: `${msg.firstName} ${msg.lastName}`,
        reply: replyText,
        messageId: msg._id,
        email: msg.email,
      });
      console.log(response);
      alert("Reply sent!");
      setMessages((prev) =>
        prev.map((m) => (m._id === msg._id ? { ...m, read: true } : m))
      );
      setSelectedMessage(null);
      return true;
    } catch (err) {
      alert("Reply failed.");
    }
  };

  return (
    <div className="messages-container">
      <h2 className="messages-title">Inbox</h2>
      <div className="messages-list">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className="message-card"
            onClick={() => setSelectedMessage(msg)}
          >
            <div className="message-header">
              <span className="message-name">
                {msg.firstName} {msg.lastName}
              </span>
              <span
                className={`message-status ${msg.read ? "read" : "unread"}`}
              >
                {msg.read ? "Read" : "Unread"}
              </span>
            </div>
            <div className="message-email">{msg.email}</div>
            <div className="message-body">{msg.message}</div>
          </div>
        ))}
      </div>

      <ReplyBox
        message={selectedMessage}
        onClose={() => setSelectedMessage(null)}
        onSend={sendReply}
      />
    </div>
  );
};

export default Messages;
