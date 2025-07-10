import { useParams } from "react-router-dom";
import journals from "../data/journals.json";
import JournalHeader from "./JournalHeader";
const Guidelines = () => {
  const { slug } = useParams();
  const journal = journals.find((journal) => journal.slug === slug);

  let tableHTML = [];
  for (let key in journal.tablesAndFigures) {
    const value = journal.tablesAndFigures[key];
    console.log(key, value);
    tableHTML.push(
      <div key={key}>
        <strong>{key}: </strong>
        <span>{value}</span> <br />
        <br />
      </div>
    );
  }
  console.log(tableHTML);
  let referenceHTML = [];
  for (let key in journal.references) {
    const value = journal.references[key];
    console.log(key, value);
    tableHTML.push(
      <div key={key}>
        <strong>Referencing {key}: </strong>
        <span>{value}</span> <br />
        <br />
      </div>
    );
  }
  console.log(tableHTML);
  return (
    <>
      <JournalHeader slug={slug} />
      <div
        style={{
          padding: "10px",
          maxWidth: "600",
          margin: "0 auto",
          textAlign: "left",
        }}
      >
        <h1>
          <u>Guidelines</u>
        </h1>
        <p>{journal.authorGuidelines}</p> <br />
        <h2>Ethical consideratioons:</h2>
        <p>{journal.ethicalConsiderations}</p> <br />
        <h2>Patient Confidentiality:</h2>
        <p>{journal.patientConfidentiality}</p>
        <br />
        <h2>Format:</h2>
        <p> {journal.formatOfJournal}</p>
        <br />
        <h3>Title page</h3>
        <p>
          <span>{journal.titlePage.text}</span>
        </p>
        <ol>
          {journal.titlePage.list.map((item) => (
            <li style={{ marginLeft: "30px" }} key={item}>
              {item}
            </li>
          ))}
        </ol>
        <br />
        <h3>Abstract</h3>
        <p>{journal.abstract}</p>
        <br />
        <h3>Main text</h3>
        <p>{journal.mainText}</p>
        <br />
        <h3>Introduction</h3>
        <p>{journal.introduction}</p>
        <br />
        <h3>Methods</h3>
        <p>{journal.methods}</p>
        <br />
        <h3>Results</h3>
        <p>{journal.results}</p>
        <br />
        <h3>Discussion</h3>
        <p>{journal.discussion}</p>
        <br />
        <h3>Conclusion</h3>
        <p>{journal.conclusion}</p>
        <br />
        <h3>Acknowledgement</h3>
        <p>{journal.acknowledgements}</p>
        <br />
        <h3>References</h3>
        {referenceHTML}
        <br />
        <h3>Tables and figures</h3>
        {tableHTML}
        <br />
        <h3>Review process</h3>
        <p>{journal.reviewProcess}</p>
        <br />
        <h3>Gallery proof</h3>
        <p>{journal.galleryProof}</p>
        <br />
        <h3>Correspondence</h3>
        <p>{journal.correspondences}</p>
        <br />
      </div>
    </>
  );
};

export default Guidelines;
