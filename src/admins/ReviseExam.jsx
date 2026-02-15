import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";
import DisplayResult from "../components/DisplayResult";

const ReviseExam = () => {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);

  useEffect(() => {
    const getExams = async () => {
      const res = await axios.get(`/exam/revise/${examId}`);
      setExam(res.data);
      console.log(res.data);
    };
    getExams();
  }, [examId]);
  if (!exam) return <p className="loading">Loading</p>;
  return (
    <div style={{ marginTop: 40 }}>
      <h3>{exam.description}</h3>
      <DisplayResult result={exam} isRevising={true} />
    </div>
  );
};

export default ReviseExam;
