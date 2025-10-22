import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import "../styles/checkResults.css";

const CheckResults = () => {
  const [selectedExam, setSelectedExam] = useState("");
  const [exams, setExams] = useState("");
  const [results, setResults] = useState("");
  const [loading, setLoading] = useState(true);
  const getExams = async () => {
    const response = await axios.get("exam/all");
    console.log(response.data);
    setExams(response.data);
  };

  const getResults = async () => {
    const res = await axios.get("/result");
    console.log(res.data);
    setResults(res.data);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await getExams();
      await getResults();
      setLoading(false);
    };
    fetchData();
  }, []);
  useEffect(() => {
    if (exams && exams.length > 0) {
      setSelectedExam(exams[0]._id);
    }
  }, [exams]);

  if (loading || !exams || !results) return <p className="loading">Loading....</p>;
  const select = (
    <>
      <label htmlFor="result">Select result: </label>
      <select
        value={selectedExam}
        onChange={(e) => setSelectedExam(e.target.value)}
        name=""
        id="result"
      >
        {exams.map((exam) => (
          <option key={exam._id} value={exam._id}>
            {exam.description || "Exam"}
          </option>
        ))}
      </select>
    </>
  );
  const content = (
    <div className="container">
      <br />
      {select}
      <table>
        <thead>
          <th>Name</th>
          <th>Score</th>
        </thead>
        {results
          .filter((r) => r.exam.toString() === selectedExam.toString())
          .map((res) => (
            <tr key={res._id}>
              <td>{res?.user?.name}</td>
              <td>
                Score: {res.score} / {res.totalScore}
              </td>
            </tr>
          ))}
      </table>
    </div>
  );
  return content;
};

export default CheckResults;
