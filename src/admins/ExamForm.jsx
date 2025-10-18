import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../api/axios";
import QuestionInput from "./QuestionInput";
import "../styles/examForm.css";

const ExamForm = () => {
  const { courseId } = useParams();
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(30);
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([
    { text: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: "",
      },
    ]);
  };
  const handleDeleteQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index, updated) => {
    const copy = [...questions];
    copy[index] = updated;
    setQuestions(copy);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage("");
      const res = await axios.post("/exam", {
        course: courseId,
        description,
        duration,
        questions,
      });
      setMessage("Exam created successfully!");
      navigate("/courses");
      console.log(res.data);
    } catch (err) {
      setMessage(err?.response?.data?.error || "Failed to create exam");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="exam-form-container">
      <h2>Create New Exam</h2>
      <form onSubmit={handleSubmit}>
        <label>Description:</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <label>Duration (minutes):</label>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          required
        />

        <h3>Questions</h3>
        {questions.map((q, i) => (
          <QuestionInput
            key={i}
            index={i}
            data={q}
            onDelete={() => handleDeleteQuestion(i)}
            onChange={(updated) => handleQuestionChange(i, updated)}
          />
        ))}

        <button type="button" onClick={handleAddQuestion} className="add-btn">
          + Add Question
        </button>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Saving..." : "Save Exam"}
        </button>
      </form>

      {message && <p className="msg">{message}</p>}
    </div>
  );
};

export default ExamForm;
