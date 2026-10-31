import React from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "../styles/examFooter.css";

const ExamFooter = ({ currentPage, totalPages, onPrev, onNext }) => {
  return (
    <div className="exam-footer">
      <button
        type="button"
        className="nav-btn"
        onClick={onPrev}
        disabled={currentPage === 0}
      >
        <FaChevronLeft /> Previous
      </button>

      <span className="page-indicator">
        Page <strong>{currentPage + 1}</strong> of <strong>{totalPages}</strong>
      </span>

      <button
        type="button"
        className="nav-btn"
        onClick={onNext}
        disabled={currentPage === totalPages - 1}
      >
        Next <FaChevronRight />
      </button>
    </div>
  );
};

export default ExamFooter;
