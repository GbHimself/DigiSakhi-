/* ============================================
   DigiSakhi – Main JavaScript
   ============================================ */

/* ---- NAVBAR: Scroll shadow + Mobile menu ---- */
const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) navbar.classList.add('scrolled');
  else navbar.classList.remove('scrolled');
});

if (hamburger) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinks.classList.toggle('open');
    /* Close lang-switcher dropdown if open */
    const langSw = document.getElementById('langSwitcher');
    const langBtn = document.getElementById('langBtn');
    if (langSw) { langSw.classList.remove('open'); }
    if (langBtn) { langBtn.setAttribute('aria-expanded', 'false'); }
  });
  // Close menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
}

/* ---- COUNTER ANIMATION ---- */
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'), 10);
  const duration = 2000;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = Math.floor(current).toLocaleString('en-IN');
  }, 16);
}

const statNumbers = document.querySelectorAll('.stat-number');
if (statNumbers.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  statNumbers.forEach(n => observer.observe(n));
}


/* ---- SCHEMES ACCORDION (Resources page) ---- */
function toggleAcc(header) {
  const item = header.parentElement;
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.acc-item').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

/* ---- ONLINE SAFETY QUIZ ---- */
const quizData = [
  {
    q: "You receive a call saying 'Your bank account is blocked. Please share your OTP to verify.' What do you do?",
    options: ["Share the OTP immediately", "Hang up the call — it is a scam", "Call back on the same number", "Visit the bank the next day"],
    correct: 1,
    explanation: "Correct! Real banks NEVER ask for OTP on phone. This is a classic fraud call. Always hang up and call your bank's official number."
  },
  {
    q: "Someone sends you a QR code on WhatsApp saying 'Scan this to receive ₹1000'. What do you do?",
    options: ["Scan it quickly to get the money", "Ask them to send more details first", "Never scan it — QR codes are for PAYING, not receiving", "Share it with family first"],
    correct: 2,
    explanation: "Correct! Scanning a QR code means YOU are paying money FROM your account. Scammers trick women this way. Never scan QR codes sent by unknown people."
  },
  {
    q: "A WhatsApp message says 'COVID relief fund: ₹5000 for every woman. Forward to 10 people to receive.' What should you do?",
    options: ["Forward it to all your contacts", "Forward it only to family", "Delete it — this is fake news", "Call 1930 to report it"],
    correct: 2,
    explanation: "Correct! Government schemes never ask you to 'forward to receive money.' This is fake news. Delete it and don't forward. Forwarding fake news can also be a criminal offence."
  },
  {
    q: "You want to create a safe password for your bank app. Which password is the BEST?",
    options: ["sunita2024", "123456", "Sunita@SBI#2024!", "SUNITA"],
    correct: 2,
    explanation: "Correct! A strong password has capital and small letters, numbers, and special characters like @ and #. Avoid using your name, birthday, or easy patterns."
  },
  {
    q: "Someone online becomes your close friend over weeks and then asks for money for a medical emergency. What do you do?",
    options: ["Send money — they are your friend", "Ask for their bank account and send a small amount", "Refuse — this is a romance scam", "Ask your SHG group leader for advice"],
    correct: 2,
    explanation: "Correct! Never send money to someone you have only met online. Romance scams are common and target lonely women. Report to Cyber Crime at 1930."
  }
];

let currentQ = 0;
let score = 0;
let answered = false;

function renderQuiz() {
  const container = document.getElementById('quizContent');
  const fillEl = document.getElementById('quizFill');
  if (!container) return;

  if (currentQ >= quizData.length) {
    const percent = Math.round((score / quizData.length) * 100);
    let grade, emoji;
    if (percent === 100) { grade = "Perfect! You are a DigiSakhi Champion!"; emoji = "🏆"; }
    else if (percent >= 60) { grade = "Good work! Keep learning to stay safe."; emoji = "🏆"; }
    else { grade = "Keep practising! Review the lessons again."; emoji = "🏆"; }

    container.innerHTML = `
      <div class="quiz-result">
        <div class="quiz-score">${emoji} ${score}/${quizData.length}</div>
        <h3>${grade}</h3>
        <p>You scored ${percent}% in the Online Safety Quiz.</p>
        <button class="btn btn-primary" onclick="restartQuiz()" style="margin-top:1.5rem">
          <i class="fas fa-redo"></i> Try Again
        </button>
      </div>`;
    if (fillEl) fillEl.style.width = '100%';

    // Submit score privately to Formspree
    submitQuizScore(score, quizData.length);
    return;
  }

  const q = quizData[currentQ];
  if (fillEl) fillEl.style.width = ((currentQ / quizData.length) * 100) + '%';
  answered = false;

  container.innerHTML = `
    <div class="quiz-question">
      <p style="font-size:.82rem;color:#6b7280;margin-bottom:.5rem">Question ${currentQ + 1} of ${quizData.length}</p>
      <h3>${q.q}</h3>
      <div class="quiz-options" id="quizOptions">
        ${q.options.map((opt, i) => `
          <div class="quiz-option" data-index="${i}" onclick="checkAnswer(${i})">
            <span style="width:28px;height:28px;border-radius:50%;background:#f3f4f6;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.8rem;flex-shrink:0">${'ABCD'[i]}</span>
            ${opt}
          </div>`).join('')}
      </div>
      <div id="quizFeedback"></div>
    </div>`;
}

function checkAnswer(idx) {
  if (answered) return;
  answered = true;

  const q = quizData[currentQ];
  const options = document.querySelectorAll('.quiz-option');
  const feedbackEl = document.getElementById('quizFeedback');

  options.forEach(opt => opt.style.pointerEvents = 'none');
  options[q.correct].classList.add('correct');

  if (idx === q.correct) {
    score++;
    feedbackEl.innerHTML = `<div class="quiz-feedback correct"><i class="fas fa-check-circle"></i> ${q.explanation}</div>`;
    if (options[idx]) options[idx].classList.add('correct');
  } else {
    feedbackEl.innerHTML = `<div class="quiz-feedback wrong"><i class="fas fa-times-circle"></i> Not quite. ${q.explanation}</div>`;
    if (options[idx]) options[idx].classList.add('wrong');
  }

  // Add next button
  const navDiv = document.createElement('div');
  navDiv.className = 'quiz-nav';
  navDiv.innerHTML = `<button class="btn btn-primary" onclick="nextQuestion()">
    ${currentQ + 1 < quizData.length ? 'Next Question <i class="fas fa-arrow-right"></i>' : 'See Results <i class="fas fa-flag-checkered"></i>'}
  </button>`;
  document.querySelector('.quiz-question').appendChild(navDiv);
}

function nextQuestion() {
  currentQ++;
  renderQuiz();
}

function restartQuiz() {
  currentQ = 0;
  score = 0;
  answered = false;
  renderQuiz();
}

/* ---- QUIZ SCORE: Auto-submit to Formspree ---- */
async function submitQuizScore(finalScore, total) {
  const percent = Math.round((finalScore / total) * 100);
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const formData = new FormData();
  formData.append('_subject',   'DigiSakhi – Quiz Score Recorded');
  formData.append('score',      `${finalScore} / ${total}`);
  formData.append('percentage', `${percent}%`);
  formData.append('page',       window.location.href);
  formData.append('time_IST',   timestamp);

  try {
    await fetch('https://formspree.io/f/xljdbvwy', {
      method: 'POST',
      body: formData,
      headers: { Accept: 'application/json' }
    });
    showQuizToast(finalScore, total, percent);
  } catch (e) {
    // Silent fail — don't interrupt the user's quiz experience
  }
}

function showQuizToast(sc, total, pct) {
  // Remove any existing toast
  const old = document.getElementById('quizScoreToast');
  if (old) old.remove();

  const toast = document.createElement('div');
  toast.id = 'quizScoreToast';
  toast.className = 'quiz-score-toast';
  toast.innerHTML = `
    <i class="fas fa-clipboard-check"></i>
    <p><strong>Score saved!</strong><br/>
    ${sc}/${total} (${pct}%) has been recorded privately.</p>`;
  document.body.appendChild(toast);

  // Auto-remove after 5 seconds
  setTimeout(() => {
    toast.style.transition = 'opacity .4s';
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 400);
  }, 5000);
}

// Initialize quiz if container exists
if (document.getElementById('quizContainer')) {
  renderQuiz();
}

/* ---- SMOOTH SCROLL for hash links ---- */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ---- FADE IN on scroll ---- */
const fadeEls = document.querySelectorAll('.topic-card, .tip-item, .testimonial-card, .fraud-card, .privacy-card, .helpline-card, .app-rec-card, .shg-tip, .training-card, .ri-video-card, .ri-story-card, .ri-review-card, .ri-stat-card');
if (fadeEls.length) {
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  fadeEls.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity .5s ease, transform .5s ease';
    fadeObserver.observe(el);
  });
}

/* ============================================
   REAL INCIDENTS — Tab Switcher & Chart Animations
   ============================================ */

/* ---- Tab switcher ---- */
function switchRiTab(riId) {
  document.querySelectorAll('.ri-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.ri === riId);
  });
  document.querySelectorAll('.ri-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === 'ri-' + riId);
  });
  // Trigger bar animations when data tab becomes visible
  if (riId === 'data') {
    setTimeout(animateRiBars, 120);
  }
}

/* ---- Animate bar fills ---- */
function animateRiBars() {
  document.querySelectorAll('.ri-bar-fill, .ri-survey-fill').forEach(bar => {
    const pct = bar.dataset.pct || 0;
    bar.style.width = pct + '%';
  });
}

/* ---- Observe when the data tab panel scrolls into view (if already active) ---- */
const riDataPanel = document.getElementById('ri-data');
if (riDataPanel) {
  const riObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && riDataPanel.classList.contains('active')) {
        animateRiBars();
        riObs.unobserve(riDataPanel);
      }
    });
  }, { threshold: 0.15 });
  riObs.observe(riDataPanel);
}

/* ============================================
   SOCIAL MEDIA  –  Dynamic Platform Cards
   ============================================ */

const platformData = {

  whatsapp: {
    name: 'WhatsApp',
    icon: 'fab fa-whatsapp',
    color: '#25d366',
    tagline: 'Free calls, messages & video calls',
    about: 'WhatsApp is the most used messaging app in India. You can send free messages, make free voice and video calls, share photos, and create groups — all using just your mobile internet.',
    features: ['Free voice & video calls', 'Group chats (up to 1024 members)', 'Share photos, videos & documents', 'Voice messages', 'End-to-end encrypted for privacy'],
    tip: 'Use WhatsApp to create your SHG group — share meeting dates, savings info, and announcements instantly.',
    androidUrl: 'https://play.google.com/store/apps/details?id=com.whatsapp',
    iosUrl: 'https://apps.apple.com/app/whatsapp-messenger/id310633997',
    webUrl: 'https://web.whatsapp.com',
    webLabel: 'Open WhatsApp Web',
    safetyNote: 'Never share your OTP or UPI PIN on WhatsApp — not even to people you know.',
    guideId: 'whatsapp',
    safetyDos: [
      'Enable Two-Step Verification: Settings → Account → Two-step verification → Enable',
      'Set Profile Photo & Last Seen to "My Contacts" in Privacy Settings',
      'Regularly check Linked Devices (Settings → Linked Devices) for unknown logins',
      'Turn on Disappearing Messages in private chats for extra privacy',
    ],
    safetyDonts: [
      'Never share any 6-digit OTP sent to your phone — not even with "WhatsApp support"',
      'Never click links from unknown numbers, even if they look official',
      'Never add unknown people to your SHG group',
      'Never forward unverified news — verify at boomlive.in first',
    ],
    warning: 'If someone calls claiming to be from "WhatsApp Support" and asks for a code — hang up immediately. WhatsApp never calls users.',
  },

  facebook: {
    name: 'Facebook',
    icon: 'fab fa-facebook-f',
    color: '#1877f2',
    tagline: 'Connect, share & grow your community',
    about: 'Facebook lets you share updates, join community groups, and connect with people in your area. SHG members can use Facebook to promote their products and reach local customers for free.',
    features: ['Create a free business page', 'Join local community groups', 'Sell products on Facebook Marketplace', 'Share photos and updates', 'Live video streaming'],
    tip: 'Create a Facebook page for your SHG to showcase your products and attract buyers — it is completely free!',
    androidUrl: 'https://play.google.com/store/apps/details?id=com.facebook.katana',
    iosUrl: 'https://apps.apple.com/app/facebook/id284882215',
    webUrl: 'https://www.facebook.com',
    webLabel: 'Open Facebook',
    safetyNote: 'Set your profile to "Friends Only" in Privacy Settings so strangers cannot see your personal information.',
    guideId: 'facebook',
    safetyDos: [
      'Set "Who can see your future posts?" to Friends — Settings → Privacy',
      'Turn on "Review posts you\'re tagged in" — Settings → Timeline and Tagging',
      'Hide your phone number and address from your public profile',
      'Report and block fake profiles immediately using the three-dot menu',
    ],
    safetyDonts: [
      'Never send money to a buyer or seller you have not verified in person',
      'Never approve friend requests from unknown people you have never met',
      'Never click "Collect your prize" or "Government scheme" links shared in groups',
      'Never share your Aadhaar, bank details, or OTP in any Facebook message',
    ],
    warning: 'Romance scammers create fake army/doctor profiles on Facebook. Never send money to anyone you have only met online — no matter how long you have chatted.',
  },

  instagram: {
    name: 'Instagram',
    icon: 'fab fa-instagram',
    color: '#e1306c',
    tagline: 'Share photos & promote your products',
    about: 'Instagram is a photo and video sharing app. It is excellent for SHG members who want to show their products — like handicrafts, food items, clothes — to a large audience for free.',
    features: ['Share product photos & short videos (Reels)', 'Reach thousands of potential buyers', 'Instagram Shopping for direct sales', 'Stories to share daily updates', 'Direct messages to customers'],
    tip: 'Post clear, bright photos of your SHG products with a short description and price. Use hashtags like #HandmadeIndia #SHGProducts to reach more people.',
    androidUrl: 'https://play.google.com/store/apps/details?id=com.instagram.android',
    iosUrl: 'https://apps.apple.com/app/instagram/id389801252',
    webUrl: 'https://www.instagram.com',
    webLabel: 'Open Instagram',
    safetyNote: 'Keep your personal account private. Create a separate business account for selling SHG products.',
    guideId: 'instagram',
    safetyDos: [
      'Set account to Private: Settings & Privacy → Account Privacy → turn ON',
      'Turn OFF "Allow others to share your stories as messages"',
      'Enable Two-Factor Authentication: Settings → Security → Two-Factor Authentication',
      'Block and report any account that sends inappropriate messages or threats',
    ],
    safetyDonts: [
      'Never pay a fake shop by GPay/PhonePe directly — only use cash on delivery or trusted platforms',
      'Never send personal photos to someone you met only on Instagram',
      'Never click external links in DMs from unknown accounts',
      'Never share your phone number or home address in comments or bio',
    ],
    warning: 'If someone threatens to share edited/morphed photos of you — DO NOT pay. Report immediately to cybercrime.gov.in and call 1930.',
  },

  youtube: {
    name: 'YouTube',
    icon: 'fab fa-youtube',
    color: '#ff0000',
    tagline: 'Learn new skills with free videos',
    about: 'YouTube is the world\'s largest free video platform. You can find tutorials in Hindi and all regional languages — from cooking and stitching to government scheme guides and digital literacy videos.',
    features: ['Free videos in Hindi & regional languages', 'Learn cooking, stitching, crafts & more', 'Watch government scheme explanations', 'Download videos to watch offline', 'Subscribe to channels you like'],
    tip: 'Search "SHG upaay" or "mahila udyog ideas" on YouTube to find hundreds of free business ideas and tutorials made for women like you.',
    androidUrl: 'https://play.google.com/store/apps/details?id=com.google.android.youtube',
    iosUrl: 'https://apps.apple.com/app/youtube-watch-listen-stream/id544007664',
    webUrl: 'https://www.youtube.com',
    webLabel: 'Open YouTube',
    safetyNote: 'YouTube is safe for learning. Avoid clicking on ads that promise quick money or prizes.',
    guideId: 'youtube',
    safetyDos: [
      'Use YouTube for free skill learning — cooking, stitching, farming, govt schemes',
      'Check the channel subscriber count before trusting health or financial advice',
      'Use Filters → "This year" to find recent, up-to-date videos',
      'Search in your own language — Hindi, Tamil, Telugu etc. for better results',
    ],
    safetyDonts: [
      'Never click "Earn from home" or "Win lottery" ads — always scams',
      'Never click WhatsApp group links shown in video ads or descriptions',
      'Never call phone numbers shown in videos claiming to be government helplines',
      'Never download apps shown in video descriptions from unknown creators',
    ],
    warning: 'Scam ads on YouTube look very real. They promise ₹5,000/day from home with no investment. These are 100% scams — skip or report them.',
  },

  telegram: {
    name: 'Telegram',
    icon: 'fab fa-telegram',
    color: '#229ed9',
    tagline: 'Large groups & broadcast channels',
    about: 'Telegram is similar to WhatsApp but allows much larger groups — up to 2 lakh (200,000) members! It is great for large SHG networks, state-level federations, and broadcasting important information.',
    features: ['Groups up to 2,00,000 members', 'Broadcast channels for announcements', 'Send large files (up to 2 GB)', 'Bots for automation', 'Available on all devices'],
    tip: 'If your SHG block or district federation needs to send messages to all members at once, create a Telegram Channel for one-way announcements.',
    androidUrl: 'https://play.google.com/store/apps/details?id=org.telegram.messenger',
    iosUrl: 'https://apps.apple.com/app/telegram-messenger/id686449807',
    webUrl: 'https://web.telegram.org',
    webLabel: 'Open Telegram Web',
    safetyNote: 'Be careful of unknown Telegram groups promising government money or jobs — these are often scams.',
    guideId: 'telegram',
    safetyDos: [
      'Set "Who can add me to groups?" to My Contacts — Settings → Privacy & Security',
      'Set Phone Number visibility to Nobody',
      'Set Last Seen to Nobody so strangers cannot track your activity',
      'Verify any "government scheme" channel at the official website before trusting',
    ],
    safetyDonts: [
      'Never invest money in any "task earning" group — initial payments are always bait',
      'Never send your Aadhaar or bank details in any Telegram group',
      'Never trust channels claiming to give PM Yojana money or job offers',
      'Never click unknown links sent by bots or unknown contacts',
    ],
    warning: 'The #1 scam on Telegram: groups that pay you small amounts first, then ask you to invest ₹2,000 – ₹50,000 to "earn more." Once you invest, the group disappears.',
  },

  gpay: {
    name: 'Google Pay',
    icon: 'fas fa-rupee-sign',
    color: '#4285f4',
    tagline: 'Safe & instant UPI payments',
    about: 'Google Pay (GPay) is a safe and easy UPI payment app by Google. You can send and receive money instantly, pay bills, recharge your mobile, and check your bank balance — all for free.',
    features: ['Instant UPI money transfers', 'Pay anyone using phone number or QR', 'Mobile & DTH recharge', 'Electricity & water bill payment', 'Check bank balance anytime'],
    tip: 'SHG members can send their monthly savings directly to the group leader\'s GPay UPI ID — no need to travel just for collection!',
    androidUrl: 'https://play.google.com/store/apps/details?id=com.google.android.apps.nbu.paisa.user',
    iosUrl: 'https://apps.apple.com/app/google-pay-save-pay/id1193357041',
    webUrl: 'https://pay.google.com',
    webLabel: 'Visit Google Pay',
    safetyNote: '⚠️️ NEVER enter your UPI PIN to RECEIVE money. You only need your PIN to SEND money. Anyone asking for your PIN is a scammer — call 1930.',
    guideId: 'gpay',
    safetyDos: [
      'To RECEIVE money — do absolutely nothing. No app opens, no PIN needed',
      'Always verify the receiver name shown on screen before entering your PIN',
      'Set a UPI transaction limit in your bank app to reduce risk',
      'Call 1930 immediately if you send money by mistake',
    ],
    safetyDonts: [
      'Never enter your UPI PIN for any "collect request" notification',
      'Never scan QR codes sent to you on WhatsApp or SMS from unknown numbers',
      'Never share your UPI ID, PIN, or OTP with anyone on the phone',
      'Never pay a "processing fee" to receive a prize or cashback — it is always a scam',
    ],
    warning: 'Collect Request scam: A buyer sends you a "₹1,500 payment request" and says "accept the payment." That button actually SENDS ₹1,500 from your account. Always DECLINE unexpected requests.',
  },

  snapchat: {
    name: 'Snapchat',
    icon: 'fab fa-snapchat-ghost',
    color: '#f5c518',
    tagline: 'Disappearing photos & short videos',
    about: 'Snapchat lets you send photos and short videos that disappear after the receiver views them. It is popular with teenagers and young adults. While it seems private, screenshots can be taken at any time.',
    features: ['Photos & videos that disappear after viewing', 'Stories visible for 24 hours', 'Snap Map to see where friends are', 'Filters and AR effects', 'Chat with friends'],
    tip: 'Only add people you know personally as Snapchat friends. Never accept requests from strangers, even if they seem friendly.',
    androidUrl: 'https://play.google.com/store/apps/details?id=com.snapchat.android',
    iosUrl: 'https://apps.apple.com/app/snapchat/id447188370',
    webUrl: 'https://www.snapchat.com',
    webLabel: 'Visit Snapchat',
    safetyNote: '"Disappearing" does NOT mean private — anyone can screenshot your snaps. Never send personal or private photos to people you have not met in person.',
    guideId: 'snapchat',
    safetyDos: [
      'Set "Who Can Contact Me" to My Friends — Settings → Privacy Controls',
      'Turn OFF "See Me in Quick Add" to stop strangers from finding you',
      'Turn OFF Snap Map or set it to Ghost Mode so no one can see your location',
      'Enable Two-Factor Authentication in Settings → Security',
    ],
    safetyDonts: [
      'Never send personal, financial, or intimate photos on Snapchat',
      'Never accept friend requests from people you do not know in real life',
      'Never believe "snaps disappear forever" — screenshots last forever',
      'Never share your location on Snap Map with people you do not fully trust',
    ],
    warning: 'Romance scammers heavily target Snapchat users. They compliment you, build trust, then ask for photos or money. Block and report anyone you have not met in person who makes such requests.',
  },

  sharechat: {
    name: 'ShareChat',
    icon: 'fas fa-share-alt',
    color: '#f96300',
    tagline: 'Indian social media in your language',
    about: 'ShareChat is an Indian social media platform available in 15 regional languages including Hindi, Tamil, Telugu, Marathi, Kannada, and Bengali. It is great for sharing regional content and connecting with local communities.',
    features: ['Available in 15 Indian languages', 'Share photos, videos & memes', 'Follow local news & entertainment', 'Connect with people from your region', 'No need to know English'],
    tip: 'ShareChat is a great platform to share information about your SHG activities and government schemes in your local language — making it easy for all members to understand.',
    androidUrl: 'https://play.google.com/store/apps/details?id=in.mohalla.video',
    iosUrl: 'https://apps.apple.com/app/sharechat-made-in-india/id1088534138',
    webUrl: 'https://sharechat.com',
    webLabel: 'Visit ShareChat',
    safetyNote: 'Fake news spreads very fast on ShareChat in regional languages. Always verify shocking news before sharing — check at boomlive.in or factcheck.afp.com.',
    guideId: 'sharechat',
    safetyDos: [
      'Verify shocking or urgent posts at boomlive.in before sharing with your SHG group',
      'Report fake news using the three-dot menu → Report → Fake News',
      'Set your account to private in Profile → Settings → Privacy',
      'Only follow verified news channels and trusted community pages',
    ],
    safetyDonts: [
      'Never click short links (bit.ly, tinyurl) from unknown posts — they hide dangerous websites',
      'Never forward posts that promise free government money or "register by today midnight"',
      'Never share your phone number, bank details or Aadhaar in any post or comment',
      'Never trust posts claiming you have won a prize just by using the app',
    ],
    warning: 'Fake news on ShareChat often uses urgency ("Only till tonight!") and government imagery to look real. Real government schemes have no time-limited registration on social media.',
  },

  twitter: {
    name: 'Twitter / X',
    icon: 'fab fa-x-twitter',
    color: '#000000',
    tagline: 'News, updates & government alerts',
    about: 'Twitter (now called X) is a platform for short public messages. It is very useful for following real-time news, official government announcements, police alerts, and important updates. Many government departments and officials post directly here.',
    features: ['Follow government & official news accounts', 'Real-time news & breaking alerts', 'Post short messages (up to 280 characters)', 'Follow police, NCRB, MHA for safety updates', 'Report crimes — many police accounts respond'],
    tip: 'Follow your local police cyber cell on Twitter/X — they post scam alerts, new fraud patterns, and helpline numbers. Search your city name + "cyber cell" to find them.',
    androidUrl: 'https://play.google.com/store/apps/details?id=com.twitter.android',
    iosUrl: 'https://apps.apple.com/app/x/id333903271',
    webUrl: 'https://x.com',
    webLabel: 'Open X (Twitter)',
    safetyNote: 'Twitter/X has a lot of harassment. Set your account to protected (private) so only approved followers can see your posts.',
    guideId: 'twitter',
    safetyDos: [
      'Turn ON "Protect your posts" — Settings → Privacy and Safety → Audience and Tagging',
      'Set "Who can reply to your posts" to Accounts you follow',
      'Set "Who can tag you in photos" to Only you',
      'Block and report accounts that harass or threaten you immediately',
    ],
    safetyDonts: [
      'Never share personal information like address, phone number, or Aadhaar in tweets',
      'Never click links from unknown accounts even if they mention your name',
      'Never engage with accounts that send threatening or abusive messages — just block',
      'Never trust accounts impersonating government officials without a blue verified tick',
    ],
    warning: 'Online harassment is very common on Twitter/X. If you receive threatening messages, take screenshots and report to cybercrime.gov.in under "Cyber Stalking / Harassment."',
  },

};

function openPlatform(id) {
  const data = platformData[id];
  if (!data) return;

  // Highlight selected card
  document.querySelectorAll('.platform-card-clickable').forEach(c => c.classList.remove('active'));
  const activeCard = document.querySelector(`.platform-card-clickable[data-id="${id}"]`);
  if (activeCard) activeCard.classList.add('active');

  const panel = document.getElementById('platformDetailPanel');
  const inner = document.getElementById('pdpInner');

  // Detect device for smart download button
  const isAndroid = /android/i.test(navigator.userAgent);
  const isIOS     = /iphone|ipad|ipod/i.test(navigator.userAgent);

  let primaryBtn = '';
  if (isAndroid) {
    primaryBtn = `<a href="${data.androidUrl}" target="_blank" rel="noopener" class="pdp-btn pdp-btn-primary"><i class="fab fa-google-play"></i> Download on Play Store</a>`;
  } else if (isIOS) {
    primaryBtn = `<a href="${data.iosUrl}" target="_blank" rel="noopener" class="pdp-btn pdp-btn-primary"><i class="fab fa-apple"></i> Download on App Store</a>`;
  } else {
    primaryBtn = `
      <a href="${data.androidUrl}" target="_blank" rel="noopener" class="pdp-btn pdp-btn-primary"><i class="fab fa-google-play"></i> Play Store</a>
      <a href="${data.iosUrl}"     target="_blank" rel="noopener" class="pdp-btn pdp-btn-secondary"><i class="fab fa-apple"></i> App Store</a>`;
  }

  // Build do/don't safety guide
  const dosHtml   = (data.safetyDos   || []).map(d => `<li><i class="fas fa-check-circle"></i>${d}</li>`).join('');
  const dontsHtml = (data.safetyDonts || []).map(d => `<li><i class="fas fa-times-circle"></i>${d}</li>`).join('');
  const warningHtml = data.warning
    ? `<div class="pdp-warning"><i class="fas fa-exclamation-triangle"></i><p><strong>Watch Out:</strong> ${data.warning}</p></div>`
    : '';

  // Full guide link (scroll to detailed section on the same page)
  const fullGuideBtn = data.guideId
    ? `<a href="#${data.guideId}" class="pdp-btn pdp-btn-guide" onclick="closePlatform()"><i class="fas fa-book-open"></i> See Full ${data.name} Guide</a>`
    : '';

  inner.innerHTML = `
    <div class="pdp-header" style="background:${data.color}">
      <button class="pdp-close" onclick="closePlatform()" aria-label="Close"><i class="fas fa-times"></i></button>
      <div class="pdp-logo"><i class="${data.icon}"></i></div>
      <div class="pdp-title-area">
        <h3>${data.name}</h3>
        <p>${data.tagline}</p>
      </div>
    </div>
    <div class="pdp-body">

      <p class="pdp-about">${data.about}</p>

      <div class="pdp-features">
        <h5><i class="fas fa-star"></i> Key Features</h5>
        <ul>${data.features.map(f => `<li><i class="fas fa-check-circle"></i> ${f}</li>`).join('')}</ul>
      </div>

      <div class="pdp-tip">
        <i class="fas fa-lightbulb"></i>
        <div><strong>SHG Tip:</strong> ${data.tip}</div>
      </div>

      <!-- SAFETY GUIDE inside popup -->
      <div class="pdp-safety-section">
        <h5><i class="fas fa-shield-alt"></i> Safety Guide — What to Do &amp; Avoid</h5>
        <div class="pdp-dos-donts">
          <div class="pdp-dos">
            <div class="pdp-dd-title"><i class="fas fa-check-circle"></i> Do This</div>
            <ul>${dosHtml}</ul>
          </div>
          <div class="pdp-donts">
            <div class="pdp-dd-title"><i class="fas fa-times-circle"></i> Never Do This</div>
            <ul>${dontsHtml}</ul>
          </div>
        </div>
        ${warningHtml}
      </div>

      <div class="pdp-download-section">
        <h5><i class="fas fa-download"></i> Get the App</h5>
        <div class="pdp-btn-row">
          ${primaryBtn}
          <a href="${data.webUrl}" target="_blank" rel="noopener" class="pdp-btn pdp-btn-web">
            <i class="fas fa-globe"></i> ${data.webLabel}
          </a>
          ${fullGuideBtn}
        </div>
      </div>

    </div>`;

  // Show panel
  panel.style.display = 'block';
  requestAnimationFrame(() => panel.classList.add('pdp-visible'));
  setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
}

function closePlatform() {
  const panel = document.getElementById('platformDetailPanel');
  panel.classList.remove('pdp-visible');
  document.querySelectorAll('.platform-card-clickable').forEach(c => c.classList.remove('active'));
  setTimeout(() => { panel.style.display = 'none'; }, 350);
}

/* ---- CRIME ACCORDION ---- */
function toggleCrime(id) {
  const item = document.getElementById(id);
  if (!item) return;
  const isOpen = item.classList.contains('open');
  // Close all
  document.querySelectorAll('.crime-item').forEach(i => i.classList.remove('open'));
  // Open clicked if it wasn't already open
  if (!isOpen) item.classList.add('open');
}

/* ---- PLATFORM AWARENESS TAB SWITCHER ---- */
function switchPawTab(pawId) {
  // Update tab buttons
  document.querySelectorAll('.paw-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.paw === pawId);
  });
  // Update panels
  document.querySelectorAll('.paw-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === 'paw-' + pawId);
  });
  // Scroll to the section smoothly
  const section = document.getElementById('platform-awareness');
  if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}



/* ---- AI SAFETY TABS ---- */
function switchAiTab(tabName) {
  document.querySelectorAll('.ai-tab').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.ai-panel').forEach(panel => panel.classList.remove('active'));
  const tab = document.querySelector(`[data-ai="${tabName}"]`);
  const panel = document.getElementById(`ai-${tabName}`);
  if (tab)   tab.classList.add('active');
  if (panel) panel.classList.add('active');
}

/* ---- FILE COMPLAINT TABS ---- */
function switchFcTab(tabName) {
  document.querySelectorAll('.fc-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.fc-panel').forEach(p => p.classList.remove('active'));
  const tab = document.querySelector(`.fc-tab[data-fc="${tabName}"]`);
  const panel = document.getElementById(`fc-${tabName}`);
  if (tab)   tab.classList.add('active');
  if (panel) panel.classList.add('active');
}


/* ============================================
   SCROLL ANIMATIONS — IntersectionObserver
   ============================================ */

(function initScrollAnimations() {
  /* Elements to animate on scroll */
  const TARGETS = [
    /* Cards */
    '.topic-card', '.tip-item', '.testimonial-card',
    '.ri-video-card', '.ri-video-link-card',
    '.ri-story-card', '.ri-review-card', '.ri-stat-card',
    '.fc-portal-card', '.fc-helpline-card',
    '.ca-report-card', '.sm-guide-card',
    '.aid-card', '.finfo-card',
    '.app-rec-card', '.scheme-card',
    '.helpline-card', '.ai-help-card', '.ai-protect-card',
    /* Section headers */
    '.section-header',
    /* Stat items */
    '.stat-item',
    /* Info/tip/warning boxes */
    '.fc-steps-card', '.fc-info-col',
    '.ca-submit-cta', '.finfo-qr',
    /* Quiz cards */
    '.qq-card', '.quiz-container',
    /* Other blocks */
    '.ri-data-source-note', '.ri-reviews-intro',
    '.ai-resource-link', '.ai-message-card',
  ].join(',');

  /* Choose animation class based on element type */
  function getAnimClass(el) {
    if (el.classList.contains('stat-item'))   return 'anim-scale';
    if (el.classList.contains('section-header')) return null; /* handled by CSS directly */
    return 'anim-fade-up';
  }

  /* Add base animation class to all targets */
  function prepareElements() {
    document.querySelectorAll(TARGETS).forEach((el, idx) => {
      const cls = getAnimClass(el);
      if (!cls) {
        /* section-header: just add the class for CSS transitions */
        el.classList.add('section-header'); /* already has it */
        return;
      }
      el.classList.add(cls);
      /* Stagger siblings inside same grid/list */
      const parent = el.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(c => c.classList.contains(el.classList[0]));
        const pos = siblings.indexOf(el);
        if (pos > 0 && pos <= 6) el.classList.add(`anim-delay-${pos}`);
      }
    });

    /* Section headers separately */
    document.querySelectorAll('.section-header').forEach(el => {
      el.classList.add('anim-fade-up');
    });
  }

  /* Observe and trigger */
  function observe() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('anim-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll(
      '.anim-fade-up, .anim-fade, .anim-scale, .section-header'
    ).forEach(el => obs.observe(el));
  }

  /* Run after DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { prepareElements(); observe(); });
  } else {
    prepareElements();
    observe();
  }
})();


/* ── Slow down hero background videos ── */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.hero-video-bg video').forEach(vid => {
    const src = vid.querySelector('source') ? vid.querySelector('source').src : '';
    /* All videos at 0.8 */
    vid.playbackRate = 0.8;
  });
});

/* ============================================
   DARK / LIGHT MODE TOGGLE
   ============================================ */
(function initDarkMode() {
  const STORAGE_KEY = 'digisakhi-theme';

  /* Apply saved preference immediately (before paint) */
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'dark') document.body.classList.add('dark-mode');

  /* Update the button icon to match current state */
  function syncIcon() {
    const isDark = document.body.classList.contains('dark-mode');
    document.querySelectorAll('.dark-toggle').forEach(btn => {
      btn.innerHTML = isDark
        ? '<i class="fas fa-sun" aria-hidden="true"></i>'
        : '<i class="fas fa-moon" aria-hidden="true"></i>';
      btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    });
  }

  /* Toggle handler */
  function toggleDark() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
    syncIcon();
  }

  /* Attach click listeners once DOM is ready */
  function attachListeners() {
    document.querySelectorAll('.dark-toggle').forEach(btn => {
      btn.addEventListener('click', toggleDark);
    });
    syncIcon(); /* set correct icon on load */
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachListeners);
  } else {
    attachListeners();
  }
})();



/* ============================================
   BACK TO TOP BUTTON
   ============================================ */
(function initBackToTop() {
  const btn = document.createElement('button');
  btn.id = 'backToTop';
  btn.setAttribute('aria-label', 'Back to top');
  btn.title = 'Back to top';
  btn.innerHTML = '<i class="fas fa-chevron-up" aria-hidden="true"></i>';
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

/* ============================================
   LIVE SCAM TICKER — loads from backend API
   falls back to scam-alerts.json
   ============================================ */
(function loadScamTicker() {
  const track = document.getElementById('scamTickerTrack');
  if (!track) return;

  fetch(API_BASE + '/alerts')
    .catch(() => fetch('scam-alerts.json'))
    .then(r => r.json())
    .then(alerts => {
      if (!alerts || alerts.length === 0) return;
      const spans = alerts.map(a => `<span>⚠ ${a.text}</span>`).join('');
      track.innerHTML = spans + spans;
    })
    .catch(() => { /* keep default text */ });
})();

/* ============================================
   COMMUNITY SCAM REPORT FORM
   Submits to backend API → MongoDB
   ============================================ */
(function initScamReport() {
  const form = document.getElementById('scamReportForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('scamSubmitBtn');
    const msg = document.getElementById('scamFormMsg');

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting…';
    msg.style.display = 'none';

    const data = Object.fromEntries(new FormData(form));
    data.source = window.location.href;

    try {
      const res = await fetch(API_BASE + '/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.result === 'success' || res.ok) {
        msg.className = 'scam-form-msg success';
        msg.innerHTML = '<i class="fas fa-check-circle"></i> Thank you! Your report has been submitted and will help protect your community.';
      } else {
        throw new Error(json.error || 'Failed');
      }
    } catch {
      msg.className = 'scam-form-msg success';
      msg.innerHTML = '<i class="fas fa-check-circle"></i> Thank you for reporting! Your information has been noted.';
    }

    msg.style.display = 'block';
    form.reset();
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Report';
    msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
})();

/* ============================================
   PWA — SERVICE WORKER REGISTRATION
   ============================================ */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js')
      .then(() => console.log('DigiSakhi SW registered'))
      .catch(err => console.warn('SW registration failed:', err));
  });
}

/* ============================================
   PWA — INSTALL PROMPT
   Shows a subtle "Add to Home Screen" banner
   ============================================ */
(function initInstallPrompt() {
  let deferredPrompt = null;

  /* Capture the install event */
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;

    /* Only show if not already installed and user hasn't dismissed */
    if (localStorage.getItem('pwa-dismissed')) return;

    /* Create the banner */
    const banner = document.createElement('div');
    banner.id = 'installBanner';
    banner.innerHTML = `
      <div class="install-banner-content">
        <div class="install-banner-icon"><i class="fas fa-mobile-screen-button"></i></div>
        <div class="install-banner-text">
          <strong>Add DigiSakhi to your phone</strong>
          <span>Access offline, no app store needed</span>
        </div>
        <button class="install-banner-btn" id="installBtn">Install</button>
        <button class="install-banner-close" id="installClose" aria-label="Dismiss"><i class="fas fa-times"></i></button>
      </div>`;
    document.body.appendChild(banner);

    /* Animate in */
    setTimeout(() => banner.classList.add('show'), 500);

    document.getElementById('installBtn').addEventListener('click', () => {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(choice => {
        if (choice.outcome === 'accepted') banner.remove();
        deferredPrompt = null;
      });
    });

    document.getElementById('installClose').addEventListener('click', () => {
      banner.classList.remove('show');
      setTimeout(() => banner.remove(), 400);
      localStorage.setItem('pwa-dismissed', '1');
    });
  });

  /* Hide banner if already installed */
  window.addEventListener('appinstalled', () => {
    const banner = document.getElementById('installBanner');
    if (banner) banner.remove();
  });
})();

/* ============================================
   REAL INCIDENTS — Dynamic Stories & Reviews
   Fetches from backend API (falls back to JSON)
   ============================================ */

/* ── Backend API base URL ── */
const API_BASE = 'https://digisakhi-backend-0c6q.onrender.com/api';
/* Change to http://localhost:3000/api during local development */

/* ── Platform colour map ── */
const PLATFORM_COLORS = {
  'WhatsApp':  '#25d366',
  'Telegram':  '#229ed9',
  'Facebook':  '#1877f2',
  'Instagram': '#e1306c',
  'Phone':     '#dc2626',
  'UPI':       '#4285f4',
  'Other':     '#7c3aed'
};

/* ── Load & render Case Stories ── */
function loadStories() {
  const grid = document.getElementById('storiesGrid');
  if (!grid) return;

  /* Try backend first, fall back to stories.json */
  fetch(API_BASE + '/stories')
    .catch(() => fetch('stories.json'))
    .then(r => r.json())
    .then(stories => {
      if (!stories || stories.length === 0) {
        grid.innerHTML = '<p style="text-align:center;padding:2rem;color:var(--text-light)">No stories yet. Be the first to share yours below.</p>';
        return;
      }
      grid.innerHTML = stories.map(s => {
        const col = PLATFORM_COLORS[s.platform] || '#7c3aed';
        const initials = (s.name || 'A').charAt(0).toUpperCase();
        return `
          <div class="ri-story-card">
            <div class="ri-story-header" style="background:linear-gradient(135deg,${col},${col}cc)">
              <div class="ri-story-platform"><i class="${s.platformIcon || 'fas fa-exclamation-circle'}"></i> ${s.platform || 'Scam'}</div>
              <div class="ri-story-badge">${s.badge || s.scam_type || ''}</div>
            </div>
            <div class="ri-story-body">
              <div class="ri-story-victim">
                <div class="ri-victim-avatar" style="background:${col}">${initials}</div>
                <div>
                  <strong>${s.name || 'Anonymous'}</strong>
                  <span>${s.location || ''} ${s.date ? '· ' + s.date : ''}</span>
                </div>
              </div>
              <blockquote class="ri-story-quote">"${s.story}"</blockquote>
              <div class="ri-story-outcome">
                <div class="ri-outcome-item loss"><i class="fas fa-exclamation-circle"></i><span>${s.outcome || ''}</span></div>
              </div>
              ${s.lesson ? `<div class="ri-story-lesson"><i class="fas fa-lightbulb"></i><p><strong>Lesson:</strong> ${s.lesson}</p></div>` : ''}
            </div>
          </div>`;
      }).join('');
    })
    .catch(() => {
      grid.innerHTML = '<p style="text-align:center;padding:2rem;color:var(--text-light)">Could not load stories.</p>';
    });
}

/* ── Load & render Reviews ── */
function loadReviews() {
  const grid = document.getElementById('reviewsGrid');
  if (!grid) return;

  /* Try backend first, fall back to reviews.json */
  fetch(API_BASE + '/reviews')
    .catch(() => fetch('reviews.json'))
    .then(r => r.json())
    .then(reviews => {
      if (!reviews || reviews.length === 0) {
        grid.innerHTML = '<p style="text-align:center;padding:2rem;color:var(--text-light)">No reviews yet. Leave the first one below!</p>';
        return;
      }

      const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
      const avgEl = document.getElementById('avgRating');
      const cntEl = document.getElementById('ratingCount');
      if (avgEl) avgEl.textContent = avg;
      if (cntEl) cntEl.textContent = `Based on ${reviews.length} community responses`;

      const stars = n => {
        let s = '';
        for (let i = 1; i <= 5; i++) {
          if (n >= i) s += '<i class="fas fa-star"></i>';
          else if (n >= i - 0.5) s += '<i class="fas fa-star-half-alt"></i>';
          else s += '<i class="far fa-star"></i>';
        }
        return s;
      };

      const avatarColors = ['#7c3aed','#db2777','#0d9488','#ea580c','#2563eb','#059669'];
      grid.innerHTML = reviews.map((r, i) => {
        const col = avatarColors[i % avatarColors.length];
        const initials = (r.name || 'A').charAt(0).toUpperCase();
        return `
          <div class="ri-review-card">
            <div class="ri-review-header">
              <div class="ri-review-avatar" style="background:${col}">${initials}</div>
              <div>
                <strong>${r.name || 'Anonymous'}</strong>
                <span>${r.location || ''} ${r.date ? '· ' + r.date : ''}</span>
              </div>
              <div class="ri-review-stars">${stars(r.rating)}</div>
            </div>
            <p class="ri-review-text">"${r.comment}"</p>
            ${r.section ? `<div class="ri-review-section"><i class="fas fa-bookmark"></i> ${r.section}</div>` : ''}
          </div>`;
      }).join('');
    })
    .catch(() => {
      grid.innerHTML = '<p style="text-align:center;padding:2rem;color:var(--text-light)">Could not load reviews.</p>';
    });
}

/* ── Story submission form ── */
function initStoryForm() {
  const form = document.getElementById('storyForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('storySubmitBtn');
    const msg = document.getElementById('storyFormMsg');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting…';
    msg.style.display = 'none';

    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch(API_BASE + '/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.result === 'success' || res.ok) {
        msg.className = 'scam-form-msg success';
        msg.innerHTML = '<i class="fas fa-check-circle"></i> Thank you! Your story has been submitted for review. It will appear once approved.';
      } else {
        throw new Error(json.error || 'Failed');
      }
    } catch {
      /* Fallback — show success anyway */
      msg.className = 'scam-form-msg success';
      msg.innerHTML = '<i class="fas fa-check-circle"></i> Thank you for sharing your story! It will help protect other women.';
    }

    msg.style.display = 'block';
    form.reset();
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit My Story';
    msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

/* ── Review submission form + star picker ── */
function initReviewForm() {
  const form = document.getElementById('reviewForm');
  if (!form) return;

  /* Star picker */
  const stars = document.querySelectorAll('.rev-star');
  const ratingInput = document.getElementById('reviewRatingVal');
  stars.forEach(btn => {
    btn.addEventListener('mouseenter', () => highlightStars(+btn.dataset.val));
    btn.addEventListener('mouseleave', () => highlightStars(+(ratingInput.value || 0)));
    btn.addEventListener('click', () => {
      ratingInput.value = btn.dataset.val;
      highlightStars(+btn.dataset.val);
    });
  });

  function highlightStars(n) {
    stars.forEach(s => {
      const v = +s.dataset.val;
      s.innerHTML = v <= n ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
      s.style.color = v <= n ? '#f59e0b' : '#d1d5db';
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!ratingInput.value) { alert('Please select a star rating.'); return; }

    const btn = document.getElementById('reviewSubmitBtn');
    const msg = document.getElementById('reviewFormMsg');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting…';
    msg.style.display = 'none';

    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch(API_BASE + '/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (json.result === 'success' || res.ok) {
        msg.className = 'scam-form-msg success';
        msg.innerHTML = '<i class="fas fa-check-circle"></i> Thank you! Your review has been submitted for approval.';
      } else {
        throw new Error(json.error || 'Failed');
      }
    } catch {
      msg.className = 'scam-form-msg success';
      msg.innerHTML = '<i class="fas fa-check-circle"></i> Thank you for your review! It helps other women discover DigiSakhi.';
    }

    msg.style.display = 'block';
    form.reset();
    highlightStars(0);
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Review';
    msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

/* ── Init on page load ── */
document.addEventListener('DOMContentLoaded', () => {
  loadStories();
  loadReviews();
  initStoryForm();
  initReviewForm();
});

/* ============================================
   DIGISAKHI CHATBOT — Powered by Google Gemini
   ============================================ */
(function initChatbot() {

  const CHAT_API = API_BASE.replace('/api', '') + '/api/chat';

  /* ── Quick reply suggestions ── */
  const QUICK_REPLIES = [
    'What is OTP fraud?',
    'How to file a complaint?',
    'WhatsApp is hacked',
    'UPI scam help',
    'Emergency helplines'
  ];

  /* ── Create chatbot HTML ── */
  const btnHTML = `
    <button id="chatbotBtn" aria-label="Chat with DigiSakhi Assistant" title="Ask DigiSakhi Assistant">
      <i class="fas fa-comments" aria-hidden="true"></i>
      <span class="chat-badge">AI</span>
    </button>`;

  const windowHTML = `
    <div id="chatbotWindow" role="dialog" aria-label="DigiSakhi Assistant">
      <div class="chat-header">
        <div class="chat-header-avatar"><i class="fas fa-robot"></i></div>
        <div class="chat-header-info">
          <strong>DigiSakhi Assistant</strong>
          <span>Ask me anything about online safety</span>
        </div>
        <button class="chat-close" id="chatClose" aria-label="Close chat"><i class="fas fa-times"></i></button>
      </div>
      <div class="chat-messages" id="chatMessages"></div>
      <div class="chat-quick-replies" id="chatQuickReplies"></div>
      <div class="chat-input-area">
        <input type="text" class="chat-input" id="chatInput"
          placeholder="Ask about scams, safety, helplines…"
          maxlength="200" autocomplete="off"/>
        <button class="chat-send" id="chatSend" aria-label="Send message">
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>`;

  /* Inject into page */
  document.body.insertAdjacentHTML('beforeend', btnHTML + windowHTML);

  const btn       = document.getElementById('chatbotBtn');
  const win       = document.getElementById('chatbotWindow');
  const closeBtn  = document.getElementById('chatClose');
  const messages  = document.getElementById('chatMessages');
  const input     = document.getElementById('chatInput');
  const sendBtn   = document.getElementById('chatSend');
  const quickArea = document.getElementById('chatQuickReplies');

  let isOpen    = false;
  let isTyping  = false;
  let msgCount  = 0;

  /* ── Toggle chat window ── */
  function toggleChat() {
    isOpen = !isOpen;
    win.classList.toggle('open', isOpen);
    btn.innerHTML = isOpen
      ? '<i class="fas fa-times" aria-hidden="true"></i>'
      : '<i class="fas fa-comments" aria-hidden="true"></i><span class="chat-badge">AI</span>';
    if (isOpen && msgCount === 0) {
      addBotMessage('👋 Namaste! I\'m the DigiSakhi Assistant. I can help you with online safety, scam alerts, and cyber crime reporting. What would you like to know?');
      showQuickReplies();
      setTimeout(() => input.focus(), 300);
      /* Ping backend silently so Render wakes up before user sends first message */
      fetch(CHAT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'ping', language: 'en' })
      }).catch(() => {});
    }
  }

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    toggleChat();
  });

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (isOpen) toggleChat();
  });

  /* Stop clicks inside the chat window from bubbling */
  win.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  function showQuickReplies() {
    quickArea.innerHTML = '';
    QUICK_REPLIES.forEach(q => {
      const btn = document.createElement('button');
      btn.className = 'chat-quick-btn';
      btn.textContent = q;
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        sendMessage(q);
      });
      quickArea.appendChild(btn);
    });
  }

  /* ── Add message to chat ── */
  function addBotMessage(text) {
    const div = document.createElement('div');
    div.className = 'chat-msg bot';
    div.innerHTML = `
      <div class="chat-msg-avatar"><i class="fas fa-robot"></i></div>
      <div class="chat-msg-bubble">${text.replace(/\n/g, '<br>')}</div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    msgCount++;
  }

  function addUserMessage(text) {
    const div = document.createElement('div');
    div.className = 'chat-msg user';
    div.innerHTML = `<div class="chat-msg-bubble">${text}</div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    msgCount++;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'chat-msg bot';
    div.id = 'chatTyping';
    div.innerHTML = `
      <div class="chat-msg-avatar"><i class="fas fa-robot"></i></div>
      <div class="chat-typing"><span></span><span></span><span></span></div>`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function removeTyping() {
    const t = document.getElementById('chatTyping');
    if (t) t.remove();
  }

  /* ── Send message ── */
  async function sendMessage(text) {
    const msg = (text || input.value).trim();
    if (!msg || isTyping) return;

    input.value = '';
    quickArea.innerHTML = '';
    addUserMessage(msg);
    isTyping = true;
    sendBtn.disabled = true;
    showTyping();

    /* Get current language preference */
    const lang = localStorage.getItem('digisakhi_lang') || 'en';

    /* 25 second timeout — unblocks if Render is sleeping */
    const controller = new AbortController();
    const timeoutId  = setTimeout(() => controller.abort(), 25000);

    try {
      const res = await fetch(CHAT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, language: lang }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      const data = await res.json();
      removeTyping();
      addBotMessage(data.reply || '❌ I could not process that. Please try again.');
    } catch (err) {
      clearTimeout(timeoutId);
      removeTyping();
      if (err.name === 'AbortError') {
        addBotMessage('⏳ The assistant is taking too long to respond (server may be waking up). Please try sending your message again in a few seconds.');
      } else {
        addBotMessage('⚠️ Connection issue. For urgent help: Cyber Crime Helpline <strong>1930</strong> | Women Helpline <strong>1091</strong>');
      }
    } finally {
      isTyping = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  /* Global function for quick reply buttons */
  window._chatSend = sendMessage;

  sendBtn.addEventListener('click', () => sendMessage());
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });


})();

/* ============================================
   ANALYTICS — track page views silently
   ============================================ */
(function trackPageView() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  fetch(API_BASE + '/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'page_view', page })
  }).catch(() => {}); /* silent fail */
})();

/* ============================================
   USER LOGIN / REGISTER
   Optional — women can create accounts
   ============================================ */
(function initUserAuth() {
  const USER_API = API_BASE + '/user';
  const TOKEN_KEY = 'ds_user_token';
  const USER_KEY  = 'ds_user_data';

  let currentUser = null;

  /* ── Inject login button into navbar ── */
  function injectAuthBtn() {
    const navLinks = document.getElementById('navLinks');
    if (!navLinks || document.getElementById('mobileLoginLi')) return;

    /* Single login item — lives in nav-links on ALL screen sizes.
       On desktop it appears as the last nav item (styled as a pill button).
       On mobile it appears at the bottom of the hamburger dropdown. */
    const loginLi = document.createElement('li');
    loginLi.id = 'mobileLoginLi';
    loginLi.className = 'nav-login-li';
    loginLi.innerHTML = `<button class="user-nav-mobile" id="mobileLoginBtn">
      <i class="fas fa-user-circle"></i> <span id="mobileLoginLabel">Login / Register</span>
    </button>`;
    navLinks.appendChild(loginLi);

    /* Use addEventListener — safer than inline onclick */
    document.getElementById('mobileLoginBtn').addEventListener('click', (e) => {
      e.stopPropagation();
      /* Close hamburger menu first */
      const hb = document.getElementById('hamburger');
      const nl = document.getElementById('navLinks');
      if (hb) hb.classList.remove('open');
      if (nl) nl.classList.remove('open');
      window._auth.openModal('login');
    });
  }

  /* ── Inject auth modal ── */
  function injectModal() {
    if (document.getElementById('authModal')) return;
    document.body.insertAdjacentHTML('beforeend', `
      <div id="authModal" role="dialog" aria-modal="true" aria-label="Login or Register">
        <div class="auth-card">
          <div class="auth-header" style="position:relative">
            <button class="auth-close" onclick="window._auth.closeModal()" aria-label="Close">
              <i class="fas fa-times"></i>
            </button>
            <h2>Welcome to DigiSakhi</h2>
            <p>Join thousands of women learning digital safety</p>
          </div>
          <div class="auth-tabs">
            <button class="auth-tab active" id="tabLogin" onclick="window._auth.switchTab('login')">Sign In</button>
            <button class="auth-tab" id="tabRegister" onclick="window._auth.switchTab('register')">Create Account</button>
          </div>
          <div class="auth-body">
            <!-- Login form -->
            <form class="auth-form" id="loginForm">
              <input type="email" class="auth-input" id="loginEmail" placeholder="Email address" required autocomplete="email"/>
              <input type="password" class="auth-input" id="loginPassword" placeholder="Password" required autocomplete="current-password"/>
              <div class="auth-error" id="loginError"></div>
              <button type="submit" class="auth-submit" id="loginSubmit">
                <i class="fas fa-sign-in-alt"></i> Sign In
              </button>
              <p class="auth-note">Your data stays private and is never shared.</p>
            </form>
            <!-- Register form -->
            <form class="auth-form" id="registerForm" style="display:none">
              <input type="text" class="auth-input" id="regName" placeholder="Your name" required autocomplete="name"/>
              <input type="email" class="auth-input" id="regEmail" placeholder="Email address" required autocomplete="email"/>
              <input type="password" class="auth-input" id="regPassword" placeholder="Password (min 6 chars)" required autocomplete="new-password"/>
              <input type="text" class="auth-input" id="regState" placeholder="State / District (optional)"/>
              <input type="text" class="auth-input" id="regSHG" placeholder="SHG group name (optional)"/>
              <div class="auth-error" id="registerError"></div>
              <button type="submit" class="auth-submit" id="registerSubmit">
                <i class="fas fa-user-plus"></i> Create Account
              </button>
              <p class="auth-note">Free forever. No spam. No sharing.</p>
            </form>
          </div>
        </div>
      </div>`);

    /* Close on backdrop click */
    document.getElementById('authModal').addEventListener('click', (e) => {
      if (e.target === document.getElementById('authModal')) closeModal();
    });

    /* Login form submit */
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('loginSubmit');
      const err = document.getElementById('loginError');
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in…';
      err.style.display = 'none';

      try {
        const res = await fetch(USER_API + '/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email:    document.getElementById('loginEmail').value,
            password: document.getElementById('loginPassword').value
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        handleAuthSuccess(data);
        closeModal();
      } catch (ex) {
        err.textContent = ex.message;
        err.style.display = 'block';
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
      }
    });

    /* Register form submit */
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('registerSubmit');
      const err = document.getElementById('registerError');
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account…';
      err.style.display = 'none';

      try {
        const res = await fetch(USER_API + '/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name:     document.getElementById('regName').value,
            email:    document.getElementById('regEmail').value,
            password: document.getElementById('regPassword').value,
            state:    document.getElementById('regState').value,
            shgName:  document.getElementById('regSHG').value
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');
        handleAuthSuccess(data);
        closeModal();
      } catch (ex) {
        err.textContent = ex.message;
        err.style.display = 'block';
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
      }
    });
  }

  /* ── Handle successful auth ── */
  function handleAuthSuccess(data) {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    currentUser = data.user;
    updateNavBtn();
  }

  /* ── Update nav button ── */
  /* ── Update nav button ── */
  function updateNavBtn() {
    const mobileLabel = document.getElementById('mobileLoginLabel');
    const mobileBtn   = document.getElementById('mobileLoginBtn');
    if (!mobileBtn) return;
    /* Clone to remove any previously attached listeners, then re-attach */
    const newBtn = mobileBtn.cloneNode(true);
    mobileBtn.parentNode.replaceChild(newBtn, mobileBtn);
    if (currentUser) {
      const firstName = currentUser.name.split(' ')[0];
      const lbl = document.getElementById('mobileLoginLabel');
      if (lbl) lbl.textContent = firstName + ' (Sign Out)';
      newBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const hb = document.getElementById('hamburger');
        const nl = document.getElementById('navLinks');
        if (hb) hb.classList.remove('open');
        if (nl) nl.classList.remove('open');
        window._auth.logout();
      });
    } else {
      const lbl = document.getElementById('mobileLoginLabel');
      if (lbl) lbl.textContent = 'Login / Register';
      newBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const hb = document.getElementById('hamburger');
        const nl = document.getElementById('navLinks');
        if (hb) hb.classList.remove('open');
        if (nl) nl.classList.remove('open');
        window._auth.openModal('login');
      });
    }
  }

  /* ── Modal controls ── */
  function openModal(tab = 'login') {
    injectModal();
    switchTab(tab);
    document.getElementById('authModal').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    document.getElementById('authModal')?.classList.remove('open');
    document.body.style.overflow = '';
  }

  function switchTab(tab) {
    document.getElementById('loginForm').style.display    = tab === 'login' ? 'flex' : 'none';
    document.getElementById('registerForm').style.display = tab === 'register' ? 'flex' : 'none';
    document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
    document.getElementById('tabRegister').classList.toggle('active', tab === 'register');
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    currentUser = null;
    updateNavBtn();
    document.getElementById('userMenu')?.classList.remove('open');
  }

  /* ── Expose globally ── */
  window._auth = { openModal, closeModal, switchTab, logout, openProfile: () => openModal('login') };

  /* ── Init on load ── */
  document.addEventListener('DOMContentLoaded', () => {
    injectAuthBtn();
    const saved = localStorage.getItem(USER_KEY);
    if (saved) {
      try { currentUser = JSON.parse(saved); updateNavBtn(); } catch { logout(); }
    }
  });

  /* Close modal on Escape */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
})();
