import { Link } from "react-router-dom";
import journals from "../data/journals.json";
import "../styles/journalsList.css";
import health from "../assets/health.jpg";
import biological from "../assets/biological.jpg";
import multidisciplinary from "../assets/multidisciplinary.jpg";
import scienceImage from "../assets/science.jpg";
const source = (string) =>
  string === "health"
    ? health
    : string === "biological"
    ? biological
    : string === "multidisciplinary"
    ? multidisciplinary
    : scienceImage;
const JournalsList = () => {
  const journal = (journalObject) => (
    <div className="journal" key={journalObject.slug}>
      <img src={source(journalObject.image)} width={100} />
      <h2>{journalObject.title}</h2>
      <div className="container">
        <p>{journalObject.description.substring(0, 300)}...</p>{" "}
        <div>
          <Link to={journalObject.slug}>Home</Link>
          <Link to={`${journalObject.slug}/editorial-board`}>
            Editorial board
          </Link>
          <Link to={`${journalObject.slug}/current-issue`}>Current issue</Link>
        </div>
      </div>
    </div>
  );
  return (
    <div className="journal-container">
      {journals.map((journalObject) => journal(journalObject))}
    </div>
  );
};

export default JournalsList;
