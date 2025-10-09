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
import TrackManuscript from "./manuscript/TrackManuscript";
import Pay from "./manuscript/Pay";
import PaymentSuccess from "./components/PaymentSuccess";
import NewIssue from "./admins/NewIssue";
import UsersList from "./admins/UsersList";
import AdminForgotPW from "./admins/AdminForgotPW";
import ResetAdminPW from "./admins/ResetAdminPW";
import NewReview from "./components/NewReview";
import Messages from "./admins/Messages";
import Footer from "./components/Footer";
import NewsletterSender from "./admins/NewsLetterSender";
import AuditReviews from "./admins/AuditReviews";
import { useEffect, useState } from "react";
import ManuscriptView from "./manuscript/ManuscriptView";
import Courses from "./components/Courses";
import NewCourse from "./admins/NewCourse";
import Payments from "./components/Payments";
import Course from "./components/Course";
import EditCourse from "./admins/EditCourse";
import ContentPage from "./components/ContentPage";
import Exam from "./components/Exam";
import ExamForm from "./admins/ExamForm";
import EditExamForm from "./admins/EditExamForm";
import TakeExam from "./components/TakeExam";
import ExamResult from "./components/ExamResult";
import AllResults from "./components/AllResults";
import CheckResults from "./admins/CheckResults";

function App() {
  const location = useLocation();
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const isJournalsPage = location.pathname.startsWith("/journals/");
  const isHomePage = location.pathname === "/";
  const showNav = !isJournalsPage && !isHomePage;

  useEffect(() => {
    const isHomepage = location.pathname === "/";

    if (!isHomepage) {
      setIsHeroVisible(false);
    }
  }, [location.pathname]);
  return (
    <div className="App">
      <Nav isHeroVisible={isHeroVisible} />
      <main style={{ paddingTop: !showNav ? 0 : "70px" }}>
        <Routes>
          <Route
            path="/"
            element={<Home setIsHeroVisible={setIsHeroVisible} />}
          />
          <Route path="/content" element={<ContentPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/journals" element={<JournalsList />} />
          <Route path="/view" element={<ManuscriptView />} />

          <Route path="/journals/:slug" element={<JournalsHome />} />
          <Route
            path="/journals/:slug/current-issue"
            element={<CurrentIssue />}
          />

          <Route
            path="/journals/:slug/editorial-board"
            element={<EditorialBoard />}
          />
          <Route element={<RequireUserAuth />}>
            <Route path="/admin/all" element={<UsersList />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/review" element={<ReviewManuscripts />} />
            <Route path="/admin/message" element={<Messages />} />
          </Route>
          <Route path="/admin/forgot" element={<AdminForgotPW />} />
          <Route path="/admin/reset" element={<ResetAdminPW />} />
          <Route element={<RequireUserAuth allowedRoles={["admin"]} />}>
            <Route path="/admin/courses" element={<NewCourse />} />
            <Route path="/admin/invite" element={<InviteUser />} />
            <Route path="admin/audit" element={<AuditReviews />} />
            <Route path="/admin/newsletter" element={<NewsletterSender />} />
            <Route path="/check-results" element={<CheckResults />} />
            <Route path="/admin/issue" element={<NewIssue />} />
            <Route path="/admin/payments" element={<Payments />} />
          </Route>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/invite/:token" element={<CompleteInvite />} />
          <Route element={<RequireAuth />}>
            <Route path="/new-exam/:courseId" element={<ExamForm />} />
            <Route path="/edit-exam/:courseId" element={<EditExamForm />} />
            <Route path="/take-exam/:courseId" element={<TakeExam />} />
            <Route path="/exam/:courseId" element={<Exam />} />
            <Route path="/result/:examId" element={<ExamResult />} />
            <Route path="/editCourse/:courseId" element={<EditCourse />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:courseId" element={<Course />} />
            <Route path="/submit" element={<ManuscriptForm />} />
            <Route path="/author" element={<AuthorProfile />} />
            <Route path="/review" element={<NewReview />} />
            <Route path="/results" element={<AllResults />} />
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
          <Route path="/edit/:token" element={<EditManuscript />} />
          <Route path="/delete/:token" element={<DeleteManuscript />} />
          <Route path="/status/:id" element={<TrackManuscript />} />
          <Route path="/pay/:manuscriptId" element={<Pay />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/*" element={<Missing />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
