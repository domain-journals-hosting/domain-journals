import { useEffect, useState } from "react";
import axios from "../api/axios";
import ReplyBox from "./ReplyBox";
import "../styles/messages.css";
import ConfirmDialog from "../components/ConfirmDialog";
import Toast from "../components/Toast";
import { FaTrash } from "react-icons/fa";

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("unread");
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios
      .get("/message")
      .then((res) => setMessages(res.data))
      .catch((err) => {
        console.error("Fetch failed:", err);
        setToast({ message: "Fetch failed", error: true });
      })
      .finally(() => setLoading(false));
  }, []);

  const deleteMessage = async (id) => {
    try {
      const response = await axios.delete(`/message/${id}`);
      console.log(response);
      setToast({ message: "Message successfully deleted" });
      setMessages((prev) =>
        prev.filter((msg) => msg._id !== response.data._id)
      );
      setSelectedMessage(null);
    } catch (error) {
      setToast({
        message: error?.response?.data?.error || "Delete failed",
        error: true,
      });
    }
  };
  const sendReply = async (replyText, msg) => {
    try {
      const response = await axios.post("/message/reply", {
        name: `${msg.firstName} ${msg.lastName}`,
        reply: replyText,
        messageId: msg._id,
        email: msg.email,
      });
      console.log(response);
      setToast({ message: "Reply sent!" });
      setMessages((prev) =>
        prev.map((m) => (m._id === msg._id ? { ...m, read: true } : m))
      );
      setSelectedMessage(null);
      return true;
    } catch (err) {
      setToast({ message: "Reply failed.", error: true });
    }
  };

  const filteredMessages = messages.filter((msg) =>
    filter === "unread" ? !msg.read : msg.read
  );

  return (
    <div className="messages-container">
      {toast && (
        <Toast
          message={toast.message}
          error={toast.error}
          onClose={() => setToast(null)}
        />
      )}

      <ConfirmDialog
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={() => deleteMessage(selectedMessage._id)}
        message={"Are you sure you want to delete this message?"}
      />

      <h2 className="messages-title">Inbox</h2>

      <div style={{ marginBottom: 15 }}>
        {["unread", "read"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={
              filter === tab
                ? {
                    padding: "8px 16px",
                    marginRight: 10,
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontWeight: 600,
                    backgroundColor: "#659377",
                    color: "white",
                    transition: "background-color 0.3s ease",
                  }
                : {
                    padding: "8px 16px",
                    marginRight: 10,
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                    fontWeight: 600,
                    backgroundColor: "#eee",
                    color: "#333",
                    transition: "background-color 0.3s ease",
                  }
            }
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                filter === tab ? "#527055" : "#ddd")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor =
                filter === tab ? "#659377" : "#eee")
            }
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="messages-list">
        {loading ? (
          <p>Loading messages...</p>
        ) : filteredMessages.length === 0 ? (
          <p>No messages to show.</p>
        ) : (
          filteredMessages.map((msg) => (
            <div
              key={msg._id}
              className="message-card"
              onClick={() => setSelectedMessage(msg)}
            >
              <div
                className="message-header"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span className="message-name">
                  {msg.firstName} {msg.lastName}
                </span>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span
                    className={`message-status ${msg.read ? "read" : "unread"}`}
                  >
                    {msg.read ? "Read" : "Unread"}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowModal(true);
                      setSelectedMessage(msg);
                    }}
                    style={{
                      backgroundColor: "#e74c3c",
                      color: "white",
                      border: "none",
                      borderRadius: 4,
                      padding: "6px 10px",
                      fontSize: 14,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                    title="Delete message"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="message-email">{msg.email}</div>
              <div className="message-body">{msg.message}</div>
            </div>
          ))
        )}
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
