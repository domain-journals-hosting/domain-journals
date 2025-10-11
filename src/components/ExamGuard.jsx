import { useEffect, useState, useCallback } from "react";

const ExamGuard = ({ warnings = 2, onViolationLimit }) => {
  const [warningCount, setWarningCount] = useState(warnings);
  const [lastViolation, setLastViolation] = useState(0);

  const triggerWarning = useCallback(
    (message) => {
      const now = Date.now();
      if (now - lastViolation < 5000) return; //  5s cooldown

      setLastViolation(now);
      if (warningCount > 1) {
        alert(`${message}\nYou have ${warningCount - 1} warnings left.`);
        setWarningCount((prev) => prev - 1);
      } else {
        alert(`${message}\nYou have 0 warnings left.\nExam will be submitted.`);
        onViolationLimit?.();
      }
    },
    [warningCount, onViolationLimit, lastViolation]
  );

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden)
        triggerWarning("You switched tabs or minimized the window!");
    };

    const handleBlur = () => {
      triggerWarning("You lost focus (clicked away or opened DevTools)!");
    };

    const handleKeyDown = (e) => {
      if (e.key === "PrintScreen") triggerWarning("Screenshot detected!");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [triggerWarning]);

  return null;
};

export default ExamGuard;
