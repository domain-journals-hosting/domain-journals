import { useParams } from "react-router-dom";
import journals from "../data/journals.json";
import JournalHeader from "./JournalHeader";
import { useSeoMeta, useHead } from "@unhead/react";
import "../styles/guidelines.css";

const Guidelines = () => {
  const { slug } = useParams();
  const journal = journals.find((j) => j.slug === slug);

  const tableEntries = Object.entries(journal?.tablesAndFigures || {});
  const referenceEntries = Object.entries(journal?.references || {});

  useSeoMeta({
    title: journal
      ? `${journal.title} - Author Guidelines | Domain Journals`
      : "Author Guidelines",
    description: journal
      ? `Author submission guidelines for ${journal.title}. Learn about formatting, ethical considerations, references, and the review process.`
      : "",
  });

  useHead({
    link: [
      {
        rel: "canonical",
        href: `https://www.domainjournals.com/journals/${slug}/guidelines`,
      },
    ],
  });

  if (!journal) {
    return (
      <div className="guidelines-page">
        <p className="guidelines-not-found">
          Requested journal guidelines not found.
        </p>
      </div>
    );
  }

  return (
    <div className="guidelines-page">
      <JournalHeader slug={slug} />

      <div className="guidelines-container">
        <div className="guidelines-header">
          <h1>Author Guidelines</h1>
          <p className="guidelines-intro">{journal.authorGuidelines}</p>
        </div>

        <section className="guidelines-card">
          <section className="guidelines-section">
            <h2>Ethical Considerations</h2>
            <p>{journal.ethicalConsiderations}</p>
          </section>

          <section className="guidelines-section">
            <h2>Patient Confidentiality</h2>
            <p>{journal.patientConfidentiality}</p>
          </section>

          <section className="guidelines-section">
            <h2>Manuscript Format</h2>
            <p>{journal.formatOfJournal}</p>

            <div className="guidelines-subsection">
              <h3>Title Page</h3>
              <p>{journal.titlePage?.text}</p>
              {journal.titlePage?.list?.length > 0 && (
                <ol className="guidelines-list">
                  {journal.titlePage.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              )}
            </div>

            <div className="guidelines-subsection">
              <h3>Abstract</h3>
              <p>{journal.abstract}</p>
            </div>

            <div className="guidelines-subsection">
              <h3>Main Text</h3>
              <p>{journal.mainText}</p>
            </div>

            <div className="guidelines-subsection">
              <h3>Introduction</h3>
              <p>{journal.introduction}</p>
            </div>

            <div className="guidelines-subsection">
              <h3>Methods</h3>
              <p>{journal.methods}</p>
            </div>

            <div className="guidelines-subsection">
              <h3>Results</h3>
              <p>{journal.results}</p>
            </div>

            <div className="guidelines-subsection">
              <h3>Discussion</h3>
              <p>{journal.discussion}</p>
            </div>

            <div className="guidelines-subsection">
              <h3>Conclusion</h3>
              <p>{journal.conclusion}</p>
            </div>

            <div className="guidelines-subsection">
              <h3>Acknowledgements</h3>
              <p>{journal.acknowledgements}</p>
            </div>
          </section>

          {referenceEntries.length > 0 && (
            <section className="guidelines-section">
              <h2>References Format</h2>
              {referenceEntries.map(([key, value]) => (
                <div key={key} className="guidelines-entry">
                  <strong>Referencing {key}:</strong>
                  <span>{value}</span>
                </div>
              ))}
            </section>
          )}

          {tableEntries.length > 0 && (
            <section className="guidelines-section">
              <h2>Tables and Figures</h2>
              {tableEntries.map(([key, value]) => (
                <div key={key} className="guidelines-entry">
                  <strong>{key}:</strong>
                  <span>{value}</span>
                </div>
              ))}
            </section>
          )}

          <section className="guidelines-section">
            <h2>Peer Review Process</h2>
            <p>{journal.reviewProcess}</p>
          </section>

          <section className="guidelines-section">
            <h2>Gallery Proof</h2>
            <p>{journal.galleryProof}</p>
          </section>

          <section className="guidelines-section">
            <h2>Correspondence</h2>
            <p>{journal.correspondences}</p>
          </section>
        </section>
      </div>
    </div>
  );
};

export default Guidelines;
