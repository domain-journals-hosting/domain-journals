import React from "react";
import { useParams } from "react-router-dom";
import journals from "./journals.json";
import "./styles/journalsHome.css";
import JournalHeader from "./JournalHeader";

const JournalsHome = () => {
  const { slug } = useParams();
  const journal = journals.find((journal) => journal.slug === slug);

  return (
    <>
      <JournalHeader slug={slug} />
      <div className="journal-container-home">
        <h1 className="journal-title">{journal.title}</h1>
        <p className="journal-description">{journal.description}</p>
      </div>
    </>
  );
};

export default JournalsHome;
