import { Link } from "react-router-dom";
import "./styles/journalHeader.css";

const JournalHeader = ({ slug }) => {
  return (
    <nav className="journal-header">
      <ul>
        <li>
          <Link to={`/journals/${slug}`}>Journal Home</Link>
        </li>
        <li>
          <Link to={`/journals/${slug}/editorial-board`}>Editorial board</Link>
        </li>
        <li>
          <Link to={`/journals/${slug}/current-issue`}>Current issue</Link>
        </li>
        <li>
          <Link to={`/journals/${slug}/archive`}>Archive</Link>
        </li>
      </ul>
    </nav>
  );
};

export default JournalHeader;
