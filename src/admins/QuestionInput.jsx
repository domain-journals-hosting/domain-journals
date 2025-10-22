import React from "react";

const QuestionInput = ({ index, data, onChange, onDelete }) => {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const handleOptionChange = (i, value) => {
    const newOptions = [...data.options];
    newOptions[i] = value;
    onChange({ ...data, options: newOptions });
  };

  const handleDelete = () => {
    const confirmDelete = window.confirm(
      `Delete Question ${index + 1}? This action cannot be undone.`
    );
    if (confirmDelete && onDelete) onDelete();
  };

  return (
    <div className="question-card">
      <div className="question-header">
        <h4>Question {index + 1}</h4>
        <button
          type="button"
          className="delete-x"
          title="Delete Question"
          onClick={handleDelete}
        >
          ×
        </button>
      </div>

      <input
        type="text"
        placeholder="Question text"
        value={data.text}
        onChange={(e) => handleChange("text", e.target.value)}
        required
      />

      {data?.options?.length &&
        data?.options?.map((opt, i) => (
          <div key={i} className="option-input">
            <input
              type="text"
              placeholder={`Option ${i + 1}`}
              value={opt}
              onChange={(e) => handleOptionChange(i, e.target.value)}
              required
            />
          </div>
        ))}

      <label>Correct Answer:</label>
      <select
        value={data.correctAnswer}
        onChange={(e) => handleChange("correctAnswer", Number(e.target.value))}
      >
        {data?.options?.map((_, i) => (
          <option key={i} value={i}>
            Option {i + 1}
          </option>
        ))}
      </select>

      <label>Explanation (optional):</label>
      <textarea
        value={data.explanation}
        onChange={(e) => handleChange("explanation", e.target.value)}
        placeholder="Brief explanation for the correct answer (optional)"
      />
    </div>
  );
};

export default QuestionInput;
