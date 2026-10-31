import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import ExamHeader from "./ExamHeader";
import QuestionCard from "./QuestionCard";
import ExamFooter from "./ExamFooter";
import QuestionMap from "./QuestionMap";
import ExamGuard from "./ExamGuard";
import { sampleQuestions } from "../data/sampleQuestions";

const TakeExam = ({ isSample: isSampleProp = false }) => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const isSample = isSampleProp || examId === "sample";

  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [flags, setFlags] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState("");

  const QUESTIONS_PER_PAGE = 3;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  useEffect(() => {
    const fetchExamAndDraft = async () => {
      setLoading(true);
      setError("");

      if (isSample) {
        // Load Sample Exam locally
        const sampleExamData = {
          _id: "sample_exam",
          description: "Practice / Sample Examination",
          duration: 20, // 20 minutes
          questions: sampleQuestions,
        };

        const savedDraft = JSON.parse(
          localStorage.getItem("sample_exam_draft") || "null",
        );

        const totalQ = sampleQuestions.length;
        const savedAnswers =
          savedDraft?.answers?.map((a) =>
            a?.answerIndex === null || isNaN(a?.answerIndex)
              ? null
              : Number(a?.answerIndex),
          ) || Array(totalQ).fill(null);

        const savedFlags = savedDraft?.flags || Array(totalQ).fill(false);
        const currentQ = savedDraft?.currentQuestion || 0;

        setExam(sampleExamData);
        setAnswers(savedAnswers);
        setFlags(savedFlags);
        setCurrentPage(Math.floor(currentQ / QUESTIONS_PER_PAGE));
        setTimeLeft(20 * 60 * 1000); // 20 mins timer
        setLoading(false);
        return;
      }

      // Live Backend Exam Load
      try {
        const examRes = await axios.get(`/exam/${examId}`);
        const examData = examRes.data;

        const draftRes = await axios
          .get(`/draft/${examData._id}`)
          .catch(() => null);

        setExam(examData);

        const totalQ = examData.questions.length;
        const savedAnswers =
          draftRes?.data?.answers?.map((a) =>
            a?.answerIndex === null || isNaN(a?.answerIndex)
              ? null
              : Number(a?.answerIndex),
          ) || Array(totalQ).fill(null);

        const savedFlags = draftRes?.data?.flags || Array(totalQ).fill(false);
        const currentQ = draftRes?.data?.currentQuestion || 0;

        setAnswers(savedAnswers);
        setFlags(savedFlags);
        setCurrentPage(Math.floor(currentQ / QUESTIONS_PER_PAGE));

        const serverNow = new Date(examData.now).getTime();
        const serverEnd = new Date(examData.endTime).getTime();
        const left = serverEnd - serverNow;
        setTimeLeft(left > 0 ? left : 0);
      } catch (err) {
        console.error(err);
        setError(err?.response?.data?.error || "Failed to load exam");
      } finally {
        setLoading(false);
      }
    };

    fetchExamAndDraft();
  }, [examId, isSample]);

  // Submit Handler
  const handleSubmit = useCallback(async () => {
    if (!exam) return;

    if (isSample) {
      // Calculate Sample Result locally
      const calculations = exam.questions.map((q, i) => {
        const userAnswer = answers[i];
        return {
          _id: `sq_res_${i}`,
          text: q.text,
          options: q.options,
          answer: userAnswer,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
        };
      });

      const score = calculations.filter(
        (c) => c.answer !== null && c.answer === c.correctAnswer,
      ).length;

      const newSampleResult = {
        _id: `sample_${Date.now()}`,
        exam: { description: "Practice / Sample Examination" },
        score,
        totalScore: exam.questions.length,
        questions: calculations,
        createdAt: new Date().toISOString(),
        isSample: true,
      };

      const existing = JSON.parse(
        localStorage.getItem("sample_exam_results") || "[]",
      );
      localStorage.setItem(
        "sample_exam_results",
        JSON.stringify([newSampleResult, ...existing]),
      );
      localStorage.removeItem("sample_exam_draft");

      navigate(`/results?id=${newSampleResult._id}`);
      return;
    }

    // Live Exam Submission via Backend
    try {
      await axios.post(`/result/${exam._id}`, {
        answers: answers.map((a, i) => ({
          questionIndex: i,
          answerIndex: a,
        })),
      });
      navigate(`/result/${exam._id}`);
    } catch (err) {
      console.error("Submit failed:", err.message);
      setError(err?.response?.data?.error || "Failed to submit exam");
    }
  }, [answers, exam, isSample, navigate]);

  // Timer Countdown
  useEffect(() => {
    if (!timeLeft) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, handleSubmit]);

  // Draft Preservation Helper
  const saveDraft = useCallback(
    async (overrideAnswers = answers, overrideFlags = flags) => {
      if (!exam?._id) return;

      const formattedAnswers = overrideAnswers.map((answer, i) => ({
        questionIndex: i,
        answerIndex:
          answer === null || answer === undefined ? null : Number(answer),
      }));

      if (isSample) {
        localStorage.setItem(
          "sample_exam_draft",
          JSON.stringify({
            answers: formattedAnswers,
            flags: overrideFlags,
            currentQuestion: currentPage * QUESTIONS_PER_PAGE,
          }),
        );
        setSaveStatus("saved");
        return;
      }

      try {
        setSaveStatus("saving");
        await axios.post(`/draft/${exam._id}`, {
          answers: formattedAnswers,
          currentQuestion: currentPage * QUESTIONS_PER_PAGE,
        });
        setSaveStatus("saved");
      } catch (err) {
        setSaveStatus("error");
        console.error("Draft save failed:", err.message);
      }
    },
    [answers, currentPage, exam, flags, isSample],
  );

  const handleAnswer = (qIndex, answerIndex) => {
    const copy = [...answers];
    copy[qIndex] = answerIndex;
    setAnswers(copy);
    saveDraft(copy, flags);
  };

  const handleFlag = (qIndex) => {
    const copy = [...flags];
    copy[qIndex] = !copy[qIndex];
    setFlags(copy);
    saveDraft(answers, copy);
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      saveDraft();
      setCurrentPage((p) => p - 1);
    }
  };

  const handleNext = () => {
    const maxPage = Math.ceil(exam.questions.length / QUESTIONS_PER_PAGE) - 1;
    if (currentPage < maxPage) {
      saveDraft();
      setCurrentPage((p) => p + 1);
    }
  };

  const handleJump = (index) => {
    saveDraft();
    setCurrentPage(Math.floor(index / QUESTIONS_PER_PAGE));
  };

  if (loading)
    return (
      <div className="loading-container">
        <p>Loading examination...</p>
      </div>
    );
  if (error)
    return (
      <p className="error" style={{ margin: "20px" }}>
        {error}
      </p>
    );
  if (!exam) return <p>No examination found.</p>;

  const totalPages = Math.ceil(exam.questions.length / QUESTIONS_PER_PAGE);
  const start = currentPage * QUESTIONS_PER_PAGE;
  const currentQuestions = exam.questions.slice(
    start,
    start + QUESTIONS_PER_PAGE,
  );
  const answeredCount = answers.filter(
    (a) => a !== null && a !== undefined,
  ).length;
  const totalQuestions = exam.questions.length;

  return (
    <div className="take-exam" style={{ paddingTop: "84px" }}>
      <ExamGuard
        warnings={3}
        onViolationLimit={handleSubmit}
        isSample={isSample}
      />
      <ExamHeader
        title={exam?.description}
        timeLeft={timeLeft}
        onSubmit={handleSubmit}
        saveStatus={saveStatus}
        answeredCount={answeredCount}
        totalQuestions={totalQuestions}
      />
      <div
        className="exam-body"
        style={{ maxWidth: "800px", margin: "20px auto", padding: "0 16px" }}
      >
        {currentQuestions?.map((q, i) => (
          <QuestionCard
            key={start + i}
            question={q}
            questionIndex={start + i}
            flagged={flags[start + i]}
            onAnswer={handleAnswer}
            selectedAnswer={answers[start + i]}
            onFlag={handleFlag}
          />
        ))}
      </div>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 16px" }}>
        <ExamFooter
          currentPage={currentPage}
          totalPages={totalPages}
          onPrev={handlePrev}
          onNext={handleNext}
        />
        <QuestionMap
          questions={exam.questions}
          answers={answers}
          flagged={flags}
          onJump={handleJump}
          currentPage={currentPage}
          questionsPerPage={QUESTIONS_PER_PAGE}
        />
      </div>
    </div>
  );
};

export default TakeExam;
