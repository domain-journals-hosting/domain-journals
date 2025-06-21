import { useState } from "react";
import "../styles/contact.css";
import axios from "../api/axios";

const Contact = () => {
  const [msg, setMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEMail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const onFirstNameChange = (e) => setFirstName(e.target.value);
  const onLastNameChange = (e) => setLastName(e.target.value);
  const onEmailChange = (e) => setEMail(e.target.value);
  const onMessageChange = (e) => setMessage(e.target.value);
  const handleSubmit = async (e) => {
    setLoading(true);
    console.log("Submit triggered");
    e.preventDefault();
    try {
      const response = await axios.post("/message", {
        firstName,
        lastName,
        email,
        message,
      });
      console.log(response.data.messageObject);
      const responseSuccess = response.data.success;
      setMsg(responseSuccess);
      setFirstName("");
      setLastName("");
      setEMail("");
      setMessage("");

      const reponseError = response.data?.error;
      setErrorMsg(reponseError);
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="contact-container">
      <h2>Contact Us</h2>
      <p>
        <strong>Address:</strong> 484 Greg's Road, Lagos, Nigeria
      </p>
      <p>
        <strong>Phone:</strong> 0812 345 6789
      </p>
      <p>
        <strong>Email:</strong> contact@domainjournals.org
      </p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="firstname">First Name</label>
        <input
          required
          type="text"
          id="firstname"
          value={firstName}
          onChange={onFirstNameChange}
        />
        <label htmlFor="lastname">Last Name</label>
        <input
          required
          type="text"
          id="lastname"
          value={lastName}
          onChange={onLastNameChange}
        />
        <label htmlFor="email">Email</label>
        <input
          type="text"
          id="email"
          value={email}
          onChange={onEmailChange}
          required
        />
        <label htmlFor="message">Enter message</label>
        <textarea
          required
          id="message"
          rows={10}
          value={message}
          onChange={onMessageChange}
        ></textarea>

        {errorMsg && <p style={{ color: "crimson" }}>{errorMsg}</p>}
        {msg && <p>{msg}</p>}
        <button>{loading ? "Sending" : "Send"}</button>
      </form>
    </div>
  );
};

export default Contact;
