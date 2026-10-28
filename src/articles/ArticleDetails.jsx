import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSeoMeta, useHead } from "@unhead/react";
import {
  FaArrowLeft,
  FaDownload,
  FaEye,
  FaCopy,
  FaCheck,
  FaShareAlt,
  FaTwitter,
  FaLinkedin,
  FaFacebook,
  FaWhatsapp,
  FaGlobe,
  FaEnvelope,
  FaCalendarAlt,
} from "react-icons/fa";
import axios from "../api/axios";
import Toast from "../components/Toast";
import ArticleContent from "./ArticleContent";
import journals from "../data/journals.json";
import { getDownloadUrl } from "../utils/fileHelpers";
import "../styles/articles.css";

const SITE_URL = "https://www.domainjournals.com";

const formatScholarDate = (dateString, fallbackYear) => {
  if (!dateString) return fallbackYear ? `${fallbackYear}/01/01` : "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return fallbackYear ? `${fallbackYear}/01/01` : "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
};

const formatFullDate = (dateString, fallbackYear) => {
  if (!dateString) return fallbackYear || "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return fallbackYear || "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const ArticleDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const getArticle = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(`/accepted/slug/${slug}`);
      setArticle(res.data);
    } catch (e) {
      setError("The requested article could not be found.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getArticle();
  }, [slug]);

  const currentJournal = article
    ? journals.find((j) => j.slug === article.journal)
    : null;
  const journalDisplayTitle = currentJournal
    ? currentJournal.title
    : article?.journal;

  const handleCopyCitation = () => {
    if (!article) return;
    const coAuthorText =
      article.coAuthors.length > 0
        ? `, & ${article.coAuthors.map((c) => c.name).join(", ")}`
        : "";
    const pubDate = formatFullDate(article.createdAt, article.year);

    const citation = `${article.author}${coAuthorText} (${pubDate}). ${article.title}. ${journalDisplayTitle}, Issue ${article.issue}. [ID: ${article.customId}]`;

    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Strip trailing slashes to guarantee exact match with production routing
  const cleanSlug = slug ? slug.replace(/\/+$/, "") : "";
  const canonicalUrl = `${SITE_URL}/articles/${cleanSlug}`;

  useSeoMeta({
    title: article
      ? `${article.title} - ${journalDisplayTitle}`
      : "Article Details",
    description: article?.abstract ? article.abstract.substring(0, 160) : "",
  });

  useHead({
    link: article ? [{ rel: "canonical", href: canonicalUrl }] : [],
    meta: article
      ? [
          { name: "citation_title", content: article.title },
          { name: "citation_author", content: article.author },
          ...article.coAuthors.map((co) => ({
            name: "citation_author",
            content: co.name,
          })),
          {
            name: "citation_publication_date",
            content: formatScholarDate(article.createdAt, article.year),
          },
          { name: "citation_journal_title", content: journalDisplayTitle },
          { name: "citation_pdf_url", content: getDownloadUrl(article.file) },
          ...(article.content
            ? [{ name: "citation_fulltext_html_url", content: canonicalUrl }]
            : []),
        ]
      : [],
  });

  return (
    <div className="articles-page">
      {copied && (
        <Toast
          message="Citation copied to clipboard!"
          onClose={() => setCopied(false)}
        />
      )}

      <div className="articles-container">
        <button className="back-btn" onClick={() => navigate("/articles")}>
          <FaArrowLeft /> Back to Articles
        </button>

        {/* SKELETON LOADING STATE */}
        {loading && (
          <div className="article-detail-layout">
            <div className="article-main-card">
              <div className="badge-group" style={{ marginBottom: "16px" }}>
                <div className="skeleton skeleton-badge" />
                <div className="skeleton skeleton-badge" />
              </div>
              <div
                className="skeleton skeleton-title"
                style={{ height: "36px", width: "90%" }}
              />
              <div
                className="skeleton skeleton-title"
                style={{ height: "36px", width: "65%" }}
              />
              <div
                className="skeleton"
                style={{ height: "160px", marginTop: "24px" }}
              />
            </div>

            <aside className="article-sidebar">
              <div className="sidebar-box">
                <div
                  className="skeleton skeleton-title"
                  style={{ width: "60%", height: "20px" }}
                />
                <div className="skeleton skeleton-text" />
                <div className="skeleton skeleton-text" />
              </div>
            </aside>
          </div>
        )}

        {/* ERROR / NOT FOUND STATE */}
        {!loading && (error || !article) && (
          <div className="state-box">
            <h3>Article Unavailable</h3>
            <p>{error || "We couldn't locate this manuscript."}</p>
            <button
              className="btn-sage-primary"
              onClick={() => navigate("/articles")}
            >
              Browse All Articles
            </button>
          </div>
        )}

        {/* MAIN ARTICLE VIEW */}
        {!loading && !error && article && (
          <div className="article-detail-layout">
            <main className="article-main-card">
              <div className="badge-group">
                <span className="badge-pill journal">
                  {journalDisplayTitle}
                </span>
                <span className="badge-pill type">{article.articleType}</span>
              </div>

              <h1 className="article-detail-title">{article.title}</h1>

              {/* Primary Action Buttons */}
              <div className="article-actions-bar">
                <a
                  href={getDownloadUrl(article.file)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-sage-primary"
                >
                  <FaDownload /> Download Manuscript
                </a>

                <button
                  className="btn-sage-outline"
                  onClick={handleCopyCitation}
                >
                  {copied ? <FaCheck /> : <FaCopy />}
                  {copied ? "Citation Copied!" : "Cite Article"}
                </button>

                {article.file && (
                  <button
                    className="btn-sage-outline"
                    onClick={() => navigate(`/articles/${slug}/pdf`)}
                  >
                    <FaEye /> View PDF
                  </button>
                )}
              </div>

              <div className="section-title-tag">Abstract</div>
              <div className="abstract-container">{article.abstract}</div>

              {article.content && (
                <>
                  <div className="section-title-tag">Full Text</div>
                  <ArticleContent content={article.content} />
                </>
              )}

              {/* Social Share Section */}
              <div className="share-panel">
                <div className="section-title-tag">
                  <FaShareAlt style={{ marginRight: "6px" }} /> Share This
                  Research
                </div>
                <div className="share-buttons-row">
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      article.title,
                    )}&url=${encodeURIComponent(canonicalUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="share-btn"
                  >
                    <FaTwitter color="#1DA1F2" /> Twitter / X
                  </a>

                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                      canonicalUrl,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="share-btn"
                  >
                    <FaLinkedin color="#0A66C2" /> LinkedIn
                  </a>

                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      canonicalUrl,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="share-btn"
                  >
                    <FaFacebook color="#1877F2" /> Facebook
                  </a>

                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `${article.title} - ${canonicalUrl}`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="share-btn"
                  >
                    <FaWhatsapp color="#25D366" /> WhatsApp
                  </a>
                </div>
              </div>
            </main>

            <aside className="article-sidebar">
              <div className="sidebar-box">
                <h3 className="sidebar-box-title">Author Information</h3>

                <div className="author-entry">
                  <span className="author-entry-name">{article.author}</span>
                  <a
                    href={`mailto:${article.email}`}
                    className="author-entry-email"
                  >
                    <FaEnvelope style={{ marginRight: "4px" }} />{" "}
                    {article.email}
                  </a>
                </div>

                {article.coAuthors.length > 0 && (
                  <div style={{ marginTop: "18px" }}>
                    <div
                      className="info-item-label"
                      style={{ marginBottom: "8px" }}
                    >
                      Co-Authors ({article.coAuthors.length})
                    </div>
                    {article.coAuthors.map((co) => (
                      <div key={co.email} className="author-entry">
                        <span className="author-entry-name">{co.name}</span>
                        <a
                          href={`mailto:${co.email}`}
                          className="author-entry-email"
                        >
                          <FaEnvelope style={{ marginRight: "4px" }} />{" "}
                          {co.email}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="sidebar-box">
                <h3 className="sidebar-box-title">Publication Details</h3>

                <div className="info-list">
                  <div className="info-item">
                    <div className="info-item-label">Manuscript ID</div>
                    <div className="info-item-val">{article.customId}</div>
                  </div>

                  <div className="info-item">
                    <div className="info-item-label">Published Date</div>
                    <div className="info-item-val" style={{ fontWeight: 600 }}>
                      <FaCalendarAlt
                        style={{
                          marginRight: "6px",
                          color: "var(--color-sage, #659377)",
                        }}
                      />
                      {formatFullDate(article.createdAt, article.year)}
                    </div>
                  </div>

                  <div className="info-item">
                    <div className="info-item-label">Issue</div>
                    <div className="info-item-val">Issue #{article.issue}</div>
                  </div>

                  <div className="info-item">
                    <div className="info-item-label">Country</div>
                    <div className="info-item-val">
                      <FaGlobe style={{ marginRight: "4px" }} />{" "}
                      {article.country}
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleDetails;
