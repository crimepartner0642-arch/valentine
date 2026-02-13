/* ========================================
   VALENTINE'S DAY APP – LOGIC
   ======================================== */

(function () {
  'use strict';

  /* ---------- Questions Data ---------- */
  const QUESTIONS = [
    'Do you think Abhinav is the luckiest man alive?',
    'Is Archana Abhinav the most beautiful woman in the universe?',
    'Will you be my Valentine today… tomorrow… and forever?',
    'Do you love me more than chocolates?',
    'Are we the cutest couple ever?',
  ];

  const TEASE_MESSAGES = [
    'Oops! That\'s not the correct answer 😜',
    'Nice try! But you know the right answer 😉',
    'Archana Abhinavaa… think again ❤️',
    'Haha, that button doesn\'t work 😏',
    'Are you sure? Really? 🤭',
  ];

  /* ---------- Sound Effects using Web Audio API ---------- */
  let audioCtx = null;

  function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  function playSparkle() {
    if (isMuted) return;
    try {
      const ctx = getAudioCtx();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1200, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.15);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1600, ctx.currentTime + 0.05);
      osc2.frequency.exponentialRampToValueAtTime(3200, ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime + 0.05);
      osc1.stop(ctx.currentTime + 0.35);
      osc2.stop(ctx.currentTime + 0.35);
    } catch (e) { /* silent fail */ }
  }

  /* ---------- Background Music (gentle pad) ---------- */
  let musicGain = null;
  let musicStarted = false;

  function startMusic() {
    if (musicStarted) return;
    musicStarted = true;
    try {
      const ctx = getAudioCtx();
      musicGain = ctx.createGain();
      musicGain.gain.value = isMuted ? 0 : 0.06;
      musicGain.connect(ctx.destination);

      function playChord(freqs, startTime, duration) {
        freqs.forEach(f => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = f;
          g.gain.setValueAtTime(0, startTime);
          g.gain.linearRampToValueAtTime(0.04, startTime + 0.5);
          g.gain.setValueAtTime(0.04, startTime + duration - 0.5);
          g.gain.linearRampToValueAtTime(0, startTime + duration);
          osc.connect(g);
          g.connect(musicGain);
          osc.start(startTime);
          osc.stop(startTime + duration);
        });
      }

      const chords = [
        [261.63, 329.63, 392.00],  // C major
        [293.66, 369.99, 440.00],  // D minor-ish
        [349.23, 440.00, 523.25],  // F major
        [329.63, 392.00, 493.88],  // E minor
      ];

      const now = ctx.currentTime;
      const chordDur = 4;
      const totalLoop = chords.length * chordDur;

      function scheduleLoop(offset) {
        chords.forEach((chord, i) => {
          playChord(chord, offset + i * chordDur, chordDur);
        });
        // Schedule next loop
        setTimeout(() => scheduleLoop(ctx.currentTime), (totalLoop - 0.5) * 1000);
      }
      scheduleLoop(now);
    } catch (e) { /* silent fail */ }
  }

  /* ---------- Mute Toggle ---------- */
  let isMuted = true;
  const muteBtn = document.getElementById('mute-toggle');

  muteBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    muteBtn.textContent = isMuted ? '🔇' : '🔊';
    if (!musicStarted) startMusic();
    if (musicGain) musicGain.gain.value = isMuted ? 0 : 0.06;
  });

  /* ---------- Floating Hearts ---------- */
  const heartsContainer = document.getElementById('floating-hearts');
  const heartEmojis = ['❤️', '💕', '💗', '💖', '🩷', '💘'];

  function spawnFloatingHeart() {
    const el = document.createElement('span');
    el.className = 'floating-heart';
    el.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
    el.style.left = Math.random() * 100 + '%';
    el.style.fontSize = (0.8 + Math.random() * 1.2) + 'rem';
    el.style.animationDuration = (6 + Math.random() * 8) + 's';
    el.style.animationDelay = Math.random() * 2 + 's';
    heartsContainer.appendChild(el);
    setTimeout(() => el.remove(), 16000);
  }

  setInterval(spawnFloatingHeart, 800);
  // Seed a few immediately
  for (let i = 0; i < 6; i++) setTimeout(spawnFloatingHeart, i * 200);

  /* ---------- Screen Management ---------- */
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(id);
    target.classList.remove('active');
    // Force reflow so fade-in animation replays
    const card = target.querySelector('.glass-card');
    if (card) {
      card.classList.remove('fade-in');
      void card.offsetWidth;
      card.classList.add('fade-in');
    }
    target.classList.add('active');
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- Heart Burst on Yes ---------- */
  const burstContainer = document.getElementById('heart-burst-container');

  function heartBurst(x, y) {
    const count = 12;
    for (let i = 0; i < count; i++) {
      const h = document.createElement('span');
      h.className = 'burst-heart';
      h.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const dist = 60 + Math.random() * 80;
      h.style.left = x + 'px';
      h.style.top = y + 'px';
      h.style.setProperty('--bx', Math.cos(angle) * dist + 'px');
      h.style.setProperty('--by', Math.sin(angle) * dist + 'px');
      burstContainer.appendChild(h);
      setTimeout(() => h.remove(), 1000);
    }
  }

  /* ---------- Hero Start ---------- */
  document.getElementById('btn-start').addEventListener('click', () => {
    if (!musicStarted) startMusic();
    currentQ = 0;
    showQuestion();
  });

  /* ---------- Question Flow ---------- */
  let currentQ = 0;
  const questionText = document.getElementById('question-text');
  const questionCounter = document.getElementById('question-counter');
  const teaseMsg = document.getElementById('tease-msg');
  const btnYes = document.getElementById('btn-yes');
  const btnNo = document.getElementById('btn-no');
  const btnRow = document.getElementById('btn-row');

  function showQuestion() {
    teaseMsg.textContent = '';
    // Reset No button
    btnNo.style.position = '';
    btnNo.style.left = '';
    btnNo.style.top = '';
    btnNo.style.transform = '';
    btnNo.className = 'btn-glow btn-no';
    btnNo.textContent = 'No';

    questionText.textContent = QUESTIONS[currentQ];
    questionCounter.textContent = `Question ${currentQ + 1} of ${QUESTIONS.length}`;
    showScreen('question-screen');
  }

  /* ---------- No Button Antics ---------- */
  // Behavior types: 0 = dodge on hover, 1 = random reposition, 2 = shrink, 3 = redirect to wrong screen
  function getRandomBehavior() {
    return Math.floor(Math.random() * 4);
  }

  let noBehavior = getRandomBehavior();

  function pickNewBehavior() {
    noBehavior = getRandomBehavior();
  }

  function randomTease() {
    return TEASE_MESSAGES[Math.floor(Math.random() * TEASE_MESSAGES.length)];
  }

  function dodgeNoButton() {
    const card = btnRow.closest('.glass-card');
    const cardRect = card.getBoundingClientRect();
    const btnW = btnNo.offsetWidth;
    const btnH = btnNo.offsetHeight;

    // Make it absolute within the btn-row
    btnNo.classList.add('escaped');

    const maxX = cardRect.width - btnW - 20;
    const maxY = 120;
    const newX = Math.random() * maxX - maxX / 2;
    const newY = -(Math.random() * maxY + 20);

    btnNo.style.left = `calc(50% + ${newX}px)`;
    btnNo.style.top = newY + 'px';
  }

  // Hover dodge
  btnNo.addEventListener('mouseenter', () => {
    if (noBehavior === 0) {
      dodgeNoButton();
      teaseMsg.textContent = randomTease();
    }
  });

  // Touch dodge (mobile)
  btnNo.addEventListener('touchstart', (e) => {
    if (noBehavior === 0) {
      e.preventDefault();
      dodgeNoButton();
      teaseMsg.textContent = randomTease();
    }
  }, { passive: false });

  btnNo.addEventListener('click', () => {
    if (noBehavior === 0) {
      // Already dodging, but if they manage to click, dodge again
      dodgeNoButton();
      teaseMsg.textContent = randomTease();
      return;
    }
    if (noBehavior === 1) {
      // Random reposition
      dodgeNoButton();
      teaseMsg.textContent = randomTease();
      pickNewBehavior();
      return;
    }
    if (noBehavior === 2) {
      // Shrink & escape
      btnNo.classList.add('shrunk');
      teaseMsg.textContent = randomTease();
      setTimeout(() => {
        dodgeNoButton();
        btnNo.classList.remove('shrunk');
      }, 400);
      pickNewBehavior();
      return;
    }
    if (noBehavior === 3) {
      // Redirect to wrong answer screen
      showScreen('wrong-screen');
      pickNewBehavior();
      return;
    }
  });

  /* ---------- Wrong Screen Yes ---------- */
  document.getElementById('btn-wrong-yes').addEventListener('click', (e) => {
    playSparkle();
    heartBurst(e.clientX, e.clientY);
    // Go back to current question
    showQuestion();
  });

  /* ---------- Yes Button Click ---------- */
  btnYes.addEventListener('click', (e) => {
    playSparkle();
    heartBurst(e.clientX, e.clientY);
    currentQ++;
    pickNewBehavior();

    if (currentQ >= QUESTIONS.length) {
      // All questions answered – show game screen
      showScreen('game-screen');
      startGame();
    } else {
      setTimeout(() => showQuestion(), 400);
    }
  });

  /* ---------- Love Letter → Final Question ---------- */
  document.getElementById('btn-last-question').addEventListener('click', () => {
    showScreen('final-screen');
    setupFinalNo();
  });

  /* ---------- Final Question ---------- */
  const btnFinalYes = document.getElementById('btn-final-yes');
  const btnFinalNo = document.getElementById('btn-final-no');
  const finalTease = document.getElementById('final-tease');
  const finalBtnRow = document.getElementById('final-btn-row');

  function setupFinalNo() {
    finalTease.textContent = '';
    btnFinalNo.style.position = '';
    btnFinalNo.style.left = '';
    btnFinalNo.style.top = '';
  }

  let finalNoDodgeCount = 0;

  btnFinalNo.addEventListener('mouseenter', () => {
    dodgeFinalNo();
  });

  btnFinalNo.addEventListener('touchstart', (e) => {
    e.preventDefault();
    dodgeFinalNo();
  }, { passive: false });

  btnFinalNo.addEventListener('click', () => {
    dodgeFinalNo();
  });

  function dodgeFinalNo() {
    finalNoDodgeCount++;
    const card = finalBtnRow.closest('.glass-card');
    const cardRect = card.getBoundingClientRect();
    const btnW = btnFinalNo.offsetWidth;

    btnFinalNo.classList.add('escaped');

    const maxX = cardRect.width - btnW - 20;
    const maxY = 120;
    const newX = Math.random() * maxX - maxX / 2;
    const newY = -(Math.random() * maxY + 20);

    btnFinalNo.style.left = `calc(50% + ${newX}px)`;
    btnFinalNo.style.top = newY + 'px';

    if (finalNoDodgeCount >= 3) {
      finalTease.textContent = 'Error 404: Option Not Available 😌';
      btnFinalNo.style.display = 'none';
    } else {
      finalTease.textContent = randomTease();
    }
  }

  btnFinalYes.addEventListener('click', (e) => {
    playSparkle();
    heartBurst(e.clientX, e.clientY);
    showScreen('finale-screen');
    launchConfetti();
    launchHeartExplosion();
  });

  /* ---------- Mini Game Logic ---------- */
  const gameContainer = document.getElementById('game-container');
  const scoreCounter = document.getElementById('score-counter');
  let gameScore = 0;
  let gameActive = false;
  let gameInterval = null;

  function startGame() {
    gameScore = 0;
    gameActive = true;
    scoreCounter.textContent = `Hearts Collected: 0 / 10`;
    gameContainer.innerHTML = ''; // clear previous
    
    // Spawn hearts every 600ms
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(spawnGameHeart, 600);
  }

  function spawnGameHeart() {
    if (!gameActive) return;

    const h = document.createElement('div');
    h.className = 'game-heart';
    h.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
    
    // Random position
    const maxLeft = gameContainer.clientWidth - 50;
    const startLeft = Math.random() * maxLeft;
    h.style.left = startLeft + 'px';
    h.style.top = '300px'; // Start from bottom

    // Random speed
    const duration = 2 + Math.random() * 3;
    h.style.animationDuration = duration + 's';

    // Click handler
    h.addEventListener('mousedown', () => catchHeart(h));
    h.addEventListener('touchstart', (e) => {
      e.preventDefault();
      catchHeart(h);
    });

    gameContainer.appendChild(h);

    // Remove after animation
    setTimeout(() => {
      if (h.parentNode) h.remove();
    }, duration * 1000);
  }

  function catchHeart(el) {
    if (!gameActive || el.classList.contains('caught')) return;
    
    el.classList.add('caught');
    el.classList.remove('game-heart'); // Stop floating
    playSparkle();
    
    gameScore++;
    scoreCounter.textContent = `Hearts Collected: ${gameScore} / 10`;

    if (gameScore >= 10) {
      winGame();
    }
  }

  function winGame() {
    gameActive = false;
    clearInterval(gameInterval);
    
    const msg = document.createElement('div');
    msg.className = 'game-success-msg';
    msg.textContent = 'Unlocked! 💌';
    gameContainer.innerHTML = '';
    gameContainer.appendChild(msg);
    gameContainer.style.display = 'flex';
    gameContainer.style.alignItems = 'center';
    gameContainer.style.justifyContent = 'center';

    playSparkle();
    
    setTimeout(() => {
      showScreen('letter-screen');
      // Reset game container style for next time (re-playability)
      setTimeout(() => {
         gameContainer.style.display = 'none'; // logic reset not strictly needed as page reload resets
      }, 1000);
    }, 2000);
  }

  /* ---------- Confetti ---------- */
  const confettiCanvas = document.getElementById('confetti-canvas');
  const cCtx = confettiCanvas.getContext('2d');
  let confettiPieces = [];
  let confettiAnimId = null;

  function resizeCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function launchConfetti() {
    confettiPieces = [];
    const colors = ['#e91e63', '#f48fb1', '#ff5252', '#ff80ab', '#fce4ec', '#d32f2f', '#f06292', '#b76e79', '#ffd54f', '#fff'];

    for (let i = 0; i < 200; i++) {
      confettiPieces.push({
        x: Math.random() * confettiCanvas.width,
        y: Math.random() * confettiCanvas.height - confettiCanvas.height,
        w: 6 + Math.random() * 8,
        h: 4 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 4,
        vy: 2 + Math.random() * 4,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
      });
    }
    if (!confettiAnimId) animateConfetti();
  }

  function animateConfetti() {
    cCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    let alive = 0;

    confettiPieces.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotSpeed;
      p.vy += 0.04; // gravity
      if (p.y > confettiCanvas.height) p.opacity -= 0.02;
      if (p.opacity <= 0) return;
      alive++;

      cCtx.save();
      cCtx.translate(p.x, p.y);
      cCtx.rotate((p.rot * Math.PI) / 180);
      cCtx.globalAlpha = Math.max(0, p.opacity);
      cCtx.fillStyle = p.color;
      cCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      cCtx.restore();
    });

    if (alive > 0) {
      confettiAnimId = requestAnimationFrame(animateConfetti);
    } else {
      confettiAnimId = null;
      cCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      // Re-launch after a pause for continuous celebration
      setTimeout(launchConfetti, 2000);
    }
  }

  /* ---------- Heart Explosion on Finale ---------- */
  function launchHeartExplosion() {
    const container = document.getElementById('heart-explosion');
    container.innerHTML = '';
    const count = 30;
    for (let i = 0; i < count; i++) {
      const h = document.createElement('span');
      h.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
      h.style.position = 'absolute';
      h.style.fontSize = (1 + Math.random() * 2) + 'rem';
      h.style.left = '50%';
      h.style.top = '50%';
      const angle = (Math.PI * 2 * i) / count;
      const dist = 80 + Math.random() * 120;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      h.style.setProperty('--bx', dx + 'px');
      h.style.setProperty('--by', dy + 'px');
      h.className = 'burst-heart';
      container.appendChild(h);
    }
    // Repeat explosion
    setTimeout(launchHeartExplosion, 2000);
  }

})();
