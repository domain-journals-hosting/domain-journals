import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../api/axios";
import QuestionInput from "./QuestionInput";
import "../styles/examForm.css";

const EditExamForm = () => {
  const { courseId } = useParams();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await axios.get(`/exam/send/${courseId}`);
        console.log(res);
        setExam(res.data);
      } catch (err) {
        console.error("Error fetching exam:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [courseId]);

  const handleChange = (index, field, value) => {
    const updatedQuestions = [...exam.questions];
    updatedQuestions[index][field] = value;
    setExam({ ...exam, questions: updatedQuestions });
  };

  const handleOptionChange = (index, options) => {
    const updated = [...exam.questions];
    updated[index].options = options;
    setExam({ ...exam, questions: updated });
  };

  const handleDeleteQuestion = (index) => {
    const updated = exam.questions.filter((_, i) => i !== index);
    setExam({ ...exam, questions: updated });
  };

  const handleDeleteExam = async () => {
    const res = axios.delete(`/exam/${exam._id}`);
    console.log(res);
    navigate("/courses");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`/exam/${courseId}`, exam);
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
      <h2>Edit Exam: {exam.description}</h2>

      {exam.questions.map((q, index) => (
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
            onChange={(options) => handleOptionChange(index, options)}
          />
        </div>
      ))}
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
