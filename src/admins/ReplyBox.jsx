import { useState, useRef, useEffect } from "react";
import "../styles/replyBox.css";

const ReplyBox = ({ message, onClose, onSend }) => {
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [reply]);

  useEffect(() => {
    textareaRef?.current?.focus();
  }, [message]);

  const handleSend = async () => {
    setLoading(true);
    if (reply.trim()) {
      const sent = await onSend(reply, message);
      if (!sent) return;
      setReply("");
    }
  };

  if (!message) return null;

  return (
    <div className="reply-box">
      <div className="reply-header">
        Replying to {message.firstName} {message.lastName}
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>

      <textarea
        ref={textareaRef}
        rows={3}
        placeholder="Type your reply..."
        value={reply}
        onChange={(e) => setReply(e.target.value)}
      />

      <div className="reply-actions">
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default ReplyBox;
