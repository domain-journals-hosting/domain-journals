import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import ExamHeader from "./ExamHeader";
import QuestionCard from "./QuestionCard";
import ExamFooter from "./ExamFooter";
import QuestionMap from "./QuestionMap";
import ExamGuard from "./ExamGuard";

const TakeExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [draft, setDraft] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [flags, setFlags] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState("");

  const QUESTIONS_PER_PAGE = 3;

  // fetch exam and draft
  useEffect(() => {
    const fetchExamAndDraft = async () => {
      try {
        setLoading(true);
        const examRes = await axios.get(`/exam/${examId}`);
        console.log(examRes);
        const draftRes = await axios
          .get(`/draft/${examRes.data._id}`)
          .catch(() => null);

        const examData = examRes.data;
        setExam(examData);

        // setup answers from draft or new
        const totalQ = examData.questions.length;
        const savedAnswers =
          draftRes?.data?.answers?.map((a) =>
            isNaN(a?.answerIndex) ? null : a?.answerIndex,
          ) || Array(totalQ).fill(null);
        const savedFlags = draftRes?.data?.flags || Array(totalQ).fill(false);
        const currentQ = draftRes?.data?.currentQuestion || 0;

        setAnswers(savedAnswers);
        setFlags(savedFlags);
        setCurrentPage(Math.floor(currentQ / QUESTIONS_PER_PAGE));
        setDraft(draftRes?.data || null);
        console.log(draftRes);
        // time setup
        const start = new Date(examData.now || Date.now());
        console.log(examData.now);

        const end = new Date(examData.endTime);
        console.log(new Date(end).toLocaleTimeString());
        console.log(new Date(start).toLocaleTimeString());
        const diff = end - start;
        console.log(diff);
        const left = end - new Date();
        setTimeLeft(left > 0 ? left : 0);
        console.log("Exam and draft loaded successfully (UI coming next)...");
      } catch (err) {
        console.error(err);
        setError(err?.response?.data?.error || "Failed to load exam");
      } finally {
        setLoading(false);
      }
    };
    fetchExamAndDraft();
  }, [examId]);

  // countdown
  useEffect(() => {
    if (!timeLeft) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          clearInterval(timer);
          handleSubmit(); // auto submit when time runs out
          return 0;
        }
        return prev - 1000;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Save draft on navigation
  const saveDraft = useCallback(async () => {
    try {
      const newAnswers = answers.map((answer, i) => ({
        questionIndex: i,
        answerIndex: Number(answer),
      }));
      console.log({ newAnswers });
      setSaveStatus("saving");
      if (!exam?._id) return;
      await axios.post(`/draft/${exam._id}`, {
        answers: newAnswers,
        currentQuestion: currentPage * QUESTIONS_PER_PAGE,
      });
      setSaveStatus("saved");
      console.log("Draft saved.");
    } catch (err) {
      setSaveStatus("error");
      console.error("Draft save failed:", err.message);
    }
  }, [answers, currentPage, exam]);

  const handleAnswer = (qIndex, answerIndex) => {
    const copy = [...answers];
    copy[qIndex] = answerIndex;
    setAnswers(copy);
  };

  const handleFlag = (qIndex) => {
    const copy = [...flags];
    copy[qIndex] = !copy[qIndex];
    setFlags(copy);
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

  const handleSubmit = useCallback(async () => {
    try {
      if (!exam) return;
      console.log(exam);
      const result = await axios.post(`/result/${exam._id}`, {
        answers: answers.map((a, i) => ({
          questionIndex: i,
          answerIndex: a,
        })),
      });
      console.log("Exam submitted!");
      navigate(`/result/${exam._id}`);
      console.log(result);
    } catch (err) {
      console.error("Submit failed:", err.message);
      setError(err?.response?.data?.error || "Failed to submit exam");
    }
  }, [answers, exam, navigate]);

  if (loading) return <p>Loading exam...</p>;
  if (error)
    return (
      <p style={{ margin: "20px" }} className="error">
        {error}
      </p>
    );
  if (!exam) return <p>No exam found.</p>;

  const totalPages = Math.ceil(exam.questions.length / QUESTIONS_PER_PAGE);
  const start = currentPage * QUESTIONS_PER_PAGE;
  const currentQuestions = exam.questions.slice(
    start,
    start + QUESTIONS_PER_PAGE,
  );

  return (
    <div className="take-exam">
      {/* <ExamGuard warnings={3} onViolationLimit={handleSubmit} /> */}
      <ExamHeader
        title={exam?.description}
        timeLeft={timeLeft}
        onSubmit={handleSubmit}
        saveStatus={saveStatus}
      />
      <div className="exam-body">
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
      <ExamFooter
        currentPage={currentPage}
        totalPages={totalPages}
        onPrev={handlePrev}
        onNext={handleNext}
        onSaveDraft={saveDraft}
      />
      <QuestionMap
        questions={exam.questions}
        answers={answers}
        flagged={flags}
        onJump={handleJump}
      />
    </div>
  );
};

export default TakeExam;
