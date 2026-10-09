#!/usr/bin/env python3
"""
Flask alternative entry point for Yashasvi Sontakki's Portfolio.
Run with:
    pip install -r requirements.txt
    python app_flask.py
"""

from flask import Flask, jsonify, request, send_from_directory
import os
import server

app = Flask(__name__, static_folder=".", static_url_path="")
server.init_db()

@app.route("/")
def index():
    return send_from_directory(".", "index.html")

@app.route("/<path:path>")
def static_proxy(path):
    return send_from_directory(".", path)

@app.route("/api/profile", methods=["GET"])
@app.route("/api/all", methods=["GET"])
def get_profile():
    return jsonify(server.PORTFOLIO_DATA)

@app.route("/api/skills", methods=["GET"])
def get_skills():
    return jsonify({"skills": server.PORTFOLIO_DATA["skills"]})

@app.route("/api/projects", methods=["GET"])
def get_projects():
    return jsonify({"projects": server.PORTFOLIO_DATA["projects"]})

@app.route("/api/experience", methods=["GET"])
def get_experience():
    return jsonify({"experience": server.PORTFOLIO_DATA["experience"]})

@app.route("/api/education", methods=["GET"])
def get_education():
    return jsonify({"education": server.PORTFOLIO_DATA["education"]})

@app.route("/api/predict", methods=["POST"])
def predict():
    data = request.get_json() or {}
    result = server.run_student_prediction(data)
    return jsonify(result)

@app.route("/api/contact", methods=["POST"])
def contact():
    data = request.get_json(silent=True)
    try:
        result, status = server.submit_contact_message(data)
        return jsonify(result), status
    except ValueError as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route("/api/terminal", methods=["POST"])
def terminal():
    data = request.get_json() or {}
    cmd = data.get("command", "").strip().lower()
    handler = server.PortfolioRequestHandler(None, ("0.0.0.0", 0), None)
    return jsonify(handler.process_terminal_command(cmd))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting Flask server on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
