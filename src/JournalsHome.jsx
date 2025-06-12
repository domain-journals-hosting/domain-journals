import React from "react";
import { useParams } from "react-router-dom";
import journals from "./journals.json";
import "./styles/JournalsHome.css";

const JournalsHome = () => {
  const { slug } = useParams();
  const journal = journals.find((journal) => journal.slug === slug);

  return (
    <div className="journal-container">
      <h1 className="journal-title">{journal.title}</h1>
      <p className="journal-description">{journal.description}</p>
    </div>
  );
};

export default JournalsHome;
