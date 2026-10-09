/**
 * Interactive Cyber Terminal Emulator
 * Yashasvi Sontakki Portfolio
 */

(function () {
  const terminalBody = document.getElementById('term-body');
  const terminalInput = document.getElementById('term-input');
  const chipContainer = document.getElementById('term-chips');

  if (!terminalBody || !terminalInput) return;

  const history = [];
  let historyIdx = -1;

  function appendLog(text, className = '') {
    const div = document.createElement('div');
    div.className = `term-log ${className}`;
    div.textContent = text;
    terminalBody.appendChild(div);
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  async function handleCommand(cmd) {
    const trimmed = cmd.trim();
    if (!trimmed) return;

    history.push(trimmed);
    historyIdx = history.length;

    // Display user input
    appendLog(`yashasvi@portfolio:~$ ${trimmed}`);

    if (trimmed.toLowerCase() === 'clear') {
      terminalBody.innerHTML = '';
      return;
    }

    try {
      const res = await ApiClient.runTerminalCommand(trimmed);
      if (res && res.output) {
        appendLog(res.output, 'output');
      } else {
        appendLog('Command finished with no output.', 'output');
      }
    } catch (err) {
      appendLog(`Error executing command: ${err.message}`, 'error');
    }

    if (window.AudioEngine) {
      window.AudioEngine.playBeep(420, 0.05);
    }
  }

  terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const cmd = terminalInput.value;
      terminalInput.value = '';
      handleCommand(cmd);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIdx > 0) {
        historyIdx--;
        terminalInput.value = history[historyIdx];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx < history.length - 1) {
        historyIdx++;
        terminalInput.value = history[historyIdx];
      } else {
        historyIdx = history.length;
        terminalInput.value = '';
      }
    } else {
      if (window.AudioEngine && Math.random() > 0.4) {
        window.AudioEngine.playTypingClick();
      }
    }
  });

  // Handle clickable chips
  if (chipContainer) {
    chipContainer.addEventListener('click', (e) => {
      const chip = e.target.closest('.term-chip');
      if (chip) {
        const cmd = chip.getAttribute('data-cmd') || chip.textContent.trim();
        terminalInput.value = cmd;
        handleCommand(cmd);
        terminalInput.value = '';
        terminalInput.focus();
      }
    });
  }

  // Initial welcome message in terminal
  appendLog(" Antigravity OS [Python 3.14.6 x86_64]\n Type 'help' or click shortcuts above to explore Yashasvi's technical portfolio.");
})();
