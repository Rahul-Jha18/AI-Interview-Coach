import { Routes, Route, Navigate } from "react-router-dom";
import SelectField from "./pages/SelectField.jsx";
import Interview from "./pages/Interview.jsx";
import Result from "./pages/Result.jsx";
import Nav from "./components/Layout/Nav.jsx";
import Footer from "./components/Layout/Footer.jsx";

export default function App() {
  return (
    <div className="app-layout">
      <Nav />

      <main className="app-content">
        <Routes>
          <Route path="/" element={<SelectField />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/result" element={<Result />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
