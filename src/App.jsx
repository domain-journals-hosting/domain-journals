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
import RequireAuth from "./components/RequireAuth";
import Signup from "./components/Signup";
import AuthorProfile from "./components/AuthorProfile";
import Login from "./components/Login";
import AdminLogin from "./admins/Login";
import ResetPassword from "./components/ResetPassword";
import ForgotPw from "./components/ForgotPw";
import InviteUser from "./admins/InviteUser";
import CompleteInvite from "./admins/CompleteInvite";
import Dashboard from "./admins/Dashboard";
import RequireUserAuth from "./admins/RequireUserAuth";
import Unauthorized from "./components/Unauthorized";
import ReviewManuscripts from "./admins/ReviewManuscripts";

function App() {
  return (
    <div className="App">
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
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
        <Route element={<RequireUserAuth allowedRoles={["editor", "admin"]} />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/review" element={<ReviewManuscripts />} />
        </Route>
        <Route element={<RequireUserAuth allowedRoles={["admin"]} />}>
          <Route path="/admin/invite" element={<InviteUser />} />
        </Route>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/invite/:token" element={<CompleteInvite />} />

        <Route element={<RequireAuth />}>
          <Route path="/submit" element={<ManuscriptForm />} />
          <Route path="/author" element={<AuthorProfile />} />
        </Route>
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot" element={<ForgotPw />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route path="/journals/:slug/guidelines" element={<Guidelines />} />
        <Route path="/journals/:slug/archive" element={<Archive />} />
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
