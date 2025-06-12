import { Link } from "react-router-dom";
import journals from "./journals.json"; // an array with the list of all of the journal names
import logo from "./assets/logo.jpg";
import "./styles/JournalsList.css";
const JournalsList = () => {
  const journal = (journalObject) => (
    <div className="journal" key={journalObject.slug}>
      <img src={logo} width={100} />
      <h2>{journalObject.title}</h2>
      <div className="container">
        <p>{journalObject.description.substring(0, 300)}...</p>{" "}
        <Link to={journalObject.slug}>Home</Link>
        <Link to={`${journalObject.slug}/editorial-board`}>
          Editorial board
        </Link>
        <Link to={`${journalObject.slug}/current-issue`}>Current issue</Link>
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
