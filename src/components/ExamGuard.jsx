import React, { useEffect, useState, useCallback } from "react";
import { FaExclamationTriangle, FaShieldAlt } from "react-icons/fa";
import "../styles/examGuard.css";

const ExamGuard = ({ warnings = 3, onViolationLimit, isSample = false }) => {
  const [warningCount, setWarningCount] = useState(warnings);
  const [lastViolation, setLastViolation] = useState(0);
  const [modalMessage, setModalMessage] = useState(null);

  const triggerWarning = useCallback(
    (message) => {
      const now = Date.now();
      if (now - lastViolation < 3000) return; // 3s cooldown between triggers

      setLastViolation(now);

      if (isSample) {
        // Endless counting for sample/practice mode
        setModalMessage(
          `${message} (Sample Exam Mode: Endless Violation Tracking)`,
        );
        setWarningCount((prev) => prev - 1);
        return;
      }

      if (warningCount > 1) {
        setWarningCount((prev) => prev - 1);
        setModalMessage(
          `${message} You have ${warningCount - 1} warning(s) remaining.`,
        );
      } else {
        setWarningCount(0);
        setModalMessage(`${message} No warnings remaining. Submitting exam...`);
        setTimeout(() => {
          onViolationLimit?.();
        }, 2000);
      }
    },
    [warningCount, onViolationLimit, lastViolation, isSample],
  );

  useEffect(() => {
    // 1. Tab switch and window minimize
    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerWarning("Tab switch or window minimization detected.");
      }
    };

    // 2. Window focus loss (clicking away, opening dev tools)
    const handleBlur = () => {
      triggerWarning(
        "Focus lost. Clicking outside the exam browser is prohibited.",
      );
    };

    // 3. Keyboard shortcut restrictions
    const handleKeyDown = (e) => {
      // PrintScreen
      if (e.key === "PrintScreen") {
        triggerWarning("Screenshot attempt detected.");
      }
      // F12 or Inspect shortcuts (Ctrl+Shift+I / Cmd+Option+I)
      if (
        e.key === "F12" ||
        (e.ctrlKey &&
          e.shiftKey &&
          (e.key === "I" || e.key === "J" || e.key === "C")) ||
        (e.ctrlKey && e.key === "u")
      ) {
        e.preventDefault();
        triggerWarning("Developer Tools shortcuts are disabled during exams.");
      }
    };

    // 4. Disable Right Click Context Menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      triggerWarning("Right-click context menu is disabled.");
    };

    // 5. Disable Text Copying
    const handleCopy = (e) => {
      e.preventDefault();
      triggerWarning("Copying text is restricted during the exam.");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopy);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
    };
  }, [triggerWarning]);

  if (!modalMessage) return null;

  return (
    <div className="exam-guard-overlay">
      <div className="exam-guard-modal">
        <div className="guard-icon-container">
          <FaExclamationTriangle className="warning-icon" />
        </div>
        <h3>Security Violation Warning</h3>
        <p className="guard-message">{modalMessage}</p>
        <div className="guard-status-pill">
          <FaShieldAlt /> Remaining Warnings:{" "}
          {isSample ? "Infinite (Sample)" : warningCount}
        </div>
        <button
          type="button"
          className="guard-dismiss-btn"
          onClick={() => setModalMessage(null)}
        >
          Acknowledge & Continue
        </button>
      </div>
    </div>
  );
};

export default ExamGuard;
