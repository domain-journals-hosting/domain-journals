import { useState } from "react";
import "../styles/contact.css";
import axios from "../api/axios";
import NewsletterSubscription from "./NewsLetterSubscription";
import { Helmet } from "react-helmet";

const Contact = ({ home = false }) => {
  const [msg, setMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEMail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setErrorMsg("");
    try {
      const response = await axios.post("/message", {
        firstName,
        lastName,
        email,
        message,
      });
      setMsg(response.data.success);
      setFirstName("");
      setLastName("");
      setEMail("");
      setMessage("");
    } catch (err) {
      setErrorMsg(err?.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!home && (
        <Helmet>
          <title>Contact Us - Domain Journals</title>
          <meta
            name="description"
            content="Reach out to the Domain Journals editorial team for inquiries, submissions, or support."
          />
          <link rel="canonical" href="https://domainjournals.com/contact" />
        </Helmet>
      )}

      <section
        className={`contact-section${home ? " contact-section--home" : ""}`}
      >
        <div className="contact-info">
          <h2>Get in touch</h2>
          <p>
            Have questions about submissions, peer review, or publishing? We'd
            love to hear from you.
          </p>
          <ul className="contact-details">
            <li>
              <i className="ti ti-map-pin" aria-hidden="true" />
              Delta State University, Abraka
            </li>
            <li>
              <i className="ti ti-phone" aria-hidden="true" />
              <a href="tel:+2349156263372">+234 915 626 3372</a>
            </li>
            <li>
              <i className="ti ti-mail" aria-hidden="true" />
              <a href="mailto:contact@domainjournals.com">
                contact@domainjournals.com
              </a>
            </li>
          </ul>
        </div>

        <div className="contact-form-wrapper">
          <h2>Send us a message</h2>
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="contact-form__row">
              <div className="contact-form__field">
                <label htmlFor="firstname">First name</label>
                <input
                  required
                  type="text"
                  id="firstname"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="contact-form__field">
                <label htmlFor="lastname">Last name</label>
                <input
                  required
                  type="text"
                  id="lastname"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="contact-form__field">
              <label htmlFor="email">Email</label>
              <input
                required
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEMail(e.target.value)}
              />
            </div>
            <div className="contact-form__field">
              <label htmlFor="message">Message</label>
              <textarea
                required
                id="message"
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            {errorMsg && <p className="contact-form__error">{errorMsg}</p>}
            {msg && <p className="contact-form__success">{msg}</p>}
            <button
              type="submit"
              className="contact-form__submit"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send message"}
            </button>
          </form>
        </div>
      </section>

      <NewsletterSubscription />
    </>
  );
};

export default Contact;
