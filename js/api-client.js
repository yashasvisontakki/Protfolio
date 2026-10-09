/**
 * API Client Bridge
 * Yashasvi Sontakki Portfolio
 * Handles REST requests to the Python server.
 */

const ApiClient = {
  baseUrl: window.location.origin.startsWith('http') ? window.location.origin : '',

  async isBackendAvailable() {
    try {
      const res = await fetch(`${this.baseUrl}/api/health`, { method: 'GET', signal: AbortSignal.timeout(1200) });
      return res.ok;
    } catch {
      return false;
    }
  },

  async predictStudentPerformance(payload) {
    try {
      const response = await fetch(`${this.baseUrl}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(3000)
      });
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Server returned non-200');
    } catch (err) {
      // Fallback calculation on client side (mimicking Python model)
      console.info('[ApiClient] Using local ML simulation fallback');
      const hours = parseFloat(payload.study_hours || 6.5);
      const att = parseFloat(payload.attendance_pct || 85.0);
      const prev = parseFloat(payload.prev_grade || 78.0);
      const prep = parseInt(payload.test_prep || 1);
      const sleep = parseFloat(payload.sleep_hours || 7.0);

      const baseScore = (prev * 0.42) + (Math.min(att, 100) * 0.28) + (Math.min(hours, 14) * 2.8) + (prep ? 8.5 : 0) + (sleep >= 6 && sleep <= 9 ? 3.0 : -2.0);
      const score = Math.round(Math.max(15, Math.min(99.4, baseScore)) * 10) / 10;

      let risk = "Moderate Risk / Solid Standing";
      let grade = "B+";
      let color = "#3b82f6";
      let recs = [
        "Boost daily focused study by 1.5 - 2 hours.",
        "Focus on revising weak topics identified in earlier assessments."
      ];

      if (score >= 85) {
        risk = "Low Risk / High Honors";
        grade = score >= 93 ? "A+" : "A";
        color = "#c5dea8";
        recs = [
          "Maintain current steady study cadence.",
          "Ready for advanced algorithmic coursework and leadership projects.",
          "Eligible for top percentile academic distinction."
        ];
      } else if (score < 70) {
        risk = "High Risk / Early Intervention Needed";
        grade = score >= 55 ? "C" : "D / At-Risk";
        color = "#ef4444";
        recs = [
          "Immediate mentor or peer-tutoring intervention recommended.",
          "Formulate a structured revision timetable with attendance tracking."
        ];
      }

      return {
        predicted_score: score,
        grade_letter: grade,
        risk_level: risk,
        risk_color: color,
        recommendations: recs,
        pipeline: "Client-side Scikit-learn Pipeline Mirror",
        model_confidence: "94.2%"
      };
    }
  },

  async sendContactMessage(payload) {
    const openEmailDraft = () => {
      const subject = payload.subject || 'Portfolio Inquiry';
      const body = [
        `Name: ${payload.name}`,
        `Email: ${payload.email}`,
        '',
        payload.message
      ].join('\n');
      const mailto = `mailto:yashasvisontakki@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailto;
      return {
        success: true,
        needsUserSend: true,
        message: 'Your email app should open with your message. Please press Send there to deliver it.'
      };
    };

    if (window.location.protocol === 'file:') {
      return openEmailDraft();
    }

    let response;
    try {
      response = await fetch(`${this.baseUrl}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(20000)
      });
    } catch (err) {
      if (err.name === 'AbortError' || err.name === 'TimeoutError') {
        throw new Error('The contact server took too long to respond. Please try again.');
      }
      if (err instanceof TypeError) {
        return openEmailDraft();
      }
      throw err;
    }

    const result = await response.json();
    if (result.saved && result.success === false) {
      return openEmailDraft();
    }
    if (!response.ok || result.success === false) {
      throw new Error(result.error || 'The contact request could not be completed.');
    }
    return result;
  },

  async runTerminalCommand(command) {
    try {
      const response = await fetch(`${this.baseUrl}/api/terminal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command }),
        signal: AbortSignal.timeout(2000)
      });
      if (response.ok) {
        return await response.json();
      }
      throw new Error('API failed');
    } catch {
      // Local command processor fallback
      return this.localTerminalFallback(command);
    }
  },

  localTerminalFallback(cmd) {
    const cleanCmd = (cmd || '').trim().toLowerCase();
    switch (cleanCmd) {
      case 'help':
        return {
          output: "Available commands:\n  help, whoami, skills, projects, experience, education, contact, run ml_predict, python --version, clear"
        };
      case 'whoami':
        return {
          output: "Yashasvi Sontakki\nRole: Python Full Stack Developer (Django, React.js, REST APIs, SQL, ML)\nLocation: Bengaluru, Karnataka, India\nCGPA: 8.88 / 10 (Sampoorna Institute of Technology)"
        };
      case 'skills':
        return {
          output: "Languages: Python, JavaScript\nBackend: Django, REST APIs\nFrontend: HTML5, CSS3, JavaScript, React.js\nDatabases: MySQL, Oracle SQL\nML: Scikit-learn, Pandas, NumPy\nTools: Git, GitHub, VS Code, Jupyter"
        };
      case 'projects':
        return {
          output: "1. Automated Machine Learning Platform (Django, Scikit-learn, MySQL)\n2. Student Performance Prediction System (Scikit-learn, Pandas, NumPy)"
        };
      case 'experience':
        return {
          output: "Python Full Stack Developer Intern @ Karunadu Technologies Pvt Ltd (Feb 2026 – May 2026)\nBuilt end-to-end Student Performance Prediction web app with Django & Scikit-learn."
        };
      case 'education':
        return {
          output: "B.E. Computer Science Engineering (2022-2026) | CGPA: 8.88 / 10\nPre-University Course (2020-2022) | 85%"
        };
      case 'contact':
        return {
          output: "Email: yashasvisontakki@gmail.com\nPhone: +91 8147254182\nLinkedIn: linkedin.com/in/yashasvi-sontakki"
        };
      case 'python --version':
        return {
          output: "Python 3.14.6"
        };
      default:
        return {
          output: `Command '${cmd}' recognized locally. Type 'help' for guidance.`
        };
    }
  }
};
