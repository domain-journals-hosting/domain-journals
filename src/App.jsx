import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./Home";
import Nav from "./Nav";
import JournalsList from "./JournalsList";
import ManuscriptForm from "./ManuscriptForm";
import Contact from "./Contact";
import PublicationEthics from "./PublicationEthics";
import ReviewProcess from "./ReviewProcess";
import Support from "./Support";
import JournalsHome from "./JournalsHome";
import { CurrentIssue } from "./CurrentIssue";
import EditorialBoard from "./EditorialBoard";
import Missing from "./Missing";
import Success from "./Success";
import EditManuscript from "./EditManuscript";
import DeleteManuscript from "./DeleteManuscript";
import Archive from "./Archive";

function App() {
  return (
    <div className="App">
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/journals" element={<JournalsList />} />

        <Route path="/journals/:slug" element={<JournalsHome />} />
        <Route
          path="/journals/:slug/current-issue"
          element={<CurrentIssue />}
        />
        <Route
          path="/journals/:slug/editorial-board"
          element={<EditorialBoard />}
        />
        <Route path="/journals/:slug/archive" element={<Archive />} />
        <Route path="/submit" element={<ManuscriptForm />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/publication-ethics" element={<PublicationEthics />} />
        <Route path="/review-process" element={<ReviewProcess />} />
        <Route path="/support" element={<Support />} />
        <Route path="/success" element={<Success />} />
        <Route path="/edit/:id" element={<EditManuscript />} />
        <Route path="/delete/:id" element={<DeleteManuscript />} />
        <Route path="/*" element={<Missing />} />
      </Routes>
    </div>
  );
}

export default App;
