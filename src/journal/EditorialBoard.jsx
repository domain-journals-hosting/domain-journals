import { useParams } from "react-router-dom";
import journals from "../data/journals.json";
import JournalHeader from "./JournalHeader";
const EditorialBoard = () => {
  const { slug } = useParams();
  const journal = journals.find((journal) => journal.slug === slug);
  const editorialSection = (
    <div>
      <h1>{journal.title}</h1>
      <h2>Editorial board</h2>
      {journal.editorialBoard.map((member, index) => (
        <div key={index} className="editor-card">
          <h3>{member.role}</h3>
          <p>
            <strong>{member.name}</strong>
          </p>
          {member.address.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      ))}
    </div>
  );
  return (
    <>
      <JournalHeader slug={slug} />
      <div>{editorialSection}</div>
    </>
  );
};

export default EditorialBoard;
