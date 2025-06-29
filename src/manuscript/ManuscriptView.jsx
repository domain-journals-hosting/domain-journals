import { useLocation } from "react-router-dom";
import health from "../assets/health.jpg";
import biological from "../assets/biological.jpg";
import multidisciplinary from "../assets/multidisciplinary.jpg";
import scienceImage from "../assets/science.jpg";
import journals from "../data/journals.json";
const ManuscriptView = () => {
  const backendBase = import.meta.env.VITE_API_BASE_URL;
  const downloadLink = (file) => {
    console.log(file);
    return file.endsWith(".doc")
      ? file
      : `${backendBase}/file?url=${encodeURIComponent(file)}`;
  };
  const { state } = useLocation();
  const manuscript = state?.manuscript;
  if (!manuscript) return <p>Manuscript not found.</p>;

  const source = () => {
    const string = journals.find((j) => j.slug === manuscript.journal).image;
    console.log(string);
    return string === "health"
      ? health
      : string === "biological"
      ? biological
      : string === "multidisciplinary"
      ? multidisciplinary
      : scienceImage;
  };

  const {
    title,
    author,
    coAuthors = [],
    journal,
    volume,
    issue,
    abstract,
    file,
    country,
    customId,
    articleType,
  } = manuscript;
  const authors = [author, ...coAuthors.map((a) => a.name)].join(", ");

  return (
    <div
      className="manuscript-view"
      style={{ padding: "20px", maxWidth: "700px", margin: "0 auto" }}
    >
      <img src={source()} style={styles.img} alt="" />
      <h1 style={{ marginBottom: "10px" }}>{title}</h1>

      <p>
        <strong>Article type:</strong> {articleType}
      </p>
      <p>
        <strong>ID:</strong> {customId}
      </p>

      <p>
        <strong>Author(s):</strong> {authors}
      </p>
      <p>
        <strong>Journal:</strong> {journal}
      </p>
      <p>
        <strong>Volume:</strong> {volume}
      </p>
      <p>
        <strong>Issue:</strong> {issue}
      </p>
      <p>
        <strong>Country:</strong> {country}
      </p>

      <p style={{ marginTop: "20px" }}>
        <strong>Abstract:</strong>
      </p>
      <p style={{ whiteSpace: "pre-wrap" }}>{abstract}</p>

      <div className="actions" style={{ marginTop: "30px" }}>
        <a
          href={`https://docs.google.com/viewer?url=${encodeURIComponent(
            file
          )}&embedded=true`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <button style={{ marginRight: "10px" }}>📄 View Full Text</button>
        </a>
        <a href={downloadLink(file)} download>
          <button>⬇️ Download</button>
        </a>
      </div>
    </div>
  );
};

export default ManuscriptView;

const styles = {
  img: {
    width: "100%",
    maxWidth: "600px",
    height: "auto",
    marginBottom: "1rem",
    borderRadius: "8px",
  },
};
