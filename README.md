# Yashasvi Sontakki - Python Full Stack Developer Portfolio

An interactive, creatively animated full stack portfolio application engineered with **Python**, **HTML5**, **CSS3**, and **JavaScript** based on the professional resume of **Yashasvi Sontakki**.

---

## 🌟 Key Highlights & Features

1. **Python Full-Stack Backend Architecture**
   - **Zero-Dependency Core (`server.py`)**: Uses Python's built-in `ThreadingHTTPServer` and `sqlite3` to deliver lightning-fast static file serving and JSON REST APIs without requiring external pip packages.
   - **Alternative Flask Backend (`app_flask.py`)**: Ready for Flask/WSGI deployments.
   - **SQLite Database (`portfolio.db`)**: Automatically stores contact inquiries and ML inference logs.

2. **Creative Visuals & Animations**
   - **Interactive Particle & Neural Constellation Canvas**: High-performance HTML5 canvas with floating nodes that connect dynamically, interact with the mouse pointer, and emit shockwave pulses on click.
   - **Dynamic Typewriter Header**: Loops through Yashasvi's core technical specialties with blinking cursor.
   - **Interactive 3D Tilt Cards**: Real-time perspective transforms on project and code cards based on mouse coordinates.
   - **Cyber/Glassmorphic Design**: Modern dark theme with glowing neon accents, ambient radial flares, and smooth scroll reveals.
   - **Multi-Theme Engine**: Switch between *Cyber Cyan* (default), *Violet Matrix*, and *Emerald Tech* on the fly.
   - **Procedural Web Audio Synthesizer**: Pure Web Audio API procedural sound engine (typing clicks, harmonic chimes, hover blips) with mute/unmute control.

3. **Interactive Live Project Showcase: Machine Learning Lab**
   - Inspired directly by Yashasvi's internship and projects (**Student Performance Prediction System** & **Automated ML Platform**).
   - Tweak daily study hours, class attendance, previous grades, and test prep toggles with interactive sliders.
   - Executes real-time predictive ML regression logic against Python's `/api/predict` endpoint, rendering an animated radial progress gauge, letter grade, risk tier, and early-intervention insights.

4. **Embedded Cyber Python Terminal**
   - Interactive developer CLI shell emulator (`yashasvi@portfolio:~$`).
   - Supports keyboard input, command history (Up/Down arrows), and one-click quick action chips (`whoami`, `skills`, `projects`, `experience`, `run ml_predict`, `education`, `contact`, `clear`).

5. **Complete Resume Representation**
   - **Professional Summary**: Highlights Python/Django full-stack engineering and 2026 graduation.
   - **Work Experience**: Python Full Stack Developer Intern at Karunadu Technologies Pvt Ltd (Feb 2026 – May 2026) with all bullet points.
   - **Projects**: Automated Machine Learning Platform & Student Performance Prediction System.
   - **Education**: B.E. in Computer Science Engineering (CGPA: 8.88 / 10) & Pre-University Course (85%).
   - **Skills Taxonomy**: Filterable skills matrix with animated proficiency bars.
   - **Direct Contact Links**: Email links open a Gmail compose window addressed to Yashasvi; phone and LinkedIn links are also provided.
   - **Resume Quick Viewer**: In-page modal with 1-click print / PDF export.

---

## 🚀 How to Run the Portfolio

### Method 1: Using Built-in Python Server (Recommended - Zero Dependencies)
Runs on any system with Python 3.8+ installed (no `pip install` required!):

```powershell
# Navigate to the portfolio folder
cd "C:\Users\Yashasvi N S\.gemini\antigravity\scratch\yashasvi-portfolio"

# Launch the server
python server.py
```
Or simply double-click **`run.bat`** on Windows!

The server will automatically start at **`http://localhost:8000`** and open your default browser.

### Configure Contact Form Email

The optional Python contact API sends mail using SMTP. Set these environment variables before starting either backend; for Gmail, use an app password rather than your normal account password:

```powershell
$env:SMTP_HOST = "smtp.gmail.com"
$env:SMTP_PORT = "587"
$env:SMTP_USERNAME = "your-sending-address@gmail.com"
$env:SMTP_PASSWORD = "your-16-character-app-password"
$env:CONTACT_EMAIL = "yashasvisontakki@gmail.com"
python server.py
```

`CONTACT_EMAIL` defaults to `yashasvisontakki@gmail.com`. `SMTP_FROM` is optional and defaults to `SMTP_USERNAME`. Port `587` uses STARTTLS; port `465` uses implicit TLS. Configure the same variables in your hosting provider's environment settings for deployment. Never put SMTP credentials in frontend code or commit them to the repository. The website's public contact links open Gmail directly and do not require a backend.

### Method 2: Using Flask Backend
If you prefer running with Flask:

```powershell
pip install -r requirements.txt
python app_flask.py
```

### Method 3: Standalone Browser Mode
You can open `index.html` directly for a static preview. Email links open a Gmail compose window addressed to `yashasvisontakki@gmail.com`; the visitor must press Send to deliver their message. This also works when the static site is hosted publicly without a Python backend.

### Publish Globally with GitHub Pages

The included `.github/workflows/pages.yml` deploys the static portfolio whenever code is pushed to the `main` or `master` branch. Push this project to a GitHub repository, then open **Settings → Pages** and set the build and deployment source to **GitHub Actions**. After the workflow completes, GitHub provides a public URL under the repository's **Settings → Pages**. The workflow publishes only `index.html`, `css/`, and `js/`; it does not publish the Python backend, virtual environment, or SQLite database.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/profile` | Returns Yashasvi's full developer profile, metrics, and background |
| `GET` | `/api/skills` | Returns categorized skill matrix and competencies |
| `GET` | `/api/projects` | Returns project descriptions, tech stacks, and features |
| `GET` | `/api/experience` | Returns professional internship history |
| `POST` | `/api/predict` | Runs student performance prediction ML regression model |
| `POST` | `/api/contact` | Saves the inquiry to SQLite and emails it to the configured contact address |
| `GET` | `/api/messages` | Retrieves submitted contact inquiries |
| `POST` | `/api/terminal` | Executes simulated terminal commands |
| `GET` | `/api/health` | Health check and server status |

---

## 📂 Project Structure

```
yashasvi-portfolio/
│
├── server.py              # Multi-threaded Python HTTP server with REST APIs & SQLite
├── app_flask.py           # Alternative Flask web server
├── requirements.txt       # Optional Flask dependencies
├── run.bat                # Windows 1-click startup script
├── index.html             # Main portfolio single-page application
│
├── css/
│   ├── style.css          # Design system, glassmorphism, responsive styles
│   └── animations.css     # Keyframes, laser scans, pulses, 3D transforms
│
├── js/
│   ├── main.js            # App coordinator, audio synthesizer, typewriter, tilt
│   ├── canvas-animation.js# Interactive particle constellation & neural network canvas
│   ├── terminal.js        # Interactive CLI terminal emulator
│   ├── ml-demo.js         # Student performance prediction simulator
│   └── api-client.js      # REST API client bridge with offline fallback
│
└── README.md              # Project documentation
```

---

## 👩‍💻 Author
**Yashasvi Sontakki**
- 📍 Bengaluru, Karnataka, India
- 📧 yashasvisontakki@gmail.com
- 📱 +91 8147254182
- 🔗 [LinkedIn Profile](https://linkedin.com/in/yashasvi-sontakki)
- 🎓 B.E. Computer Science Engineering (CGPA: 8.88 / 10)
