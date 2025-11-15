/* script.js - Intelligential
   Handles: particles, stat counters, contact form demo, dark mode persistence, auth-demo
*/

/* ===== Dark mode persistence & toggle ===== */
(function(){
  const root = document.documentElement;
  const themeKey = 'intelligential_theme';
  function setTheme(theme){
    if(theme === 'dark') root.setAttribute('data-theme','dark');
    else root.removeAttribute('data-theme');
    localStorage.setItem(themeKey, theme);
  }
  // init
  const saved = localStorage.getItem(themeKey);
  if(saved === 'dark') setTheme('dark');
  // expose toggle
  window.toggleTheme = () => {
    const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    setTheme(current === 'dark' ? 'light' : 'dark');
  };
})();

/* ===== Particles (background floating dots) ===== */
function createParticles(count = 20){
  const container = document.getElementById('particles-container');
  if(!container) return;
  container.innerHTML = '';
  for(let i=0;i<count;i++){
    const el = document.createElement('div');
    el.className = 'particle';
    const left = Math.random()*100;
    const delay = Math.random()*6;
    const duration = 6 + Math.random()*8;
    el.style.left = left + '%';
    el.style.top = (80 + Math.random()*20) + '%';
    el.style.width = (3 + Math.random()*6) + 'px';
    el.style.height = el.style.width;
    el.style.opacity = (0.4 + Math.random()*0.8);
    el.style.animation = `particleFloat ${duration}s linear ${delay}s infinite`;
    container.appendChild(el);
  }
}
/* particle keyframes added via CSS runtime */
(function addParticleKeyframes(){
  const css = `@keyframes particleFloat{
    0%{ transform: translateY(0) rotate(0deg); opacity:0; }
    8%{ opacity:1; }
    92%{ opacity:1; }
    100%{ transform: translateY(-120vh) rotate(360deg); opacity:0; }
  }`;
  const s = document.createElement('style'); s.innerHTML = css; document.head.appendChild(s);
})();

/* ===== Stats counter animation ===== */
function animateStats() {
  const stats = [
    { id: 'stat-1', target: 50, suffix: 'K+' },
    { id: 'stat-2', target: 95, suffix: '%' },
    { id: 'stat-3', target: 200, suffix: '+' },
    { id: 'stat-4', target: 24, suffix: '/7' }
  ];
  stats.forEach(stat => {
    const el = document.getElementById(stat.id);
    if(!el) return;
    let cur = 0;
    const increment = Math.max(1, Math.floor(stat.target / 60));
    const t = setInterval(() => {
      cur += increment;
      if(cur >= stat.target) { cur = stat.target; clearInterval(t); }
      el.textContent = Math.floor(cur) + stat.suffix;
    }, 30);
  });
}

/* ===== Contact form handler (demo) ===== */
function handleContactForm(evt){
  evt.preventDefault();
  const btn = evt.target.querySelector('button[type="submit"]');
  const original = btn.textContent;
  btn.textContent = 'Message Sent ✓';
  btn.disabled = true;
  btn.style.backgroundColor = '#10b981';
  setTimeout(()=>{ evt.target.reset(); btn.textContent = original; btn.disabled = false; btn.style.backgroundColor = ''; }, 2200);
}

/* ===== Intersection observer to trigger animations when sections visible ===== */
function setupObservers(){
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        if(entry.target.classList.contains('fade-in-up')){
          entry.target.classList.add('visible');
        }
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.fade-in-up, .slide-in-left, .slide-in-right').forEach(el => obs.observe(el));
}

/* ===== AUTH DEMO (very small front-end demo) ===== */
function loginDemo(e){
  e.preventDefault();
  const form = e.target;
  const email = form.querySelector('[name="email"]').value.trim();
  const pass = form.querySelector('[name="password"]').value;
  if(!email || !pass){ alert('Enter email & password (demo)'); return; }
  // store token & user
  localStorage.setItem('int_token', btoa(email + '::demo'));
  localStorage.setItem('int_user', JSON.stringify({ email: email, name: email.split('@')[0] }));
  // go to dashboard
  window.location.href = './dashboard.html';
}
function requireAuth(redirect = true){
  const t = localStorage.getItem('int_token');
  if(!t){
    if(redirect) window.location.href = './login.html';
    return false;
  }
  return true;
}
function logoutDemo(){
  localStorage.removeItem('int_token');
  localStorage.removeItem('int_user');
  window.location.href = './login.html';
}

/* ===== On DOM ready initialize ===== */
document.addEventListener('DOMContentLoaded', () => {
  createParticles(22);
  animateStats();
  setupObservers();

  // wire contact forms
  document.querySelectorAll('form[data-contact="true"]').forEach(f => f.addEventListener('submit', handleContactForm));

  // fill contact fields text nodes if present
  document.querySelectorAll('#contact-email').forEach(el => el.textContent = 'hello@yourdomain.com');
  document.querySelectorAll('#contact-phone').forEach(el => el.textContent = '09116575661');
  document.querySelectorAll('#contact-address').forEach(el => el.textContent = 'Military avenue, off ago Adura, Sango ota, Ogun state');

  // if on dashboard populate user
  if(document.getElementById('user-box')){
    const u = JSON.parse(localStorage.getItem('int_user') || 'null');
    document.getElementById('user-box').textContent = u ? `${u.name} • ${u.email}` : 'Student';
  }

  // menu mobile toggle
  const btn = document.getElementById('hamburger-btn');
  if(btn){
    btn.addEventListener('click', () => {
      const links = document.getElementById('nav-links');
      if(links.style.display === 'flex') links.style.display = 'none';
      else links.style.display = 'flex';
    });
  }
});
function toggleDarkMode() {
    document.body.classList.toggle('dark');
}
