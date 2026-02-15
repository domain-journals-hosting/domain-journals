import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";
import { BiTrash } from "react-icons/bi";

const Results = () => {
  const { examId } = useParams();
  const [results, setResults] = useState(null);
  const [description, setDescription] = useState(null);
  const [divisor, setDivisor] = useState(30);

  useEffect(() => {
    const getResults = async () => {
      const res = await axios.get("/result/" + examId);
      console.log(res.data);
      setResults(res.data.results);
      setDescription(res.data.description);
    };
    getResults();
  }, [examId]);

  const saveDivisors = (e) => {
    setDivisor(+e.target.value);
  };

  const deleteResult = async (result) => {
    const id = result._id;
    const canDelete = window.confirm(
      "Are you sure you want to delete this result?\nName: " +
        result.user?.name,
    );
    if (!canDelete) return;
    const res = await axios.delete("/result/" + id);
    console.log(res);
    setResults(res.data.results);
  };

  if (!results) return <p className="loading">Loading...</p>;
  return (
    <div className="container">
      <h2>Results for {description}</h2>
      <br />
      <button className="btn no-print" onClick={() => window.print()}>
        Print
      </button>
      <div style={{ overflow: "scroll" }}>
        {" "}
        <table border={1}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Matric No.</th>
              <th>Level</th>
              <th>Department</th>
              <th>Score</th>
              <th>
                CA{" "}
                <input
                  className="no-print"
                  type="text"
                  value={divisor}
                  onChange={saveDivisors}
                />{" "}
              </th>
              <th className="no-print">Delete</th>
            </tr>
          </thead>
          {results
            .sort((a, b) => a.user.name.localeCompare(b.user.name))
            .map((res) => {
              console.log(res);
              return (
                <tr key={res._id}>
                  <td>{res?.user?.name}</td>
                  <td>{res?.user?.matricNumber}</td> <td>{res?.user?.level}</td>
                  <td>
                    {res?.user?.department?.charAt(0).toUpperCase() +
                      res?.user?.department?.slice(1)}
                  </td>
                  <td style={{ whiteSpace: "noWrap" }}>
                    {res.score} / {res.totalScore}
                  </td>
                  <td>
                    {" "}
                    {Math.round((res.score / res.totalScore) * divisor)}/
                    {divisor}
                  </td>
                  <td className="no-print">
                    <span onClick={() => deleteResult(res)}>
                      <BiTrash />
                    </span>
                  </td>
                </tr>
              );
            })}
        </table>
      </div>
    </div>
  );
};

export default Results;
