import { useParams } from "react-router-dom";
import journals from "../data/journals.json";
import JournalHeader from "./JournalHeader";
import { useSeoMeta, useHead } from "@unhead/react";
import "../styles/editorialBoard.css";

const EditorialBoard = () => {
  const { slug } = useParams();
  const journal = journals.find((j) => j.slug === slug);
  const journalTitle = journal?.title || "Journal";

  useSeoMeta({
    title: `${journalTitle} - Editorial Board | Domain Journals`,
    description: `Meet the editorial board members of ${journalTitle}, a peer-reviewed open access journal under Domain Journals.`,
  });

  useHead({
    link: [
      {
        rel: "canonical",
        href: `https://www.domainjournals.com/journals/${slug}/editorial-board`,
      },
    ],
  });

  return (
    <div className="editorial-page">
      <JournalHeader slug={slug} />

      <div className="editorial-container">
        <div className="editorial-page__header">
          <h1>{journalTitle}</h1>
          <h2>Editorial Board</h2>
        </div>

        <div className="editorial-grid">
          {journal?.editorialBoard?.map((member, index) => (
            <div key={index} className="editor-card">
              <div className="editor-card__avatar">
                {member.name ? member.name.charAt(0) : "E"}
              </div>
              <div className="editor-card__body">
                <span className="editor-card__role">{member.role}</span>
                <h3 className="editor-card__name">{member.name}</h3>
                <div className="editor-card__address">
                  {member.address?.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EditorialBoard;
