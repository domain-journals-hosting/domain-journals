import { useEffect, useState } from "react";

const ExamGuard = ({ warnings = 2, onViolationLimit }) => {
  const [warningCount, setWarningCount] = useState(warnings);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden)
        triggerWarning(
          "You switched tabs or minimized the window!" +
            `You have ${warnings} warnings`
        );
    };

    const handleKeyDown = (e) => {
      // Detect PrintScreen
      if (e.key === "PrintScreen") {
        triggerWarning(
          "Screenshot detected!" + `You have ${warnings} warnings`
        );
      }
    };

    const triggerWarning = (message) => {
      if (warningCount > 1) {
        alert(`${message}`);
        setWarningCount((prev) => prev - 1);
      } else {
        alert(`${message} We will now automatically submit your exam.`);
        onViolationLimit?.();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [warningCount, onViolationLimit, warnings]);

  return null; // invisible component
};

export default ExamGuard;
