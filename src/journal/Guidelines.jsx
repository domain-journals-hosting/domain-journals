import { useParams } from "react-router-dom";
import journals from "../data/journals.json";
import JournalHeader from "./JournalHeader";
import { Helmet } from "react-helmet";
import "../styles/guidelines.css";

const Guidelines = () => {
  const { slug } = useParams();
  const journal = journals.find((j) => j.slug === slug);

  const tableEntries = Object.entries(journal.tablesAndFigures || {});
  const referenceEntries = Object.entries(journal.references || {});

  return (
    <>
      <Helmet>
        <title>{journal.title} - Author Guidelines | Domain Journals</title>
        <meta
          name="description"
          content={`Author submission guidelines for ${journal.title}. Learn about formatting, ethical considerations, references, and the review process.`}
        />
        <link
          rel="canonical"
          href={`https://www.domainjournals.com/journals/${slug}/guidelines`}
        />
      </Helmet>

      <JournalHeader slug={slug} />

      <div className="guidelines-page">
        <div className="guidelines-content">
          <h1>Author Guidelines</h1>
          <p className="guidelines-intro">{journal.authorGuidelines}</p>

          <section className="guidelines-section">
            <h2>Ethical Considerations</h2>
            <p>{journal.ethicalConsiderations}</p>
          </section>

          <section className="guidelines-section">
            <h2>Patient Confidentiality</h2>
            <p>{journal.patientConfidentiality}</p>
          </section>

          <section className="guidelines-section">
            <h2>Format</h2>
            <p>{journal.formatOfJournal}</p>

            <div className="guidelines-subsection">
              <h3>Title page</h3>
              <p>{journal.titlePage.text}</p>
              <ol className="guidelines-list">
                {journal.titlePage.list.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>

            <div className="guidelines-subsection">
              <h3>Abstract</h3>
              <p>{journal.abstract}</p>
            </div>

            <div className="guidelines-subsection">
              <h3>Main text</h3>
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

          <section className="guidelines-section">
            <h2>References</h2>
            {referenceEntries.map(([key, value]) => (
              <div key={key} className="guidelines-entry">
                <strong>Referencing {key}:</strong>
                <span>{value}</span>
              </div>
            ))}
          </section>

          <section className="guidelines-section">
            <h2>Tables and Figures</h2>
            {tableEntries.map(([key, value]) => (
              <div key={key} className="guidelines-entry">
                <strong>{key}:</strong>
                <span>{value}</span>
              </div>
            ))}
          </section>

          <section className="guidelines-section">
            <h2>Review Process</h2>
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
        </div>
      </div>
    </>
  );
};

export default Guidelines;
