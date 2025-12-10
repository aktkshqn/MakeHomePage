/* script.js
   - パーティクル（canvas）アニメーション
   - ベル音（WebAudio API）
   - スクロール連動 reveal-on-scroll
   - シンプルなSVGアニメーショントリガー（既にCSSアニメ）
*/

(() => {
  /* ========== Canvas パーティクル ========== */
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  let W = canvas.width = innerWidth;
  let H = canvas.height = innerHeight;

  window.addEventListener('resize', () => {
    W = canvas.width = innerWidth;
    H = canvas.height = innerHeight;
  });

  // パーティクル配列
  const particles = [];
  const particleCount = Math.max(10, Math.floor((W * H) / 12000)); // デバイスに応じて数調整

  function rand(min, max) { return Math.random() * (max - min) + min; }

  class P {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = rand(0, W);
      this.y = rand(-H * 0.4, H);
      this.size = rand(1.4, 2.3);
      this.speed = rand(0.1, 0.9);
      this.vx = rand(-0.2, 0.2);
      this.vy = this.speed + rand(0.1, 0.8);
      this.alpha = rand(0.3, 0.95);
      this.hue = rand(40, 60); // ゴールド系
      this.life = rand(60, 240);
      this.age = 0;
      this.type = Math.random() > 0.85 ? 'spark' : 'soft';
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.age++;
      if (this.y > H + 40 || this.x < -40 || this.x > W + 40 || this.age > this.life) this.reset();
    }
    draw(ctx) {
      if (this.type === 'spark') {
        // 強めの点
        ctx.beginPath();
        ctx.fillStyle = `hsla(${this.hue}, 95%, 60%, ${this.alpha})`;
        ctx.arc(this.x, this.y, this.size * 0.9, 0, Math.PI * 2);
        ctx.fill();
        // 小さな輝き
        ctx.beginPath();
        ctx.fillStyle = `hsla(${this.hue}, 95%, 70%, ${this.alpha * 0.5})`;
        ctx.arc(this.x - this.size, this.y - this.size*0.6, this.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // ソフトな光
        const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 6);
        g.addColorStop(0, `hsla(${this.hue},95%,70%, ${this.alpha})`);
        g.addColorStop(0.5, `hsla(${this.hue},95%,60%, ${this.alpha*0.25})`);
        g.addColorStop(1, `rgba(255,255,255,0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 8, 0, Math.PI*2);
        ctx.fill();
      }
    }
  }

  for (let i = 0; i < particleCount; i++) particles.push(new P());

  function loop() {
    ctx.clearRect(0,0,W,H);
    // うっすらグラデ背景オーバーレイを描く
    // ctx.fillStyle = 'rgba(10,8,20,0.02)'; ctx.fillRect(0,0,W,H);
    for (let p of particles) {
      p.update();
      p.draw(ctx);
    }
    requestAnimationFrame(loop);
  }
  loop();

  /* ========== ベル音（WebAudio API） ========== */
  let audioCtx = null;
  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  // シンプルなベルっぽい合成音
  function playBell() {
    initAudio();
    const ctx = audioCtx;
    const now = ctx.currentTime;

    // 基本ノート周波数（ミュージックな感じの和音）
    const freqs = [880, 1320, 1760]; // A5, E6, A6-ish
    const master = ctx.createGain(); master.gain.value = 0.0001; master.connect(ctx.destination);

    // エンベロープを使ってベルの余韻
    master.gain.linearRampToValueAtTime(0.9, now + 0.001);
    master.gain.exponentialRampToValueAtTime(0.0005, now + 3.8);

    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.value = f * (1 + (Math.random()-0.5) * 0.01);
      gain.gain.value = i === 0 ? 0.6 : 0.36;
      // Detune slightly
      osc.detune.value = (Math.random() - 0.5) * 15;
      // simple lowpass for mellow
      const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 6500;
      osc.connect(gain); gain.connect(filter); filter.connect(master);
      osc.start(now + i * 0.002);
      osc.stop(now + 4 + i * 0.02);
    });

    // 透明な高域のチャイム
    const noiseOsc = ctx.createOscillator();
    const noiseGain = ctx.createGain();
    noiseOsc.type = 'sine';
    noiseOsc.frequency.value = 4800 + Math.random()*600;
    noiseGain.gain.value = 0.08;
    noiseOsc.connect(noiseGain); noiseGain.connect(master);
    noiseOsc.start(now);
    noiseOsc.stop(now + 1.2);
  }

  // ベルボタンのクリック
  const bellBtn = document.getElementById('bell-btn');
  bellBtn.addEventListener('click', (e) => {
    // iOS Safari などではユーザー操作でAudioContextをresumeする必要
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    playBell();
    // 視覚フィードバック
    bellBtn.classList.add('ring');
    bellBtn.setAttribute('aria-pressed', 'true');
    setTimeout(()=>{ bellBtn.classList.remove('ring'); bellBtn.setAttribute('aria-pressed', 'false'); }, 900);
  });

  /* ========== スクロール連動 reveal-on-scroll ========== */
  const observerOpts = {
    root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.12
  };
  const reveals = document.querySelectorAll('.reveal-on-scroll');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('is-visible');
        // 一度見えたら停止（アニメは一回）
        io.unobserve(en.target);
      }
    });
  }, observerOpts);
  reveals.forEach(r => io.observe(r));

  /* ========== 小さな飾り星をランダムに生成してページに配置（アクセント） ========= */
  function makeDecorStars() {
    const count = Math.min(6, Math.floor(window.innerWidth / 200));
    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      star.className = 'decor-star';
      star.style.left = (Math.random()*100) + '%';
      star.style.top = (10 + Math.random()*40) + '%';
      star.style.width = (6 + Math.random()*8) + 'px';
      star.style.height = star.style.width;
      star.style.opacity = (0.6 + Math.random()*0.6).toString();
      star.style.transition = `opacity ${2+Math.random()*4}s ease-in-out`;
      document.body.appendChild(star);
      // ゆっくり点滅
      setInterval(() => {
        star.style.opacity = (0.3 + Math.random()*0.9).toString();
      }, 1800 + Math.random()*3200);
    }
  }
  makeDecorStars();

  /* ========== タッチデバイスでパフォーマンスを考慮し、粒子を抑える ========== */
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouch && particles.length > 120) {
    // タッチなら粒子を削減
    for (let i = particles.length - 1; i >= 120; i--) particles.splice(i, 1);
  }

  // 最後に軽いヒント（アクセシビリティのため）
  // スクロールして要素が現れるのをお楽しみください
})();
