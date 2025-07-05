import React from "react";
import { Link, useParams } from "react-router-dom";
import journals from "../data/journals.json";
import "../styles/journalsHome.css";
import JournalHeader from "./JournalHeader";
import health from "../assets/health.jpg";
import biological from "../assets/biological.jpg";
import multidisciplinary from "../assets/multidisciplinary.jpg";
import scienceImage from "../assets/science.jpg";
import { Helmet } from "react-helmet";
const source = (string) =>
  string === "health"
    ? health
    : string === "biological"
    ? biological
    : string === "multidisciplinary"
    ? multidisciplinary
    : scienceImage;

const JournalsHome = () => {
  const { slug } = useParams();
  const journal = journals.find((journal) => journal.slug === slug);

  return (
    <>
      <Helmet>
        <title>{journal.title} - Domain Journals</title>
        <meta
          name="description"
          content={`Read about ${journal.title}, a peer-reviewed publication under Domain Journals.`}
        />
        <link
          rel="canonical"
          href={`https://domainjournals.com/journals/${slug}`}
        />
      </Helmet>
      <JournalHeader slug={slug} />
      <div className="journal-container-home">
        <img src={source(journal.image)} alt="" />
        <h1 className="journal-title">{journal.title}</h1>
        <p className="journal-description">{journal.description}</p>

        <Link to="archive">View archive</Link>
      </div>
    </>
  );
};

export default JournalsHome;
