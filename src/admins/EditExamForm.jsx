import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "../api/axios";
import QuestionInput from "./QuestionInput";
import "../styles/examForm.css";

const EditExamForm = () => {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [originalLocked, setOriginalLocked] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await axios.get(`/exam/send/${examId}`);
        console.log(res);
        setExam(res.data);
        setOriginalLocked(res.data.locked);
      } catch (err) {
        console.error("Error fetching exam:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [examId]);

  const handleOptionChange = (index, updatedQuestion) => {
    const updated = [...exam.questions];
    updated[index] = updatedQuestion;
    setExam({ ...exam, questions: updated });
  };

  const handleDeleteQuestion = (index) => {
    setExam((prev) => {
      const updated = prev.questions.filter((_, i) => i !== index);
      return { ...prev, questions: updated };
    });
  };

  const handleDeleteExam = async () => {
    const res = await axios.delete(`/exam/${exam._id}`);
    console.log(res);
    navigate("/courses");
  };
  const setQuestions = (questions) => {
    setExam((prev) => ({ ...prev, questions }));
  };
  const setDuration = (duration) => {
    setExam((prev) => ({ ...prev, duration }));
  };
  const handleAddQuestion = () => {
    setQuestions([
      ...exam.questions,
      {
        text: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: "",
      },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (originalLocked && !exam.locked) {
      const confirm = window.confirm(
        "Warning: You are unlocking this exam. Students may be able to retake it, and every result related to this exam will be deleted... Click cancel and use the button at the bottom of the page to print all results. Continue?",
      );
      if (!confirm) return setSaving(false);
    } else if (!originalLocked && exam.locked) {
      const confirm = window.confirm(
        "Warning: You are locking this exam. Students will not be able to take it. Continue?",
      );
      if (!confirm) return setSaving(false);
    }

    try {
      const result = await axios.patch(`/exam/${exam._id}`, exam);
      setExam(result.data);
      setOriginalLocked(result.data.locked);
      console.log(exam);
      alert("Exam updated successfully!");
    } catch (err) {
      console.error("Error updating exam:", err);
      alert("Error saving exam.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading exam...</p>;
  if (!exam) return <p>No exam found.</p>;

  return (
    <form className="exam-form" onSubmit={handleSubmit}>
      <h2>Edit Exam: {exam.description}</h2>{" "}
      <div style={{ width: "100%" }}>
        <label htmlFor="Questions">Questions</label>
        <textarea
          id="Questions"
          placeholder="Paste questions array, please use carefully"
          value={JSON.stringify(exam.questions)}
          onChange={(e) => setQuestions(JSON.parse(e.target.value))}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />
      </div>
      <label>Duration (minutes):</label>
      <input
        type="number"
        value={exam.duration}
        onChange={(e) => setDuration(Number(e.target.value))}
        required
      />
      <div style={{ width: "100%" }}>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          placeholder="Description"
          value={exam.description}
          onChange={(e) =>
            setExam((prev) => ({ ...prev, description: e.target.value }))
          }
          required
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />
      </div>
      {exam?.questions?.map((q, index) => (
        <div key={index} className="question-block">
          <div className="question-header">
            <h3>Question {index + 1}</h3>
            <button
              type="button"
              className="delete-btn"
              onClick={() => handleDeleteQuestion(index)}
            >
              ×
            </button>
          </div>

          <QuestionInput
            index={index}
            data={q}
            onChange={(updated) => handleOptionChange(index, updated)}
          />
        </div>
      ))}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          gap: 20,
        }}
      >
        <input
          style={{ width: 20 }}
          type="checkbox"
          name="review"
          id="review"
          checked={exam.canReview}
          onChange={(e) =>
            setExam((prev) => ({ ...prev, canReview: e.target.checked }))
          }
        />
        <label style={{ whiteSpace: "nowrap" }} htmlFor="review">
          Allow users to review after exam?
        </label>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          gap: 20,
        }}
      >
        <input
          type="checkbox"
          name="locked"
          id="locked"
          checked={exam.locked}
          style={{ width: 20 }}
          onChange={(e) =>
            setExam((prev) => ({ ...prev, locked: e.target.checked }))
          }
        />
        <label style={{ whiteSpace: "nowrap" }} htmlFor="locked">
          Lock Exam?
        </label>
      </div>
      <Link to={`/results/${exam._id}`} style={{ fontSize: 20 }}>
        Results
      </Link>
      <button type="button" onClick={handleAddQuestion} className="add-btn">
        + Add Question
      </button>
      <button onClick={handleDeleteExam} style={{ backgroundColor: "red" }}>
        Delete exam
      </button>
      <button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
};

export default EditExamForm;
