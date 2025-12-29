import React, { useState } from "react";
import axios from "../api/axios";
import { FaCopy } from "react-icons/fa";

export const ResetAuthor = () => {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onEmailChange = (e) => setEmail(e.target.value);
  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    setErr("");
    setToken("");
    setName("");
    try {
      const res = await axios.post("/admin/resetAuthor", { email });
      const { token, name } = res.data;
      setToken(token);
      setName(name);
    } catch (err) {
      console.log(err);
      setErr(
        err?.response?.data?.error || err?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };
  const link =
    "https://domainjournals.com/complete/" + encodeURIComponent(token);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    window.alert("URL copied");
  };

  const message = (
    <div>
      Password reset link {name} successfully generated, copy reset link and
      send
      <div
        onClick={handleCopy}
        style={{
          marginTop: 20,
        }}
      >
        <FaCopy />
      </div>
      <input
        style={{
          marginTop: 20,
        }}
        type="text"
        readOnly
        value={link}
      />
    </div>
  );
  return (
    <form onSubmit={handleSubmit}>
      <label>Enter author's email</label>
      <input type="text" id="email" value={email} onChange={onEmailChange} />
      <button
        disabled={loading}
        style={{
          backgroundColor: "green",
        }}
      >
        Reset
      </button>
      {token && message}
      {err && <p className="error">{err}</p>}
    </form>
  );
};
