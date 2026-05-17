import { useParams } from "react-router-dom";
import journals from "../data/journals.json";
import JournalHeader from "./JournalHeader";

const EditorialBoard = () => {
  const { slug } = useParams();
  const journal = journals.find((journal) => journal.slug === slug);
  const journalTitle = journal?.title || "Journal";

  const editorialSection = (
    <div style={{ padding: "20px" }}>
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
      <Helmet>
        <title>{journalTitle} - Editorial Board | Domain Journals</title>
        <meta
          name="description"
          content={`Meet the editorial board members of ${journalTitle}, a peer-reviewed open access journal under Domain Journals.`}
        />
        <link
          rel="canonical"
          href={`https://www.domainjournals.com/journals/${slug}/editorial-board`}
        />
      </Helmet>
      <JournalHeader slug={slug} />
      <div>{editorialSection}</div>
    </>
  );
};

export default EditorialBoard;
