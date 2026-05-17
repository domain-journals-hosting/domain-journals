import { Link, useParams } from "react-router-dom";
import journals from "../data/journals.json";
import "../styles/journalsHome.css";
import JournalHeader from "./JournalHeader";
import health from "../assets/health.jpg";
import biological from "../assets/biological.jpg";
import multidisciplinary from "../assets/multidisciplinary.jpg";
import scienceImage from "../assets/science.jpg";
import { Helmet } from "react-helmet";

const imageMap = {
  health,
  biological,
  multidisciplinary,
  science: scienceImage,
};

const JournalsHome = () => {
  const { slug } = useParams();
  const journal = journals.find((j) => j.slug === slug);

  return (
    <>
      <Helmet>
        <title>{journal.title} - Domain Journals</title>
        <meta
          name="description"
          content={`Read about ${journal.title}, a peer-reviewed publication under Domain Journals.`}
        />
        <link
          rel="canonical"
          href={`https://domainjournals.com/journals/${slug}`}
        />
      </Helmet>

      <JournalHeader slug={slug} />

      <div className="journal-home">
        <div className="journal-home__hero">
          <img src={imageMap[journal.image]} alt={journal.title} />
          <div className="journal-home__hero-text">
            <h1>{journal.title}</h1>
            <p>{journal.description}</p>
            <Link to="archive" className="journal-home__archive-link">
              <i className="ti ti-archive" aria-hidden="true" /> View archive
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default JournalsHome;
