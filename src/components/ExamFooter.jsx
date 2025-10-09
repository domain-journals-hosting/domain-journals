import React from "react";
import "../styles/examFooter.css";

const ExamFooter = ({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onSaveDraft,
}) => {
  const handlePrev = () => {
    if (currentPage > 0) {
      onSaveDraft();
      onPrev();
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      onSaveDraft();
      onNext();
    }
  };

  return (
    <div className="exam-footer">
      <button
        className="nav-btn"
        onClick={handlePrev}
        disabled={currentPage === 0}
      >
        Prev
      </button>

      <span className="page-indicator">
        Page {currentPage + 1} of {totalPages}
      </span>

      <button
        className="nav-btn"
        onClick={handleNext}
        disabled={currentPage === totalPages - 1}
      >
        Next
      </button>
    </div>
  );
};

export default ExamFooter;
