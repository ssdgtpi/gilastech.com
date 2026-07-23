// ---- extracted script block 1 of 11 ----
  // ---------- ambient grid canvas, reacts to cursor ----------
  let gridDotColor = getComputedStyle(document.body).getPropertyValue('--grid-dot').trim() || 'rgba(255,255,255,0.045)';
  const canvas = document.getElementById('gridCanvas');
  const ctx = canvas.getContext('2d');
  let w, h, mouseX = -9999, mouseY = -9999;
  function resize(){ w = canvas.width = window.innerWidth; h = canvas.height = document.documentElement.scrollHeight; }
  resize();
  window.addEventListener('resize', resize);

  const spacing = 44;
  function draw(){
    ctx.clearRect(0,0,w,h);
    const cols = Math.ceil(w/spacing)+1;
    const rows = Math.ceil(h/spacing)+1;
    for(let i=0;i<cols;i++){
      for(let j=0;j<rows;j++){
        const x = i*spacing, y = j*spacing;
        const dx = x - mouseX, dy = y - mouseY;
        const dist = Math.sqrt(dx*dx+dy*dy);
        const influence = Math.max(0, 1 - dist/260);
        const r = 1 + influence*1.8;
        if(influence > 0.02){
          ctx.beginPath();
          ctx.arc(x,y,r,0,Math.PI*2);
          ctx.fillStyle = `rgba(231,178,76,${0.05 + influence*0.35})`;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(x,y,0.9,0,Math.PI*2);
          ctx.fillStyle = gridDotColor;
          ctx.fill();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();

  const glow = document.getElementById('cursorGlow');
  window.addEventListener('mousemove', (e)=>{
    mouseX = e.clientX; mouseY = e.clientY + window.scrollY;
    glow.style.left = e.clientX+'px';
    glow.style.top = e.clientY+'px';
    glow.style.opacity = '1';
  });
  window.addEventListener('mouseleave', ()=>{ glow.style.opacity='0'; mouseX=-9999; mouseY=-9999; });

  // ---------- tilt cards ----------
  document.querySelectorAll('[data-tilt]').forEach(card=>{
    card.addEventListener('mousemove', (e)=>{
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left)/rect.width;
      const py = (e.clientY - rect.top)/rect.height;
      const rx = (py-0.5) * -8;
      const ry = (px-0.5) * 8;
      card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(4px)`;
      card.style.setProperty('--mx', (px*100)+'%');
      card.style.setProperty('--my', (py*100)+'%');
    });
    card.addEventListener('mouseleave', ()=>{
      card.style.transform = 'perspective(700px) rotateX(0) rotateY(0) translateZ(0)';
    });
  });

  // ---------- magnetic buttons ----------
  document.querySelectorAll('.magnetic').forEach(wrap=>{
    const el = wrap.querySelector('a');
    wrap.addEventListener('mousemove', (e)=>{
      const rect = wrap.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width/2;
      const y = e.clientY - rect.top - rect.height/2;
      el.style.transform = `translate(${x*0.25}px, ${y*0.4}px)`;
    });
    wrap.addEventListener('mouseleave', ()=>{
      el.style.transform = 'translate(0,0)';
    });
  });

  // ---------- count-up numbers ----------
  function animateCounter(el){
    if(el.dataset.animated) return;
    el.dataset.animated = '1';
    const target = parseFloat(el.getAttribute('data-count'));
    const suffix = el.getAttribute('data-suffix') || '';
    const isDecimal = target % 1 !== 0;
    let cur = 0;
    const duration = 1400;
    const start = performance.now();
    function step(now){
      const t = Math.min(1, (now-start)/duration);
      const eased = 1 - Math.pow(1-t, 3);
      cur = target * eased;
      el.textContent = (isDecimal ? cur.toFixed(2) : Math.round(cur).toLocaleString()) + suffix;
      if(t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function runCountersIn(container){
    container.querySelectorAll('[data-count]').forEach(animateCounter);
  }

  // ---------- scroll reveal ----------
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        runCountersIn(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, {threshold:0.2});
  revealEls.forEach(el=>io.observe(el));

  // fallback: if dashboard already in view on load
  window.addEventListener('load', ()=>{
    const dash = document.querySelector('.dashboard');
    const rect = dash.getBoundingClientRect();
    if(rect.top < window.innerHeight) { dash.classList.add('in'); runCountersIn(dash); }
  });

  // ---------- live Philippines date & time ----------
  const phFormatter = new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila',
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
  function updatePHClock(){
    const el = document.getElementById('phClockText');
    if(!el) return;
    el.textContent = phFormatter.format(new Date());
  }
  updatePHClock();
  setInterval(updatePHClock, 1000);

  // ---------- scroll progress bar ----------
  const progressBar = document.getElementById('scrollProgress');
  function updateProgress(){
    const h = document.documentElement;
    const scrolled = h.scrollTop;
    const max = h.scrollHeight - h.clientHeight;
    progressBar.style.width = (max > 0 ? (scrolled / max) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', updateProgress, {passive:true});
  updateProgress();

  // ---------- custom cursor ----------
  const cursor = document.getElementById('customCursor');
  let cx = 0, cy = 0, tx = 0, ty = 0;
  window.addEventListener('mousemove', (e)=>{
    tx = e.clientX; ty = e.clientY;
    cursor.classList.add('show');
  });
  window.addEventListener('mouseleave', ()=> cursor.classList.remove('show'));
  function cursorLoop(){
    cx += (tx - cx) * 0.25;
    cy += (ty - cy) * 0.25;
    cursor.style.left = cx + 'px';
    cursor.style.top = cy + 'px';
    requestAnimationFrame(cursorLoop);
  }
  cursorLoop();
  document.querySelectorAll('a, button, [data-tilt]').forEach(el=>{
    el.addEventListener('mouseenter', ()=> cursor.classList.add('hover'));
    el.addEventListener('mouseleave', ()=> cursor.classList.remove('hover'));
  });

  // ---------- ripple effect ----------
  document.querySelectorAll('.rippler').forEach(el=>{
    el.addEventListener('click', function(e){
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.6;
      const dot = document.createElement('span');
      dot.className = 'ripple-dot';
      dot.style.width = dot.style.height = size + 'px';
      dot.style.left = (e.clientX - rect.left - size/2) + 'px';
      dot.style.top = (e.clientY - rect.top - size/2) + 'px';
      this.appendChild(dot);
      setTimeout(()=> dot.remove(), 650);
    });
  });

  // ---------- scrollspy active nav link ----------
  const navAnchors = document.querySelectorAll('#navLinks a[data-section]');
  const spySections = Array.from(navAnchors).map(a => document.getElementById(a.dataset.section)).filter(Boolean);
  function updateActiveNav(){
    let current = null;
    spySections.forEach(sec=>{
      const rect = sec.getBoundingClientRect();
      if(rect.top <= 140 && rect.bottom > 140) current = sec.id;
    });
    navAnchors.forEach(a=> a.classList.toggle('active', a.dataset.section === current));
  }
  window.addEventListener('scroll', updateActiveNav, {passive:true});
  updateActiveNav();

  // ---------- back to top ----------
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', ()=>{
    backToTop.classList.toggle('show', window.scrollY > 600);
  }, {passive:true});
  backToTop.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));

  // ---------- reusable toast ----------
  const copyToast = document.getElementById('copyToast');
  let toastTimer = null;
  function showToast(msg, duration){
    copyToast.textContent = msg;
    copyToast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=> copyToast.classList.remove('show'), duration || 2200);
  }

  // ---------- copy email to clipboard ----------
  const emailCta = document.getElementById('emailCta');
  if(emailCta){
    emailCta.addEventListener('click', ()=>{
      const email = emailCta.getAttribute('data-email');
      if(navigator.clipboard){
        navigator.clipboard.writeText(email).catch(()=>{});
      }
      showToast('Email copied to clipboard');
    });
  }

  // ---------- subtle live dashboard tick ----------
  function liveTick(){
    const cells = document.querySelectorAll('.dash-value[data-count]');
    cells.forEach(el=>{
      if(Math.random() < 0.5) return;
      el.classList.add('live-tick');
      const prevColor = el.style.color;
      el.style.color = 'var(--gold)';
      setTimeout(()=>{ el.style.color = prevColor; }, 400);
    });
  }
  setInterval(liveTick, 4000);

  // ---------- header shrink on scroll ----------
  const headerEl = document.querySelector('header');
  window.addEventListener('scroll', ()=>{
    headerEl.classList.toggle('compact', window.scrollY > 40);
  }, {passive:true});

  // ---------- hero parallax on mouse move ----------
  const heroParallax = document.getElementById('heroParallax');
  const heroSection = document.getElementById('top');
  if(heroParallax && heroSection){
    heroSection.addEventListener('mousemove', (e)=>{
      const rect = heroSection.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      heroParallax.style.transform = `translate(${px*-14}px, ${py*-10}px)`;
    });
    heroSection.addEventListener('mouseleave', ()=>{
      heroParallax.style.transform = 'translate(0,0)';
    });
  }

  // ---------- scroll cue ----------
  const scrollCue = document.getElementById('scrollCue');
  if(scrollCue){
    scrollCue.addEventListener('click', ()=>{
      document.getElementById('services').scrollIntoView({behavior:'smooth'});
    });
  }

  // ---------- particle burst on primary CTA ----------
  function burstAt(x, y){
    const colors = ['#E7B24C', '#52DCE0', '#EDEEF3'];
    const count = isTouchDevice ? 8 : 14;
    for(let i=0;i<count;i++){
      const p = document.createElement('span');
      p.className = 'burst-particle';
      const size = 4 + Math.random()*5;
      p.style.width = p.style.height = size + 'px';
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      p.style.background = colors[i % colors.length];
      const angle = (Math.PI * 2 * i) / count + Math.random()*0.4;
      const dist = 60 + Math.random()*60;
      const ex = Math.cos(angle) * dist;
      const ey = Math.sin(angle) * dist;
      p.style.setProperty('--burst-end', `translate(${ex}px, ${ey}px)`);
      document.body.appendChild(p);
      setTimeout(()=> p.remove(), 750);
    }
  }
  document.querySelectorAll('#startNowBtn, #emailCta').forEach(btn=>{
    btn.addEventListener('click', (e)=> burstAt(e.clientX, e.clientY));
  });

  // ---------- dashboard cell click micro-interaction ----------
  document.querySelectorAll('.dash-cell').forEach(cell=>{
    cell.addEventListener('click', (e)=>{
      burstAt(e.clientX, e.clientY);
      const val = cell.querySelector('.dash-value');
      if(val){
        val.style.transform = 'scale(1.12)';
        setTimeout(()=> val.style.transform = 'scale(1)', 220);
      }
    });
  });

  // ---------- service card "why it matters" toggle ----------
  const serviceGrid = document.getElementById('serviceGrid');
  if(serviceGrid){
    serviceGrid.addEventListener('click', (e)=>{
      const btn = e.target.closest('.card-more-toggle');
      if(!btn) return;
      const card = btn.closest('.service-card');
      if(card) card.classList.toggle('open');
    });
  }

  // ---------- theme toggle ----------
  const themeToggle = document.getElementById('themeToggle');
  const themeColorMeta = document.getElementById('themeColorMeta');
  function readGridDotColor(){
    gridDotColor = getComputedStyle(document.body).getPropertyValue('--grid-dot').trim() || gridDotColor;
  }
  function syncThemeColorMeta(){
    if(!themeColorMeta) return;
    const bg = getComputedStyle(document.body).getPropertyValue('--bg').trim();
    if(bg) themeColorMeta.setAttribute('content', bg);
  }
  if(themeToggle){
    themeToggle.addEventListener('click', ()=>{
      document.body.classList.toggle('light-theme');
      readGridDotColor();
      syncThemeColorMeta();
    });
  }
  readGridDotColor();
  syncThemeColorMeta();

  // ---------- section dot navigation + keyboard nav ----------
  const sectionOrder = ['top','services','process','numbers','contact'];
  const sdotButtons = document.querySelectorAll('#sectionDots .sdot');
  function jumpToSection(id){
    const el = document.getElementById(id);
    if(el) el.scrollIntoView({behavior:'smooth'});
  }
  sdotButtons.forEach(btn=>{
    btn.addEventListener('click', ()=> jumpToSection(btn.dataset.jump));
  });
  function updateSectionDots(){
    let current = 'top';
    sectionOrder.forEach(id=>{
      const el = document.getElementById(id);
      if(!el) return;
      const rect = el.getBoundingClientRect();
      if(rect.top <= 200) current = id;
    });
    sdotButtons.forEach(btn=> btn.classList.toggle('active', btn.dataset.jump === current));
  }
  window.addEventListener('scroll', updateSectionDots, {passive:true});
  updateSectionDots();

  window.addEventListener('keydown', (e)=>{
    const tag = (document.activeElement && document.activeElement.tagName) || '';
    if(['INPUT','TEXTAREA'].includes(tag)) return;
    if(e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    let current = 'top';
    sectionOrder.forEach(id=>{
      const el = document.getElementById(id);
      if(!el) return;
      if(el.getBoundingClientRect().top <= 200) current = id;
    });
    const idx = sectionOrder.indexOf(current);
    let nextIdx = idx;
    if(e.key === 'ArrowDown') nextIdx = Math.min(idx + 1, sectionOrder.length - 1);
    if(e.key === 'ArrowUp') nextIdx = Math.max(idx - 1, 0);
    if(nextIdx !== idx){
      e.preventDefault();
      jumpToSection(sectionOrder[nextIdx]);
    }
  });

  // ---------- live system log ticker ----------
  const dashLogText = document.getElementById('dashLogText');
  const logLines = [
    'Payment gateway heartbeat OK',
    'KYC verification queue cleared',
    'Server cluster auto-scaled (+2 nodes)',
    'SSL certificates renewed',
    'Compliance report generated',
    'Fraud monitor: 0 anomalies detected',
    'Backup snapshot completed',
    'CDN edge cache warmed',
    'AML transaction sweep completed',
    'Support queue: all tickets triaged'
  ];
  if(dashLogText){
    let logIdx = 0;
    setInterval(()=>{
      dashLogText.classList.add('fade');
      setTimeout(()=>{
        logIdx = (logIdx + 1) % logLines.length;
        dashLogText.textContent = logLines[logIdx];
        dashLogText.classList.remove('fade');
      }, 300);
    }, 2800);
  }

  // ---------- sound toggle (Web Audio blips) ----------
  const soundToggle = document.getElementById('soundToggle');
  let soundEnabled = false;
  let audioCtx = null;
  function playBlip(freq){
    if(!soundEnabled) return;
    try{
      if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq || 660;
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.18);
    }catch(err){ /* audio unsupported, fail silently */ }
  }
  if(soundToggle){
    soundToggle.addEventListener('click', ()=>{
      soundEnabled = !soundEnabled;
      soundToggle.querySelector('.icon-sound-off').style.display = soundEnabled ? 'none' : 'block';
      soundToggle.querySelector('.icon-sound-on').style.display = soundEnabled ? 'block' : 'none';
      if(soundEnabled) playBlip(880);
      showToast(soundEnabled ? 'Interface sounds on' : 'Interface sounds off');
    });
  }
  document.querySelectorAll('.rippler, .sdot, .theme-toggle, .card-more-toggle, .chip').forEach(el=>{
    el.addEventListener('click', ()=> playBlip(620));
  });

  // ---------- cursor sparkle trail ----------
  let lastSparkle = 0;
  const sparkleColors = ['#E7B24C', '#52DCE0'];
  window.addEventListener('mousemove', (e)=>{
    if(isTouchDevice) return;
    const now = performance.now();
    if(now - lastSparkle < 55) return;
    lastSparkle = now;
    const dot = document.createElement('span');
    dot.className = 'sparkle-dot';
    dot.style.left = (e.clientX - 2) + 'px';
    dot.style.top = (e.clientY - 2) + 'px';
    dot.style.background = sparkleColors[Math.random() < 0.5 ? 0 : 1];
    document.body.appendChild(dot);
    setTimeout(()=> dot.remove(), 800);
  });

  // ---------- session timer ----------
  const sessionTimerEl = document.getElementById('sessionTimer');
  const sessionStart = Date.now();
  if(sessionTimerEl){
    setInterval(()=>{
      const elapsed = Math.floor((Date.now() - sessionStart) / 1000);
      const m = Math.floor(elapsed / 60);
      const s = String(elapsed % 60).padStart(2, '0');
      sessionTimerEl.textContent = `Session: ${m}:${s}`;
    }, 1000);
  }

  // ---------- GILAS easter egg ----------
  let keyBuffer = '';
  window.addEventListener('keydown', (e)=>{
    if(e.key.length !== 1) return;
    keyBuffer = (keyBuffer + e.key).slice(-5).toLowerCase();
    if(keyBuffer === 'gilas'){
      keyBuffer = '';
      for(let i=0;i<6;i++){
        setTimeout(()=>{
          burstAt(Math.random()*window.innerWidth, Math.random()*window.innerHeight*0.6 + 80);
        }, i*90);
      }
      showToast('🎉 You found the secret! Welcome to Gilas Tech.', 3200);
    }
  });

  // ---------- brief builder chips ----------
  const briefChips = document.querySelectorAll('#briefChips .chip');
  const selectedTopics = new Set();
  function updateEmailCta(){
    if(!emailCta) return;
    if(selectedTopics.size === 0){
      emailCta.href = 'mailto:hr@gilastech.com';
      emailCta.childNodes[0].textContent = 'hr@gilastech.com';
      return;
    }
    const topics = Array.from(selectedTopics);
    const subject = encodeURIComponent(`Inquiry: ${topics.join(', ')}`);
    const body = encodeURIComponent(`Hi Gilas Tech team,\n\nI'd like to learn more about:\n- ${topics.join('\n- ')}\n\nPlease reach out with next steps.\n`);
    emailCta.href = `mailto:hr@gilastech.com?subject=${subject}&body=${body}`;
    emailCta.childNodes[0].textContent = `Email us about (${topics.length}) topic${topics.length>1?'s':''}`;
  }
  briefChips.forEach(chip=>{
    chip.addEventListener('click', ()=>{
      const topic = chip.dataset.topic;
      if(selectedTopics.has(topic)){
        selectedTopics.delete(topic);
        chip.classList.remove('picked');
      } else {
        selectedTopics.add(topic);
        chip.classList.add('picked');
      }
      updateEmailCta();
    });
  });

  // ---------- reached-the-end celebration ----------
  const footerEl = document.querySelector('footer');
  let celebrated = false;
  if(footerEl){
    const footerIO = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting && !celebrated){
          celebrated = true;
          const w = window.innerWidth;
          [w*0.2, w*0.5, w*0.8].forEach((x, i)=>{
            setTimeout(()=> burstAt(x, 160), i*140);
          });
          showToast('👋 Thanks for exploring Gilas Tech!', 2600);
          footerIO.disconnect();
        }
      });
    }, {threshold:0.3});
    footerIO.observe(footerEl);
  }

  // ---------- mobile hamburger menu ----------
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navActions = document.getElementById('navActions');
  function closeMobileMenu(){
    headerEl.classList.remove('menu-open');
    if(hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'false');
  }
  function openMobileMenu(){
    headerEl.classList.add('menu-open');
    if(hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'true');
  }
  if(hamburgerBtn){
    hamburgerBtn.addEventListener('click', ()=>{
      if(headerEl.classList.contains('menu-open')) closeMobileMenu();
      else openMobileMenu();
    });
  }
  if(navActions){
    navActions.addEventListener('click', (e)=>{
      if(e.target.closest('a')) closeMobileMenu();
    });
  }
  document.addEventListener('click', (e)=>{
    if(!headerEl.classList.contains('menu-open')) return;
    if(e.target.closest('#navActions') || e.target.closest('#hamburgerBtn')) return;
    closeMobileMenu();
  });
  window.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape') closeMobileMenu();
  });

  // ---------- screen size / orientation / touch detection ----------
  const rootEl = document.documentElement;
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
  rootEl.classList.add(isTouchDevice ? 'is-touch' : 'is-mouse');

  function updateViewportFlags(){
    const w = window.innerWidth, h = window.innerHeight;
    rootEl.classList.toggle('is-portrait', h >= w);
    rootEl.classList.toggle('is-landscape', h < w);
    rootEl.classList.toggle('is-mobile', w <= 640);
    rootEl.classList.toggle('is-tablet', w > 640 && w <= 1024);
    rootEl.classList.toggle('is-desktop', w > 1024);
    if(w > 860) closeMobileMenu();
    resize(); // recompute canvas size on any viewport/orientation change
  }
  window.addEventListener('resize', updateViewportFlags, {passive:true});
  window.addEventListener('orientationchange', ()=>{
    setTimeout(updateViewportFlags, 200); // let the browser settle post-rotation
  });
  updateViewportFlags();

  // ---------- Gemini AI chatbot ----------
  // Paste your Gemini API key between the quotes below. Get one at https://aistudio.google.com/apikey
  const GEMINI_API_KEY = 'AIzaSyAxga85EY3X0vczD6YCrfieIgk-kxn1F1Q';
  const GEMINI_MODEL = 'gemini-3.5-flash';
  const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
  const GEMINI_SYSTEM_PROMPT = `You are the friendly, knowledgeable virtual assistant for Gilas Tech Philippines Inc., a company that provides backend business platform management, payment gateway integration, KYC/AML transaction monitoring, regulatory compliance support, customer support solutions, IT security and data protection, marketing, and personnel acquisition for online businesses. Answer questions about these services helpfully and concisely (2-4 sentences unless more detail is asked for). If asked something unrelated to the business, answer briefly and politely steer back to how Gilas Tech Philippines Inc. can help. If you don't know something specific about the company, say so honestly and suggest contacting hr@gilastech.com.`;

  const chatFab = document.getElementById('chatFab');
  const chatPanel = document.getElementById('chatPanel');
  const chatClose = document.getElementById('chatClose');
  const chatMessages = document.getElementById('chatMessages');
  const chatInput = document.getElementById('chatInput');
  const chatSend = document.getElementById('chatSend');

  let chatHistory = [];
  let chatBusy = false;

  function scrollChatToBottom(){
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function appendChatMessage(text, role){
    const div = document.createElement('div');
    div.className = 'chat-msg ' + role;
    div.textContent = text;
    chatMessages.appendChild(div);
    scrollChatToBottom();
    return div;
  }

  function showChatTyping(){
    const div = document.createElement('div');
    div.className = 'chat-msg typing';
    div.id = 'chatTypingIndicator';
    div.innerHTML = '<span></span><span></span><span></span>';
    chatMessages.appendChild(div);
    scrollChatToBottom();
  }

  function hideChatTyping(){
    const el = document.getElementById('chatTypingIndicator');
    if(el) el.remove();
  }

  function openChat(){
    chatPanel.classList.add('open');
    chatFab.classList.add('open');
    chatFab.setAttribute('aria-expanded', 'true');
    setTimeout(()=> chatInput.focus(), 200);
  }
  function closeChat(){
    chatPanel.classList.remove('open');
    chatFab.classList.remove('open');
    chatFab.setAttribute('aria-expanded', 'false');
  }
  function toggleChat(){
    if(chatPanel.classList.contains('open')) closeChat();
    else openChat();
  }

  if(chatFab) chatFab.addEventListener('click', toggleChat);
  if(chatClose) chatClose.addEventListener('click', closeChat);
  window.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && chatPanel && chatPanel.classList.contains('open')) closeChat();
  });

  async function sendChatMessage(){
    if(chatBusy) return;
    const text = chatInput.value.trim();
    if(!text) return;

    appendChatMessage(text, 'user');
    chatInput.value = '';

    if(!GEMINI_API_KEY){
      appendChatMessage(
        "This assistant isn't connected yet — the site owner needs to paste a Gemini API key into the GEMINI_API_KEY constant in the page's code before I can reply.",
        'error'
      );
      return;
    }

    chatHistory.push({ role: 'user', parts: [{ text }] });
    // keep the last 20 turns so the request doesn't grow unbounded
    if(chatHistory.length > 20) chatHistory = chatHistory.slice(-20);

    chatBusy = true;
    chatSend.disabled = true;
    showChatTyping();

    try{
      const response = await fetch(GEMINI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: chatHistory,
          systemInstruction: { parts: [{ text: GEMINI_SYSTEM_PROMPT }] },
          generationConfig: { temperature: 0.7, maxOutputTokens: 400 }
        })
      });

      const data = await response.json();

      if(!response.ok){
        const apiMsg = (data && data.error && data.error.message) ? data.error.message : `Request failed (${response.status})`;
        throw new Error(apiMsg);
      }

      const candidate = data && data.candidates && data.candidates[0];
      const replyText = candidate && candidate.content && candidate.content.parts && candidate.content.parts[0] && candidate.content.parts[0].text;

      hideChatTyping();

      if(!replyText){
        const blockReason = data && data.promptFeedback && data.promptFeedback.blockReason;
        appendChatMessage(
          blockReason ? `I can't answer that (${blockReason.toLowerCase().replace('_',' ')}). Try rephrasing your question.` : "I didn't get a usable reply that time — could you try rephrasing?",
          'error'
        );
      } else {
        appendChatMessage(replyText, 'bot');
        chatHistory.push({ role: 'model', parts: [{ text: replyText }] });
        playBlip(520);
      }
    } catch(err){
      hideChatTyping();
      appendChatMessage(`Something went wrong talking to Gemini: ${err.message}`, 'error');
    } finally {
      chatBusy = false;
      chatSend.disabled = false;
    }
  }

  if(chatSend) chatSend.addEventListener('click', sendChatMessage);
  if(chatInput){
    chatInput.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter'){
        e.preventDefault();
        sendChatMessage();
      }
    });
  }

// ---- extracted script block 2 of 11 ----
(() => {
  // --- 1. DASHBOARD STRESS-TESTER ---
  const dashCells = document.querySelectorAll('.dash-cell');
  const logText = document.getElementById('dashLogText');
  const stressLogs = [
    '⚡ STRESS TEST: Simulating 10,000 concurrent socket connections...',
    '🛡️ DEFENSE: DDoS mitigation scrubbed 4.2 GB/s anomaly.',
    '🚀 BOOST: Routing traffic through Singapore & Tokyo edge nodes.',
    '💎 OVERCLOCK: Database query execution compressed by 40%.'
  ];

  dashCells.forEach((cell, idx) => {
    cell.addEventListener('click', () => {
      cell.classList.remove('stress-shaking');
      void cell.offsetWidth; // trigger reflow
      cell.classList.add('stress-shaking');

      // Temporarily spike the metric
      const valEl = cell.querySelector('.dash-value');
      if (valEl && valEl.dataset.count) {
        const orig = parseFloat(valEl.dataset.count);
        const suffix = valEl.dataset.suffix || '';
        const isDec = orig % 1 !== 0;
        const spike = idx === 1 ? orig * 2.5 : (idx === 2 ? orig * 0.4 : orig + 0.01);
        
        valEl.style.color = 'var(--cyan)';
        valEl.textContent = (isDec ? spike.toFixed(2) : Math.round(spike).toLocaleString()) + suffix;
        
        setTimeout(() => {
          valEl.style.color = '';
          valEl.textContent = (isDec ? orig.toFixed(2) : Math.round(orig).toLocaleString()) + suffix;
          cell.classList.remove('stress-shaking');
        }, 1200);
      }

      // Inject high-priority log
      if (logText) {
        logText.classList.add('fade');
        setTimeout(() => {
          logText.style.color = 'var(--gold)';
          logText.textContent = stressLogs[idx % stressLogs.length];
          logText.classList.remove('fade');
          setTimeout(() => { logText.style.color = ''; }, 3000);
        }, 200);
      }
    });
  });

  // --- 2. PENTATONIC AUDIO SCALE ON BRIEF CHIPS ---
  // C Major Pentatonic frequencies (Hz): C4, D4, E4, G4, A4, C5, D5, E5
  const pentatonicScale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
  const chips = document.querySelectorAll('#briefChips .chip');
  
  chips.forEach((chip, index) => {
    chip.addEventListener('click', () => {
      // Tap into existing soundEnabled flag and playBlip function
      if (typeof soundEnabled !== 'undefined' && soundEnabled && typeof audioCtx !== 'undefined') {
        const freq = pentatonicScale[index % pentatonicScale.length];
        try {
          if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle'; // Smoother, synth-like tone
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.35);
        } catch(e){}
      }
    });
  });

  // --- 3. LIVE PROJECT SCOPE ESTIMATOR ---
  const briefContainer = document.querySelector('.brief-builder');
  if (briefContainer) {
    const estimatorBadge = document.createElement('div');
    estimatorBadge.id = 'scopeEstimator';
    estimatorBadge.innerHTML = `<div>EST. TIMELINE: <span id="estTime">0 Weeks</span></div><div>CORE SPECIALISTS: <span id="estTeam">0 Units</span></div>`;
    briefContainer.appendChild(estimatorBadge);

    const estTimeEl = document.getElementById('estTime');
    const estTeamEl = document.getElementById('estTeam');

    // Listen for chip clicks to recalculate
    briefContainer.addEventListener('click', (e) => {
      if (!e.target.classList.contains('chip')) return;
      
      setTimeout(() => {
        const pickedCount = document.querySelectorAll('#briefChips .chip.picked').length;
        if (pickedCount === 0) {
          estimatorBadge.classList.remove('active');
        } else {
          estimatorBadge.classList.add('active');
          // Algorithmic estimation logic
          const weeks = Math.max(2, pickedCount * 1.5);
          const specialists = Math.min(12, Math.ceil(pickedCount * 1.25));
          estTimeEl.textContent = `${Math.round(weeks)}–${Math.round(weeks + 2)} Weeks`;
          estTeamEl.textContent = `${specialists} Dedicated Specialists`;
        }
      }, 50);
    });
  }
})();

// ---- extracted script block 3 of 11 ----
(() => {
  // --- 1. CYBER-SCRAMBLE ON HOVER ---
  const scrambleChars = '01#$@&%X+?*<>~=_';
  const numberEls = document.querySelectorAll('.strip-num, .dash-value');

  numberEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (el.dataset.scrambling) return;
      el.dataset.scrambling = '1';
      const origText = el.textContent;
      el.classList.add('scrambling');
      
      let counter = 0;
      const interval = setInterval(() => {
        el.textContent = origText.split('').map((char, i) => {
          if (char === ' ' || char === '.' || char === '%' || char === '+' || char === 'm' || char === 's') return char;
          return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
        }).join('');
        
        counter++;
        if (counter > 8) {
          clearInterval(interval);
          el.textContent = origText;
          el.classList.remove('scrambling');
          delete el.dataset.scrambling;
        }
      }, 35);
    });
  });

  // --- 2. ACOUSTIC SONAR PULSE ON DOUBLE CLICK ---
  window.addEventListener('dblclick', (e) => {
    // Drop DOM Ring
    const ring = document.createElement('div');
    ring.className = 'sonar-ring';
    ring.style.left = e.pageX + 'px';
    ring.style.top = e.pageY + 'px';
    document.body.appendChild(ring);
    setTimeout(() => ring.remove(), 1000);

    // Play Submarine Sonar Ping (440Hz -> 110Hz sweep)
    if (typeof soundEnabled !== 'undefined' && soundEnabled && typeof audioCtx !== 'undefined') {
      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(130.81, audioCtx.currentTime + 0.6); // C3
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.6);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.6);
      } catch(err){}
    }
  });

  // --- 3. GLOBAL EDGE TELEMETRY POPOVER ---
  const popover = document.getElementById('edgePopover');
  const triggerCells = document.querySelectorAll('.dash-cell');
  
  if (triggerCells.length >= 4) {
    // Attach to Latency and Jurisdictions cells (index 2 and 3)
    [triggerCells[2], triggerCells[3]].forEach(cell => {
      cell.addEventListener('mousemove', (e) => {
        popover.style.left = (e.pageX + 15) + 'px';
        popover.style.top = (e.pageY + 15) + 'px';
        popover.classList.add('show');
      });
      cell.addEventListener('mouseleave', () => popover.classList.remove('show'));
    });

    // Simulate micro-fluctuations in ping
    setInterval(() => {
      if (!popover.classList.contains('show')) return;
      document.getElementById('pingMNL').textContent = (3 + Math.floor(Math.random()*3)) + 'ms';
      document.getElementById('pingSIN').textContent = (27 + Math.floor(Math.random()*4)) + 'ms';
      document.getElementById('pingTYO').textContent = (34 + Math.floor(Math.random()*4)) + 'ms';
    }, 800);
  }

  // --- 4. COMMAND PALETTE (CMD+K / CTRL+K) ---
  const cmdBackdrop = document.getElementById('cmdBackdrop');
  const cmdInput = document.getElementById('cmdInput');
  const cmdItems = document.querySelectorAll('.cmd-item');
  let selectedIdx = 0;

  function openCmd() {
    cmdBackdrop.classList.add('open');
    cmdBackdrop.setAttribute('aria-hidden', 'false');
    setTimeout(() => cmdInput.focus(), 50);
  }
  function closeCmd() {
    cmdBackdrop.classList.remove('open');
    cmdBackdrop.setAttribute('aria-hidden', 'true');
    cmdInput.value = '';
    filterCmd('');
  }

  // Toggle on Ctrl+K or Cmd+K
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      cmdBackdrop.classList.contains('open') ? closeCmd() : openCmd();
    }
    if (e.key === 'Escape' && cmdBackdrop.classList.contains('open')) closeCmd();
  });

  cmdBackdrop.addEventListener('click', (e) => { if (e.target === cmdBackdrop) closeCmd(); });

  // Filter commands
  function filterCmd(query) {
    let visibleCount = 0;
    cmdItems.forEach((item, idx) => {
      const match = item.textContent.toLowerCase().includes(query.toLowerCase());
      item.style.display = match ? 'flex' : 'none';
      item.classList.remove('selected');
      if (match && visibleCount === 0) {
        item.classList.add('selected');
        selectedIdx = idx;
      }
      if (match) visibleCount++;
    });
  }

  cmdInput.addEventListener('input', (e) => filterCmd(e.target.value));

  // Execute action
  function execAction(action) {
    closeCmd();
    if (typeof playBlip === 'function') playBlip(740);
    setTimeout(() => {
      if (action === 'services') document.getElementById('services')?.scrollIntoView({behavior:'smooth'});
      if (action === 'contact') document.getElementById('contact')?.scrollIntoView({behavior:'smooth'});
      if (action === 'chat') document.getElementById('chatFab')?.click();
      if (action === 'theme') document.getElementById('themeToggle')?.click();
      if (action === 'sound') document.getElementById('soundToggle')?.click();
      if (action === 'stress') {
        const cell = document.querySelectorAll('.dash-cell')[1];
        if (cell) cell.click();
      }
    }, 150);
  }

  cmdItems.forEach(item => {
    item.addEventListener('click', () => execAction(item.dataset.action));
  });

  // Keyboard navigation inside Palette
  cmdInput.addEventListener('keydown', (e) => {
    const visibleItems = Array.from(cmdItems).filter(i => i.style.display !== 'none');
    if (visibleItems.length === 0) return;

    let currentVisibleIdx = visibleItems.findIndex(i => i.classList.contains('selected'));

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      visibleItems[currentVisibleIdx].classList.remove('selected');
      currentVisibleIdx = (currentVisibleIdx + 1) % visibleItems.length;
      visibleItems[currentVisibleIdx].classList.add('selected');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      visibleItems[currentVisibleIdx].classList.remove('selected');
      currentVisibleIdx = (currentVisibleIdx - 1 + visibleItems.length) % visibleItems.length;
      visibleItems[currentVisibleIdx].classList.add('selected');
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (visibleItems[currentVisibleIdx]) execAction(visibleItems[currentVisibleIdx].dataset.action);
    }
  });
})();

// ---- extracted script block 4 of 11 ----
(() => {
  // --- 1. QUAKE-STYLE TERMINAL ENGINE ---
  const term = document.getElementById('gtpiTerminal');
  const termOutput = document.getElementById('termOutput');
  const termInput = document.getElementById('termInput');
  let termOpen = false;

  function toggleTerm() {
    termOpen = !termOpen;
    term.classList.toggle('open', termOpen);
    term.setAttribute('aria-hidden', !termOpen);
    if (termOpen) {
      setTimeout(() => termInput.focus(), 100);
      if (typeof playBlip === 'function') playBlip(880);
    }
  }

  // Bind to Tilde (~) or Backtick (`)
  window.addEventListener('keydown', (e) => {
    if (e.key === '`' || e.key === '~') {
      e.preventDefault();
      toggleTerm();
    }
    if (e.key === 'Escape' && termOpen) toggleTerm();
  });

  function printTerm(text, className = '') {
    const div = document.createElement('div');
    div.className = 'term-line ' + className;
    div.innerHTML = text;
    termOutput.appendChild(div);
    termOutput.scrollTop = termOutput.scrollHeight;
  }

  const commands = {
    help: () => {
      printTerm('Available commands:', 'gold');
      printTerm('&nbsp;&nbsp;<b>status</b>&nbsp;&nbsp;&nbsp;&nbsp;- View live infrastructure health & edge node telemetry');
      printTerm('&nbsp;&nbsp;<b>ping</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Send test packets to Asian & European edge servers');
      printTerm('&nbsp;&nbsp;<b>deploy</b>&nbsp;&nbsp;&nbsp;&nbsp;- Simulate an instant zero-downtime microservice deploy');
      printTerm('&nbsp;&nbsp;<b>whoami</b>&nbsp;&nbsp;&nbsp;&nbsp;- Display current session privilege and clearance tier');
      printTerm('&nbsp;&nbsp;<b>matrix</b>&nbsp;&nbsp;&nbsp;&nbsp;- Trigger system-wide cyber scramble test');
      printTerm('&nbsp;&nbsp;<b>clear</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Clear console scrollback buffer');
      printTerm('&nbsp;&nbsp;<b>exit</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- Close interactive terminal');
    },
    status: () => {
      printTerm('SYSTEM HEALTH: <span style="color:#6FDD9A">OPTIMAL (99.98% Uptime)</span>', 'sys');
      printTerm('EDGE NODES:&nbsp;&nbsp;&nbsp;14 Active Licensed Jurisdictions [PH, SG, JP, DE, UK...]');
      printTerm('THREAT SHIELD: Active — Scrubbing SYN/UDP floods automatically.');
      printTerm('AI CORE:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Gemini 3.5 Flash connected via secure API proxy.');
    },
    ping: () => {
      printTerm('Pinging GTPI Edge Network via Anycast DNS...', 'sys');
      setTimeout(() => printTerm('Reply from PH-MNL (Manila): time=3.8ms TTL=64'), 200);
      setTimeout(() => printTerm('Reply from SG-SIN (Singapore): time=27.4ms TTL=58'), 400);
      setTimeout(() => printTerm('Reply from JP-TYO (Tokyo): time=34.1ms TTL=56'), 600);
      setTimeout(() => printTerm('0% packet loss. Optimal routing paths verified.', 'gold'), 800);
    },
    deploy: () => {
      printTerm('Initiating zero-downtime rolling deployment...', 'gold');
      setTimeout(() => printTerm('[1/3] Building container images (gtpi-core:v4.2.8)...'), 300);
      setTimeout(() => printTerm('[2/3] Swapping Kubernetes ingress pods...'), 700);
      setTimeout(() => printTerm('[3/3] Running automated smoke tests...'), 1100);
      setTimeout(() => {
        printTerm('✔ DEPLOYMENT SUCCESSFUL. Zero dropped connections recorded.', 'sys');
        if (typeof burstAt === 'function') burstAt(window.innerWidth/2, window.innerHeight/3);
      }, 1500);
    },
    whoami: () => {
      printTerm('User:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;guest@gilas-core');
      printTerm('Clearance:&nbsp;&nbsp;Level 1 (Prospective Enterprise Partner)');
      printTerm('Session ID:&nbsp;GTPI-' + Math.random().toString(36).substring(2, 9).toUpperCase());
    },
    matrix: () => {
      printTerm('Triggering global ASCII scramble...', 'err');
      document.querySelectorAll('.strip-num, .dash-value').forEach(el => {
        el.dispatchEvent(new MouseEvent('mouseenter'));
      });
      setTimeout(() => printTerm('Scramble cycle completed.'), 1000);
    },
    clear: () => { termOutput.innerHTML = ''; }
  };

  termInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const val = termInput.value.trim().toLowerCase();
      printTerm('guest@gilas-core:~$ ' + termInput.value, 'gold');
      termInput.value = '';
      if (!val) return;
      if (val === 'exit') { toggleTerm(); return; }
      if (commands[val]) {
        commands[val]();
      } else {
        printTerm(`Command not recognized: "${val}". Type <b>help</b> for command list.`, 'err');
      }
      if (typeof playBlip === 'function') playBlip(600);
    }
  });

  // --- 2. TECHNICAL SLA BLUEPRINT X-RAY MODE (Shift Key Only) ---
  const cards = document.querySelectorAll('.service-card');

  // Hard technical specs mapped to the 8 cards
  const specsData = [
    'SLA: 99.98% Uptime | Stack: AWS/K8s | Auto-scaling: <30s trigger | Redundancy: Multi-AZ failover',
    'Throughput: 4,200 Tx/s | Compliance: PCI-DSS Level 1 | Latency: <150ms | Crypto: AES-256 GCM',
    'Engine: Real-time Biometric + AI | AML: Automated SAR filing | Screen time: <4.2s verification',
    'Frameworks: PAGCOR, AMLC, GDPR | Auditing: Real-time immutable ledger | Risk Score: Automated',
    'Availability: 24/7/365 | Channels: WebSocket Live Chat, VoIP, API | Multilingual: 14 Languages',
    'Protection: Cloudflare Enterprise DDoS | Pen-Testing: Monthly automated | WAF: Custom ruleset',
    'Analytics: Real-time attribution modeling | Affiliates: Automated smart-contract payouts',
    'Profiling: Data-driven behavioral indexing | Retention: Churn predictive AI models'
  ];

  if (cards.length > 0) {
    // Inject spec divs into cards
    cards.forEach((card, idx) => {
      const specDiv = document.createElement('div');
      specDiv.className = 'blueprint-specs';
      specDiv.textContent = specsData[idx] || 'SLA: Enterprise Tier | 24/7 Monitoring | High Availability';
      card.appendChild(specDiv);
    });

    // Hold SHIFT key to peek X-Ray mode
    window.addEventListener('keydown', (e) => { 
      if (e.key === 'Shift') {
        cards.forEach(c => c.classList.add('blueprint-mode'));
      } 
    });
    
    window.addEventListener('keyup', (e) => { 
      if (e.key === 'Shift') {
        cards.forEach(c => c.classList.remove('blueprint-mode'));
      } 
    });
  }

  // --- 3. LIVE CYBER-DEFENSE THREAT INTERCEPTOR (On Card #6) ---
  const securityCard = cards[5]; // 6th card (0-indexed)
  if (securityCard) {
    const ticker = document.createElement('div');
    ticker.id = 'threatTicker';
    ticker.innerHTML = '🛡️ SHIELD ACTIVE: <span>[CLEAN] No anomalies detected</span>';
    securityCard.appendChild(ticker);

    const attacks = [
      '<span>[BLOCKED]</span> SYN Flood / 185.220.x.x -> PH-MNL',
      '<span>[SCRUBBED]</span> SQLi Payload / 45.33.21.x',
      '<span>[DEFLECTED]</span> Brute-force Auth / 89.144.x.x',
      '<span>[VERIFIED]</span> Biometric KYC Token #9942',
      '<span>[ISOLATED]</span> XSS Script Injection Scrubbed'
    ];
    let attackIdx = 0;
    let tickerSpeed = 2500;
    let tickerTimer;

    function runTicker() {
      attackIdx = (attackIdx + 1) % attacks.length;
      ticker.innerHTML = '🛡️ ' + attacks[attackIdx];
      if (securityCard.matches(':hover') && typeof playBlip === 'function') {
        playBlip(920); // Deflection audio blip when hovering over card
      }
    }
    tickerTimer = setInterval(runTicker, tickerSpeed);

    // Speed up interception rate when hovering over IT Security card
    securityCard.addEventListener('mouseenter', () => {
      clearInterval(tickerTimer);
      tickerTimer = setInterval(runTicker, 800);
      ticker.style.borderColor = 'var(--cyan)';
    });
    securityCard.addEventListener('mouseleave', () => {
      clearInterval(tickerTimer);
      tickerTimer = setInterval(runTicker, 2500);
      ticker.style.borderColor = 'rgba(231,110,76,0.4)';
    });
  }

  // --- 4. INTERACTIVE ROI & SCALING CALCULATOR WIDGET ---
  const numbersSection = document.getElementById('numbers');
  if (numbersSection) {
    const widget = document.createElement('div');
    widget.id = 'roiWidget';
    widget.innerHTML = `
      <div class="roi-header">Interactive Infrastructure & ROI Estimator</div>
      <div class="roi-sub">Drag slider to simulate your platform's Monthly Active Users (MAU) and view projected efficiency gains.</div>
      <div class="roi-slider-wrap">
        <div class="roi-val-display"><span id="mauDisplay">100,000</span> Monthly Active Users</div>
        <input type="range" id="roiSlider" min="10000" max="1000000" step="10000" value="100000" aria-label="Monthly Active Users Slider">
      </div>
      <div class="roi-grid">
        <div class="roi-box">
          <div class="roi-box-val" id="costSave">32%</div>
          <div class="roi-box-label">Est. Infra Cost Savings</div>
        </div>
        <div class="roi-box">
          <div class="roi-box-val" id="latReduce">-42ms</div>
          <div class="roi-box-label">p99 Latency Reduction</div>
        </div>
        <div class="roi-box">
          <div class="roi-box-val" id="hrsSave">160 hrs</div>
          <div class="roi-box-label">Compliance Hours Saved / Mo</div>
        </div>
      </div>
    `;
    numbersSection.appendChild(widget);

    const slider = document.getElementById('roiSlider');
    const mauDisp = document.getElementById('mauDisplay');
    const costSave = document.getElementById('costSave');
    const latReduce = document.getElementById('latReduce');
    const hrsSave = document.getElementById('hrsSave');

    slider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      mauDisp.textContent = val.toLocaleString();

      // Algorithmic projection scaling
      const cost = Math.min(48, Math.round(24 + (val / 1000000) * 24));
      const lat = Math.round(25 + (val / 1000000) * 35);
      const hrs = Math.round(60 + (val / 10000) * 4.5);

      costSave.textContent = cost + '%';
      latReduce.textContent = '-' + lat + 'ms';
      hrsSave.textContent = hrs.toLocaleString() + ' hrs';
    });

    slider.addEventListener('change', () => {
      if (typeof playBlip === 'function') playBlip(680);
      if (typeof burstAt === 'function') {
        const rect = slider.getBoundingClientRect();
        burstAt(rect.left + rect.width/2, rect.top);
      }
    });
  }
})();

// ---- extracted script block 5 of 11 ----
(() => {
  // --- 1. IDLE SOC SCREENSAVER ---
  // Fades in a cinematic HUD if the user is inactive for 15 seconds
  const idleHud = document.getElementById('idleHud');
  const hudData = document.getElementById('hudData');
  let idleTimer;
  const IDLE_TIME = 15000; // 15 seconds

  function resetIdle() {
    idleHud.classList.remove('active');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      idleHud.classList.add('active');
      simulateHudData();
    }, IDLE_TIME);
  }

  function simulateHudData() {
    if(!idleHud.classList.contains('active')) return;
    const regions = ['PH-MNL', 'SG-SIN', 'JP-TYO', 'US-WEST', 'EU-FRA'];
    const r = regions[Math.floor(Math.random() * regions.length)];
    hudData.textContent = `ANOMALY SCAN: ${r} | PKT_LOSS: 0.00% | CRYPTO: AES-256 GCM`;
    setTimeout(simulateHudData, 2000);
  }

  window.addEventListener('mousemove', resetIdle);
  window.addEventListener('keydown', resetIdle);
  window.addEventListener('scroll', resetIdle, {passive: true});
  window.addEventListener('click', resetIdle);
  resetIdle();

  // --- 2. SMART TEXT SELECTION TOOLTIP ---
  // Pops up a sleek "Copy" button when user highlights text
  const tooltip = document.getElementById('selectionTooltip');
  
  document.addEventListener('selectionchange', () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (text.length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // Position the tooltip above the selected text
      tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + window.scrollX + 'px';
      tooltip.style.top = (rect.top - 45) + window.scrollY + 'px';
      tooltip.classList.add('show');
    } else {
      tooltip.classList.remove('show');
    }
  });

  tooltip.addEventListener('click', () => {
    const text = window.getSelection().toString();
    if(text && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      tooltip.textContent = 'Copied!';
      if(typeof playBlip === 'function') playBlip(800);
      
      // Reset the tooltip state
      setTimeout(() => {
        tooltip.classList.remove('show');
        setTimeout(() => tooltip.textContent = 'Copy to Clipboard', 300);
      }, 1500);
    }
  });
})();

// ---- extracted script block 6 of 11 ----
(() => {
  // --- 1. FIBER-OPTIC DATA STREAMS ---
  // Spawns shooting light beams across the background grid
  function spawnDataStream() {
    // Only spawn if tab is active to save resources
    if (document.hidden) return;

    const stream = document.createElement('div');
    const isHorizontal = Math.random() > 0.5;
    
    if (isHorizontal) {
      stream.className = 'network-stream stream-horiz';
      stream.style.top = Math.floor(Math.random() * window.innerHeight) + 'px';
      stream.style.animationDuration = (1.5 + Math.random() * 2) + 's';
    } else {
      stream.className = 'network-stream stream-vert';
      stream.style.left = Math.floor(Math.random() * window.innerWidth) + 'px';
      stream.style.animationDuration = (1.5 + Math.random() * 2) + 's';
    }
    
    document.body.appendChild(stream);
    
    // Cleanup after animation finishes
    setTimeout(() => { stream.remove(); }, 4000);
  }
  
  // Spawn a new packet every 800ms
  setInterval(spawnDataStream, 800);


  // --- 2. LIVE FPS & PERFORMANCE MONITOR ---
  const fpsVal = document.getElementById('fpsVal');
  const memVal = document.getElementById('memVal');
  let lastTime = performance.now();
  let frames = 0;

  function updatePerformance() {
    const now = performance.now();
    frames++;
    
    if (now >= lastTime + 1000) {
      const fps = Math.round((frames * 1000) / (now - lastTime));
      fpsVal.textContent = fps + '.0';
      
      // Turn red if frame rate drops
      fpsVal.style.color = fps < 45 ? '#E76E4C' : '#6FDD9A';
      
      frames = 0;
      lastTime = now;

      // Update Memory if browser supports it
      if (performance.memory && performance.memory.usedJSHeapSize) {
        const memMB = Math.round(performance.memory.usedJSHeapSize / (1024 * 1024));
        memVal.textContent = memMB + ' MB';
      }
    }
    requestAnimationFrame(updatePerformance);
  }
  requestAnimationFrame(updatePerformance);


  // --- 3. MAGNETIC FOOTER LINKS ---
  const footerLinks = document.querySelectorAll('.footer-col a');
  
  footerLinks.forEach(link => {
    link.addEventListener('mousemove', (e) => {
      const rect = link.getBoundingClientRect();
      // Calculate cursor position relative to the center of the link
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      // Pull the link towards the cursor slightly (multiplier controls strength)
      link.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
      link.style.color = 'var(--gold)';
    });

    link.addEventListener('mouseleave', () => {
      // Snap back to original position
      link.style.transform = 'translate(0, 0)';
      link.style.color = '';
    });
  });
})();

// ---- extracted script block 7 of 11 ----
(() => {
  // --- 1. APPLE-STYLE 3D DASHBOARD PHYSICS ---
  const dashboard = document.querySelector('.dashboard');
  if (dashboard) {
    dashboard.addEventListener('mousemove', (e) => {
      // Don't tilt if viewing on mobile
      if (window.innerWidth <= 768) return; 

      const rect = dashboard.getBoundingClientRect();
      const x = e.clientX - rect.left; 
      const y = e.clientY - rect.top;
      
      // Calculate rotation between -6 and +6 degrees
      const px = x / rect.width; 
      const py = y / rect.height;
      const rotateX = (py - 0.5) * -12; 
      const rotateY = (px - 0.5) * 12;

      // Apply 3D transform and dynamic dynamic shadow
      dashboard.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      dashboard.style.boxShadow = `${(px - 0.5) * -30}px ${(py - 0.5) * -30}px 50px rgba(0,0,0,0.5), 0 0 20px rgba(82, 220, 224, 0.15)`;
    });

    dashboard.addEventListener('mouseleave', () => {
      // Snap back to flat
      dashboard.style.transform = 'perspective(1200px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      dashboard.style.boxShadow = '';
    });
  }

  // --- 2. TERMINAL TYPEWRITER BOOT-UP ---
  const subTextEl = document.querySelector('.hero-sub');
  if (subTextEl) {
    const fullText = subTextEl.textContent;
    subTextEl.textContent = ''; // Clear it out initially
    let charIndex = 0;

    function typeWriter() {
      if (charIndex < fullText.length) {
        subTextEl.textContent += fullText.charAt(charIndex);
        charIndex++;
        // Randomize typing speed slightly for human/terminal feel (10ms - 35ms)
        setTimeout(typeWriter, Math.random() * 25 + 10);
      } else {
        subTextEl.classList.add('typed-done');
      }
    }
    // Start typing 400ms after script execution
    setTimeout(typeWriter, 400);
  }

  // --- 3. THE KONAMI CODE -> SYNTHWAVE OVERDRIVE ---
  // Up, Up, Down, Down, Left, Right, Left, Right, B, A
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let konamiIndex = 0;

  window.addEventListener('keydown', (e) => {
    // Check if key matches the next step in the sequence
    if (e.key === konamiCode[konamiIndex] || e.key.toLowerCase() === konamiCode[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiCode.length) {
        activateOverdrive();
        konamiIndex = 0; // Reset
      }
    } else {
      konamiIndex = 0; // Restart sequence if a mistake is made
    }
  });

  function activateOverdrive() {
    document.body.classList.toggle('synthwave-mode');
    
    // Play power-up sound
    if (typeof playBlip === 'function') {
      setTimeout(() => playBlip(440), 0);
      setTimeout(() => playBlip(554.37), 100); // C#
      setTimeout(() => playBlip(659.25), 200); // E
      setTimeout(() => playBlip(880), 300);    // A
    }

    // Trigger visual explosion
    if (typeof burstAt === 'function') {
      burstAt(window.innerWidth / 2, window.innerHeight / 2);
      setTimeout(() => burstAt(window.innerWidth / 3, window.innerHeight / 3), 100);
      setTimeout(() => burstAt(window.innerWidth / 1.5, window.innerHeight / 1.5), 200);
    }
    
    // Toast notification
    if (typeof showToast === 'function') {
      const msg = document.body.classList.contains('synthwave-mode') 
        ? '👾 OVERDRIVE ENGAGED: SYNTHWAVE PROTOCOL' 
        : '👾 OVERDRIVE DISABLED: STANDARD PROTOCOL';
      showToast(msg, 3000);
    }
  }

  // --- 4. DEVTOOLS HACKER RECRUITMENT PAYLOAD ---
  // If someone presses F12 or opens console, they see this
  setTimeout(() => {
    console.log(
      "%c \u25A0 GILAS TECH PHILIPPINES INC. \u25A0 ", 
      "color: #10121A; background: #E7B24C; font-size: 22px; font-weight: bold; padding: 4px 20px; border-radius: 4px;"
    );
    console.log(
      "%c> System Architecture: VERIFIED\n> Edge Network: SECURE\n> Root Access: DENIED", 
      "color: #52DCE0; font-size: 14px; font-family: monospace; padding-top: 10px;"
    );
    console.log(
      "%cIf you are reading this, your browser's DevTools are open.\nWe like people who look under the hood.\n\nDrop us an email: hr@gilastech.com", 
      "color: #9297AA; font-size: 14px; font-family: monospace; padding-top: 10px;"
    );
  }, 1000);
})();

// ---- extracted script block 8 of 11 ----
(() => {
  // Utility: Check if user is typing in an input/textarea so we don't trigger hotkeys
  function isTyping() {
    const tag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
    return tag === 'input' || tag === 'textarea';
  }

  // --- 1. FLASHLIGHT FOCUS MODE (Press 'F') ---
  const flashlight = document.getElementById('focusFlashlight');
  let focusActive = false;

  window.addEventListener('keydown', (e) => {
    if (isTyping()) return;
    if (e.key.toLowerCase() === 'f') {
      focusActive = !focusActive;
      flashlight.classList.toggle('active', focusActive);
      if (typeof playBlip === 'function') playBlip(focusActive ? 300 : 400);
      if (typeof showToast === 'function') showToast(focusActive ? 'Focus Mode Enabled' : 'Focus Mode Disabled');
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (focusActive) {
      flashlight.style.setProperty('--fx', e.clientX + 'px');
      flashlight.style.setProperty('--fy', e.clientY + 'px');
    }
  });

  // --- 2. HARDWARE BATTERY TELEMETRY ---
  // Injects live battery stats into the Performance Monitor (Pack #5)
  const perfMonitor = document.getElementById('perfMonitor');
  if (perfMonitor && navigator.getBattery) {
    const batRow = document.createElement('div');
    batRow.className = 'perf-row';
    batRow.innerHTML = `<span class="perf-label">BAT</span><span id="batVal">--%</span>`;
    perfMonitor.appendChild(batRow);

    navigator.getBattery().then(battery => {
      function updateBattery() {
        const level = Math.round(battery.level * 100);
        const isCharging = battery.charging ? '⚡' : '';
        const batEl = document.getElementById('batVal');
        if (batEl) {
          batEl.textContent = `${level}% ${isCharging}`;
          batEl.style.color = level <= 20 && !battery.charging ? '#E76E4C' : '#6FDD9A';
        }
      }
      updateBattery();
      battery.addEventListener('levelchange', updateBattery);
      battery.addEventListener('chargingchange', updateBattery);
    });
  }

  // --- 3. VOICE-ACTIVATED COMMAND CENTER (Hold 'V') ---
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const voiceHud = document.getElementById('voiceHud');
  const transcriptEl = document.getElementById('voiceTranscript');
  let recognition;
  let isListening = false;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      isListening = true;
      voiceHud.classList.add('listening');
      transcriptEl.textContent = "Listening... (Hold 'V')";
      if (typeof playBlip === 'function') playBlip(800);
    };

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript.toLowerCase().trim();
      transcriptEl.textContent = `"${transcript}"`;

      if (event.results[current].isFinal) {
        processVoiceCommand(transcript);
      }
    };

    recognition.onerror = () => { stopListening(); };
    recognition.onend = () => { stopListening(); };
  }

  function stopListening() {
    isListening = false;
    voiceHud.classList.remove('listening');
    if (recognition) recognition.stop();
  }

  window.addEventListener('keydown', (e) => {
    if (isTyping() || !SpeechRecognition) return;
    if (e.key.toLowerCase() === 'v' && !isListening) {
      try { recognition.start(); } catch(err){}
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.key.toLowerCase() === 'v' && isListening) {
      stopListening();
    }
  });

  function processVoiceCommand(cmd) {
    if (typeof playBlip === 'function') playBlip(950);
    
    if (cmd.includes('overdrive') || cmd.includes('synthwave')) {
      document.body.classList.toggle('synthwave-mode');
      if (typeof showToast === 'function') showToast('Voice Command: Overdrive Toggled');
    } 
    else if (cmd.includes('terminal') || cmd.includes('console')) {
      const term = document.getElementById('gtpiTerminal');
      if (term) {
        const isOpen = term.classList.contains('open');
        term.classList.toggle('open', !isOpen);
        term.setAttribute('aria-hidden', isOpen);
      }
    }
    else if (cmd.includes('services') || cmd.includes('what do you do')) {
      document.getElementById('services')?.scrollIntoView({behavior: 'smooth'});
    }
    else if (cmd.includes('contact') || cmd.includes('email')) {
      document.getElementById('contact')?.scrollIntoView({behavior: 'smooth'});
    }
    else if (cmd.includes('light theme') || cmd.includes('dark theme')) {
      document.getElementById('themeToggle')?.click();
    }
    else if (cmd.includes('chat') || cmd.includes('assistant')) {
      document.getElementById('chatFab')?.click();
    }
  }
})();

// ---- extracted script block 9 of 11 ----
(() => {
 // --- 1. TAB ABANDONMENT PROTOCOL (Page Visibility API) ---
  const originalTitle = document.title;
  let titleInterval;
  let marqueeText = "Gilas Tech Philippines Inc. • "; // Added a bullet for a clean looping separator

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Dim the screen as before
      document.body.classList.add('admin-away');
      
      // Start the left-phasing marquee
      titleInterval = setInterval(() => {
        // Take the first character and move it to the very end
        marqueeText = marqueeText.substring(1) + marqueeText[0];
        document.title = marqueeText;
      }, 250); // Adjust this number (e.g., 200-300) to change the scrolling speed

    } else {
      // Restore normal state when user returns
      document.body.classList.remove('admin-away');
      clearInterval(titleInterval);
      document.title = originalTitle;
      
      // Reset the text so it starts fresh next time they leave
      marqueeText = "Gilas Tech Philippines Inc. • "; 
      
      if (typeof playBlip === 'function') playBlip(900);
    }
  });
  // --- 2. TEXT-TO-SPEECH (TTS) SYSTEM ANNOUNCER ---
  // We elegantly wrap your existing showToast function to add voice without breaking old code.
  if (typeof window.showToast === 'function' && 'speechSynthesis' in window) {
    const originalShowToast = window.showToast;
    
    window.showToast = function(msg, duration) {
      // Call the original visual toast
      originalShowToast(msg, duration);
      
      // If the user has turned on interface sounds, speak the message
      if (typeof soundEnabled !== 'undefined' && soundEnabled) {
        window.speechSynthesis.cancel(); // Stop any currently playing audio
        const utterance = new SpeechSynthesisUtterance(msg);
        utterance.rate = 1.15; // Slightly faster, robotic tempo
        utterance.pitch = 0.9;
        window.speechSynthesis.speak(utterance);
      }
    };
  }

  // --- 3. NATIVE GAMEPAD / CONTROLLER SUPPORT ---
  let gamepadConnected = false;
  let lastButtonStates = {};

  window.addEventListener("gamepadconnected", (e) => {
    gamepadConnected = true;
    if (typeof showToast === 'function') showToast(`Gamepad Connected: ${e.gamepad.id}`);
    requestAnimationFrame(gamepadLoop);
  });

  window.addEventListener("gamepaddisconnected", (e) => {
    gamepadConnected = false;
    if (typeof showToast === 'function') showToast('Gamepad Disconnected');
  });

  function gamepadLoop() {
    if (!gamepadConnected) return;
    const gamepads = navigator.getGamepads();
    const gp = gamepads[0]; // Grab player 1

    if (gp) {
      // Analog Stick Scrolling (Left Stick Y-Axis)
      const leftY = gp.axes[1];
      if (Math.abs(leftY) > 0.15) { // Deadzone threshold
        window.scrollBy({ top: leftY * 20, behavior: 'auto' });
      }

      // Button Mapping with basic debounce
      const currentButtons = {
        A: gp.buttons[0]?.pressed, // Xbox A / PS Cross
        Y: gp.buttons[3]?.pressed  // Xbox Y / PS Triangle
      };

      // Press A/Cross to open Chat
      if (currentButtons.A && !lastButtonStates.A) {
        document.getElementById('chatFab')?.click();
      }
      
      // Press Y/Triangle to toggle Quake Terminal
      if (currentButtons.Y && !lastButtonStates.Y) {
        const term = document.getElementById('gtpiTerminal');
        if (term) {
          const isOpen = term.classList.contains('open');
          term.classList.toggle('open', !isOpen);
          term.setAttribute('aria-hidden', isOpen);
          if (!isOpen && typeof playBlip === 'function') playBlip(880);
        }
      }

      lastButtonStates = currentButtons;
    }
    requestAnimationFrame(gamepadLoop);
  }

  // --- 4. MOBILE GYROSCOPE 3D PARALLAX ---
  // Upgrades the Dashboard 3D tilt from Pack 6 to work with smartphone motion sensors
  const dashboard = document.querySelector('.dashboard');
  
  if (dashboard && window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', (e) => {
      // Only execute if on a mobile/tablet-sized screen
      if (window.innerWidth > 768) return;
      
      // e.gamma is left-to-right tilt in degrees, e.beta is front-to-back tilt in degrees.
      let tiltX = e.gamma; 
      let tiltY = e.beta;
      
      // Clamp values to prevent excessive flipping
      if (tiltX > 30) tiltX = 30;
      if (tiltX < -30) tiltX = -30;
      if (tiltY > 60) tiltY = 60;
      if (tiltY < 30) tiltY = 30; // Assuming resting in hand is around 45 degrees

      // Normalize Y around a resting 45 degree angle
      const rotateX = (tiltY - 45) * -0.5;
      const rotateY = tiltX * 0.5;

      dashboard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      dashboard.style.boxShadow = `${-rotateY}px ${rotateX}px 30px rgba(0,0,0,0.4), 0 0 15px rgba(82, 220, 224, 0.1)`;
    }, true);
  }
})();

// ---- extracted script block 10 of 11 ----
(() => {
  // --- 1. CUSTOM CYBER-OS CONTEXT MENU ---
  const ctxMenu = document.createElement('div');
  ctxMenu.id = 'customContextMenu';
  ctxMenu.innerHTML = `
    <div class="ctx-item" data-act="chat">Ping AI Assistant <span>💬</span></div>
    <div class="ctx-item" data-act="term">Developer Terminal <span>~</span></div>
    <div class="ctx-item" data-act="theme">Toggle Theme <span>🌓</span></div>
    <div class="ctx-item" data-act="copy">Copy Page URL <span>🔗</span></div>
  `;
  document.body.appendChild(ctxMenu);

  document.addEventListener('contextmenu', (e) => {
    // Preserve native right-click inside inputs so users can paste text
    if (e.target.closest('input') || e.target.closest('textarea')) return; 
    
    e.preventDefault();
    
    // Boundary collision detection so menu doesn't clip off screen
    let x = e.clientX;
    let y = e.clientY;
    if (x + 180 > window.innerWidth) x = window.innerWidth - 180 - 10;
    if (y + 150 > window.innerHeight) y = window.innerHeight - 150 - 10;

    ctxMenu.style.left = x + 'px';
    ctxMenu.style.top = y + 'px';
    ctxMenu.classList.add('active');
    
    if (typeof playBlip === 'function') playBlip(750);
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#customContextMenu')) {
      ctxMenu.classList.remove('active');
    }
  });

  ctxMenu.addEventListener('click', (e) => {
    const act = e.target.closest('.ctx-item')?.dataset.act;
    if (!act) return;

    if (act === 'chat') document.getElementById('chatFab')?.click();
    if (act === 'term') window.dispatchEvent(new KeyboardEvent('keydown', {key: '~'}));
    if (act === 'theme') document.getElementById('themeToggle')?.click();
    if (act === 'copy') {
      navigator.clipboard.writeText(window.location.href);
      if (typeof showToast === 'function') showToast('Page URL Copied to Clipboard');
    }
    
    ctxMenu.classList.remove('active');
    if (typeof playBlip === 'function') playBlip(850);
  });


  // --- 2. LIVE NETWORK & HARDWARE TELEMETRY ---
  const perf = document.getElementById('perfMonitor');
  if (perf) {
    // Hardware CPU Cores
    if (navigator.hardwareConcurrency) {
      const cpuRow = document.createElement('div');
      cpuRow.className = 'perf-row';
      cpuRow.innerHTML = `<span class="perf-label">CPU</span><span id="cpuVal">${navigator.hardwareConcurrency} Cores</span>`;
      perf.appendChild(cpuRow);
    }

    // Network Bandwidth Estimate
    if (navigator.connection && navigator.connection.downlink) {
      const netRow = document.createElement('div');
      netRow.className = 'perf-row';
      netRow.innerHTML = `<span class="perf-label">NET</span><span id="netVal">${navigator.connection.downlink} Mbps</span>`;
      perf.appendChild(netRow);

      navigator.connection.addEventListener('change', () => {
        const netEl = document.getElementById('netVal');
        if (netEl) netEl.textContent = navigator.connection.downlink + ' Mbps';
      });
    }
  }


  // --- 3. DYNAMIC CLI FAVICON (ONLY WHEN TAB IS INACTIVE) ---
  const favFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let favIdx = 0;
  let favInterval;
  
  const canvasFav = document.createElement('canvas');
  canvasFav.width = 32; 
  canvasFav.height = 32;
  const ctxFav = canvasFav.getContext('2d');
  
  let linkFav = document.querySelector("link[rel~='icon']");
  if (!linkFav) {
    linkFav = document.createElement('link');
    linkFav.rel = 'icon';
    document.head.appendChild(linkFav);
  }
  
  // Save the original Gilas Tech logo URL to restore later
  const originalFavHref = linkFav.href;

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // User left the tab -> Start spinning the CLI loader
      favInterval = setInterval(() => {
        ctxFav.clearRect(0, 0, 32, 32);
        ctxFav.fillStyle = document.body.classList.contains('light-theme') ? '#10121A' : '#52DCE0';
        ctxFav.font = '26px monospace';
        ctxFav.textAlign = 'center';
        ctxFav.textBaseline = 'middle';
        ctxFav.fillText(favFrames[favIdx], 16, 16);
        
        linkFav.href = canvasFav.toDataURL('image/png');
        favIdx = (favIdx + 1) % favFrames.length;
      }, 120);
    } else {
      // User came back -> Stop animation and restore original logo
      clearInterval(favInterval);
      linkFav.href = originalFavHref;
    }
  });

})();

// ---- extracted script block 11 of 11 ----
(() => {
  // --- 1. VERTICAL LASER PROGRESS TRACKER ---
  const vLaser = document.getElementById('verticalLaser');
  window.addEventListener('scroll', () => {
    const scrolled = document.documentElement.scrollTop;
    const max = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    vLaser.style.height = (max > 0 ? (scrolled / max) * 100 : 0) + '%';
  }, { passive: true });

  // --- 2. MAGNETIC KINETIC TYPOGRAPHY ---
  // Wraps the golden <em> words in individual spans so they can physically dodge the cursor
  const emElements = document.querySelectorAll('h1 em');
  const allCharSpans = [];

  emElements.forEach(em => {
    // Prevent double-wrapping if the code runs twice
    if (em.dataset.kinetic) return;
    em.dataset.kinetic = 'true';

    const text = em.innerText;
    em.innerHTML = ''; // Clear text
    
    text.split('').forEach(char => {
      const span = document.createElement('span');
      span.className = 'kinetic-char';
      span.innerText = char === ' ' ? '\u00A0' : char; // Preserve spaces
      em.appendChild(span);
      allCharSpans.push(span);
    });
  });

  const heroSection = document.getElementById('top');
  if (heroSection) {
    heroSection.addEventListener('mousemove', (e) => {
      // Don't apply on mobile viewports for performance
      if (window.innerWidth <= 768) return;

      allCharSpans.forEach(span => {
        const rect = span.getBoundingClientRect();
        const charX = rect.left + rect.width / 2;
        const charY = rect.top + rect.height / 2;
        
        // Calculate distance from cursor to character
        const dx = e.clientX - charX;
        const dy = e.clientY - charY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // If cursor is within 80px, push the character away
        if (dist < 80) {
          const angle = Math.atan2(dy, dx);
          const pushForce = (80 - dist) * 0.4; // Multiplier controls repulsion strength
          
          span.style.transform = `translate(${Math.cos(angle) * -pushForce}px, ${Math.sin(angle) * -pushForce}px)`;
          span.style.color = '#fff'; // Flash white when repelled
          span.style.textShadow = '0 0 15px var(--cyan)';
        } else {
          span.style.transform = 'translate(0, 0)';
          span.style.color = '';
          span.style.textShadow = 'none';
        }
      });
    });

    heroSection.addEventListener('mouseleave', () => {
      // Snap all characters back into place when mouse leaves the hero area
      allCharSpans.forEach(span => {
        span.style.transform = 'translate(0, 0)';
        span.style.color = '';
        span.style.textShadow = 'none';
      });
    });
  }

  // --- 3. DIGITAL RAIN TERMINAL COMMAND ---
  // Hooks into your existing Quake Terminal (Pack 3) to add a secret full-screen 'rain' command
  const termInput10 = document.getElementById('termInput');
  
  if (termInput10) {
    termInput10.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && termInput10.value.trim().toLowerCase() === 'rain') {
        triggerMatrixRain();
        // Play an appropriate sound if available
        if (typeof playBlip === 'function') {
          playBlip(300); setTimeout(() => playBlip(200), 150);
        }
      }
    });
  }

  function triggerMatrixRain() {
    // Prevent multiple canvases
    if (document.getElementById('matrixCanvas')) return;

    const cvs = document.createElement('canvas');
    cvs.id = 'matrixCanvas';
    cvs.style.position = 'fixed';
    cvs.style.inset = '0';
    cvs.style.zIndex = '9000'; // Sits just below the OS Context Menu
    cvs.style.pointerEvents = 'none';
    cvs.style.opacity = '0.85';
    document.body.appendChild(cvs);

    const ctx = cvs.getContext('2d');
    cvs.width = window.innerWidth; 
    cvs.height = window.innerHeight;

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*<>~'.split('');
    const fontSize = 16;
    const columns = cvs.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    const rainInterval = setInterval(() => {
      // Black background with slight opacity for the trailing fade effect
      ctx.fillStyle = 'rgba(16, 18, 26, 0.08)';
      ctx.fillRect(0, 0, cvs.width, cvs.height);
      
      ctx.fillStyle = '#6FDD9A'; // Matches your terminal green
      ctx.font = fontSize + 'px monospace';
      
      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        
        // Randomly reset drops to the top
        if (drops[i] * fontSize > cvs.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }, 35); // 35ms per frame

    // Auto-destroy the matrix rain after 10 seconds
    setTimeout(() => {
      clearInterval(rainInterval);
      cvs.style.transition = 'opacity 2s ease';
      cvs.style.opacity = '0';
      setTimeout(() => cvs.remove(), 2000);
      if (typeof showToast === 'function') showToast('Matrix Subroutine Terminated');
    }, 10000);
  }

  // Handle window resizing for the matrix canvas
  window.addEventListener('resize', () => {
    const cvs = document.getElementById('matrixCanvas');
    if (cvs) {
      cvs.width = window.innerWidth;
      cvs.height = window.innerHeight;
    }
  });

})();
