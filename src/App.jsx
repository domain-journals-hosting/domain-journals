import { Route, Routes, useLocation } from "react-router-dom";
import Home from "./components/Home";
import Nav from "./components/Nav";
import JournalsList from "./journal/JournalsList";
import ManuscriptForm from "./manuscript/ManuscriptForm";
import Contact from "./components/Contact";
import PublicationEthics from "./components/PublicationEthics";
import ReviewProcess from "./components/ReviewProcess";
import Support from "./components/Support";
import JournalsHome from "./journal/JournalsHome";
import { CurrentIssue } from "./journal/CurrentIssue";
import EditorialBoard from "./journal/EditorialBoard";
import Missing from "./components/Missing";
import Success from "./components/Success";
import EditManuscript from "./manuscript/EditManuscript";
import DeleteManuscript from "./manuscript/DeleteManuscript";
import Archive from "./journal/Archive";
import Guidelines from "./journal/Guidelines";

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
        <Route path="/journals/:slug/guidelines" element={<Guidelines />} />
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
