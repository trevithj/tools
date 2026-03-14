const SHAPES = ['circle', 'square', 'triangle', 'diamond'];
const COLORS = [
    {name: 'rose', fill: '#f9a8b8', stroke: '#f07090'},
    {name: 'sky', fill: '#a8d4f9', stroke: '#5aaae0'},
    {name: 'sage', fill: '#a8f0cc', stroke: '#50c887'},
    {name: 'amber', fill: '#f9dfa8', stroke: '#e0b840'},
    // {name: 'lavender', fill: '#d4a8f9', stroke: '#a060e0'},
];
const SPEED_VALUES = [1.0, 2.0, 3.0];
const state = {
    running: false,
    speedIdx: 1,
    bubbles: [],
    lastSpawnTime: 0,
    rafId: null,
    lastTs: null,
    target: randomTarget()
};

const wrap = document.getElementById('canvas-wrap');
const idleMsg = document.getElementById('idle-msg');
const btnStart = document.getElementById('btn-start');
const targetBox = document.getElementById('target-box');
const targetSvg = targetBox.querySelector('#target-svg');
const targetName = targetBox.querySelector('#target-name');

// ── helpers ────────────────────────────────────────────────────────────────

function rand(a, b) {return a + Math.random() * (b - a);}
function pick(arr) {return arr[Math.floor(Math.random() * arr.length)];}

function randomTarget() {
    return {shape: pick(SHAPES), color: pick(COLORS)};
}

function shapeInnerSVG(shape, fill, stroke) {
    if (shape === 'circle')
        return `<circle cx="50" cy="50" r="44" fill="${fill}" stroke="${stroke}" stroke-width="4"/>`;
    if (shape === 'square')
        return `<rect x="10" y="10" width="80" height="80" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="4"/>`;
    if (shape === 'triangle')
        return `<polygon points="50,8 95,92 5,92" fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>`;
    if (shape === 'diamond')
        return `<polygon points="50,6 94,50 50,94 6,50" fill="${fill}" stroke="${stroke}" stroke-width="4" stroke-linejoin="round"/>`;
}

// ── target display ─────────────────────────────────────────────────────────

function renderTarget() {
    const { target } = state;
    targetSvg.innerHTML = shapeInnerSVG(target.shape, target.color.fill, target.color.stroke);
    targetName.textContent = `${target.color.name} ${target.shape}`;
}
renderTarget();

function changeTarget() {
    const newTarget = randomTarget();
    if (newTarget.shape === state.target.shape) {
        changeTarget();
    } else {
        state.target = newTarget;
        renderTarget();
    }
}

// ── bubble factory ─────────────────────────────────────────────────────────

function spawnBubble() {
    const speed = SPEED_VALUES[state.speedIdx];
    const size = rand(44, 80);
    const shape = pick(SHAPES);
    const color = pick(COLORS);
    const xPct = rand(6, 94);
    const vy = rand(0.5, 0.9) * speed * 60; // px/s
    const phase = rand(0, Math.PI * 2);

    const el = document.createElement('div');
    el.className = 'bubble';
    el.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 100 100">${shapeInnerSVG(shape, color.fill, color.stroke)}</svg>`;
    wrap.appendChild(el);

    state.bubbles.push({
        el, shape, color, size,
        xPct,
        yPx: wrap.offsetHeight + size,
        vy, phase,
        opacity: 1,
        state: 'alive', // 'alive' | 'popping' | 'miss'
    });
}

// ── click handler ──────────────────────────────────────────────────────────
targetBox.addEventListener("click", changeTarget);

wrap.addEventListener('mousedown', e => {
    if (!state.running) return;
    const el = e.target.closest('.bubble');
    if (!el) return;
    const { bubbles, target } = state;
    const b = bubbles.find(b => b.el === el);
    if (!b || b.state !== 'alive') return;

    const isMatch = b.shape === target.shape && b.color.name === target.color.name;
    b.state = isMatch ? 'popping' : 'miss';

    // if (isMatch && Math.random() < 0.35) {
    //     setTimeout(changeTarget, 500);
    // }
});

// ── animation loop ─────────────────────────────────────────────────────────

function frame(ts) {
    if (!state.running) return;
    if (state.lastTs === null) state.lastTs = ts;
    const dt = Math.min((ts - state.lastTs) / 1000, 0.05);
    state.lastTs = ts;

    const speed = SPEED_VALUES[state.speedIdx];
    const spawnInterval = 1400 / speed;

    if (ts - state.lastSpawnTime > spawnInterval) {
        spawnBubble();
        state.lastSpawnTime = ts;
    }

    const W = wrap.offsetWidth;

    state.bubbles = state.bubbles.filter(b => {
        if (b.state === 'popping') {
            b.opacity -= 0.06;
            b.size *= 1.04;
            b.el.style.opacity = b.opacity;
            const svg = b.el.querySelector('svg');
            svg.setAttribute('width', b.size);
            svg.setAttribute('height', b.size);
            if (b.opacity <= 0) {b.el.remove(); return false;}
            return true;
        }

        if (b.state === 'miss') {
            // console.log("missed");
            b.opacity -= 0.045;
            b.el.style.opacity = b.opacity;
            b.el.style.filter = 'grayscale(0.7)';
            b.yPx -= b.vy * dt;
            const xPx = (b.xPct / 100) * W + Math.sin(b.yPx * 0.04 + b.phase) * 18;
            b.el.style.left = xPx + 'px';
            b.el.style.top = b.yPx + 'px';
            if (b.opacity <= 0) {b.el.remove(); return false;}
            return true;
        }

        // alive — float upward with gentle sway
        b.yPx -= b.vy * dt;
        const xPx = (b.xPct / 100) * W + Math.sin(b.yPx * 0.04 + b.phase) * 18;
        b.el.style.left = xPx + 'px';
        b.el.style.top = b.yPx + 'px';

        if (b.yPx < -b.size) {b.el.remove(); return false;}
        return true;
    });

    state.rafId = requestAnimationFrame(frame);
}

// ── start / pause ──────────────────────────────────────────────────────────

btnStart.addEventListener('click', () => {
    state.running = !state.running;

    if (state.running) {
        idleMsg.style.display = 'none';
        btnStart.textContent = 'pause';
        btnStart.classList.remove('paused');
        state.lastTs = null;
        state.lastSpawnTime = 0;
        state.rafId = requestAnimationFrame(frame);
    } else {
        btnStart.textContent = 'start';
        btnStart.classList.add('paused');
        cancelAnimationFrame(state.rafId);
        state.lastTs = null;
    }
});

// ── speed buttons ──────────────────────────────────────────────────────────

document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        state.speedIdx = parseInt(btn.dataset.i);
        document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});