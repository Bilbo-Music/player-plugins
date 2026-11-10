<template>
  <div class="gf-container" :class="[theme]" id="gf-app-root">
    
    <!-- TOP MINIMALIST HEADER -->
    <header class="gf-header">
      <a 
        href="https://t.me/ghostf_music" 
        target="_blank" 
        rel="noopener noreferrer" 
        class="gf-top-tg-btn"
        aria-label="Telegram"
      >
        <span class="tg-glow-pulse"></span>
        <svg class="gf-icon tg-icon-svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
        </svg>
      </a>
      <!--  -->

      <!-- BRAND TITLE: STRICTLY THE ONLY TEXT ALLOWED (WITH THEMATIC BORDER EQUALIZER) -->
      <a 
        href="https://t.me/ghostf_music" 
        target="_blank" 
        rel="noopener noreferrer" 
        class="gf-brand-link"
        :class="{ 'is-playing': playerState === 'playing' }"
        aria-label="GHOST FREQUENCY Telegram"
      >
        <!-- Top Equalizer Bars radiating from top border -->
        <div class="gf-eq-container gf-eq-top" aria-hidden="true">
          <span 
            v-for="(val, idx) in eqBars" 
            :key="'eq-top-' + idx" 
            class="gf-eq-bar"
            :style="{ 
              height: `${Math.max(2, val * 22)}px`,
              opacity: 0.35 + val * 0.65,
              background: val > 0.75 ? '#ffffff' : (val > 0.4 ? '#c084fc' : '#a855f7'),
              boxShadow: val > 0.4 ? `0 0 8px rgba(192, 132, 252, ${val})` : 'none'
            }"
          ></span>
        </div>

        <!-- Glow border pulse aura reacting to audio bass -->
        <span 
          class="gf-brand-glow-border"
          :style="{
            opacity: 0.3 + audioData.bass * 0.7,
            boxShadow: `0 0 ${10 + audioData.bass * 26}px rgba(168, 85, 247, ${0.4 + audioData.bass * 0.6}), inset 0 0 ${6 + audioData.bass * 12}px rgba(192, 132, 252, ${0.3 + audioData.bass * 0.5})`
          }"
        ></span>

        <span class="gf-brand-text">GHOST FREQUENCY</span>

        <!-- Bottom Equalizer Bars radiating from bottom border -->
        <div class="gf-eq-container gf-eq-bottom" aria-hidden="true">
          <span 
            v-for="(val, idx) in eqBars" 
            :key="'eq-bot-' + idx" 
            class="gf-eq-bar"
            :style="{ 
              height: `${Math.max(2, val * 22)}px`,
              opacity: 0.35 + val * 0.65,
              background: val > 0.75 ? '#ffffff' : (val > 0.4 ? '#c084fc' : '#a855f7'),
              boxShadow: val > 0.4 ? `0 0 8px rgba(192, 132, 252, ${val})` : 'none'
            }"
          ></span>
        </div>
      </a>

      <button 
        class="gf-icon-btn" 
        @click="toggleSound"
        :class="{ 'is-active': soundEnabled }"
        aria-label="Sound"
      >
        <svg v-if="soundEnabled" class="gf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
        <svg v-else class="gf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        </svg>
      </button>

<!--        -->
    </header>

    <!-- INTERACTIVE CANVAS VIEWPORT -->
    <div 
      class="gf-canvas-container" 
      ref="containerRef"
      @pointerdown="handleCanvasClick"
      @pointermove="handlePointerMove"
    >
      <canvas ref="canvasRef" class="gf-canvas"></canvas>
    </div>

    <!-- MINIMALIST FIXED CONTROLLER DOCK (ICONS ONLY) -->
    <footer class="gf-footer">
      <div class="gf-dock">
        <!-- Spawn Ghost Button -->
        <button 
          class="gf-dock-btn" 
          @click="spawnGhostClick"
          aria-label="Spawn Ghost"
        >
          <svg class="gf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 10h.01M15 10h.01M12 2a8 8 0 0 0-8 8v10l3-2 3 2 2-1 2 1 3-2 3 2V10a8 8 0 0 0-8-8z"/>
          </svg>
        </button>

        <!-- Previous Track -->
        <button 
          class="gf-dock-btn" 
          @click="playerSdk.prev()" 
          :disabled="prevDisabled"
          aria-label="Previous"
        >
          <svg class="gf-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
          </svg>
        </button>

        <!-- Play / Pause Main Button -->
        <button 
          class="gf-dock-btn gf-dock-play" 
          @click="togglePlay"
          aria-label="Play/Pause"
        >
          <svg v-if="playerState !== 'playing'" class="gf-icon gf-icon-play" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z"/>
          </svg>
          <svg v-else class="gf-icon gf-icon-play" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        </button>

        <!-- Next Track -->
        <button 
          class="gf-dock-btn" 
          @click="playerSdk.next()" 
          :disabled="nextDisabled"
          aria-label="Next"
        >
          <svg class="gf-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6zm9-12h2v12h-2z"/>
          </svg>
        </button>

        <!-- Playlist / Queue -->
        <button 
          class="gf-dock-btn" 
          @click="openPlaylist"
          aria-label="Playlist"
        >
          <svg class="gf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6"/>
            <line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/>
            <line x1="3" y1="12" x2="3.01" y2="12"/>
            <line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
        </button>

        <!-- Like / Favorite -->
        <button 
          class="gf-dock-btn" 
          @click="handleLike" 
          :class="{ 'is-liked': reaction === 'LIKE' }"
          aria-label="Like"
        >
          <svg 
            class="gf-icon" 
            viewBox="0 0 24 24" 
            :fill="reaction === 'LIKE' ? '#a855f7' : 'none'" 
            stroke="currentColor" 
            stroke-width="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

        <!-- Minimize / Collapse -->
        <button 
          class="gf-dock-btn" 
          @click="playerSdk.collapse()" 
          aria-label="Collapse"
        >
          <svg class="gf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="4 14 10 14 10 20"></polyline>
            <polyline points="20 10 14 10 14 4"></polyline>
            <line x1="14" y1="10" x2="21" y2="3"></line>
            <line x1="10" y1="14" x2="3" y2="21"></line>
          </svg>
        </button>
      </div>
    </footer>

  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, reactive } from 'vue'
import { playerSdk } from '@bilbomusic/player-plugin-sdk'

// Refs
const canvasRef = ref(null)
const containerRef = ref(null)

// Player state
const theme = ref('dark')
const playerState = ref('paused')
const reaction = ref('')
const nextDisabled = ref(false)
const prevDisabled = ref(false)
const soundEnabled = ref(false)

// Audio analysis values
const audioData = reactive({
  bass: 0,
  mid: 0,
  high: 0,
  beatPulse: 0
})

// Thematic Equalizer Spectrum (24 bands along top and bottom brand borders)
const eqBars = ref(new Array(24).fill(0.08))
let lastAudioFrameTime = 0
let simBeatTimer = 0

// Web Audio API context for procedural sounds
let audioCtx = null

const initAudioContext = () => {
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
}

// Procedural sound FX
const playScaredSfx = () => {
  if (!soundEnabled.value) return
  try {
    initAudioContext()
    if (!audioCtx) return

    const now = audioCtx.currentTime
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()

    // Cute startled squeak / whoop frequency sweep
    osc.type = 'sine'
    osc.frequency.setValueAtTime(320, now)
    osc.frequency.exponentialRampToValueAtTime(780, now + 0.08)
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.22)

    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)

    osc.connect(gain)
    gain.connect(audioCtx.destination)

    osc.start(now)
    osc.stop(now + 0.25)
  } catch (e) {
    // Audio context may be restricted by autoplay policy
  }
}

const playSpawnSfx = () => {
  if (!soundEnabled.value) return
  try {
    initAudioContext()
    if (!audioCtx) return

    const now = audioCtx.currentTime
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()

    // Soft ethereal bell chime
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(587.33, now) // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15) // A5

    gain.gain.setValueAtTime(0.12, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35)

    osc.connect(gain)
    gain.connect(audioCtx.destination)

    osc.start(now)
    osc.stop(now + 0.35)
  } catch (e) {
    // Ignore autoplay restriction
  }
}

const toggleSound = () => {
  soundEnabled.value = !soundEnabled.value
  if (soundEnabled.value) {
    playSpawnSfx()
  }
}

// ==========================================
// INTERACTIVE ENGINE: LOGO & GHOSTS
// ==========================================

// Main Ghost Frequency character state
const hero = {
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  baseX: 0,
  baseY: 0,
  // width: 96,
  width: 48,
  height: 61,
  // height: 122,
  angle: 0,
  targetAngle: 0,
  
  // Eye tracking & searching state
  eyeLookX: 0,
  eyeLookY: 0,
  eyeTargetX: 0,
  eyeTargetY: 0,
  eyeScanTimer: 0,

  // Scared / startled state
  isScared: false,
  scareTimer: 0,
  scareCooldown: 0,
  scareIntensity: 0,
  jitterX: 0,
  jitterY: 0,

  // Hover bobbing
  floatTimer: 0,
  bobSpeed: 0.0025,
  bobAmpX: 45,
  bobAmpY: 35,

  // Frequency wave radiation phase
  wavePhase: 0
}

// Translucent wandering ghosts
let roamingGhosts = []

// Background / shockwave particle effects
let particles = []
let shockwaves = []

// Mouse cursor interaction
let pointerX = -1000
let pointerY = -1000

// Animation loop
let animationId = null
let lastTime = 0

// Create a translucent roaming ghost
const spawnGhost = (optX, optY) => {
  if (!canvasRef.value) return
  const w = canvasRef.value.width / (window.devicePixelRatio || 1)
  const h = canvasRef.value.height / (window.devicePixelRatio || 1)

  let startX, startY, targetX, targetY

  if (optX !== undefined && optY !== undefined) {
    startX = optX
    startY = optY
    const angle = Math.random() * Math.PI * 2
    const dist = 300 + Math.random() * 300
    targetX = startX + Math.cos(angle) * dist
    targetY = startY + Math.sin(angle) * dist
  } else {
    // Spawn from random border edge
    const side = Math.floor(Math.random() * 4)
    if (side === 0) { // Top
      startX = Math.random() * w
      startY = -60
      targetX = Math.random() * w
      targetY = h + 60
    } else if (side === 1) { // Right
      startX = w + 60
      startY = Math.random() * h
      targetX = -60
      targetY = Math.random() * h
    } else if (side === 2) { // Bottom
      startX = Math.random() * w
      startY = h + 60
      targetX = Math.random() * w
      targetY = -60
    } else { // Left
      startX = -60
      startY = Math.random() * h
      targetX = w + 60
      targetY = Math.random() * h
    }
  }

  const ghostTypes = [
    { type: 'wobbly', color: 'rgba(216, 180, 254, 0.45)', glow: '#c084fc', size: 36, speed: 1.2, face: 'cute' },
    { type: 'zoomer', color: 'rgba(168, 85, 247, 0.55)', glow: '#a855f7', size: 28, speed: 2.2, face: 'playful' },
    { type: 'giant', color: 'rgba(192, 132, 252, 0.35)', glow: '#e9d5ff', size: 54, speed: 0.8, face: 'chill' },
    { type: 'shy', color: 'rgba(243, 232, 255, 0.4)', glow: '#d8b4fe', size: 32, speed: 1.4, face: 'shy' },
    { type: 'derp', color: 'rgba(233, 213, 255, 0.5)', glow: '#c084fc', size: 38, speed: 1.6, face: 'derp' }
  ]

  const chosenType = ghostTypes[Math.floor(Math.random() * ghostTypes.length)]
  const dx = targetX - startX
  const dy = targetY - startY
  const dist = Math.sqrt(dx * dx + dy * dy) || 1
  const baseSpeed = (chosenType.speed + Math.random() * 0.6) * (1 + audioData.bass * 0.5)

  roamingGhosts.push({
    x: startX,
    y: startY,
    vx: (dx / dist) * baseSpeed,
    vy: (dy / dist) * baseSpeed,
    targetX,
    targetY,
    size: chosenType.size,
    color: chosenType.color,
    glow: chosenType.glow,
    face: chosenType.face,
    wavePhase: Math.random() * Math.PI * 2,
    waveSpeed: 0.05 + Math.random() * 0.05,
    wobbleAmp: 10 + Math.random() * 15,
    alpha: 0,
    maxAlpha: 0.45 + Math.random() * 0.25,
    age: 0,
    lifespan: 600 + Math.random() * 400
  })

  // Add subtle ethereal ring at spawn
  shockwaves.push({
    x: startX,
    y: startY,
    radius: 5,
    maxRadius: 40,
    alpha: 0.6,
    color: chosenType.glow
  })
}

const spawnGhostClick = () => {
  if (!canvasRef.value) return
  const w = canvasRef.value.width / (window.devicePixelRatio || 1)
  const h = canvasRef.value.height / (window.devicePixelRatio || 1)

  // Spawn near a random corner or near mouse
  const sx = Math.random() * (w - 100) + 50
  const sy = Math.random() * (h - 200) + 100
  spawnGhost(sx, sy)
  playSpawnSfx()
}

const handleCanvasClick = (e) => {
  if (!canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  const clickX = e.clientX - rect.left
  const clickY = e.clientY - rect.top

  spawnGhost(clickX, clickY)
  playSpawnSfx()

  // Spooky pulse
  shockwaves.push({
    x: clickX,
    y: clickY,
    radius: 10,
    maxRadius: 70,
    alpha: 0.8,
    color: '#a855f7'
  })
}

const handlePointerMove = (e) => {
  if (!canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  pointerX = e.clientX - rect.left
  pointerY = e.clientY - rect.top
}

// Physics & Logic Update
const updateState = (dt) => {
  if (!canvasRef.value) return
  const w = canvasRef.value.width / (window.devicePixelRatio || 1)
  const h = canvasRef.value.height / (window.devicePixelRatio || 1)

  // Audio analysis & reactive spectrum update
  const now = Date.now()
  const isMusicPlaying = playerState.value === 'playing'
  const isRealAudioActive = (now - lastAudioFrameTime < 250)

  if (isMusicPlaying && !isRealAudioActive) {
    // High-fidelity procedural studio rhythm simulation (~126 BPM)
    simBeatTimer += dt
    const beatPhase = (simBeatTimer % 476) / 476
    const barPhase = (simBeatTimer % 1904) / 1904

    // Dynamic kick impact on beats 1, 2, 3, 4
    const kickCurve = Math.max(0, 1 - (beatPhase * 4.2))
    const kick = Math.pow(kickCurve, 2.2)

    // Snare / clap on beats 2 and 4
    const isSnare = (barPhase >= 0.23 && barPhase <= 0.31) || (barPhase >= 0.73 && barPhase <= 0.81)
    const snare = isSnare ? Math.sin((beatPhase % 0.5) * Math.PI * 2) * 0.75 : 0

    // Hi-hat groove (16th notes)
    const hatPhase = (simBeatTimer % 119) / 119
    const hat = Math.max(0, 1 - hatPhase * 3.6) * 0.65

    // Sub-bass glide & harmony
    const bassGlide = 0.35 + Math.sin(barPhase * Math.PI * 4) * 0.25

    const targetBass = Math.min(1, kick * 0.85 + bassGlide * 0.38)
    const targetMid = Math.min(1, Math.max(0, snare) * 0.8 + (Math.sin(simBeatTimer * 0.008) * 0.15 + 0.3))
    const targetHigh = Math.min(1, hat * 0.75 + (Math.cos(simBeatTimer * 0.014) * 0.15 + 0.25))

    audioData.bass += (targetBass - audioData.bass) * 0.32
    audioData.mid += (targetMid - audioData.mid) * 0.32
    audioData.high += (targetHigh - audioData.high) * 0.32

    // Update 24 equalizer bars along brand border
    for (let b = 0; b < 24; b++) {
      let bandVal = 0
      if (b < 6) {
        bandVal = audioData.bass * (0.85 + Math.sin(b * 0.6 + simBeatTimer * 0.012) * 0.25)
      } else if (b < 16) {
        bandVal = audioData.mid * (0.75 + Math.sin(b * 1.1 + simBeatTimer * 0.016) * 0.3)
      } else {
        bandVal = audioData.high * (0.7 + Math.cos(b * 1.4 + simBeatTimer * 0.02) * 0.3)
      }
      eqBars.value[b] += (Math.max(0.06, bandVal) - eqBars.value[b]) * 0.34
    }
  } else if (!isMusicPlaying) {
    audioData.bass *= 0.88
    audioData.mid *= 0.88
    audioData.high *= 0.88
    for (let b = 0; b < 24; b++) {
      eqBars.value[b] += (0.05 - eqBars.value[b]) * 0.12
    }
  }

  // 1. HERO FLOATING MOTION & EMANATING FREQUENCY WAVES
  hero.floatTimer += dt

  // Speed of emanating frequency lines: picks up clear rhythmic momentum on beats while remaining smooth
  const musicSpeedBoost = isMusicPlaying 
    ? (1.15 + Math.pow(audioData.bass, 1.3) * 1.6 + audioData.mid * 0.6) 
    : 0.85
  const scareSpeedBoost = hero.isScared ? 1.4 : 1.0

  // Advance wavePhase in sync with music rhythm
  hero.wavePhase += (0.000045 * musicSpeedBoost * scareSpeedBoost) * dt

  // Natural organic drift path
  const driftX = Math.sin(hero.floatTimer * 0.0008) * (w * 0.28) + Math.sin(hero.floatTimer * 0.0021) * 40
  const driftY = Math.cos(hero.floatTimer * 0.0011) * (h * 0.22) + Math.cos(hero.floatTimer * 0.0033) * 30

  // Apply smooth movement to hero
  const centerX = w * 0.5
  const centerY = h * 0.46
  const targetX = centerX + driftX
  const targetY = centerY + driftY

  // Steering force towards floating anchor
  hero.vx += (targetX - hero.x) * 0.02
  hero.vy += (targetY - hero.y) * 0.02

  // Damping
  hero.vx *= 0.92
  hero.vy *= 0.92

  hero.x += hero.vx
  hero.y += hero.vy

  // Clamp within bounds
  const pad = 60
  if (hero.x < pad) { hero.x = pad; hero.vx = Math.abs(hero.vx) * 0.8 }
  if (hero.x > w - pad) { hero.x = w - pad; hero.vx = -Math.abs(hero.vx) * 0.8 }
  if (hero.y < pad + 50) { hero.y = pad + 50; hero.vy = Math.abs(hero.vy) * 0.8 }
  if (hero.y > h - pad - 60) { hero.y = h - pad - 60; hero.vy = -Math.abs(hero.vy) * 0.8 }

  // Banking / Tilt in movement direction
  hero.targetAngle = (hero.vx * 0.035)
  hero.angle += (hero.targetAngle - hero.angle) * 0.1

  // 2. EYE SCANNING & GHOST SEARCHING
  let closestGhost = null
  let minGhostDist = 999999

  for (let g of roamingGhosts) {
    const gx = g.x
    const gy = g.y
    const d = Math.hypot(gx - hero.x, gy - hero.y)
    if (d < minGhostDist) {
      minGhostDist = d
      closestGhost = g
    }
  }

  // Eye tracking behavior
  if (closestGhost && minGhostDist < 420) {
    // Lock eyes onto the detected ghost!
    const angleToGhost = Math.atan2(closestGhost.y - hero.y, closestGhost.x - hero.x)
    const eyeDist = Math.min(10, 3 + (400 - minGhostDist) * 0.02)
    hero.eyeTargetX = Math.cos(angleToGhost) * eyeDist
    hero.eyeTargetY = Math.sin(angleToGhost) * eyeDist
  } else {
    // Autonomous curious scanning (looking around left, right, up, down)
    hero.eyeScanTimer -= dt
    if (hero.eyeScanTimer <= 0) {
      hero.eyeScanTimer = 800 + Math.random() * 1400
      const scanAngles = [0, Math.PI * 0.25, Math.PI * 0.5, Math.PI * 0.75, Math.PI, Math.PI * 1.25, Math.PI * 1.5, Math.PI * 1.75]
      const pickAngle = scanAngles[Math.floor(Math.random() * scanAngles.length)]
      const mag = Math.random() > 0.3 ? (4 + Math.random() * 6) : 0
      hero.eyeTargetX = Math.cos(pickAngle) * mag
      hero.eyeTargetY = Math.sin(pickAngle) * mag
    }
  }

  // Smooth eye interpolation
  hero.eyeLookX += (hero.eyeTargetX - hero.eyeLookX) * 0.15
  hero.eyeLookY += (hero.eyeTargetY - hero.eyeLookY) * 0.15

  // 3. SCARE & RECOIL LOGIC
  if (hero.scareCooldown > 0) {
    hero.scareCooldown -= dt
  }

  // Check if any ghost is too close (Scare Trigger Radius ~ 160px)
  const SCARE_RADIUS = 160
  if (!hero.isScared && hero.scareCooldown <= 0 && closestGhost && minGhostDist < SCARE_RADIUS) {
    // TRIGGER SCARE!
    hero.isScared = true
    hero.scareTimer = 750
    hero.scareIntensity = 1.0
    hero.scareCooldown = 1800

    // Play startled sound FX
    playScaredSfx()

    // Recoil direction: directly away from the scary ghost
    const fleeAngle = Math.atan2(hero.y - closestGhost.y, hero.x - closestGhost.x)
    const fleeSpeed = 16 + Math.random() * 8
    hero.vx += Math.cos(fleeAngle) * fleeSpeed
    hero.vy += Math.sin(fleeAngle) * fleeSpeed

    // Emit purple startled shockwave
    shockwaves.push({
      x: hero.x,
      y: hero.y,
      radius: 20,
      maxRadius: 150,
      alpha: 1.0,
      color: '#c084fc'
    })

    // Emit panic sparks
    for (let i = 0; i < 14; i++) {
      const pAngle = Math.random() * Math.PI * 2
      const pSpeed = 3 + Math.random() * 6
      particles.push({
        x: hero.x,
        y: hero.y,
        vx: Math.cos(pAngle) * pSpeed,
        vy: Math.sin(pAngle) * pSpeed,
        alpha: 1.0,
        decay: 0.03 + Math.random() * 0.02,
        color: '#c084fc',
        size: 2 + Math.random() * 3
      })
    }
  }

  // Update ongoing scare state
  if (hero.isScared) {
    hero.scareTimer -= dt
    hero.scareIntensity = Math.max(0, hero.scareTimer / 750)

    // Jitter/shiver physics
    hero.jitterX = (Math.random() - 0.5) * 10 * hero.scareIntensity
    hero.jitterY = (Math.random() - 0.5) * 10 * hero.scareIntensity

    if (hero.scareTimer <= 0) {
      hero.isScared = false
      hero.jitterX = 0
      hero.jitterY = 0
    }
  }

  // 4. ROAMING GHOSTS UPDATE
  for (let i = roamingGhosts.length - 1; i >= 0; i--) {
    const g = roamingGhosts[i]
    g.age += dt

    // Fade in and out
    if (g.age < 60) {
      g.alpha = (g.age / 60) * g.maxAlpha
    } else if (g.age > g.lifespan - 80) {
      g.alpha = Math.max(0, ((g.lifespan - g.age) / 80) * g.maxAlpha)
    } else {
      g.alpha = g.maxAlpha
    }

    // Wavy sinusoidal drift
    g.wavePhase += g.waveSpeed
    const perpX = -g.vy
    const perpY = g.vx
    const perpNorm = Math.hypot(perpX, perpY) || 1
    const sway = Math.sin(g.wavePhase) * g.wobbleAmp * 0.04

    g.x += g.vx + (perpX / perpNorm) * sway
    g.y += g.vy + (perpY / perpNorm) * sway

    // Remove old or far out-of-bounds ghosts
    if (g.age >= g.lifespan || g.x < -140 || g.x > w + 140 || g.y < -140 || g.y > h + 140) {
      roamingGhosts.splice(i, 1)
    }
  }

  // Periodic auto-spawn if few ghosts on screen
  if (roamingGhosts.length < 4 && Math.random() < 0.015) {
    spawnGhost()
  }

  // 5. SHOCKWAVES & PARTICLES
  for (let i = shockwaves.length - 1; i >= 0; i--) {
    const sw = shockwaves[i]
    sw.radius += 4.5
    sw.alpha *= 0.94
    if (sw.radius >= sw.maxRadius || sw.alpha <= 0.02) {
      shockwaves.splice(i, 1)
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.x += p.vx
    p.y += p.vy
    p.vx *= 0.96
    p.vy *= 0.96
    p.alpha -= p.decay
    if (p.alpha <= 0) {
      particles.splice(i, 1)
    }
  }
}

// ==========================================
// DRAWING ROUTINES (CANVAS 2D)
// ==========================================

const drawGhostCharacter = (ctx, x, y, angle, isScared, scareIntensity) => {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.scale(0.5, 0.5)

  // Audio bounce squash & stretch
  const bassBounce = audioData.bass * 0.15
  let scaleX = 1 - bassBounce * 0.5
  let scaleY = 1 + bassBounce

  if (isScared) {
    // Startled cartoon vertical stretch
    scaleY *= 1 + scareIntensity * 0.22
    scaleX *= 1 - scareIntensity * 0.12
  }

  ctx.scale(scaleX, scaleY)

  // ----------------------------------------------------
  // 1. DRAW PURPLE FREQUENCY WAVES (AUDIO-REACTIVE INDIVIDUAL EMANATION)
  // ----------------------------------------------------
  // 3 distinct concentric arcs matching the Ghost Frequency logo
  const waveCount = 3
  const minR = 48
  const maxR = 126

  ctx.save()
  ctx.lineCap = 'round'

  for (let i = 0; i < waveCount; i++) {
    // Each wave emanates individually with staggered phase
    const norm = ((hero.wavePhase + (i / waveCount)) % 1 + 1) % 1

    // Audio-reactive expansion pulse on bass kick!
    const bassPulse = Math.pow(audioData.bass, 1.3) * 24
    const r = minR + norm * (maxR - minR) + bassPulse * (1 - norm * 0.4)

    // Smooth envelope: fades in smoothly as it radiates out, stays clear and crisp, fades into darkness
    let envelope = 1
    if (norm < 0.22) {
      envelope = norm / 0.22
    } else if (norm > 0.65) {
      envelope = Math.max(0, (1 - norm) / 0.35)
    }

    const alpha = Math.min(1, envelope * (0.8 + audioData.bass * 0.35 + (isScared ? 0.2 : 0)))
    if (alpha <= 0.02) continue

    // Thicker, energetic stroke on beats
    const lineWidth = (3.4 - norm * 1.4) * (1 + Math.pow(audioData.bass, 1.2) * 1.3)
    ctx.lineWidth = lineWidth

    // High energy: bright white-hot violet core on heavy kick/bass
    if (audioData.bass > 0.65) {
      ctx.strokeStyle = `rgba(243, 232, 255, ${alpha})`
      ctx.shadowColor = '#f3e8ff'
      ctx.shadowBlur = (12 + audioData.bass * 28) * envelope
    } else {
      ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`
      ctx.shadowColor = '#a855f7'
      ctx.shadowBlur = (8 + audioData.bass * 20) * envelope
    }

    // Draw reactive frequency arcs with harmonic audio soundwave ripple
    const drawFrequencyArc = (centerX, startAngle, endAngle) => {
      ctx.beginPath()
      const steps = 24
      for (let s = 0; s <= steps; s++) {
        const t = s / steps
        const a = startAngle + t * (endAngle - startAngle)

        // Harmonic frequency soundwave ripple (vibrates with mid and high frequencies)
        const rippleFreq = 10 + i * 4
        const rippleAmp = (audioData.mid * 5.0 + audioData.high * 3.5) * Math.sin(t * Math.PI) * envelope
        const wiggle = Math.sin(a * rippleFreq + hero.floatTimer * 0.018) * rippleAmp
        const curR = r + wiggle

        const px = centerX + Math.cos(a) * curR
        const py = Math.sin(a) * curR
        if (s === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.stroke()
    }

    // Left concentric frequency wave arc
    drawFrequencyArc(-8, Math.PI * 0.68, Math.PI * 1.32)

    // Right concentric frequency wave arc
    drawFrequencyArc(8, -Math.PI * 0.32, Math.PI * 0.32)
  }
  ctx.restore()

  // ----------------------------------------------------
  // 2. DRAW MAIN WHITE GHOST BODY
  // ----------------------------------------------------
  const gw = 68 // half width ~ 34
  const gh = 80 // total height
  const topY = -gh * 0.5
  const botY = gh * 0.5
  const halfW = gw * 0.5

  ctx.save()
  // Subtle glowing halo around ghost
  ctx.shadowColor = 'rgba(192, 132, 252, 0.45)'
  ctx.shadowBlur = 24 + audioData.bass * 20
  ctx.fillStyle = '#f8f6ed' // Creamy ivory white from official logo

  ctx.beginPath()
  // Top rounded dome (half circle)
  ctx.arc(0, topY + halfW, halfW, Math.PI, 0, false)

  // Right vertical edge
  ctx.lineTo(halfW, botY - 14)

  // Bottom 3 rounded scallop waves (Left, Center, Right)
  // Right scallop
  ctx.arc(halfW - (gw / 6), botY - 14, gw / 6, 0, Math.PI, false)
  // Middle scallop
  ctx.arc(0, botY - 14, gw / 6, 0, Math.PI, false)
  // Left scallop
  ctx.arc(-halfW + (gw / 6), botY - 14, gw / 6, 0, Math.PI, false)

  // Left vertical edge
  ctx.lineTo(-halfW, topY + halfW)

  ctx.closePath()
  ctx.fill()
  ctx.restore()

  // ----------------------------------------------------
  // 3. DRAW EYES (DYNAMIC SCANNING / WIDE SCARE)
  // ----------------------------------------------------
  const eyeCenterY = topY + halfW + 4
  const eyeSpacing = 13.5
  const eyeBaseW = 12
  const eyeBaseH = 17

  // If scared: eyes pop wide and pupils shrink in fear!
  let curEyeW = isScared ? eyeBaseW * 1.35 : eyeBaseW
  let curEyeH = isScared ? eyeBaseH * 1.35 : eyeBaseH

  const leftEyeX = -eyeSpacing
  const rightEyeX = eyeSpacing

  // Helper to draw a rounded pill/rect eye socket
  const drawEyeSocket = (ex, ey, ew, eh) => {
    ctx.save()
    ctx.fillStyle = '#111216' // Dark charcoal eye socket from logo
    ctx.beginPath()
    const r = ew * 0.5
    ctx.roundRect(ex - ew * 0.5, ey - eh * 0.5, ew, eh, r)
    ctx.fill()
    ctx.restore()
  }

  // Draw two dark eye sockets
  drawEyeSocket(leftEyeX, eyeCenterY, curEyeW, curEyeH)
  drawEyeSocket(rightEyeX, eyeCenterY, curEyeW, curEyeH)

  // Eye highlights / pupils looking around
  const lookX = hero.eyeLookX
  const lookY = hero.eyeLookY

  if (isScared) {
    // Shocked tiny pupils inside wide sockets
    ctx.save()
    ctx.fillStyle = '#ffffff'
    const pupilR = 2.2
    ctx.beginPath()
    ctx.arc(leftEyeX + (Math.random() - 0.5) * 2, eyeCenterY + (Math.random() - 0.5) * 2, pupilR, 0, Math.PI * 2)
    ctx.arc(rightEyeX + (Math.random() - 0.5) * 2, eyeCenterY + (Math.random() - 0.5) * 2, pupilR, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    // Cute startled sweat drop when scared
    ctx.save()
    ctx.fillStyle = '#a855f7'
    ctx.beginPath()
    ctx.arc(halfW + 6, topY + 12, 3.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  } else {
    // Subtle, stylish specular reflection in eyes that tracks direction
    ctx.save()
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'
    const specOffset = 2.5
    ctx.beginPath()
    ctx.arc(leftEyeX + lookX * 0.3 - specOffset, eyeCenterY + lookY * 0.3 - specOffset, 2.2, 0, Math.PI * 2)
    ctx.arc(rightEyeX + lookX * 0.3 - specOffset, eyeCenterY + lookY * 0.3 - specOffset, 2.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  // ----------------------------------------------------
  // 4. SCARE MOUTH (APPEARS ONLY WHEN STARTLED)
  // ----------------------------------------------------
  if (isScared && scareIntensity > 0.2) {
    ctx.save()
    ctx.fillStyle = '#111216'
    ctx.beginPath()
    // Cute open shocked gasp 'o'
    ctx.ellipse(0, eyeCenterY + 18, 6 * scareIntensity, 8 * scareIntensity, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }

  ctx.restore()
}

// Draw a translucent roaming ghost
const drawRoamingGhost = (ctx, g) => {
  ctx.save()
  ctx.translate(g.x, g.y)
  ctx.globalAlpha = g.alpha

  const r = g.size * 0.5
  const h = g.size * 1.25

  ctx.shadowColor = g.glow
  ctx.shadowBlur = 18
  ctx.fillStyle = g.color

  // Flowing ethereal ghost body
  ctx.beginPath()
  ctx.arc(0, -h * 0.4, r, Math.PI, 0, false)
  ctx.lineTo(r, h * 0.4)

  // Wavy bottom tails
  const wave = Math.sin(g.wavePhase * 3) * 4
  ctx.quadraticCurveTo(r * 0.5, h * 0.6 + wave, 0, h * 0.35)
  ctx.quadraticCurveTo(-r * 0.5, h * 0.6 - wave, -r, h * 0.4)
  ctx.lineTo(-r, -h * 0.4)

  ctx.closePath()
  ctx.fill()

  // Cute minimal ghost faces
  ctx.fillStyle = '#ffffff'
  ctx.shadowBlur = 0

  if (g.face === 'playful') {
    // Winking / playful face ^_-
    ctx.beginPath()
    ctx.arc(-r * 0.35, -h * 0.38, 2.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(r * 0.35, -h * 0.38, 2.5, Math.PI, 0)
    ctx.stroke()
  } else if (g.face === 'derp') {
    // Goofy derp eyes
    ctx.beginPath()
    ctx.arc(-r * 0.35, -h * 0.4, 2.5, 0, Math.PI * 2)
    ctx.arc(r * 0.35, -h * 0.36, 1.8, 0, Math.PI * 2)
    ctx.fill()
  } else {
    // Classic cute twin dots
    ctx.beginPath()
    ctx.arc(-r * 0.35, -h * 0.38, 2, 0, Math.PI * 2)
    ctx.arc(r * 0.35, -h * 0.38, 2, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

// ==========================================
// PROCEDURAL DARK FOREST ENGINE (ORI / LIMBO STYLE)
// 100% Procedural Canvas 2D, Pure gloomy black/charcoal silhouettes
// ==========================================

const forestLayers = {
  w: 0,
  h: 0,
  farCanvas: null,
  midCanvas: null,
  foreCanvas: null,
  spores: [],
  fogBands: [],
  initialized: false
}

// Generate the procedural dark forest layers on offscreen canvases for silky 60fps performance
const initProceduralForest = (w, h) => {
  if (w <= 0 || h <= 0) return
  forestLayers.w = w
  forestLayers.h = h

  const farW = Math.ceil(w + 160)
  const farH = Math.ceil(h + 100)
  const midW = Math.ceil(w + 240)
  const midH = Math.ceil(h + 140)
  const foreW = Math.ceil(w + 320)
  const foreH = Math.ceil(h + 180)

  // 1. FAR LAYER: Distant mountain ridges & misty pine tree silhouettes (#080611, #0d0b1a)
  const farCanvas = document.createElement('canvas')
  farCanvas.width = farW
  farCanvas.height = farH
  const fCtx = farCanvas.getContext('2d')

  if (fCtx) {
    // Distant mountain ridge 1
    fCtx.fillStyle = '#080611'
    fCtx.beginPath()
    fCtx.moveTo(0, farH)
    fCtx.lineTo(0, farH * 0.55)
    for (let x = 0; x <= farW; x += 40) {
      const y = farH * 0.55 + Math.sin(x * 0.005) * 45 + Math.sin(x * 0.014) * 20
      fCtx.lineTo(x, y)
    }
    fCtx.lineTo(farW, farH)
    fCtx.closePath()
    fCtx.fill()

    // Distant mountain ridge 2 (closer)
    fCtx.fillStyle = '#0a0815'
    fCtx.beginPath()
    fCtx.moveTo(0, farH)
    fCtx.lineTo(0, farH * 0.68)
    for (let x = 0; x <= farW; x += 30) {
      const y = farH * 0.68 + Math.cos(x * 0.007) * 35 + Math.sin(x * 0.02) * 15
      fCtx.lineTo(x, y)
    }
    fCtx.lineTo(farW, farH)
    fCtx.closePath()
    fCtx.fill()

    // Distant misty pine silhouettes
    fCtx.fillStyle = '#0d0b1a'
    const pineCount = Math.floor(farW / 24)
    for (let i = 0; i < pineCount; i++) {
      const px = i * 24 + (Math.sin(i * 99) * 8)
      const baseGroundY = farH * 0.72 + Math.cos(px * 0.007) * 30
      const treeH = 45 + Math.abs(Math.sin(i * 13)) * 65
      const treeW = 14 + Math.abs(Math.cos(i * 7)) * 10

      // Tiered pine silhouette
      fCtx.beginPath()
      fCtx.moveTo(px, baseGroundY - treeH)
      fCtx.lineTo(px + treeW * 0.5, baseGroundY)
      fCtx.lineTo(px - treeW * 0.5, baseGroundY)
      fCtx.closePath()
      fCtx.fill()
    }
  }
  forestLayers.farCanvas = farCanvas

  // 2. MID LAYER: Gnarled ancient trees, sprawling branches, hanging moss & foliage clumps (#05040b, #07060f)
  const midCanvas = document.createElement('canvas')
  midCanvas.width = midW
  midCanvas.height = midH
  const mCtx = midCanvas.getContext('2d')

  if (mCtx) {
    // Mid-ground organic hill slope
    mCtx.fillStyle = '#05040a'
    mCtx.beginPath()
    mCtx.moveTo(0, midH)
    mCtx.lineTo(0, midH * 0.82)
    for (let x = 0; x <= midW; x += 50) {
      const y = midH * 0.82 + Math.sin(x * 0.008) * 25 + Math.cos(x * 0.016) * 15
      mCtx.lineTo(x, y)
    }
    mCtx.lineTo(midW, midH)
    mCtx.closePath()
    mCtx.fill()

    // Recursive gnarled branch generator
    const drawGnarledBranch = (ctx, startX, startY, len, angle, width, depth) => {
      if (depth > 4 || len < 6) return
      const endX = startX + Math.cos(angle) * len
      const endY = startY + Math.sin(angle) * len
      const curveX = (startX + endX) * 0.5 + (Math.sin(depth * 3.7 + startX) * len * 0.22)
      const curveY = (startY + endY) * 0.5 + (Math.cos(depth * 2.3 + startY) * len * 0.22)

      ctx.lineWidth = width
      ctx.beginPath()
      ctx.moveTo(startX, startY)
      ctx.quadraticCurveTo(curveX, curveY, endX, endY)
      ctx.stroke()

      // Dark foliage cluster at branch tips
      if (depth >= 3) {
        ctx.save()
        ctx.fillStyle = depth === 4 ? '#080612' : '#05040b'
        ctx.beginPath()
        ctx.arc(endX, endY, len * 0.65, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // Hanging moss tendrils
      if (depth === 2 || depth === 3) {
        ctx.save()
        ctx.strokeStyle = 'rgba(7, 5, 14, 0.75)'
        ctx.lineWidth = 1.2
        const mossLen = 22 + Math.abs(Math.sin(startX + depth)) * 25
        ctx.beginPath()
        ctx.moveTo(curveX, curveY)
        ctx.quadraticCurveTo(curveX + 4, curveY + mossLen * 0.5, curveX - 2, curveY + mossLen)
        ctx.stroke()
        ctx.restore()
      }

      const spread = 0.52
      drawGnarledBranch(ctx, endX, endY, len * 0.72, angle - spread, Math.max(1.2, width * 0.62), depth + 1)
      drawGnarledBranch(ctx, endX, endY, len * 0.68, angle + spread * 0.88, Math.max(1.2, width * 0.62), depth + 1)
    }

    // 5-7 Ancient twisted gnarled trees
    const treeCount = Math.max(5, Math.floor(midW / 180))
    mCtx.strokeStyle = '#05040b'
    mCtx.fillStyle = '#05040b'
    mCtx.lineCap = 'round'
    mCtx.lineJoin = 'round'

    for (let i = 0; i < treeCount; i++) {
      const baseX = (i + 0.5) * (midW / treeCount) + (Math.sin(i * 47) * 40)
      const baseY = midH * 0.85 + (Math.cos(i * 31) * 20)
      const scale = 0.75 + Math.abs(Math.sin(i * 19)) * 0.5
      const trunkH = 130 * scale
      const trunkW = 20 * scale

      // Massive flaring roots into earth
      mCtx.beginPath()
      mCtx.moveTo(baseX - trunkW * 1.8, baseY)
      mCtx.quadraticCurveTo(baseX - trunkW * 0.8, baseY - trunkH * 0.25, baseX - trunkW * 0.5, baseY - trunkH * 0.6)
      mCtx.quadraticCurveTo(baseX - trunkW * 0.2, baseY - trunkH * 0.85, baseX - trunkW * 0.3, baseY - trunkH)
      mCtx.lineTo(baseX + trunkW * 0.3, baseY - trunkH)
      mCtx.quadraticCurveTo(baseX + trunkW * 0.2, baseY - trunkH * 0.85, baseX + trunkW * 0.5, baseY - trunkH * 0.6)
      mCtx.quadraticCurveTo(baseX + trunkW * 0.8, baseY - trunkH * 0.25, baseX + trunkW * 1.8, baseY)
      mCtx.closePath()
      mCtx.fill()

      // Primary boughs branching across the sky
      drawGnarledBranch(mCtx, baseX - trunkW * 0.2, baseY - trunkH, 70 * scale, -Math.PI * 0.62, trunkW * 0.52, 1)
      drawGnarledBranch(mCtx, baseX + trunkW * 0.2, baseY - trunkH, 75 * scale, -Math.PI * 0.38, trunkW * 0.52, 1)
      drawGnarledBranch(mCtx, baseX, baseY - trunkH * 0.85, 55 * scale, -Math.PI * 0.5, trunkW * 0.42, 2)
    }
  }
  forestLayers.midCanvas = midCanvas

  // 3. FOREGROUND LAYER: Pitch-black roots, gnarls, and cinematic corner framing (#020104)
  const foreCanvas = document.createElement('canvas')
  foreCanvas.width = foreW
  foreCanvas.height = foreH
  const fgCtx = foreCanvas.getContext('2d')

  if (fgCtx) {
    fgCtx.fillStyle = '#020104'
    fgCtx.strokeStyle = '#020104'
    fgCtx.lineCap = 'round'

    // Foreground bottom ground terrain
    fgCtx.beginPath()
    fgCtx.moveTo(0, foreH)
    fgCtx.lineTo(0, foreH * 0.9)
    for (let x = 0; x <= foreW; x += 35) {
      const y = foreH * 0.9 + Math.sin(x * 0.015) * 16 + Math.cos(x * 0.035) * 10
      fgCtx.lineTo(x, y)
    }
    fgCtx.lineTo(foreW, foreH)
    fgCtx.closePath()
    fgCtx.fill()

    // Protruding twisted roots along the ground
    for (let x = 40; x < foreW - 40; x += 110) {
      const rootBaseY = foreH * 0.9 + Math.sin(x * 0.015) * 16
      fgCtx.lineWidth = 6
      fgCtx.beginPath()
      fgCtx.moveTo(x, rootBaseY + 10)
      fgCtx.quadraticCurveTo(x + 15, rootBaseY - 25, x + 35, rootBaseY - 8)
      fgCtx.stroke()
    }

    // Top framing gnarled branches dipping into view (Ori/Little Nightmares frame)
    const drawCornerBranch = (startX, startY, endX, endY, baseWidth) => {
      fgCtx.save()
      fgCtx.lineWidth = baseWidth
      const midX = (startX + endX) * 0.5 + 40
      const midY = (startY + endY) * 0.5 - 20
      fgCtx.beginPath()
      fgCtx.moveTo(startX, startY)
      fgCtx.quadraticCurveTo(midX, midY, endX, endY)
      fgCtx.stroke()

      // Twigs & hanging vines
      for (let i = 1; i <= 5; i++) {
        const t = i / 6
        const bx = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * midX + t * t * endX
        const by = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * midY + t * t * endY
        
        fgCtx.lineWidth = baseWidth * 0.38
        fgCtx.beginPath()
        fgCtx.moveTo(bx, by)
        const tx = bx + (i % 2 === 0 ? 30 : -20)
        const ty = by + 35 + i * 8
        fgCtx.quadraticCurveTo(bx + 8, by + 20, tx, ty)
        fgCtx.stroke()

        // Hanging moss strand
        fgCtx.strokeStyle = 'rgba(3, 2, 6, 0.75)'
        fgCtx.lineWidth = 1.5
        fgCtx.beginPath()
        fgCtx.moveTo(bx, by)
        fgCtx.quadraticCurveTo(bx - 3, by + 25, bx + 2, by + 50)
        fgCtx.stroke()
        fgCtx.strokeStyle = '#020104'
      }
      fgCtx.restore()
    }

    // Top-left overhanging canopy branch
    drawCornerBranch(-20, -20, foreW * 0.35, foreH * 0.22, 18)
    // Top-right overhanging branch
    drawCornerBranch(foreW + 20, -10, foreW * 0.68, foreH * 0.24, 16)
  }
  forestLayers.foreCanvas = foreCanvas

  // 4. FLOATING SPORES & ETHEREAL DUST PARTICLES (Ori-style)
  forestLayers.spores = []
  const sporeCount = 42
  for (let i = 0; i < sporeCount; i++) {
    forestLayers.spores.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vy: -(0.25 + Math.random() * 0.45),
      swayPhase: Math.random() * Math.PI * 2,
      swaySpeed: 0.015 + Math.random() * 0.02,
      swayAmp: 0.5 + Math.random() * 0.6,
      size: 1 + Math.random() * 2.2,
      alpha: 0.18 + Math.random() * 0.32,
      color: Math.random() > 0.4 ? 'rgba(192, 132, 252, ' : 'rgba(216, 180, 254, '
    })
  }

  // 5. HORIZONTAL DRIFTING FOG BANDS
  forestLayers.fogBands = [
    { y: h * 0.42, speed: 0.035, offset: 0, height: 130, alpha: 0.2 },
    { y: h * 0.64, speed: 0.048, offset: 50, height: 160, alpha: 0.18 },
    { y: h * 0.84, speed: 0.026, offset: 120, height: 140, alpha: 0.26 }
  ]

  forestLayers.initialized = true
}

// Draw a smooth procedural fog band across the canvas
const drawFogBand = (ctx, band, w, h, dt, parallaxX) => {
  if (!band) return
  band.offset += band.speed * dt
  const y = band.y
  const grad = ctx.createLinearGradient(0, y - band.height * 0.5, 0, y + band.height * 0.5)
  grad.addColorStop(0, 'rgba(10, 8, 16, 0)')
  grad.addColorStop(0.5, `rgba(20, 16, 32, ${band.alpha})`)
  grad.addColorStop(1, 'rgba(10, 8, 16, 0)')

  ctx.save()
  ctx.fillStyle = grad
  ctx.beginPath()
  const step = 60
  const points = Math.ceil(w / step) + 2
  ctx.moveTo(0, y + band.height * 0.5)

  for (let i = 0; i <= points; i++) {
    const x = i * step
    const wave = Math.sin((x + band.offset + parallaxX) * 0.004) * 22 + Math.cos((x * 0.5 + band.offset) * 0.007) * 14
    ctx.lineTo(x, y - band.height * 0.5 + wave)
  }
  ctx.lineTo(w, y + band.height * 0.5)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

// Update and draw floating ambient spores (Ori / Little Nightmares floating particles)
const updateAndDrawSpores = (ctx, w, h, dt, parallaxX) => {
  ctx.save()
  const timeScale = dt / 16.6
  for (let s of forestLayers.spores) {
    s.y += s.vy * timeScale
    s.swayPhase += s.swaySpeed * timeScale
    const curX = s.x + Math.sin(s.swayPhase) * s.swayAmp * 16 + parallaxX

    if (s.y < -20) {
      s.y = h + 20
      s.x = Math.random() * w
    }

    ctx.fillStyle = s.color + `${s.alpha})`
    ctx.beginPath()
    ctx.arc(curX, s.y, s.size, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

// Master Procedural Dark Forest Renderer
const drawProceduralDarkForest = (ctx, w, h, dt) => {
  if (!forestLayers.initialized || forestLayers.w !== w || forestLayers.h !== h) {
    initProceduralForest(w, h)
  }

  // 1. Base Sky Gradient: deep gloomy black/charcoal obsidian
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h)
  skyGrad.addColorStop(0, '#020104')
  skyGrad.addColorStop(0.5, '#06040c')
  skyGrad.addColorStop(0.85, '#0b0817')
  skyGrad.addColorStop(1, '#030206')
  ctx.fillStyle = skyGrad
  ctx.fillRect(0, 0, w, h)

  // Character-relative camera parallax offsets
  const camX = (w * 0.5 - hero.x)
  const camY = (h * 0.5 - hero.y)

  // 2. Far Layer (Pines & Distant Mountains) - Slowest parallax
  if (forestLayers.farCanvas) {
    const farX = -80 + camX * 0.018
    const farY = -50 + camY * 0.015
    ctx.drawImage(forestLayers.farCanvas, farX, farY)
  }

  // 3. Far Fog Band (Ethereal drifting mist)
  if (forestLayers.fogBands[0]) {
    drawFogBand(ctx, forestLayers.fogBands[0], w, h, dt, camX * 0.025)
  }

  // 4. Mid Layer (Ancient Gnarled Trees & Hanging Moss) - Mid parallax
  if (forestLayers.midCanvas) {
    const midX = -120 + camX * 0.045
    const midY = -70 + camY * 0.035
    ctx.drawImage(forestLayers.midCanvas, midX, midY)
  }

  // 5. Mid Fog Band
  if (forestLayers.fogBands[1]) {
    drawFogBand(ctx, forestLayers.fogBands[1], w, h, dt, camX * 0.05)
  }

  // 6. Floating Forest Spores (Ori-style ambient particles)
  updateAndDrawSpores(ctx, w, h, dt, camX * 0.06)

  // 7. Foreground Layer (Framing Gnarled Branches & Root Floor) - Strongest parallax
  if (forestLayers.foreCanvas) {
    const foreX = -160 + camX * 0.08
    const foreY = -90 + camY * 0.06
    ctx.drawImage(forestLayers.foreCanvas, foreX, foreY)
  }

  // 8. Low Ground Mist
  if (forestLayers.fogBands[2]) {
    drawFogBand(ctx, forestLayers.fogBands[2], w, h, dt, camX * 0.07)
  }

  // 9. Ghost Character Illumination (Lantern Aura)
  // The glowing ghost gently reveals the dark woods directly around it
  const ghostGlow = ctx.createRadialGradient(hero.x, hero.y, 25, hero.x, hero.y, 340)
  ghostGlow.addColorStop(0, 'rgba(192, 132, 252, 0.14)')
  ghostGlow.addColorStop(0.35, 'rgba(147, 51, 234, 0.06)')
  ghostGlow.addColorStop(0.7, 'rgba(88, 28, 135, 0.02)')
  ghostGlow.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = ghostGlow
  ctx.fillRect(0, 0, w, h)

  // 10. Cinematic Vignette (Deep dark edges)
  const vignette = ctx.createRadialGradient(w * 0.5, h * 0.5, Math.min(w, h) * 0.38, w * 0.5, h * 0.5, Math.max(w, h) * 0.88)
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)')
  vignette.addColorStop(0.7, 'rgba(3, 2, 6, 0.45)')
  vignette.addColorStop(1, 'rgba(2, 1, 4, 0.92)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, w, h)
}

// Master Render Loop
const render = (timestamp) => {
  if (!lastTime) lastTime = timestamp
  const dt = Math.min(50, timestamp - lastTime)
  lastTime = timestamp

  if (canvasRef.value) {
    const canvas = canvasRef.value
    const ctx = canvas.getContext('2d')

    if (ctx) {
      const w = canvas.width / (window.devicePixelRatio || 1)
      const h = canvas.height / (window.devicePixelRatio || 1)

      // 1. Draw 100% Procedural Dark Forest Background
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drawProceduralDarkForest(ctx, w, h, dt)

      // 2. Physics & State update
      updateState(dt)

      // 3. Render Shockwaves
      shockwaves.forEach(sw => {
        ctx.save()
        ctx.strokeStyle = sw.color
        ctx.globalAlpha = sw.alpha
        ctx.lineWidth = 2
        ctx.shadowColor = sw.color
        ctx.shadowBlur = 12
        ctx.beginPath()
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()
      })

      // 4. Render Particles
      particles.forEach(p => {
        ctx.save()
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha
        ctx.shadowColor = p.color
        ctx.shadowBlur = 8
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      // 5. Render Translucent Wandering Ghosts
      roamingGhosts.forEach(g => {
        drawRoamingGhost(ctx, g)
      })

      // 6. Render Main Ghost Frequency Character
      const renderX = hero.x + hero.jitterX
      const renderY = hero.y + hero.jitterY
      drawGhostCharacter(ctx, renderX, renderY, hero.angle, hero.isScared, hero.scareIntensity)
    }
  }

  animationId = requestAnimationFrame(render)
}

// Window resize handler
const handleResize = () => {
  if (!canvasRef.value || !containerRef.value) return
  const dpr = window.devicePixelRatio || 1
  const w = containerRef.value.clientWidth
  const h = containerRef.value.clientHeight

  canvasRef.value.width = w * dpr
  canvasRef.value.height = h * dpr

  const ctx = canvasRef.value.getContext('2d')
  if (ctx) {
    ctx.scale(dpr, dpr)
  }

  if (hero.x === 0 && hero.y === 0) {
    hero.x = w * 0.5
    hero.y = h * 0.46
  }

  // Re-generate procedural forest layers for current viewport
  initProceduralForest(w, h)
}

// Lifecycle Hooks
onMounted(() => {
  if (typeof playerSdk.setUiConfig === 'function') {
    playerSdk.setUiConfig({
      carousel: false,
      interactive: true,
      trackInfo: false,
      progressBar: false,
      controls: { like: false, dislike: false, playPause: false, next: false, prev: false },
      actions: { repeat: false, playlist: false },
      minimize: false
    })
  }

  handleResize()
  window.addEventListener('resize', handleResize)

  // Seed 3 initial roaming ghosts
  for (let i = 0; i < 3; i++) {
    spawnGhost()
  }

  animationId = requestAnimationFrame(render)

  // SDK Listeners
  const onInit = (state) => {
    if (state?.theme) theme.value = state.theme
    if (state?.panes?.default?.state) playerState.value = state.panes.default.state
    if (state?.panes?.default?.reaction) reaction.value = state.panes.default.reaction
    if (state?.panes?.default?.nextDisabled !== undefined) nextDisabled.value = !!state.panes.default.nextDisabled
    if (state?.panes?.default?.prevDisabled !== undefined) prevDisabled.value = !!state.panes.default.prevDisabled

    if (state?.styles) {
        const root = document.documentElement;

        Object.entries(state.styles).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                root.style.setProperty(key, value);
            }
        });
    }
  }

  const onState = (payload) => {
    if (payload?.state) playerState.value = payload.state
  }

  const onReaction = (payload) => {
    if (payload?.reaction !== undefined) reaction.value = payload.reaction
  }

  const onChange = ({ pane, type, payload }) => {
    if (pane !== 'default') return
    if (type === 'prevDisabled') prevDisabled.value = payload?.value
    if (type === 'nextDisabled') nextDisabled.value = payload?.value
  }

  const onAudioFrame = (dataArray) => {
    if (!dataArray || !dataArray.length) return
    lastAudioFrameTime = Date.now()

    const len = dataArray.length
    let bSum = 0, mSum = 0, hSum = 0
    const bEnd = Math.floor(len * 0.15) || 1
    const mEnd = Math.floor(len * 0.6) || 2

    for (let i = 0; i < len; i++) {
      const val = dataArray[i] || 0
      if (i < bEnd) bSum += val
      else if (i < mEnd) mSum += val
      else hSum += val
    }

    const tb = (bSum / bEnd) / 255
    const tm = (mSum / (mEnd - bEnd)) / 255
    const th = (hSum / (len - mEnd)) / 255

    audioData.bass += (tb - audioData.bass) * 0.35
    audioData.mid += (tm - audioData.mid) * 0.35
    audioData.high += (th - audioData.high) * 0.35

    // 24 Equalizer spectrum bins along the brand border
    const binCount = 24
    const blockSize = Math.floor(len / binCount) || 1
    for (let b = 0; b < binCount; b++) {
      let sum = 0
      const start = b * blockSize
      const end = Math.min(len, start + blockSize)
      for (let j = start; j < end; j++) {
        sum += dataArray[j] || 0
      }
      const rawVal = (sum / (end - start)) / 255
      const boostVal = Math.pow(rawVal, 1.15)
      eqBars.value[b] += (boostVal - eqBars.value[b]) * 0.4
    }

    // Beat drop threshold: spawn cute ghost on heavy transients
    if (tb > 0.85 && Math.random() < 0.08 && roamingGhosts.length < 5) {
      spawnGhost()
    }
  }

  playerSdk.on('init', onInit)
  playerSdk.on('state', onState)
  playerSdk.on('state', onState, 'default')
  playerSdk.on('reaction', onReaction)
  playerSdk.on('change', onChange)
  playerSdk.on('audioFrame', onAudioFrame)
  playerSdk.on('audioFrame', onAudioFrame, 'default')

  onBeforeUnmount(() => {
    if (animationId) cancelAnimationFrame(animationId)
    window.removeEventListener('resize', handleResize)

    playerSdk.off('init', onInit)
    playerSdk.off('state', onState)
    playerSdk.off('state', onState, 'default')
    playerSdk.off('reaction', onReaction)
    playerSdk.off('change', onChange)
    playerSdk.off('audioFrame', onAudioFrame)
    playerSdk.off('audioFrame', onAudioFrame, 'default')

    if (audioCtx) {
      audioCtx.close().catch(() => {})
    }
  })
})

const togglePlay = () => {
  if (playerState.value === 'playing') {
    playerState.value = 'paused'
    playerSdk.pause()
  } else {
    playerState.value = 'playing'
    playerSdk.play()
  }
}

const handleLike = () => {
  playerSdk.reaction(reaction.value === 'LIKE' ? '' : 'LIKE')
}

const openPlaylist = () => {
  if (typeof playerSdk.openPlaylist === 'function') {
    playerSdk.openPlaylist()
  }
}
</script>

<style scoped>
* {
    -webkit-tap-highlight-color: transparent !important;
    -webkit-touch-callout: none !important;
    user-select: none !important;
}


.gf-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1;
  overflow: hidden;
  background-color: #020104;
  display: flex;
  flex-direction: column;
  user-select: none;
  -webkit-user-select: none;
}

/* TOP MINIMALIST HEADER */
.gf-header {
  position: absolute;
  top: 68px;
  left: 0;
  right: 0;
  width: 100%;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 50;
  box-sizing: border-box;
  pointer-events: none;
}

.gf-header button,
.gf-header a {
  pointer-events: auto;
}

/* BRAND TITLE LINK: STRICTLY THE ONLY TEXT ALLOWED WITH THEMATIC BORDER EQUALIZER */
.gf-brand-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  cursor: pointer;
  padding: 8px 22px;
  border-radius: 24px;
  background: rgba(14, 11, 24, 0.75);
  border: 1px solid rgba(168, 85, 247, 0.35);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.6);
  margin: auto;
}

.gf-brand-glow-border {
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  border-radius: 24px;
  border: 1px solid rgba(192, 132, 252, 0.6);
  pointer-events: none;
  transition: opacity 0.1s ease, box-shadow 0.1s ease;
}

/* THEMATIC EQUALIZER BARS ALONG TOP & BOTTOM BORDERS */
.gf-eq-container {
  position: absolute;
  left: 20px;
  right: 20px;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
  z-index: 2;
}

.gf-eq-top {
  bottom: 100%;
  margin-bottom: 2px;
  height: 24px;
  align-items: flex-end;
}

.gf-eq-bottom {
  top: 100%;
  margin-top: 2px;
  height: 24px;
  align-items: flex-start;
}

.gf-eq-bar {
  width: 3px;
  min-height: 2px;
  border-radius: 2px;
  transition: height 0.06s ease, opacity 0.06s ease, background 0.08s ease;
  will-change: height;
}

.gf-eq-top .gf-eq-bar {
  transform-origin: bottom center;
}

.gf-eq-bottom .gf-eq-bar {
  transform-origin: top center;
}

.gf-brand-link:hover {
  background: rgba(168, 85, 247, 0.22);
  border-color: #c084fc;
  box-shadow: 0 0 24px rgba(168, 85, 247, 0.4);
  transform: translateY(-1px) scale(1.02);
}

.gf-brand-text {
  font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 5px;
  color: #f8f6ed;
  text-transform: uppercase;
  text-shadow: 0 0 12px rgba(168, 85, 247, 0.6), 0 0 24px rgba(168, 85, 247, 0.3);
  z-index: 3;
}

/* PROMINENT TOP TELEGRAM BUTTON */
.gf-top-tg-btn {
  position: relative;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(28, 22, 46, 0.85) 0%, rgba(12, 10, 20, 0.95) 100%);
  border: 1.5px solid rgba(168, 85, 247, 0.4);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  color: #38bdf8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.12);
  text-decoration: none;
}

.gf-top-tg-btn:hover {
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(168, 85, 247, 0.35) 100%);
  border-color: #38bdf8;
  color: #ffffff;
  transform: translateY(-2px) scale(1.1);
  box-shadow: 0 8px 28px rgba(56, 189, 248, 0.45);
}

.tg-glow-pulse {
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border-radius: 50%;
  border: 1.5px solid rgba(56, 189, 248, 0.35);
  pointer-events: none;
  animation: tg-pulse-anim 2.5s infinite;
}

@keyframes tg-pulse-anim {
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.25); opacity: 0.2; }
  100% { transform: scale(1.45); opacity: 0; }
}

.tg-icon-svg {
  width: 20px;
  height: 20px;
  transition: transform 0.2s ease;
}

.gf-top-tg-btn:hover .tg-icon-svg {
  transform: translate(1px, -1px) scale(1.08);
}

/* ICON BUTTONS */
.gf-icon-btn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(22, 17, 34, 0.65);
  border: 1px solid rgba(168, 85, 247, 0.25);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  color: #e9d5ff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
  text-decoration: none;
}

.gf-icon-btn:hover {
  background: rgba(168, 85, 247, 0.22);
  border-color: #a855f7;
  color: #ffffff;
  transform: translateY(-1px) scale(1.06);
  box-shadow: 0 6px 24px rgba(168, 85, 247, 0.35);
}

.gf-icon-btn:active {
  transform: translateY(1px) scale(0.96);
}

.gf-icon-btn.is-active {
  color: #c084fc;
  border-color: #c084fc;
}

@media (max-width: 768px) {
  .gf-header {
    top: 16px; 
/*    //calc(34px + var(--tg-safe-area-inset-top, 0px));*/
    padding: 0 16px;
    padding-top: calc(var(--max-safe-area-inset-top, var(--tg-safe-area-inset-top, 0px)) + var(--max-content-safe-area-inset-top, var(--tg-content-safe-area-inset-top, 0px)));
  }
}

/* CANVAS VIEWPORT */
.gf-canvas-container {
  flex: 1;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  cursor: crosshair;
}

.gf-canvas {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: none;
}

/* FOOTER DOCK */
.gf-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 20;
  pointer-events: none;
  box-sizing: border-box;
  padding-bottom: calc(20px + var(--tg-safe-area-inset-bottom, 0px));
}

.gf-dock {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 14px;
  background: rgba(16, 12, 26, 0.65);
  border: 1px solid rgba(168, 85, 247, 0.2);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 40px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.08);
  pointer-events: auto;
}

.gf-dock-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: transparent;
  border: none;
  color: #c084fc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.gf-dock-btn:hover:not(:disabled) {
  background: rgba(168, 85, 247, 0.15);
  color: #ffffff;
  transform: scale(1.1);
}

.gf-dock-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.gf-dock-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.gf-dock-play {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%);
  color: #ffffff;
  box-shadow: 0 4px 18px rgba(168, 85, 247, 0.45);
}

.gf-dock-play:hover {
  background: linear-gradient(135deg, #c084fc 0%, #9333ea 100%) !important;
  box-shadow: 0 6px 24px rgba(168, 85, 247, 0.6);
  transform: scale(1.08) !important;
}

.gf-dock-btn.is-liked {
  color: #a855f7;
}

.gf-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.gf-icon-play {
  width: 22px;
  height: 22px;
}

@media (max-width: 640px) {
  .gf-brand-link {
    padding: 6px 14px;
    border-radius: 18px;
  }
  .gf-eq-container {
    left: 12px;
    right: 12px;
  }
  .gf-eq-bar {
    width: 2px;
  }
  .gf-brand-text {
    font-size: 11px;
    letter-spacing: 3px;
  }
  .gf-icon-btn {
    width: 36px;
    height: 36px;
  }
  .gf-icon {
    width: 18px;
    height: 18px;
  }
  .gf-dock {
    gap: 8px;
    padding: 6px 10px;
  }
  .gf-dock-btn {
    width: 36px;
    height: 36px;
  }
  .gf-dock-play {
    width: 44px;
    height: 44px;
  }
}
</style>
