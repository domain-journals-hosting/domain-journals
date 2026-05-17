import { Helmet } from "react-helmet";

const Support = () => {
  return (
    <div style={{ padding: "20px" }}>
      <Helmet>
        <title>Support Domain Journals</title>
        <meta
          name="description"
          content="Support Domain Journals and help us continue providing free open access publishing for researchers worldwide."
        />
        <link rel="canonical" href="https://www.domainjournals.com/support" />
      </Helmet>
      <h1>Support</h1>
      <p>Sources of support for the journal include:</p>

      <ul>
        <li>
          <strong>Article Processing Charges (APCs):</strong> The journal
          charges authors a fee to publish their articles.
        </li>
        <li>
          <strong>Grants and Funding Agencies:</strong> The journal may receive
          funding from government bodies, foundations, or other organizations to
          support research and publication activities.
        </li>
        <li>
          <strong>Advertising and Sponsorships:</strong> Revenue may be
          generated through advertising or sponsorships from relevant industries
          such as pharmaceutical or medical device companies.
        </li>
      </ul>
    </div>
  );
};

export default Support;
