/**
 * script.js — Undangan Digital Pernikahan
 * Includes: Firebase Firestore, countdown, RSVP, maps, mobile nav
 */

// ─── WEDDING DATE ───
const WEDDING_DATE = new Date('2025-06-14T08:00:00');

// ─── SEED DATA (fallback jika Firebase belum dikonfigurasi) ───
const SEED_WISHES = [
  { id: 'seed1', name: 'Budi Santoso',    text: 'Selamat menempuh hidup baru! Semoga menjadi pasangan sakinah mawaddah warahmah. Bahagia selalu ya! 🤲', timestamp: { toDate: () => new Date(Date.now() - 3*3600000) } },
  { id: 'seed2', name: 'Rina Kusuma',     text: 'MasyaAllah, semoga Allah meridhoi dan memberkahi pernikahan kalian ❤️', timestamp: { toDate: () => new Date(Date.now() - 6*3600000) } },
  { id: 'seed3', name: 'Hendra Wijaya',   text: 'Selamat ya! Semoga langgeng dan lekas diberi momongan yang sholeh/sholehah 🤲', timestamp: { toDate: () => new Date(Date.now() - 10*3600000) } },
];

// ─── FIREBASE DB REFERENCE ───
let db = null;
let wishesUnsubscribe = null;

// ─── NOMOR WHATSAPP ───
const WA_NUMBER = '6281514610382';

// ─── INIT ───
window.addEventListener('DOMContentLoaded', () => {
  // Kunci scroll selama cover tampil
  document.body.style.overflow = 'hidden';
  initLoading();
  updateCountdown();
  setInterval(updateCountdown, 1000);
});

/* ============================================================
   LOADING SCREEN
   ============================================================ */
function initLoading() {
  setTimeout(() => {
    const screen = document.getElementById('loading-screen');
    screen.classList.add('fade-out');
    setTimeout(() => {
      screen.style.display = 'none';
      spawnPetals();
    }, 800);
  }, 2300);
}

/* ============================================================
   PETALS
   ============================================================ */
function spawnPetals() {
  const container = document.getElementById('petals');
  if (!container) return;
  const emojis = ['🌸', '🌺', '🌼', '✿', '❀'];
  for (let i = 0; i < 15; i++) {
    const petal = document.createElement('span');
    petal.className = 'petal';
    petal.textContent = emojis[i % emojis.length];
    petal.style.cssText = `
      left: ${Math.random() * 100}%;
      font-size: ${0.7 + Math.random() * 1}rem;
      animation-duration: ${9 + Math.random() * 10}s;
      animation-delay: ${Math.random() * 12}s;
    `;
    container.appendChild(petal);
  }
}

/* ============================================================
   OPEN INVITATION
   ============================================================ */
document.getElementById('btn-open-invitation').addEventListener('click', openInvitation);

function openInvitation() {
  const cover = document.getElementById('page-cover');
  const main  = document.getElementById('main-invitation');

  // Animate cover out
  cover.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  cover.style.opacity    = '0';
  cover.style.transform  = 'scale(1.04)';

  setTimeout(() => {
    cover.style.display = 'none';
    // Buka kembali scroll
    document.body.style.overflow = '';
    main.classList.remove('hidden');
    main.style.opacity    = '0';
    main.style.transition = 'opacity 0.5s ease';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => { main.style.opacity = '1'; });
    });

    // Try music autoplay
    tryPlayMusic();

    // Scroll to top of couple section
    setTimeout(() => {
      document.getElementById('page-couple').scrollIntoView({ behavior: 'smooth' });
      initScrollReveal();
      initBottomNav();
      initFirebase();
    }, 150);
  }, 700);
}

/* ============================================================
   MUSIC
   ============================================================ */
const musicBtn = document.getElementById('music-btn');
const bgMusic  = document.getElementById('bg-music');

function tryPlayMusic() {
  bgMusic.volume = 0.3;
  bgMusic.play().then(() => {
    musicBtn.classList.add('playing');
    musicBtn.querySelector('.music-icon').textContent = '♫';
  }).catch(() => { /* user hasn't interacted yet */ });
}

musicBtn.addEventListener('click', () => {
  if (bgMusic.paused) {
    bgMusic.play();
    musicBtn.classList.add('playing');
    musicBtn.querySelector('.music-icon').textContent = '♫';
  } else {
    bgMusic.pause();
    musicBtn.classList.remove('playing');
    musicBtn.querySelector('.music-icon').textContent = '♪';
  }
});

/* ============================================================
   COUNTDOWN
   ============================================================ */
function updateCountdown() {
  const now  = new Date();
  const diff = WEDDING_DATE - now;

  if (diff <= 0) {
    ['cnt-days','cnt-hours','cnt-mins','cnt-secs'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '00';
    });
    const label = document.querySelector('.countdown-label');
    if (label) label.textContent = '🎉 Hari Bahagia Telah Tiba!';
    return;
  }

  const pad = n => String(n).padStart(2, '0');
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  setCounterWithFlip('cnt-days',  pad(d));
  setCounterWithFlip('cnt-hours', pad(h));
  setCounterWithFlip('cnt-mins',  pad(m));
  setCounterWithFlip('cnt-secs',  pad(s));
}

// Subtle flip animation when digit changes
function setCounterWithFlip(id, val) {
  const el = document.getElementById(id);
  if (!el) return;
  if (el.textContent !== val) {
    el.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
    el.style.opacity    = '0.4';
    el.style.transform  = 'scale(0.85)';
    setTimeout(() => {
      el.textContent      = val;
      el.style.opacity    = '1';
      el.style.transform  = 'scale(1)';
    }, 120);
  }
}

/* ============================================================
   MAP TABS
   ============================================================ */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('.map-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    document.getElementById('map-' + tab).classList.add('active');
  });
});

/* ============================================================
   RSVP FORM
   ============================================================ */
document.getElementById('rsvp-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const name   = document.getElementById('rsvp-name').value.trim();
  if (!name) { shakeInput(document.getElementById('rsvp-name')); return; }

  const attend = document.querySelector('input[name="attend"]:checked').value;
  const guests = document.getElementById('rsvp-guests').value || '';

  // Susun pesan pure teks
  let pesan = '';
  if (attend === 'hadir') {
    const jml = guests ? ` (${guests} orang)` : '';
    pesan =
      `Assalamualaikum warahmatullahi wabarakatuh.\n\n` +
      `Perkenalkan, saya ${name}. Saya ingin mengkonfirmasi kehadiran saya${jml} pada acara pernikahan Rizky dan Aulia, Sabtu 14 Juni 2025. Insya Allah kami dapat hadir.\n\n` +
      `Barakallahu lakuma wa baraka alaikuma wa jama a bainakuma fi khair. Aamiin.`;
  } else {
    pesan =
      `Assalamualaikum warahmatullahi wabarakatuh.\n\n` +
      `Perkenalkan, saya ${name}. Mohon maaf, saya tidak dapat hadir pada acara pernikahan Rizky dan Aulia, Sabtu 14 Juni 2025.\n\n` +
      `Semoga acara pernikahannya berjalan lancar dan penuh berkah. Aamiin.`;
  }

  const btn = document.getElementById('btn-rsvp');
  btn.textContent = 'Membuka WhatsApp...';
  btn.disabled = true;

  const success = document.getElementById('rsvp-success');
  success.classList.remove('hidden');
  success.textContent = attend === 'hadir'
    ? `Terima kasih, ${name}! WhatsApp sedang dibuka...`
    : `Terima kasih, ${name}! Doa terbaik kami menyertai Anda.`;

  setTimeout(() => {
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(pesan)}`, '_blank');
  }, 800);
});

function shakeInput(el) {
  el.style.animation = 'none';
  el.offsetHeight; // reflow
  el.style.animation = 'shake 0.4s ease';
  el.focus();
}

// Simple shake keyframe (added via JS)
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%,100%{ transform: translateX(0); }
    25%{ transform: translateX(-8px); }
    75%{ transform: translateX(8px); }
  }
`;
document.head.appendChild(shakeStyle);

/* ============================================================
   FIREBASE — WISHES (Real-time)
   ============================================================ */
async function initFirebase() {
  const statusDot  = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');

  // Check if Firebase is configured
  if (!window.IS_FIREBASE_READY) {
    // Use local fallback
    setStatus('offline', 'Mode demo (lokal)');
    loadLocalWishes();
    return;
  }

  try {
    // Dynamically import Firebase (CDN module)
    const { initializeApp }              = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
    const { getFirestore, collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp }
      = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');

    const app = initializeApp(window.FIREBASE_CONFIG);
    db = getFirestore(app);

    setStatus('connected', 'Real-time tersambung');

    // Listen for wishes in real-time
    const wishesRef = collection(db, window.COLLECTION_NAME);
    const q = query(wishesRef, orderBy('timestamp', 'desc'), limit(50));

    wishesUnsubscribe = onSnapshot(q,
      (snapshot) => {
        renderWishesList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      (error) => {
        console.error('Firestore error:', error);
        setStatus('error', 'Gagal terhubung');
        loadLocalWishes();
      }
    );

    // Wire wish form to Firestore
    document.getElementById('wish-form').addEventListener('submit', async function(e) {
      e.preventDefault();
      const name = document.getElementById('wish-name').value.trim();
      const text = document.getElementById('wish-text').value.trim();
      if (!name) { shakeInput(document.getElementById('wish-name')); return; }
      if (!text) { shakeInput(document.getElementById('wish-text')); return; }

      const btn = document.getElementById('btn-wish');
      btn.textContent = 'Mengirim... 💫';
      btn.disabled = true;

      try {
        await addDoc(collection(db, window.COLLECTION_NAME), {
          name: name.substring(0, 100),
          text: text.substring(0, 500),
          timestamp: serverTimestamp()
        });
        document.getElementById('wish-name').value = '';
        document.getElementById('wish-text').value = '';
        btn.textContent = 'Terkirim! 💌';
        setTimeout(() => { btn.textContent = 'Kirim Ucapan 💌'; btn.disabled = false; }, 2000);
      } catch (err) {
        console.error(err);
        btn.textContent = 'Gagal, coba lagi';
        btn.disabled = false;
      }
    });

  } catch (err) {
    console.error('Firebase init error:', err);
    setStatus('error', 'Firebase tidak tersambung');
    loadLocalWishes();
    setupLocalWishForm();
  }
}

function setStatus(type, text) {
  const dot  = document.getElementById('status-dot');
  const span = document.getElementById('status-text');
  if (!dot || !span) return;
  dot.className  = 'status-dot ' + type;
  span.textContent = text;
}

/* ─── RENDER WISHES LIST ─── */
function renderWishesList(wishes) {
  const list = document.getElementById('wishes-list');
  if (!list) return;

  if (wishes.length === 0) {
    list.innerHTML = '<p class="wishes-empty">Belum ada ucapan. Jadilah yang pertama! 💌</p>';
    return;
  }

  list.innerHTML = wishes.map(w => {
    const ts = w.timestamp?.toDate ? w.timestamp.toDate() : new Date(w.timestamp || Date.now());
    const timeStr = ts.toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    }) + ' · ' + ts.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    return `
      <div class="wish-item">
        <p class="wish-name">✦ ${escHtml(w.name)}</p>
        <p class="wish-text-content">${escHtml(w.text)}</p>
        <p class="wish-time">${timeStr}</p>
      </div>
    `;
  }).join('');
}

/* ─── LOCAL FALLBACK (no Firebase) ─── */
function loadLocalWishes() {
  const stored = JSON.parse(localStorage.getItem('wedding_wishes') || '[]');
  const all    = [...SEED_WISHES, ...stored.map((w,i) => ({...w, id:'local'+i}))];
  renderWishesList(all.reverse());
}

function setupLocalWishForm() {
  document.getElementById('wish-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('wish-name').value.trim();
    const text = document.getElementById('wish-text').value.trim();
    if (!name) { shakeInput(document.getElementById('wish-name')); return; }
    if (!text) { shakeInput(document.getElementById('wish-text')); return; }

    const stored = JSON.parse(localStorage.getItem('wedding_wishes') || '[]');
    const wish   = { name, text, timestamp: Date.now() };
    stored.push(wish);
    localStorage.setItem('wedding_wishes', JSON.stringify(stored));

    document.getElementById('wish-name').value = '';
    document.getElementById('wish-text').value = '';
    loadLocalWishes();

    const btn = document.getElementById('btn-wish');
    btn.textContent = 'Terkirim! 💌';
    setTimeout(() => { btn.textContent = 'Kirim Ucapan 💌'; }, 2000);
  });
}

/* ============================================================
   BOTTOM NAV — Active state on scroll
   ============================================================ */
function initBottomNav() {
  const sections = [
    { id: 'page-couple', navId: 'bnav-couple', dotHref: '#page-couple' },
    { id: 'page-event',  navId: 'bnav-event',  dotHref: '#page-event'  },
    { id: 'page-maps',   navId: 'bnav-maps',   dotHref: '#page-maps'   },
  ];

  // Smooth scroll on nav click
  document.querySelectorAll('.bnav-item, .nav-dot').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = link.getAttribute('href');
      document.querySelector(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Update active on scroll (throttled)
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateNavActive(sections);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

function updateNavActive(sections) {
  const mid = window.innerHeight * 0.45;
  sections.forEach(({ id, navId, dotHref }) => {
    const el = document.getElementById(id);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const isActive = rect.top <= mid && rect.bottom >= mid;
    if (isActive) {
      // Bottom nav
      document.querySelectorAll('.bnav-item').forEach(b => b.classList.remove('active'));
      document.getElementById(navId)?.classList.add('active');
      // Side dots
      document.querySelectorAll('.nav-dot').forEach(d => d.classList.remove('active'));
      document.querySelector(`.nav-dot[href="${dotHref}"]`)?.classList.add('active');
    }
  });
}

/* ============================================================
   SCROLL REVEAL
   ============================================================ */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal, .reveal-up').forEach(el => observer.observe(el));
}

/* ============================================================
   UTILS
   ============================================================ */
function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

// Cleanup on page hide
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden' && wishesUnsubscribe) {
    wishesUnsubscribe();
  }
});
