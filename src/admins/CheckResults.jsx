import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import "../styles/checkResults.css";

const CheckResults = () => {
  const [selectedExam, setSelectedExam] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
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
  const availableDepartments = results
    ? new Set(results.map((r) => r.user.department))
    : [];

  if (loading || !exams || !results)
    return <p className="loading">Loading....</p>;
  const select = (
    <>
      <label htmlFor="result">Select exam: </label>
      <select
        value={selectedExam}
        onChange={(e) => setSelectedExam(e.target.value)}
        name=""
        id="result"
      >
        <option value="all">All</option>
        {exams.map((exam) => (
          <option key={exam._id} value={exam._id}>
            {exam.description || "Exam"}
          </option>
        ))}
      </select>

      <label htmlFor="result">Select department: </label>
      <select
        value={selectedDepartment}
        onChange={(e) => setSelectedDepartment(e.target.value)}
        name=""
        id="result"
      >
        <option value="all">All</option>

        {Array.from(availableDepartments).map((d) => (
          <option key={d} value={d}>
            {d && d.charAt(0).toUpperCase() + d.slice(1)}
          </option>
        ))}
      </select>

      <label htmlFor="level">Select level: </label>
      <select
        value={selectedLevel}
        onChange={(e) => setSelectedLevel(e.target.value)}
        name=""
        id="level"
      >
        <option value="all">All</option>

        {[100, 200, 300, 400, 500, 600, 700, 800].map((d) => (
          <option key={d} value={d}>
            {d}
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
          .filter(
            (r) =>
              (selectedExam === "all" ||
                r.exam.toString() === selectedExam.toString()) &&
              (selectedDepartment === "all" ||
                r.user.department === selectedDepartment) &&
              (selectedLevel === "all" ||
                Number(r.user.level) === Number(selectedLevel))
          )
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
