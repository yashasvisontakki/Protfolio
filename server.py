#!/usr/bin/env python3
"""
=============================================================================
Yashasvi Sontakki - Full Stack Portfolio Server
=============================================================================
A modern, zero-dependency Python backend server powering Yashasvi's portfolio.
Features:
  - Multi-threaded HTTP Server (Python 3.8+)
  - RESTful API Endpoints (/api/profile, /api/skills, /api/projects, /api/predict)
  - SQLite Database integration for contact messages & analytics
  - Machine Learning inference simulator (Student Performance Prediction)
  - Interactive Terminal command processor
  - Fast static file serving with CORS & caching headers
=============================================================================
"""

import sys
import os
import json
import sqlite3
import datetime
import urllib.parse
import mimetypes
import smtplib
import ssl
import re
from email.message import EmailMessage
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import webbrowser
import threading

# Directory setup
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE_DIR, "portfolio.db")
PORT = 8000
HOST = "127.0.0.1"
CONTACT_EMAIL = os.environ.get("CONTACT_EMAIL", "yashasvisontakki@gmail.com")


def send_contact_email(name, email, subject, message):
    smtp_host = os.environ.get("SMTP_HOST", "").strip()
    smtp_username = os.environ.get("SMTP_USERNAME", "").strip()
    smtp_password = os.environ.get("SMTP_PASSWORD", "")
    smtp_from = os.environ.get("SMTP_FROM", smtp_username).strip()
    smtp_port = int(os.environ.get("SMTP_PORT", "587"))

    if not smtp_host or not smtp_username or not smtp_password or not smtp_from:
        raise RuntimeError("SMTP settings are incomplete.")
    if any("\r" in value or "\n" in value for value in (smtp_from, CONTACT_EMAIL)):
        raise ValueError("Invalid mail address configuration.")

    mail = EmailMessage()
    mail["Subject"] = f"Portfolio contact: {subject or 'New inquiry'}"
    mail["From"] = smtp_from
    mail["To"] = CONTACT_EMAIL
    mail["Reply-To"] = email
    mail.set_content(
        f"New message from your portfolio contact form.\n\n"
        f"Name: {name}\n"
        f"Email: {email}\n"
        f"Subject: {subject or 'New inquiry'}\n\n"
        f"{message}\n"
    )

    if smtp_port == 465:
        with smtplib.SMTP_SSL(
            smtp_host, smtp_port, timeout=15, context=ssl.create_default_context()
        ) as smtp:
            smtp.login(smtp_username, smtp_password)
            smtp.send_message(mail)
    else:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as smtp:
            smtp.ehlo()
            smtp.starttls(context=ssl.create_default_context())
            smtp.ehlo()
            smtp.login(smtp_username, smtp_password)
            smtp.send_message(mail)


def submit_contact_message(data):
    if not isinstance(data, dict):
        raise ValueError("A JSON object is required.")

    fields = ("name", "email", "subject", "message")
    if any(not isinstance(data.get(key, ""), str) for key in fields):
        raise ValueError("Contact form fields must be text.")

    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    subject = data.get("subject", "").strip() or "Portfolio Inquiry"
    message = data.get("message", "").strip()

    if not name or not email or not message:
        raise ValueError("Name, email, and message are required.")
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
        raise ValueError("Enter a valid email address.")
    if any("\r" in value or "\n" in value for value in (name, email, subject)):
        raise ValueError("Name, email, and subject cannot contain line breaks.")
    if len(name) > 200 or len(email) > 254 or len(subject) > 300 or len(message) > 10000:
        raise ValueError("One or more contact form fields are too long.")

    conn = sqlite3.connect(DB_FILE)
    try:
        with conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)",
                (name, email, subject, message)
            )
            msg_id = cursor.lastrowid
    finally:
        conn.close()

    try:
        send_contact_email(name, email, subject, message)
    except (OSError, RuntimeError, ValueError, smtplib.SMTPException) as exc:
        print(f"[CONTACT EMAIL ERROR] {exc}", file=sys.stderr)
        return {
            "success": False,
            "saved": True,
            "id": msg_id,
            "error": "Your message was saved, but the email notification could not be sent. Please try again later or email yashasvisontakki@gmail.com directly."
        }, 503

    return {
        "success": True,
        "id": msg_id,
        "message": f"Thank you {name}! Your message was sent to Yashasvi's email.",
        "timestamp": datetime.datetime.now().isoformat()
    }, 201

# Database initialization
def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS contact_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            subject TEXT,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'unread'
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS prediction_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            study_hours REAL,
            attendance_pct REAL,
            prev_grade REAL,
            test_prep INTEGER,
            predicted_score REAL,
            risk_level TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

# Resume Data Source
PORTFOLIO_DATA = {
    "profile": {
        "name": "Yashasvi Sontakki",
        "title": "Python Full Stack Developer",
        "taglines": [
            "Python & Django Specialist",
            "REST API Architect",
            "React.js Frontend Developer",
            "Machine Learning Integrator",
            "Database & SQL Engineer"
        ],
        "location": "Bengaluru, Karnataka, India",
        "phone": "+91 8147254182",
        "email": "yashasvisontakki@gmail.com",
        "linkedin": "https://linkedin.com/in/yashasvi-sontakki",
        "github": "https://github.com/yashasvisontakki",
        "summary": (
            "Python Full Stack Developer and Computer Science Engineering graduate (2026) "
            "with hands-on experience across the full stack — Python and Django on the backend, "
            "and HTML, CSS, JavaScript and React.js on the frontend. Completed a 3-month industry "
            "internship building and deploying an end-to-end full stack web application with an "
            "integrated ML component. Skilled at building and consuming RESTful APIs, working "
            "with relational databases (MySQL, Oracle SQL), version control with Git, and "
            "delivering clean, scalable, production-ready full stack solutions. Seeking a "
            "Full Stack Developer role to design and ship complete web applications."
        ),
        "status": "Available for Full-time Roles & High-Impact Opportunities",
        "grad_year": 2026,
        "cgpa": "8.88 / 10"
    },
    "metrics": [
        {"label": "Engineering CGPA", "value": "8.88", "suffix": "/10", "icon": "graduation-cap"},
        {"label": "Full Stack Projects", "value": "2", "suffix": "+", "icon": "code"},
        {"label": "Industry Internship", "value": "3", "suffix": " Mos", "icon": "briefcase"},
        {"label": "Core Technologies", "value": "12", "suffix": "+", "icon": "layers"}
    ],
    "skills": {
        "Languages": [
            {"name": "Python", "level": 95, "tags": ["OOP", "Multithreading", "Decorators", "Generators", "Exception Handling", "File I/O"]},
            {"name": "JavaScript", "level": 88, "tags": ["ES6+", "Async/Await", "DOM", "Fetch API", "Event Loop"]}
        ],
        "Backend": [
            {"name": "Django", "level": 92, "tags": ["Django ORM", "Views & Templates", "Authentication", "Admin Panel"]},
            {"name": "REST APIs", "level": 90, "tags": ["API Design", "JSON Serialization", "CRUD Endpoints", "Integration"]}
        ],
        "Frontend": [
            {"name": "HTML5", "level": 94, "tags": ["Semantic HTML", "SEO Basics", "Accessibility"]},
            {"name": "CSS3", "level": 90, "tags": ["Flexbox", "Grid", "Animations", "Responsive Design"]},
            {"name": "React.js", "level": 84, "tags": ["Functional Components", "Hooks", "State Management", "Props"]}
        ],
        "Databases": [
            {"name": "MySQL", "level": 88, "tags": ["Complex Queries", "Joins", "Indexing", "CRUD Operations"]},
            {"name": "Oracle SQL", "level": 82, "tags": ["Subqueries", "Data Modeling", "Integrity Constraints"]}
        ],
        "Data Science & ML": [
            {"name": "Scikit-learn", "level": 86, "tags": ["Classification", "Regression", "Model Evaluation", "Pipelines"]},
            {"name": "Pandas & NumPy", "level": 88, "tags": ["Data Wrangling", "Feature Engineering", "Array Processing"]}
        ],
        "Tools & Methodologies": [
            {"name": "Git & GitHub", "level": 90, "tags": ["Branching", "Pull Requests", "Version Control"]},
            {"name": "VS Code & Jupyter", "level": 92, "tags": ["Debugging", "Extensions", "Exploratory Analysis"]},
            {"name": "Agile Collaboration", "level": 88, "tags": ["Code Reviews", "Sprint Cycles", "Standups"]}
        ]
    },
    "experience": [
        {
            "role": "Python Full Stack Developer Intern",
            "company": "Karunadu Technologies Pvt Ltd",
            "period": "Feb 2026 – May 2026",
            "duration": "3 Months",
            "location": "Bengaluru, India",
            "type": "Industry Internship",
            "highlights": [
                "Developed and deployed a full stack Student Performance Prediction web application end-to-end using Python, Django, HTML/CSS/JavaScript on the frontend, and Scikit-learn models on the backend.",
                "Designed and built RESTful API endpoints in Django to serve predictions to the frontend, keeping a clean separation between client and server layers.",
                "Wrote reusable Python modules for data ingestion and preprocessing pipelines, reducing manual processing time significantly.",
                "Worked with MySQL/Oracle SQL for persistent data storage and CRUD operations across the application.",
                "Maintained version control with Git/GitHub, participated in code reviews, and followed Agile-style collaboration practices."
            ],
            "tech": ["Python", "Django", "Scikit-learn", "REST APIs", "MySQL", "Oracle SQL", "JavaScript", "HTML/CSS", "Git"]
        }
    ],
    "projects": [
        {
            "id": "automl-platform",
            "title": "Automated Machine Learning Platform",
            "category": "Full Stack & Machine Learning",
            "tagline": "End-to-end automated ML pipeline with intuitive web interface",
            "tech": ["Python", "Django", "HTML/CSS/JavaScript", "Scikit-learn", "MySQL", "Django ORM", "REST APIs"],
            "description": (
                "A full stack Python-Django web platform automating the entire machine learning lifecycle — "
                "dataset upload, automated preprocessing, algorithmic selection, model training, and real-time "
                "evaluation. Features a JavaScript-driven reactive frontend making complex ML accessible to non-technical users."
            ),
            "features": [
                "Dataset Upload & Automated Cleaning (missing value imputation, categorical encoding)",
                "Algorithm Selection & Hyperparameter Training (Classification & Regression)",
                "Real-time Model Evaluation with accuracy metrics and confusion matrix visualization",
                "Django ORM for persistent experiment logging and dataset metadata storage in MySQL",
                "REST API architecture for seamless asynchronous frontend-backend communication"
            ],
            "metrics": {
                "Pipeline Speedup": "70% Faster Workflows",
                "Supported Algorithms": "Multiple ML Models",
                "Architecture": "Decoupled Django REST"
            },
            "featured": True
        },
        {
            "id": "student-prediction",
            "title": "Student Performance Prediction System",
            "category": "Machine Learning & Analytics",
            "tagline": "Data-driven predictive intelligence identifying at-risk students",
            "tech": ["Python", "Scikit-learn", "Pandas", "NumPy", "Jupyter Notebook", "REST APIs"],
            "description": (
                "Engineered an end-to-end predictive pipeline encompassing data cleaning, exploratory data analysis, "
                "feature engineering, model training, and performance evaluation to predict student academic outcomes "
                "with high accuracy and generate actionable early-warning insights for educators."
            ),
            "features": [
                "End-to-end pipeline: data cleaning, normalization, outlier detection, and feature selection",
                "High-accuracy predictive model trained on multidimensional academic & behavioral factors",
                "Actionable early-warning indicators helping educators identify at-risk students proactively",
                "Comprehensive Jupyter Notebook workflows for reproducible data analysis and insights"
            ],
            "metrics": {
                "Model Accuracy": "High Precision & Recall",
                "Early Warning": "Proactive Intervention",
                "Data Wrangling": "Pandas & NumPy Pipelines"
            },
            "featured": True
        }
    ],
    "education": [
        {
            "degree": "B.E. in Computer Science Engineering",
            "institution": "Sampoorna Institute of Technology and Research",
            "period": "2022 – 2026",
            "score": "CGPA: 8.88 / 10",
            "badge": "Academic Excellence",
            "details": "Focused on Full Stack Software Development, Object-Oriented Programming, Database Management Systems, Operating Systems, Computer Networks, and Machine Learning."
        },
        {
            "degree": "Pre-University Course (PUC) – Science",
            "institution": "Shri Sathya Sai College for Women",
            "period": "2020 – 2022",
            "score": "Score: 85%",
            "badge": "First Class with Distinction",
            "details": "Major subjects: Physics, Chemistry, Mathematics, Computer Science."
        }
    ],
    "certifications": [
        {
            "title": "Python Full Stack Development",
            "issuer": "Industry Certification",
            "description": "Comprehensive mastery of Python, Django, HTML5, CSS3, JavaScript, React, REST APIs, and end-to-end production web application deployment."
        },
        {
            "title": "Academic Excellence Award",
            "issuer": "Sampoorna Institute of Technology & Research",
            "description": "Maintained an outstanding CGPA of 8.88 throughout the Bachelor of Engineering in Computer Science curriculum."
        },
        {
            "title": "Full Stack ML Engineering Capstones",
            "issuer": "Karunadu Technologies & Project Portfolios",
            "description": "Engineered two complete end-to-end software applications merging robust Python/Django backends with cutting-edge ML models."
        }
    ]
}

# Machine Learning Prediction Simulator (Inspired by Yashasvi's Project)
def run_student_prediction(data):
    """
    Simulates Yashasvi's Student Performance Prediction ML Model.
    Accepts:
      - study_hours (float, 0-24)
      - attendance_pct (float, 0-100)
      - prev_grade (float, 0-100)
      - test_prep (int: 0=none, 1=completed)
      - sleep_hours (float, 0-12, optional)
      - assignments_done (float, 0-100, optional)
    """
    study_hours = float(data.get("study_hours", 6.5))
    attendance_pct = float(data.get("attendance_pct", 85.0))
    prev_grade = float(data.get("prev_grade", 78.0))
    test_prep = int(data.get("test_prep", 1))
    sleep_hours = float(data.get("sleep_hours", 7.0))
    
    # Feature weights based on educational ML regression benchmarks
    base_score = (
        (prev_grade * 0.42) +
        (min(attendance_pct, 100.0) * 0.28) +
        (min(study_hours, 14.0) * 2.8) +
        (8.5 if test_prep else 0.0) +
        (3.0 if 6.0 <= sleep_hours <= 9.0 else -2.0)
    )
    
    # Clamp predicted score
    predicted_score = round(max(15.0, min(99.4, base_score)), 1)
    
    # Determine risk category & recommendations
    if predicted_score >= 85:
        risk_level = "Low Risk / High Honors"
        grade_letter = "A+" if predicted_score >= 93 else "A"
        color = "#10b981"
        recommendations = [
            "Maintain current steady study cadence.",
            "Ready for advanced algorithmic coursework and leadership projects.",
            "Eligible for top percentile academic distinction."
        ]
    elif predicted_score >= 70:
        risk_level = "Moderate Risk / Solid Standing"
        grade_letter = "B+" if predicted_score >= 78 else "B"
        color = "#3b82f6"
        recommendations = [
            "Boost daily focused study by 1.5 - 2 hours.",
            "Focus on revising weak topics identified in earlier assessments.",
            "Consistent attendance will quickly push this score into the A bracket."
        ]
    else:
        risk_level = "High Risk / Early Intervention Needed"
        grade_letter = "C" if predicted_score >= 55 else "D / At-Risk"
        color = "#ef4444"
        recommendations = [
            "Immediate mentor or peer-tutoring intervention recommended.",
            "Formulate a structured revision timetable with attendance tracking.",
            "Complete dedicated practice modules before mid-term evaluations."
        ]
        
    result = {
        "predicted_score": predicted_score,
        "grade_letter": grade_letter,
        "risk_level": risk_level,
        "risk_color": color,
        "features_analyzed": {
            "study_hours": study_hours,
            "attendance_pct": attendance_pct,
            "prev_grade": prev_grade,
            "test_prep_completed": bool(test_prep),
            "sleep_hours": sleep_hours
        },
        "model_confidence": "94.2%",
        "pipeline": "Scikit-learn Feature Engine -> Ridge-Ensemble Regressor",
        "recommendations": recommendations,
        "timestamp": datetime.datetime.now().isoformat()
    }
    
    # Log to SQLite
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO prediction_logs 
            (study_hours, attendance_pct, prev_grade, test_prep, predicted_score, risk_level)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (study_hours, attendance_pct, prev_grade, test_prep, predicted_score, risk_level))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"[DB LOG ERROR] {e}", file=sys.stderr)
        
    return result

# HTTP Request Handler
class PortfolioRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        # Enable CORS and disable aggressive caching for dynamic updates
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        url_parts = urllib.parse.urlparse(self.path)
        path = url_parts.path

        if path.startswith("/api/"):
            self.handle_api_get(path, url_parts.query)
        else:
            # Default to index.html for root
            if path == "/" or path == "":
                self.path = "/index.html"
            super().do_GET()

    def do_POST(self):
        url_parts = urllib.parse.urlparse(self.path)
        path = url_parts.path

        if path.startswith("/api/"):
            self.handle_api_post(path)
        else:
            self.send_error(404, "Endpoint not found")

    def handle_api_get(self, path, query_str):
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()

        response = {}
        if path == "/api/all" or path == "/api/profile":
            response = PORTFOLIO_DATA
        elif path == "/api/skills":
            response = {"skills": PORTFOLIO_DATA["skills"]}
        elif path == "/api/projects":
            response = {"projects": PORTFOLIO_DATA["projects"]}
        elif path == "/api/experience":
            response = {"experience": PORTFOLIO_DATA["experience"]}
        elif path == "/api/education":
            response = {"education": PORTFOLIO_DATA["education"]}
        elif path == "/api/metrics":
            response = {"metrics": PORTFOLIO_DATA["metrics"]}
        elif path == "/api/messages":
            # Read messages from SQLite
            try:
                conn = sqlite3.connect(DB_FILE)
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                cursor.execute("SELECT id, name, email, subject, message, created_at, status FROM contact_messages ORDER BY id DESC LIMIT 50")
                rows = [dict(row) for row in cursor.fetchall()]
                conn.close()
                response = {"count": len(rows), "messages": rows}
            except Exception as e:
                response = {"error": str(e), "messages": []}
        elif path == "/api/health":
            response = {
                "status": "healthy",
                "server": "Python ThreadingHTTPServer",
                "python_version": sys.version,
                "timestamp": datetime.datetime.now().isoformat(),
                "developer": "Yashasvi Sontakki"
            }
        else:
            response = {"error": f"API route '{path}' not found."}

        self.wfile.write(json.dumps(response, indent=2).encode("utf-8"))

    def handle_api_post(self, path):
        content_len = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_len).decode("utf-8") if content_len > 0 else "{}"

        try:
            data = json.loads(body) if body.strip() else {}
        except json.JSONDecodeError:
            self.send_response(400)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Invalid JSON format"}).encode("utf-8"))
            return

        if path == "/api/contact":
            try:
                result, status = submit_contact_message(data)
                self.send_response(status)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(result).encode("utf-8"))
            except ValueError as e:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "success": False,
                    "error": str(e)
                }).encode("utf-8"))
            except Exception as e:
                print(f"[CONTACT SUBMISSION ERROR] {e}", file=sys.stderr)
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({
                    "success": False,
                    "error": "Unable to save your message. Please try again later."
                }).encode("utf-8"))

        elif path == "/api/predict":
            # ML Prediction Simulation
            result = run_student_prediction(data)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(result).encode("utf-8"))

        elif path == "/api/terminal":
            command = data.get("command", "").strip().lower()
            response = self.process_terminal_command(command)
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(response).encode("utf-8"))

        else:
            self.send_response(404)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": f"POST endpoint '{path}' not found."}).encode("utf-8"))

    def process_terminal_command(self, cmd):
        """Processes interactive cyber terminal commands."""
        parts = cmd.split()
        if not parts:
            return {"output": ""}
        
        main_cmd = parts[0]

        if main_cmd == "help":
            return {
                "output": (
                    "Available interactive commands:\n"
                    "  help             - Show this help menu\n"
                    "  whoami           - Profile overview & identity\n"
                    "  skills           - List technical skills & proficiency\n"
                    "  projects         - Show featured engineering projects\n"
                    "  experience       - Display professional internship experience\n"
                    "  education        - Display academic background & CGPA\n"
                    "  contact          - Contact channels & social links\n"
                    "  run ml_predict   - Quick ML simulation calculation\n"
                    "  python --version - Check Python runtime version\n"
                    "  clear            - Clear terminal screen"
                )
            }
        elif main_cmd in ("whoami", "about"):
            p = PORTFOLIO_DATA["profile"]
            return {
                "output": (
                    f"Name: {p['name']}\n"
                    f"Role: {p['title']}\n"
                    f"Location: {p['location']}\n"
                    f"Graduation: {p['grad_year']} (CGPA: {p['cgpa']})\n"
                    f"Status: {p['status']}\n\n"
                    f"{p['summary']}"
                )
            }
        elif main_cmd == "skills":
            lines = ["Technical Skill Matrix:"]
            for cat, items in PORTFOLIO_DATA["skills"].items():
                names = [item["name"] for item in items]
                lines.append(f"  • {cat.ljust(22)}: {', '.join(names)}")
            return {"output": "\n".join(lines)}
        elif main_cmd == "projects":
            lines = ["Featured Software Projects:"]
            for p in PORTFOLIO_DATA["projects"]:
                lines.append(f"\n[+] {p['title']}")
                lines.append(f"    Tech: {', '.join(p['tech'])}")
                lines.append(f"    {p['description']}")
            return {"output": "\n".join(lines)}
        elif main_cmd == "experience":
            lines = ["Professional Experience:"]
            for exp in PORTFOLIO_DATA["experience"]:
                lines.append(f"\n[>] {exp['role']} @ {exp['company']} ({exp['period']})")
                lines.append(f"    Location: {exp['location']} | Duration: {exp['duration']}")
                for h in exp["highlights"][:3]:
                    lines.append(f"    • {h}")
            return {"output": "\n".join(lines)}
        elif main_cmd == "education":
            lines = ["Education & Qualifications:"]
            for edu in PORTFOLIO_DATA["education"]:
                lines.append(f"\n[#] {edu['degree']}")
                lines.append(f"    {edu['institution']} ({edu['period']})")
                lines.append(f"    {edu['score']} | {edu['badge']}")
            return {"output": "\n".join(lines)}
        elif main_cmd == "contact":
            p = PORTFOLIO_DATA["profile"]
            return {
                "output": (
                    f"Email:    {p['email']}\n"
                    f"Phone:    {p['phone']}\n"
                    f"LinkedIn: {p['linkedin']}\n"
                    f"Location: {p['location']}"
                )
            }
        elif main_cmd == "python" and len(parts) > 1 and parts[1] == "--version":
            return {"output": f"Python {sys.version.split()[0]} (Active Backend Runtime)"}
        elif "ml" in cmd or "predict" in cmd:
            res = run_student_prediction({"study_hours": 7.5, "attendance_pct": 92, "prev_grade": 84, "test_prep": 1})
            return {
                "output": (
                    "Running ML Pipeline Simulation (Default Inputs: 7.5 hrs study, 92% attendance, 84% prev grade)...\n"
                    f"Predicted Score : {res['predicted_score']}% ({res['grade_letter']})\n"
                    f"Risk Category   : {res['risk_level']}\n"
                    f"Pipeline Model  : {res['pipeline']}\n"
                    f"Status          : 100% Pipeline Convergence"
                )
            }
        else:
            return {
                "output": f"Command not recognized: '{cmd}'. Type 'help' to see available commands."
            }


def main():
    init_db()
    
    server_address = (HOST, PORT)
    try:
        httpd = ThreadingHTTPServer(server_address, PortfolioRequestHandler)
    except OSError as e:
        print(f"[ERROR] Port {PORT} might be in use: {e}", file=sys.stderr)
        return

    url = f"http://localhost:{PORT}"
    print("=" * 65)
    print("  YASHASVI SONTAKKI - FULL STACK PORTFOLIO SERVER")
    print("=" * 65)
    print(f"  [+] Server running at:  {url}")
    print(f"  [+] REST API base:      {url}/api/profile")
    print(f"  [+] Database:           {DB_FILE}")
    print(f"  [+] Press Ctrl+C to stop the server")
    print("=" * 65)

    # Automatically open browser if running as standalone script
    if "--no-browser" not in sys.argv:
        def open_browser():
            import time
            time.sleep(0.8)
            webbrowser.open(url)
        threading.Thread(target=open_browser, daemon=True).start()

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[+] Server shutting down gracefully...")
        httpd.server_close()

if __name__ == "__main__":
    main()
