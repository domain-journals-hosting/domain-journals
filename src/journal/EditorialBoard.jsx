import { useParams } from "react-router-dom";
import journals from "../data/journals.json";
import JournalHeader from "./JournalHeader";
import { Helmet } from "react-helmet";
import "../styles/editorialBoard.css";

const EditorialBoard = () => {
  const { slug } = useParams();
  const journal = journals.find((j) => j.slug === slug);
  const journalTitle = journal?.title || "Journal";

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

      <div className="editorial-page">
        <div className="editorial-page__header">
          <h1>{journal.title}</h1>
          <h2>Editorial Board</h2>
        </div>

        <div className="editorial-grid">
          {journal.editorialBoard.map((member, index) => (
            <div key={index} className="editor-card">
              <div className="editor-card__avatar">{member.name.charAt(0)}</div>
              <div className="editor-card__body">
                <span className="editor-card__role">{member.role}</span>
                <h3 className="editor-card__name">{member.name}</h3>
                <div className="editor-card__address">
                  {member.address.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default EditorialBoard;
