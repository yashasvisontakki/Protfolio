/**
 * Interactive Machine Learning Simulation Lab
 * Yashasvi Sontakki Portfolio
 * Visualizes the Student Performance Prediction System (Key Project & Internship)
 */

(function () {
  const form = document.getElementById('ml-predict-form');
  if (!form) return;

  // Sliders and Value Displays
  const rangeHours = document.getElementById('range-hours');
  const valHours = document.getElementById('val-hours');

  const rangeAttendance = document.getElementById('range-attendance');
  const valAttendance = document.getElementById('val-attendance');

  const rangeGrade = document.getElementById('range-grade');
  const valGrade = document.getElementById('val-grade');

  const rangeSleep = document.getElementById('range-sleep');
  const valSleep = document.getElementById('val-sleep');

  const checkPrep = document.getElementById('check-prep');

  // Outputs
  const radialProgress = document.getElementById('radial-prog-circle');
  const scoreNum = document.getElementById('ml-score-num');
  const scoreGrade = document.getElementById('ml-score-grade');
  const riskBadge = document.getElementById('ml-risk-badge');
  const recomList = document.getElementById('ml-recom-list');
  const modelPipeline = document.getElementById('ml-model-pipeline');

  // Slider event syncing
  function syncSliders() {
    if (rangeHours && valHours) valHours.textContent = `${rangeHours.value} hrs/day`;
    if (rangeAttendance && valAttendance) valAttendance.textContent = `${rangeAttendance.value}%`;
    if (rangeGrade && valGrade) valGrade.textContent = `${rangeGrade.value}%`;
    if (rangeSleep && valSleep) valSleep.textContent = `${rangeSleep.value} hrs`;
  }

  [rangeHours, rangeAttendance, rangeGrade, rangeSleep].forEach(slider => {
    if (slider) {
      slider.addEventListener('input', () => {
        syncSliders();
        if (window.AudioEngine && Math.random() > 0.6) {
          window.AudioEngine.playBeep(600 + slider.value * 30, 0.03);
        }
      });
    }
  });

  syncSliders();

  // Run Prediction
  async function executePrediction() {
    const btn = document.getElementById('btn-run-predict');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Scikit-learn Pipeline...';
    }

    const payload = {
      study_hours: parseFloat(rangeHours ? rangeHours.value : 6.5),
      attendance_pct: parseFloat(rangeAttendance ? rangeAttendance.value : 85),
      prev_grade: parseFloat(rangeGrade ? rangeGrade.value : 78),
      test_prep: checkPrep && checkPrep.checked ? 1 : 0,
      sleep_hours: parseFloat(rangeSleep ? rangeSleep.value : 7)
    };

    try {
      const data = await ApiClient.predictStudentPerformance(payload);
      displayResult(data);

      if (window.AudioEngine) {
        window.AudioEngine.playSuccessChime();
      }
    } catch (err) {
      console.error('Prediction failed', err);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-brain"></i> Predict Student Outcome';
      }
    }
  }

  function displayResult(res) {
    const score = res.predicted_score;
    const grade = res.grade_letter;
    const risk = res.risk_level;
    const color = res.risk_color || '#c5dea8';

    // Animate score counter
    if (scoreNum) {
      let current = 0;
      const target = score;
      const step = target / 20;
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        scoreNum.textContent = current.toFixed(1) + '%';
      }, 25);
    }

    if (scoreGrade) {
      scoreGrade.textContent = `Predicted Grade: ${grade}`;
      scoreGrade.style.color = color;
    }

    // Radial SVG animation (circumference is ~440 for r=70)
    if (radialProgress) {
      const circumference = 440;
      const offset = circumference - (score / 100) * circumference;
      radialProgress.style.strokeDashoffset = offset;
      radialProgress.style.stroke = color;
    }

    // Risk badge
    if (riskBadge) {
      riskBadge.textContent = risk;
      riskBadge.style.color = color;
      riskBadge.style.borderColor = color;
      riskBadge.style.backgroundColor = `${color}20`;
    }

    // Pipeline label
    if (modelPipeline && res.pipeline) {
      modelPipeline.textContent = res.pipeline;
    }

    // Recommendations list
    if (recomList && res.recommendations) {
      recomList.innerHTML = '';
      res.recommendations.forEach(r => {
        const li = document.createElement('li');
        li.innerHTML = `<i class="fas fa-check-circle"></i> <span>${r}</span>`;
        recomList.appendChild(li);
      });
    }
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      executePrediction();
    });
  }

  // Run default prediction on load
  setTimeout(executePrediction, 600);
})();
