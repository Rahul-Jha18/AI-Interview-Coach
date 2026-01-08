export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-left">
          <h4>AI Interview Coach</h4>
          <p className="muted">
            My first AI-powered fully functional project built to simulate real interview experiences.
          </p>

          <a
            href="mailto:rahuljha@gmail.com"
            className="footer-mail"
          >
            📧 rj8563@gmail.com
          </a>
        </div>

        <div className="footer-right">
          <div className="footer-socials">
            <a
              href="https://github.com/yourusername"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/yourusername"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
            <a
              href="https://twitter.com/yourusername"
              target="_blank"
              rel="noreferrer"
            >
              Twitter
            </a>
          </div>

          <p className="muted">
            © {new Date().getFullYear()} Rahul Jha
          </p>
          <p className="muted">
            Built with React, JavaScript & Groq AI
          </p>
        </div>
      </div>
    </footer>
  );
}
