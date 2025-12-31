export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-left">
          <h4>AI Interview Coach</h4>
          <p className="muted">
            My first AI-powered full-stack project built to simulate real interview experiences.
          </p>
        </div>

        <div className="footer-right">
          <p className="muted">
            © {new Date().getFullYear()} Rahul Jha
          </p>
          <p className="muted">
            Built with React, Node.js & AI
          </p>
        </div>
      </div>
    </footer>
  );
}
