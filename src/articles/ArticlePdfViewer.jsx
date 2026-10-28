import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaDownload } from "react-icons/fa";
import axios from "../api/axios";
import { useSeoMeta, useHead } from "@unhead/react";
import { getViewerUrl, getDownloadUrl } from "../utils/fileHelpers";
import "../styles/articles.css";

const SITE_URL = "https://www.domainjournals.com";

const ArticlePdfViewer = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`/accepted/slug/${slug}`)
      .then((res) => setArticle(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const cleanSlug = slug ? slug.replace(/\/+$/, "") : "";
  const primaryArticleUrl = `${SITE_URL}/articles/${cleanSlug}`;

  useSeoMeta({
    title: article
      ? `PDF Preview: ${article.title} - Domain Journals`
      : "PDF Viewer",
    description: article?.abstract
      ? `PDF document viewer for ${article.title}`
      : "",
    robots: "noindex, follow", // Prevents Google from indexing the viewer shell over the main article
  });

  useHead({
    link: article ? [{ rel: "canonical", href: primaryArticleUrl }] : [],
    meta: article
      ? [
          { name: "citation_title", content: article.title },
          { name: "citation_pdf_url", content: getDownloadUrl(article.file) },
        ]
      : [],
  });

  if (loading) {
    return (
      <div className="articles-page">
        <div className="articles-container">Loading PDF Viewer...</div>
      </div>
    );
  }

  if (!article || !article.file) {
    return (
      <div className="articles-page">
        <div className="articles-container">
          <button
            className="back-btn"
            onClick={() => navigate(`/articles/${slug}`)}
          >
            <FaArrowLeft /> Back to Article
          </button>
          <h3>PDF Document Unavailable</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="pdf-viewer-page">
      <header className="pdf-viewer-bar">
        <button
          className="back-btn"
          onClick={() => navigate(`/articles/${slug}`)}
        >
          <FaArrowLeft /> Back to Details
        </button>
        <span className="pdf-title">{article.title}</span>
        <a
          href={getDownloadUrl(article.file)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-sage-primary"
        >
          <FaDownload /> Download PDF
        </a>
      </header>

      <iframe
        src={getViewerUrl(article.file)}
        title={`PDF Viewer - ${article.title}`}
        className="pdf-iframe"
      />
    </div>
  );
};

export default ArticlePdfViewer;
