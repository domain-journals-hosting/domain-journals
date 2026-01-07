import React, { useState } from "react";
import axios from "../api/axios";

const SubmitReceipt = ({
  message,
  setReceipt,
  accountName,
  setAccountName,
}) => {
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState("");
  const [err, setErr] = useState("");

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("receipt", file);

      const { data } = await axios.post("/file/receipt", formData, {
        withCredentials: true,
      });
      const receipt = data.url;
      setUrl(receipt);
      setReceipt(receipt);
    } catch (error) {
      console.error("receipt upload failed", error);
      setErr(error.response?.data?.error || "Failed to upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleAccountNameChange = (e) => setAccountName(e.target.value);
  const uploadingMessage = <p style={{ color: "green" }}>Uploading...</p>;

  return (
    <form
      style={{
        padding: "10px",
      }}
    >
      <p
        style={{
          borderColor: "#333",
          color: "#333",
        }}
      >
        {message}
      </p>
      <input
        type="file"
        name="receipt"
        id="receipt"
        accept="image/*"
        onChange={handleFileChange}
        style={{
          borderColor: "#333",
          color: "#333",
        }}
      />
      <label
        htmlFor="receipt"
        style={{
          color: "#333",
        }}
      >
        Upload your receipt{" "}
      </label>
      {url && <img src={url} width={200} height={200} alt="RECEIPT" />}{" "}
      <input
        style={{
          borderColor: "#333",
          color: "#333",
        }}
        type="text"
        name="name"
        id="name"
        value={accountName}
        onChange={handleAccountNameChange}
      />
      <label
        style={{
          color: "#333",
        }}
        htmlFor="name"
      >
        Please enter the exact sender name shown in the receipt
      </label>
      {err && <p>{err}</p>}
      {uploading && uploadingMessage}
    </form>
  );
};

export default SubmitReceipt;
