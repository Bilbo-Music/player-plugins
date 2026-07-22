<template>
  <div class="roblox-container" :class="[theme]">
    <!-- TOP HEADER: Roblox Topbar with Safe Area Insets -->
    <div ref="topPanelRef" class="roblox-topbar" :style="topbarSafeStyle">
      <!-- Track Info & Cover -->
      <div class="track-info-group" @click="playerSdk.openTrackKebab()">
        <div class="cover-wrapper" :class="{ 'is-playing': playerState === 'playing' }">
          <img v-if="coverUrl" :src="coverUrl" class="cover-img" alt="Cover" />
          <div v-else class="cover-fallback font-mono">
            <svg class="roblox-tile-svg" viewBox="0 0 24 24">
              <rect x="4" y="4" width="16" height="16" rx="2" fill="#FFFFFF" stroke="#000" stroke-width="2" transform="rotate(12 12 12)" />
              <rect x="9.5" y="9.5" width="5" height="5" fill="#141720" transform="rotate(12 12 12)" />
            </svg>
          </div>
        </div>

        <div class="text-meta">
          <div class="roblox-badge font-mono">
            <span class="live-dot" :class="{ 'active': playerState === 'playing' }"></span>
            <span>ROBLOX DISCO WORLD</span>
          </div>
          <div class="track-title text-truncate" :title="trackTitle">
            {{ trackTitle }}
          </div>
          <div class="track-artist text-truncate">
            {{ trackArtist }}
          </div>
        </div>
      </div>

      <!-- Top Right Action Controls: Playlist Queue -->
      <div class="top-actions font-mono">
        <button 
          class="roblox-top-btn playlist-btn" 
          :disabled="!hasQueue" 
          @click="playerSdk.openPlaylist()" 
          title="Open Playlist Queue"
        >
          <svg class="btn-svg-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18C16.69 14.07 16.35 14 16 14c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
          </svg>
          <span class="hidden sm:inline">{{ t.queue }}</span>
        </button>
      </div>
    </div>

    <!-- 3D THREE.JS CANVAS (Roblox World & Dancing Avatar) -->
    <div class="canvas-wrapper">
      <canvas ref="canvasRef" class="three-canvas" @click="handleCanvasTap"></canvas>

      <!-- TOP CANVAS HUD: Current Style, Dance & BPM Chips -->
      <div class="canvas-top-hud font-mono">
        <div class="hud-chip style-chip">
          <span class="style-dot" :style="{ background: currentAvatarStyle.torsoHex }"></span>
          <span>{{ currentAvatarStyle.name }}</span>
        </div>
        <div class="hud-chip dance-chip">
          <span class="dance-icon">🕺</span>
          <span>{{ currentDanceName }}</span>
        </div>
        <div class="hud-chip bpm-chip">
          <span class="bpm-icon">🎵</span>
          <span>{{ Math.round(trackBpm) }} BPM</span>
        </div>
      </div>

      <!-- BOTTOM OVERLAY OVER DANCE AREA: Thumb-Friendly Interactive Buttons -->
      <div class="canvas-bottom-controls font-mono" @click.stop @touchstart.stop>
        <!-- Randomize Outfit / Skin Button -->
        <button 
          class="roblox-action-btn outfit-action-btn" 
          @click.stop.prevent="randomizeAvatar" 
          @touchstart.stop.prevent="randomizeAvatar"
          :title="t.skinBtn"
        >
          <svg class="btn-icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10a2 2 0 002 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z" />
          </svg>
          <span>{{ t.skinBtn }}</span>
        </button>

        <!-- Switch Dance Move Button -->
        <button 
          class="roblox-action-btn dance-action-btn" 
          @click.stop.prevent="switchDanceMove" 
          @touchstart.stop.prevent="switchDanceMove"
          :title="t.danceBtn"
        >
          <svg class="btn-icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
          <span>{{ t.danceBtn }}</span>
        </button>

        <!-- World Theme Button (Random / Next Style) -->
        <button 
          class="roblox-action-btn world-action-btn" 
          @click.stop.prevent="cycleCityTheme" 
          @touchstart.stop.prevent="cycleCityTheme"
          :title="t.worldBtn"
        >
          <span class="btn-emoji-icon">{{ currentCityTheme.icon }}</span>
          <span>{{ t.worldBtn }}</span>
        </button>

        <!-- Collapse / Expand Deck Button -->
        <button 
          class="roblox-action-btn collapse-action-btn" 
          :class="{ 'is-active-collapse': isDeckCollapsed }"
          @click.stop.prevent="toggleCollapseDeck" 
          @touchstart.stop.prevent="toggleCollapseDeck"
          :title="isDeckCollapsed ? t.expand : t.collapse"
        >
          <svg class="btn-icon-lg transition-transform duration-200" :class="{ 'rotate-180': isDeckCollapsed }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M19 9l-7 7-7-7" />
          </svg>
          <span>{{ isDeckCollapsed ? t.expand : t.collapse }}</span>
        </button>
      </div>
    </div>

    <!-- BOTTOM DECK: Roblox Media Controls (Collapsible) -->
    <div class="roblox-bottom-deck font-mono" :class="{ 'is-collapsed': isDeckCollapsed }">
      <!-- PROGRESS TRACKER (Hidden when collapsed) -->
      <div v-show="!isDeckCollapsed" class="progress-container" @click="handleProgressClick">
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
          <div class="progress-thumb" :style="{ left: progressPercent + '%' }">
            <div class="mini-block-head"></div>
          </div>
        </div>
        <div class="progress-time-row font-mono">
          <span>0:00</span>
          <span class="time-readout">{{ formattedCurrentTime }} / {{ formattedDuration }}</span>
          <span>{{ formattedDuration }}</span>
        </div>
      </div>

      <!-- MAIN MEDIA CONTROLS ROW -->
      <div class="controls-row font-mono">
        <!-- Like / Heart Reaction -->
        <button 
          class="roblox-ctrl-btn reaction-btn"
          :class="{ 'is-liked': reaction === 'LIKE' }"
          @click="toggleLike"
          title="Like Track"
        >
          <svg class="ctrl-svg" viewBox="0 0 24 24" :fill="reaction === 'LIKE' ? '#E2231A' : 'none'" stroke="currentColor" stroke-width="2.5">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>

        <!-- Previous Track -->
        <button 
          class="roblox-ctrl-btn" 
          :disabled="prevDisabled" 
          @click="playerSdk.prev()" 
          title="Previous Track"
        >
          <svg class="ctrl-svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>

        <!-- MAIN PLAY / PAUSE BUTTON -->
        <button 
          class="roblox-play-btn font-bold"
          :class="playerState === 'playing' ? 'is-playing' : 'is-paused'"
          @click="togglePlay"
        >
          <svg v-if="playerState === 'playing'" class="play-svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
          <svg v-else class="play-svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          <span class="play-text">{{ playerState === 'playing' ? t.pause : t.play }}</span>
        </button>

        <!-- Next Track -->
        <button 
          class="roblox-ctrl-btn" 
          :disabled="nextDisabled" 
          @click="playerSdk.next()" 
          title="Next Track"
        >
          <svg class="ctrl-svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
        </button>

        <!-- Repeat Mode -->
        <button 
          class="roblox-ctrl-btn repeat-btn" 
          :class="{ 'active-repeat': repeatMode !== 'none' }"
          @click="toggleRepeat" 
          title="Repeat Mode"
        >
          <svg class="ctrl-svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
          </svg>
          <span v-if="repeatMode === 'track'" class="repeat-one-badge">1</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as THREE from 'three'
import { playerSdk } from '@bilbomusic/player-plugin-sdk'

// -----------------------------------------------------------------
// 1. LOCALIZATION & LOCAL STATE
// -----------------------------------------------------------------
const activeLocale = ref('ru-RU')

const i18n = {
  'en-US': {
    play: 'DANCE',
    pause: 'PAUSE',
    silence: 'Robloxia Silence...',
    unknown: 'Unknown Robloxian',
    skinBtn: 'SKIN',
    danceBtn: 'DANCE',
    worldBtn: 'WORLD',
    collapse: 'COLLAPSE',
    expand: 'EXPAND',
    queue: 'QUEUE'
  },
  'ru-RU': {
    play: 'ТАНЦЕВАТЬ',
    pause: 'ПАУЗА',
    silence: 'Тишина в Роблоксии...',
    unknown: 'Неизвестный Нооб',
    skinBtn: 'СКИН',
    danceBtn: 'ТАНЕЦ',
    worldBtn: 'МИР',
    collapse: 'СВЕРНУТЬ',
    expand: 'РАЗВЕРНУТЬ',
    queue: 'ОЧЕРЕДЬ'
  },
  'tr-TR': {
    play: 'DANS ET',
    pause: 'DURAKLAT',
    silence: 'Robloxia Sessizliği...',
    unknown: 'Bilinmeyen Noob',
    skinBtn: 'KOSTÜM',
    danceBtn: 'DANS',
    worldBtn: 'DÜNYA',
    collapse: 'DARALT',
    expand: 'GENİŞLET',
    queue: 'KUYRUK'
  },
  'es-ES': {
    play: 'BAILAR',
    pause: 'PAUSA',
    silence: 'Silencio en Robloxia...',
    unknown: 'Noob Desconocido',
    skinBtn: 'SKIN',
    danceBtn: 'BAILE',
    worldBtn: 'MUNDO',
    collapse: 'PLEGAR',
    expand: 'DESPLEGAR',
    queue: 'COLA'
  },
  'de-DE': {
    play: 'TANZEN',
    pause: 'PAUSE',
    silence: 'Robloxia Stille...',
    unknown: 'Unbekannter Noob',
    skinBtn: 'SKIN',
    danceBtn: 'TANZ',
    worldBtn: 'WELT',
    collapse: 'EINKLAPPEN',
    expand: 'AUSKLAPPEN',
    queue: 'WARTESCHLANGE'
  }
}

const t = computed(() => {
  const loc = activeLocale.value || 'ru-RU'
  return i18n[loc] || i18n[loc.split('-')[0]] || i18n['ru-RU']
})

const topPanelRef = ref(null)
const canvasRef = ref(null)

const theme = ref('dark')
const playerState = ref('paused')
const reaction = ref('NONE')
const repeatMode = ref('none')

const currentTrack = ref(null)
const playedMs = ref(0)
const durationMs = ref(180000)

const nextDisabled = ref(false)
const prevDisabled = ref(true)
const hasQueue = ref(true)

const topUiHeight = ref(80)
const isDeckCollapsed = ref(false)

// BPM Sync from Track Metadata (defaults to 120 BPM)
const trackBpm = computed(() => {
  return currentTrack.value?.bpm || 
         currentTrack.value?.metadata?.bpm || 
         currentTrack.value?.audioAnalysis?.bpm || 
         120
})

// Radical Environment Themes (Vastly different 3D visuals, sky, floor, buildings, lighting)
const cityThemes = [
  {
    id: 'cyber',
    nameRu: 'Неоновый Кибер',
    nameEn: 'Neon Cyber',
    icon: '🏙️',
    skyHex: 0x0c0018,
    fogHex: 0x0a001a,
    stageColor: 0x140228,
    studColor: 0x00ffff,
    buildingColor: 0x1a0833,
    windowColors: ['#FF007F', '#00FFFF', '#7000FF'],
    lightIntensity: 1.4
  },
  {
    id: 'spawn',
    nameRu: 'Классический Спавн',
    nameEn: 'Classic Spawn',
    icon: '☀️',
    skyHex: 0x3898FF,
    fogHex: 0x8cc4ff,
    stageColor: 0x28A745,
    studColor: 0xFFD700,
    buildingColor: 0xE2231A,
    windowColors: ['#FFD700', '#FFFFFF', '#00A2FF'],
    lightIntensity: 1.8
  },
  {
    id: 'space',
    nameRu: 'Космический Станция',
    nameEn: 'Space Station',
    icon: '🌌',
    skyHex: 0x020208,
    fogHex: 0x100826,
    stageColor: 0x111528,
    studColor: 0x00F0FF,
    buildingColor: 0x12082b,
    windowColors: ['#00F0FF', '#9900FF', '#00FF66'],
    lightIntensity: 1.3
  },
  {
    id: 'sunset',
    nameRu: 'Огненный Закат',
    nameEn: 'Sunset Metropolis',
    icon: '🌅',
    skyHex: 0x3d0c18,
    fogHex: 0x3d0c18,
    stageColor: 0x2b1c18,
    studColor: 0xFFA500,
    buildingColor: 0x1a0a0d,
    windowColors: ['#FFA500', '#FF4500', '#FFD700'],
    lightIntensity: 1.5
  }
]
const currentCityIdx = ref(0)
const currentCityTheme = computed(() => cityThemes[currentCityIdx.value])

// Dance Move Modes (9 real dance styles with distinct 3D choreography)
const danceModes = [
  { id: 'hiphop', ru: 'ХИП-ХОП ГРУВ', en: 'HIP-HOP GROOVE' },
  { id: 'disco', ru: 'ДИСКО ЛЕГЕНДА', en: 'DISCO FEVER' },
  { id: 'shuffle', ru: 'ШАФФЛ СТЕП', en: 'SHUFFLE STEP' },
  { id: 'floss', ru: 'ФЛОСС ДРАЙВ', en: 'HYPER FLOSS' },
  { id: 'breakdance', ru: 'БРЕЙК ВИНДМИЛЛ', en: 'WINDMILL SPIN' },
  { id: 'robot', ru: 'РОБОТ ВЕЙВ', en: 'ROBOT WAVE' },
  { id: 'orange', ru: 'ОРАНЖ ДЖАСТИC', en: 'ORANGE JUSTICE' },
  { id: 'hype', ru: 'ХАЙП БОУНС', en: 'HYPE BOUNCE' },
  { id: 'carlton', ru: 'КАРЛТОН СВИНГ', en: 'CARLTON SWING' }
]
const currentDanceIdx = ref(0)
const currentDanceName = computed(() => {
  const d = danceModes[currentDanceIdx.value]
  const isRu = activeLocale.value && activeLocale.value.startsWith('ru')
  return isRu ? d.ru : d.en
})

// Avatar Preset Customization Styles
const avatarPresets = [
  {
    name: 'CLASSIC NOOB',
    headHex: 0xFFD700,
    torsoHex: '#00A2FF',
    torsoColor: 0x00A2FF,
    legsColor: 0x00AA22,
    hatType: 'none'
  },
  {
    name: 'BACON HAIR',
    headHex: 0xFFCD94,
    torsoHex: '#2B2B2B',
    torsoColor: 0x2B2B2B,
    legsColor: 0x1A1A1A,
    hatType: 'bacon'
  },
  {
    name: 'DOMINUS LORD',
    headHex: 0x111111,
    torsoHex: '#3A0066',
    torsoColor: 0x3A0066,
    legsColor: 0x220044,
    hatType: 'dominus'
  },
  {
    name: 'SPARKLE FEDORA',
    headHex: 0xFFD700,
    torsoHex: '#7000FF',
    torsoColor: 0x7000FF,
    legsColor: 0x111122,
    hatType: 'fedora'
  },
  {
    name: 'KORBLOX ICE',
    headHex: 0x1A2A3A,
    torsoHex: '#006699',
    torsoColor: 0x006699,
    legsColor: 0x00F0FF,
    hatType: 'ice'
  }
]

const currentStyleIdx = ref(0)
const currentAvatarStyle = computed(() => avatarPresets[currentStyleIdx.value])

// -----------------------------------------------------------------
// 2. COMPUTED HELPERS & ACTIONS
// -----------------------------------------------------------------
const topbarSafeStyle = computed(() => ({
  paddingTop: 'calc(var(--max-safe-area-inset-top, var(--tg-safe-area-inset-top, 0px)) + var(--max-content-safe-area-inset-top, var(--tg-content-safe-area-inset-top, 0px)))'
}))

const trackTitle = computed(() => currentTrack.value?.title || t.value.silence)
const trackArtist = computed(() => currentTrack.value?.artists || currentTrack.value?.artist || t.value.unknown)
const coverUrl = computed(() => {
  if (!currentTrack.value?.cover) return null
  if (typeof currentTrack.value.cover === 'string') return currentTrack.value.cover
  return currentTrack.value.cover.crop || currentTrack.value.cover.resized || currentTrack.value.cover.original || null
})

const currentTimeSec = computed(() => Math.floor((playedMs.value || 0) / 1000))
const durationSec = computed(() => Math.max(1, Math.floor((durationMs.value || 180000) / 1000)))

const progressPercent = computed(() => {
  if (!durationSec.value) return 0
  return Math.min(100, Math.max(0, (currentTimeSec.value / durationSec.value) * 100))
})

const formattedCurrentTime = computed(() => formatMinSec(currentTimeSec.value))
const formattedDuration = computed(() => formatMinSec(durationSec.value))

function formatMinSec(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

const updateTopUiHeight = () => {
  if (topPanelRef.value) {
    topUiHeight.value = topPanelRef.value.offsetHeight || 80
  }
}

function cycleCityTheme() {
  currentCityIdx.value = (currentCityIdx.value + 1) % cityThemes.length
  applyCityThemeToScene()
  playCoilSound()
}

function toggleCollapseDeck() {
  isDeckCollapsed.value = !isDeckCollapsed.value
  playCoilSound()
  if (typeof playerSdk.collapse === 'function') {
    try {
      playerSdk.collapse()
    } catch (e) {
      console.warn('playerSdk.collapse error:', e)
    }
  }
}

// -----------------------------------------------------------------
// 3. AUDIO SYNTHESIZER SFX
// -----------------------------------------------------------------
let audioCtx = null

function getAudioCtx() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (AudioContext) audioCtx = new AudioContext()
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

function playCoilSound() {
  try {
    const ctx = getAudioCtx()
    if (!ctx) return
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(260, now)
    osc.frequency.exponentialRampToValueAtTime(820, now + 0.18)

    gain.gain.setValueAtTime(0.25, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.2)
  } catch (e) {
    console.warn(e)
  }
}

// -----------------------------------------------------------------
// 4. THREE.JS 3D ROBLOX CITY WORLD ENGINE
// -----------------------------------------------------------------
let scene, camera, renderer
let ambientLight, dirLight
let characterGroup
let headMesh, torsoMesh
let leftArmPivot, rightArmPivot, leftLegPivot, rightLegPivot
let leftArmMesh, rightArmMesh, leftLegMesh, rightLegMesh, hatGroup
let discoBallGroup, discoBallMesh, discoRays = []
let eqBars = []
let cityGroup, cityBuildings = []
let obbyPlatforms = []
let floatingRobuxCoins = []
let laserBeams = []
let spotlightMeshLeft, spotlightMeshRight, centerSpotlight
let animFrameId = null
let audioFrequencies = new Array(16).fill(0.1)

let danceTime = 0
let tapJumpTimer = 0
let lastTime = performance.now()
let smoothSpeedMult = 1.0
let kickPulse = 0

let cameraModeTimer = 0
let currentCamMode = 0 // 0: Orbit, 1: Low Hero, 2: Side Dynamic, 3: Wide Rhythm
let camAngle = 0
let targetCamPos = new THREE.Vector3(0, 5.0, 13.0)
let targetCamLookAt = new THREE.Vector3(0, 2.0, 0)
let currentCamLookAt = new THREE.Vector3(0, 2.0, 0)

function createFaceTexture(bgColor = '#FFD700') {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, 128, 128)

  // Roblox Classic Smile Face
  ctx.fillStyle = '#000000'
  ctx.fillRect(32, 38, 18, 22)
  ctx.fillRect(78, 38, 18, 22)

  ctx.beginPath()
  ctx.arc(64, 75, 26, 0.2, Math.PI - 0.2)
  ctx.lineWidth = 8
  ctx.strokeStyle = '#000000'
  ctx.stroke()

  return new THREE.CanvasTexture(canvas)
}

function updateCharacterMaterials() {
  if (!headMesh || !torsoMesh) return
  const preset = currentAvatarStyle.value

  // Head
  const headTex = createFaceTexture(preset.torsoHex === '#3A0066' ? '#111111' : '#FFD700')
  const headMat = [
    new THREE.MeshStandardMaterial({ color: preset.headHex }),
    new THREE.MeshStandardMaterial({ color: preset.headHex }),
    new THREE.MeshStandardMaterial({ color: preset.headHex }),
    new THREE.MeshStandardMaterial({ color: preset.headHex }),
    new THREE.MeshStandardMaterial({ map: headTex }),
    new THREE.MeshStandardMaterial({ color: preset.headHex })
  ]
  headMesh.material = headMat

  // Torso & Limbs
  torsoMesh.material.color.setHex(preset.torsoColor)
  leftArmMesh.material.color.setHex(preset.headHex)
  rightArmMesh.material.color.setHex(preset.headHex)
  leftLegMesh.material.color.setHex(preset.legsColor)
  rightLegMesh.material.color.setHex(preset.legsColor)

  // Accessories
  if (hatGroup) {
    headMesh.remove(hatGroup)
  }
  hatGroup = new THREE.Group()

  if (preset.hatType === 'bacon') {
    const baconGeo = new THREE.BoxGeometry(1.4, 0.35, 1.3)
    const baconMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.6 })
    const bacon = new THREE.Mesh(baconGeo, baconMat)
    bacon.position.set(0, 0.75, 0)
    hatGroup.add(bacon)
  } else if (preset.hatType === 'dominus') {
    const hoodGeo = new THREE.BoxGeometry(1.5, 0.5, 1.4)
    const hoodMat = new THREE.MeshStandardMaterial({ color: 0x220044, roughness: 0.2, metalness: 0.5 })
    const hood = new THREE.Mesh(hoodGeo, hoodMat)
    hood.position.set(0, 0.75, 0)
    hatGroup.add(hood)
  } else if (preset.hatType === 'fedora') {
    const brimGeo = new THREE.BoxGeometry(1.8, 0.15, 1.8)
    const topGeo = new THREE.BoxGeometry(1.1, 0.5, 1.1)
    const fedoraMat = new THREE.MeshStandardMaterial({ color: 0x7000FF, roughness: 0.1, metalness: 0.8 })
    const brim = new THREE.Mesh(brimGeo, fedoraMat)
    const topH = new THREE.Mesh(topGeo, fedoraMat)
    brim.position.set(0, 0.65, 0)
    topH.position.set(0, 0.95, 0)
    hatGroup.add(brim)
    hatGroup.add(topH)
  } else if (preset.hatType === 'ice') {
    const crownGeo = new THREE.ConeGeometry(0.8, 1.0, 5)
    const crownMat = new THREE.MeshStandardMaterial({ color: 0x00F0FF, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.9 })
    const crown = new THREE.Mesh(crownGeo, crownMat)
    crown.position.set(0, 1.1, 0)
    hatGroup.add(crown)
  }

  headMesh.add(hatGroup)
}

let stageMesh, studMatMeshGroup = []

function applyCityThemeToScene() {
  if (!scene) return
  const curTheme = cityThemes[currentCityIdx.value]
  scene.background.setHex(curTheme.skyHex)
  if (scene.fog) scene.fog.color.setHex(curTheme.fogHex)

  if (ambientLight) ambientLight.intensity = curTheme.lightIntensity * 0.8
  if (dirLight) dirLight.intensity = curTheme.lightIntensity * 0.9

  // Update Stage Floor & Studs Color
  if (stageMesh && stageMesh.material) {
    stageMesh.material.color.setHex(curTheme.stageColor)
  }

  studMatMeshGroup.forEach(stud => {
    if (stud.material) stud.material.color.setHex(curTheme.studColor)
  })

  // Update Skyline Buildings
  cityBuildings.forEach(b => {
    if (b.mesh && b.mesh.material) {
      b.mesh.material.color.setHex(curTheme.buildingColor)
    }
  })
}

function randomizeAvatar() {
  currentStyleIdx.value = (currentStyleIdx.value + 1) % avatarPresets.length
  updateCharacterMaterials()
  playCoilSound()
}

function switchDanceMove() {
  currentDanceIdx.value = (currentDanceIdx.value + 1) % danceModes.length
  playCoilSound()
  cameraModeTimer = 0
  currentCamMode = (currentCamMode + 1) % 4
}

function handleCanvasTap() {
  tapJumpTimer = 1.0
  playCoilSound()
  currentCamMode = (currentCamMode + 1) % 4
}

function buildRobloxCitySkyline() {
  cityGroup = new THREE.Group()
  cityBuildings = []

  const curTheme = cityThemes[currentCityIdx.value]
  const buildingCount = 14

  for (let i = 0; i < buildingCount; i++) {
    const angle = (i / (buildingCount - 1)) * Math.PI * 0.85 - Math.PI * 0.42
    const dist = 12.5 + (i % 3) * 2.2
    const width = 2.4 + (i % 4) * 0.6
    const height = 7 + (i % 5) * 3.5
    const depth = 2.4 + (i % 3) * 0.8

    const bGeo = new THREE.BoxGeometry(width, height, depth)
    const bMat = new THREE.MeshStandardMaterial({
      color: curTheme ? curTheme.buildingColor : 0x161c28,
      roughness: 0.5,
      metalness: 0.3
    })
    const bMesh = new THREE.Mesh(bGeo, bMat)

    const x = Math.sin(angle) * dist
    const z = -Math.cos(angle) * dist - 2
    bMesh.position.set(x, height / 2 - 1.5, z)

    // Window Matrix Canvas Texture
    const winCanvas = document.createElement('canvas')
    winCanvas.width = 64
    winCanvas.height = 128
    const wctx = winCanvas.getContext('2d')
    wctx.fillStyle = '#0a0d14'
    wctx.fillRect(0, 0, 64, 128)

    const colors = curTheme ? curTheme.windowColors : ['#FFD700', '#00A2FF']
    for (let wy = 8; wy < 120; wy += 14) {
      for (let wx = 8; wx < 56; wx += 14) {
        if (Math.random() > 0.3) {
          wctx.fillStyle = colors[Math.floor(Math.random() * colors.length)]
          wctx.fillRect(wx, wy, 8, 8)
        }
      }
    }
    const winTex = new THREE.CanvasTexture(winCanvas)
    const winGeo = new THREE.PlaneGeometry(width * 0.85, height * 0.8)
    const winMat = new THREE.MeshBasicMaterial({ map: winTex, transparent: true })
    const winMesh = new THREE.Mesh(winGeo, winMat)
    winMesh.position.set(0, 0, depth / 2 + 0.02)
    bMesh.add(winMesh)

    cityGroup.add(bMesh)
    cityBuildings.push({ mesh: bMesh, winMesh })
  }
  scene.add(cityGroup)
}

function initThreeScene() {
  const container = canvasRef.value?.parentElement
  if (!container || !canvasRef.value) return

  const width = container.clientWidth
  const height = container.clientHeight

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0c0018)
  scene.fog = new THREE.FogExp2(0x0a001a, 0.02)

  camera = new THREE.PerspectiveCamera(46, width / height, 0.1, 100)
  camera.position.set(0, 5.0, 13.0)
  camera.lookAt(0, 2.0, 0)

  renderer = new THREE.WebGLRenderer({ canvas: canvasRef.value, antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap

  ambientLight = new THREE.AmbientLight(0xffffff, 0.9)
  scene.add(ambientLight)

  dirLight = new THREE.DirectionalLight(0xffffff, 1.0)
  dirLight.position.set(5, 12, 8)
  dirLight.castShadow = true
  scene.add(dirLight)

  centerSpotlight = new THREE.SpotLight(0xe2231a, 1.4)
  centerSpotlight.position.set(0, 14, 4)
  centerSpotlight.angle = Math.PI / 4
  centerSpotlight.penumbra = 0.5
  scene.add(centerSpotlight)

  spotlightMeshLeft = new THREE.PointLight(0x00a2ff, 1.4, 18)
  spotlightMeshLeft.position.set(-6, 6, 2)
  scene.add(spotlightMeshLeft)

  spotlightMeshRight = new THREE.PointLight(0x00ff66, 1.4, 18)
  spotlightMeshRight.position.set(6, 6, 2)
  scene.add(spotlightMeshRight)

  // 1. ROBLOX STAGE FLOOR WITH STUDS
  const stageGeo = new THREE.CylinderGeometry(6.2, 6.8, 0.6, 32)
  const stageMat = new THREE.MeshStandardMaterial({ color: 0x140228, roughness: 0.3, metalness: 0.3 })
  stageMesh = new THREE.Mesh(stageGeo, stageMat)
  stageMesh.position.set(0, -0.3, 0)
  stageMesh.receiveShadow = true
  scene.add(stageMesh)

  // Roblox Studs on Floor
  studMatMeshGroup = []
  const studGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.08, 12)
  for (let r = 1.2; r <= 4.8; r += 1.2) {
    const count = Math.floor(r * 6)
    for (let a = 0; a < count; a++) {
      const angle = (a / count) * Math.PI * 2
      const studMat = new THREE.MeshStandardMaterial({ color: 0x00ffff, roughness: 0.2 })
      const stud = new THREE.Mesh(studGeo, studMat)
      stud.position.set(Math.cos(angle) * r, 0.04, Math.sin(angle) * r)
      scene.add(stud)
      studMatMeshGroup.push(stud)
    }
  }

  // 2. 3D ROBLOX CITY SKYLINE IN BACKGROUND
  buildRobloxCitySkyline()

  // 3. DISCO MIRROR BALL OVERHEAD
  discoBallGroup = new THREE.Group()
  discoBallGroup.position.set(0, 8.5, 0)

  const ballGeo = new THREE.IcosahedronGeometry(1.1, 3)
  const ballMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.1,
    metalness: 0.9,
    flatShading: true
  })
  discoBallMesh = new THREE.Mesh(ballGeo, ballMat)
  discoBallGroup.add(discoBallMesh)

  const wireGeo = new THREE.CylinderGeometry(0.02, 0.02, 4)
  const wireMat = new THREE.MeshBasicMaterial({ color: 0x888888 })
  const wire = new THREE.Mesh(wireGeo, wireMat)
  wire.position.set(0, 2, 0)
  discoBallGroup.add(wire)

  discoRays = []
  for (let i = 0; i < 6; i++) {
    const rayGeo = new THREE.ConeGeometry(0.7, 9, 8)
    const rayMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide
    })
    const ray = new THREE.Mesh(rayGeo, rayMat)
    ray.rotation.x = Math.PI / 1.3
    ray.rotation.z = (i / 6) * Math.PI * 2
    ray.position.set(0, -4.5, 0)
    discoBallGroup.add(ray)
    discoRays.push(ray)
  }
  scene.add(discoBallGroup)

  // 4. FLOATING ROBLOX OBBY PLATFORMS & ROBUX COINS
  obbyPlatforms = []
  floatingRobuxCoins = []

  const obbyColors = [0xE2231A, 0x00A2FF, 0xFFD700, 0x00FF66, 0x9900FF]
  const platformPositions = [
    { x: -5.8, y: 3.5, z: -2.5 },
    { x: 5.8, y: 4.2, z: -2.0 },
    { x: -7.2, y: 5.8, z: -4.5 },
    { x: 7.2, y: 6.2, z: -4.5 }
  ]

  platformPositions.forEach((pos, idx) => {
    const blockGeo = new THREE.BoxGeometry(2.0, 0.45, 2.0)
    const blockMat = new THREE.MeshStandardMaterial({
      color: obbyColors[idx % obbyColors.length],
      roughness: 0.3,
      metalness: 0.4
    })
    const block = new THREE.Mesh(blockGeo, blockMat)
    block.position.set(pos.x, pos.y, pos.z)
    scene.add(block)
    obbyPlatforms.push({ mesh: block, baseY: pos.y, speed: 0.8 + idx * 0.2 })

    const coinGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.12, 6)
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xFFD700,
      metalness: 0.9,
      roughness: 0.1,
      emissive: 0x665500
    })
    const coin = new THREE.Mesh(coinGeo, coinMat)
    coin.rotation.x = Math.PI / 2
    coin.position.set(pos.x, pos.y + 1.1, pos.z)
    scene.add(coin)
    floatingRobuxCoins.push({ mesh: coin, baseY: pos.y + 1.1, speed: 1.2 + idx * 0.3 })
  })

  // 5. HIGH-VISIBILITY NEON EQUALIZER BARS (PROMINENT ON NARROW MOBILE SCREENS)
  eqBars = []
  const eqCount = 12
  const eqColors = [0x00ffff, 0xff007f, 0x00ff66, 0xffd700, 0x9900ff, 0xff3300]

  for (let i = 0; i < eqCount; i++) {
    // Curved arc wrapping tightly around stage sides & back
    const angle = (i / (eqCount - 1)) * Math.PI * 0.82 - Math.PI * 0.41
    const radius = 4.2
    const barGeo = new THREE.BoxGeometry(0.42, 1, 0.42)
    const barColor = eqColors[i % eqColors.length]
    
    const barMat = new THREE.MeshStandardMaterial({
      color: barColor,
      emissive: barColor,
      emissiveIntensity: 0.9,
      roughness: 0.1,
      metalness: 0.8
    })
    const bar = new THREE.Mesh(barGeo, barMat)
    const x = Math.sin(angle) * radius
    const z = -Math.cos(angle) * radius * 0.6 + 0.5
    bar.position.set(x, 0.5, z)
    scene.add(bar)
    eqBars.push(bar)
  }

  // 6. SCANNING DISCO LASER BEAMS
  laserBeams = []
  const laserColors = [0x00ffff, 0xff00ff, 0x00ff00, 0xffff00]
  for (let i = 0; i < 4; i++) {
    const laserGeo = new THREE.CylinderGeometry(0.02, 0.06, 16, 8)
    const laserMat = new THREE.MeshBasicMaterial({
      color: laserColors[i],
      transparent: true,
      opacity: 0.5
    })
    const laser = new THREE.Mesh(laserGeo, laserMat)
    laser.position.set((i - 1.5) * 2.8, 7, -2)
    scene.add(laser)
    laserBeams.push({ mesh: laser, angleOffset: i * (Math.PI / 2) })
  }

  // 7. ROBLOX CHARACTER RIG (R6) WITH ANATOMICAL JOINT PIVOTS
  characterGroup = new THREE.Group()

  // Head
  const headTex = createFaceTexture()
  const headMat = [
    new THREE.MeshStandardMaterial({ color: 0xffd700 }),
    new THREE.MeshStandardMaterial({ color: 0xffd700 }),
    new THREE.MeshStandardMaterial({ color: 0xffd700 }),
    new THREE.MeshStandardMaterial({ color: 0xffd700 }),
    new THREE.MeshStandardMaterial({ map: headTex }),
    new THREE.MeshStandardMaterial({ color: 0xffd700 })
  ]
  headMesh = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), headMat)
  headMesh.position.set(0, 3.2, 0)
  headMesh.castShadow = true
  characterGroup.add(headMesh)

  // Torso
  const torsoMat = new THREE.MeshStandardMaterial({ color: 0x00a2ff })
  torsoMesh = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 0.7), torsoMat)
  torsoMesh.position.set(0, 1.9, 0)
  torsoMesh.castShadow = true
  characterGroup.add(torsoMesh)

  // Arms with Shoulder Pivots
  const armMat = new THREE.MeshStandardMaterial({ color: 0xffd700 })
  const armGeo = new THREE.BoxGeometry(0.5, 1.3, 0.5)

  leftArmPivot = new THREE.Group()
  leftArmPivot.position.set(-0.95, 2.5, 0)
  leftArmMesh = new THREE.Mesh(armGeo, armMat)
  leftArmMesh.position.set(0, -0.65, 0)
  leftArmMesh.castShadow = true
  leftArmPivot.add(leftArmMesh)
  characterGroup.add(leftArmPivot)

  rightArmPivot = new THREE.Group()
  rightArmPivot.position.set(0.95, 2.5, 0)
  rightArmMesh = new THREE.Mesh(armGeo, armMat)
  rightArmMesh.position.set(0, -0.65, 0)
  rightArmMesh.castShadow = true
  rightArmPivot.add(rightArmMesh)
  characterGroup.add(rightArmPivot)

  // Legs with Hip Pivots
  const legMat = new THREE.MeshStandardMaterial({ color: 0x00aa22 })
  const legGeo = new THREE.BoxGeometry(0.65, 1.3, 0.6)

  leftLegPivot = new THREE.Group()
  leftLegPivot.position.set(-0.35, 1.3, 0)
  leftLegMesh = new THREE.Mesh(legGeo, legMat)
  leftLegMesh.position.set(0, -0.65, 0)
  leftLegMesh.castShadow = true
  leftLegPivot.add(leftLegMesh)
  characterGroup.add(leftLegPivot)

  rightLegPivot = new THREE.Group()
  rightLegPivot.position.set(0.35, 1.3, 0)
  rightLegMesh = new THREE.Mesh(legGeo, legMat)
  rightLegMesh.position.set(0, -0.65, 0)
  rightLegMesh.castShadow = true
  rightLegPivot.add(rightLegMesh)
  characterGroup.add(rightLegPivot)

  characterGroup.position.set(0, 0, 0)
  scene.add(characterGroup)

  updateCharacterMaterials()
  applyCityThemeToScene()
  startRenderLoop()
}

function handleResize() {
  const container = canvasRef.value?.parentElement
  if (!container || !renderer || !camera) return
  const width = container.clientWidth
  const height = container.clientHeight

  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
  updateTopUiHeight()
}

// -----------------------------------------------------------------
// REALISTIC DANCE ANIMATION ENGINE & EXACT BPM RHYTHM SYNC
// -----------------------------------------------------------------
function startRenderLoop() {
  lastTime = performance.now()

  const render = () => {
    animFrameId = requestAnimationFrame(render)

    const now = performance.now()
    const dt = Math.min((now - lastTime) / 1000, 0.1)
    lastTime = now

    const isPlaying = playerState.value === 'playing'
    const bpm = trackBpm.value || 120
    const beatsPerSecond = bpm / 60 // e.g., 120 BPM = 2 beats/sec

    // Audio Intensity Bass & Mid calculation from audioFrequencies
    const bassVal = (audioFrequencies[0] + audioFrequencies[1] + audioFrequencies[2]) / 3 || 0.15
    const midVal = (audioFrequencies[4] + audioFrequencies[5] + audioFrequencies[6]) / 3 || 0.15

    if (isPlaying) {
      // Audio-to-dance master beat alignment
      const targetBeatFromPos = ((playedMs.value || 0) / 1000) * beatsPerSecond
      const drift = danceTime - targetBeatFromPos

      if (Math.abs(drift) > 1.8) {
        // Large seek / track start: clean soft jump to track position
        danceTime = targetBeatFromPos
        smoothSpeedMult = 1.0
      } else if (Math.abs(drift) > 0.25) {
        // Drift tolerance exceeded (>125ms): gently nudge speed multiplier by ±3-5%
        // Target speed multiplier slowly speeds up or slows down to catch up without any sudden snapping or jerking
        const nudge = THREE.MathUtils.clamp(1.0 - drift * 0.1, 0.94, 1.06)
        smoothSpeedMult = THREE.MathUtils.lerp(smoothSpeedMult, nudge, dt * 1.2)
      } else {
        // Within natural threshold (±0.25 beats): pure smooth 1.0x flow
        smoothSpeedMult = THREE.MathUtils.lerp(smoothSpeedMult, 1.0, dt * 1.5)
      }

      danceTime += beatsPerSecond * smoothSpeedMult * dt

      // Bass transient pulse accent (smooth physical bounce energy, NO phase jumps!)
      if (bassVal > 0.35) {
        kickPulse = Math.max(kickPulse, (bassVal - 0.35) * 0.25)
      }
      kickPulse = THREE.MathUtils.lerp(kickPulse, 0, dt * 5.0)
    } else {
      danceTime += dt * 0.2
      smoothSpeedMult = 1.0
      kickPulse = 0
    }

    if (tapJumpTimer > 0) {
      tapJumpTimer -= dt * 2.5
    }

    // DYNAMIC CINEMATIC CAMERA SYSTEM WITH LAZY DAMPED BASS REACTION
    if (camera) {
      cameraModeTimer += dt
      // Switch camera view automatically every 10 seconds or on dance change/tap
      if (cameraModeTimer > 10.0) {
        cameraModeTimer = 0
        currentCamMode = (currentCamMode + 1) % 4
      }

      camAngle += dt * (isPlaying ? 0.35 : 0.1)

      if (currentCamMode === 0) {
        // Mode 0: Smooth Floating Orbit (Spacious view)
        const r = 13.5 + Math.sin(danceTime * 0.2) * 0.8
        targetCamPos.set(Math.sin(camAngle) * r * 0.45, 4.8 + Math.cos(danceTime * 0.25) * 0.5, r)
        targetCamLookAt.set(0, 2.0, 0)
      } else if (currentCamMode === 1) {
        // Mode 1: Low-Angle Hero Shot (Pulled back for full avatar visibility)
        targetCamPos.set(Math.sin(camAngle * 0.8) * 2.8, 2.2 + Math.sin(danceTime * 0.3) * 0.3, 9.2)
        targetCamLookAt.set(0, 2.2, 0)
      } else if (currentCamMode === 2) {
        // Mode 2: Dynamic Side View Stage Cam
        targetCamPos.set(8.5 * Math.sin(camAngle * 0.6), 4.5, 10.5)
        targetCamLookAt.set(0, 2.0, 0)
      } else if (currentCamMode === 3) {
        // Mode 3: Wide Rhythm Overview
        targetCamPos.set(Math.sin(danceTime * 0.3) * 1.5, 3.8, 8.2)
        targetCamLookAt.set(0, 2.2, 0)
      }

      // Reactive Bass Impulse: Camera subtle zoom inward on bass spikes
      if (isPlaying && bassVal > 0.35) {
        const bassKick = (bassVal - 0.35) * 1.2
        targetCamPos.z -= bassKick
        targetCamPos.y += Math.sin(danceTime * 8) * bassKick * 0.2
      }

      // Smooth Lazy Damped Camera Position & LookAt Lerp
      camera.position.lerp(targetCamPos, dt * 3.0)
      currentCamLookAt.lerp(targetCamLookAt, dt * 3.0)
      camera.lookAt(currentCamLookAt)
    }

    // Restore rig joint defaults
    if (headMesh) headMesh.position.y = 3.2
    if (leftArmPivot) leftArmPivot.position.x = -0.95
    if (rightArmPivot) rightArmPivot.position.x = 0.95
    if (leftLegPivot) leftLegPivot.position.x = -0.35
    if (rightLegPivot) rightLegPivot.position.x = 0.35

    // 2. DANCE ANIMATIONS SYNCED TO BPM
    if (characterGroup && leftArmPivot && rightArmPivot && leftLegPivot && rightLegPivot) {
        const modeObj = danceModes[currentDanceIdx.value]
        const mode = modeObj.id
        const jumpY = tapJumpTimer > 0 ? Math.sin(tapJumpTimer * Math.PI) * 1.2 : 0

        if (isPlaying) {
          const beat = danceTime * Math.PI // Full phase per beat

          if (mode === 'hiphop') {
            // --- REAL HIP-HOP GROOVE ---
            const bodyBob = Math.abs(Math.sin(beat)) * 0.22 + bassVal * 0.12 + kickPulse
            characterGroup.position.y = jumpY + bodyBob
            characterGroup.rotation.x = 0
            characterGroup.rotation.y = THREE.MathUtils.lerp(characterGroup.rotation.y, Math.sin(beat * 0.5) * 0.2, 0.15)
            characterGroup.rotation.z = Math.sin(beat * 0.5) * 0.08

            leftArmPivot.rotation.x = THREE.MathUtils.lerp(leftArmPivot.rotation.x, -0.6 + Math.sin(beat) * 0.45, 0.15)
            leftArmPivot.rotation.z = THREE.MathUtils.lerp(leftArmPivot.rotation.z, 0.4 + Math.cos(beat * 0.5) * 0.2, 0.15)

            rightArmPivot.rotation.x = THREE.MathUtils.lerp(rightArmPivot.rotation.x, -0.6 - Math.sin(beat) * 0.45, 0.15)
            rightArmPivot.rotation.z = THREE.MathUtils.lerp(rightArmPivot.rotation.z, -0.4 - Math.cos(beat * 0.5) * 0.2, 0.15)

            leftLegPivot.rotation.x = Math.sin(beat) * 0.32
            rightLegPivot.rotation.x = -Math.sin(beat) * 0.32
            headMesh.rotation.x = Math.sin(beat * 2) * 0.1

          } else if (mode === 'disco') {
            // --- REAL DISCO FEVER ---
            characterGroup.position.y = jumpY + Math.abs(Math.sin(beat * 0.5)) * 0.1
            characterGroup.rotation.set(0, Math.sin(beat * 0.5) * 0.3, 0)

            rightArmPivot.rotation.x = THREE.MathUtils.lerp(rightArmPivot.rotation.x, -2.4 + Math.sin(beat) * 0.2, 0.15)
            rightArmPivot.rotation.z = THREE.MathUtils.lerp(rightArmPivot.rotation.z, -0.6, 0.15)

            leftArmPivot.rotation.x = THREE.MathUtils.lerp(leftArmPivot.rotation.x, 0.2, 0.15)
            leftArmPivot.rotation.z = THREE.MathUtils.lerp(leftArmPivot.rotation.z, 0.5, 0.15)

            leftLegPivot.rotation.z = Math.sin(beat * 0.5) * 0.15
            rightLegPivot.rotation.z = Math.sin(beat * 0.5) * 0.15
            headMesh.rotation.y = -Math.sin(beat * 0.5) * 0.25

          } else if (mode === 'shuffle') {
            // --- REAL SHUFFLE STEP ---
            characterGroup.position.y = jumpY + Math.abs(Math.sin(beat * 2)) * 0.25
            characterGroup.rotation.set(0, Math.sin(beat) * 0.15, 0)

            leftLegPivot.rotation.x = Math.sin(beat * 2) * 0.6
            rightLegPivot.rotation.x = -Math.sin(beat * 2) * 0.6

            leftArmPivot.rotation.x = -Math.sin(beat * 2) * 0.45 - 0.2
            rightArmPivot.rotation.x = Math.sin(beat * 2) * 0.45 - 0.2
            leftArmPivot.rotation.z = 0.3
            rightArmPivot.rotation.z = -0.3

          } else if (mode === 'floss') {
            // --- REAL HYPER FLOSS ---
            characterGroup.position.y = jumpY + Math.abs(Math.sin(beat * 2)) * 0.08
            characterGroup.rotation.set(0, 0, Math.sin(beat) * 0.22)

            const armSwing = Math.sin(beat * 1.5) * 1.1
            leftArmPivot.rotation.z = armSwing + 0.2
            rightArmPivot.rotation.z = armSwing - 0.2
            leftArmPivot.rotation.x = -0.2
            rightArmPivot.rotation.x = -0.2

            leftLegPivot.rotation.z = -Math.sin(beat) * 0.15
            rightLegPivot.rotation.z = -Math.sin(beat) * 0.15

          } else if (mode === 'breakdance') {
            // --- BREAKDANCE WINDMILL ---
            characterGroup.position.y = jumpY + 0.6
            characterGroup.rotation.z = THREE.MathUtils.lerp(characterGroup.rotation.z, Math.PI / 3.2, 0.1)
            characterGroup.rotation.y += dt * 5.0

            leftLegPivot.rotation.z = 0.7
            rightLegPivot.rotation.z = -0.7
            leftArmPivot.rotation.x = -1.5
            rightArmPivot.rotation.x = -1.5

          } else if (mode === 'robot') {
            // --- ROBOT WAVE (UPRIGHT MECHANICAL ISOLATION) ---
            characterGroup.position.y = jumpY
            characterGroup.rotation.set(0, 0, 0)

            const robotStep = Math.floor(beat * 0.8) % 4
            if (robotStep === 0) {
              leftArmPivot.rotation.set(-1.57, 0, 0.3)
              rightArmPivot.rotation.set(0, 0, -0.2)
              headMesh.rotation.set(0, 0, 0)
            } else if (robotStep === 1) {
              leftArmPivot.rotation.set(-1.57, 0, 1.2)
              rightArmPivot.rotation.set(-0.4, 0, -0.2)
              headMesh.rotation.set(0, 0.5, 0)
            } else if (robotStep === 2) {
              leftArmPivot.rotation.set(0, 0, 0.2)
              rightArmPivot.rotation.set(-1.57, 0, -0.3)
              headMesh.rotation.set(0, 0, 0)
            } else {
              leftArmPivot.rotation.set(-0.4, 0, 0.2)
              rightArmPivot.rotation.set(-1.57, 0, -1.2)
              headMesh.rotation.set(0, -0.5, 0)
            }
            leftLegPivot.rotation.set(0, 0, 0)
            rightLegPivot.rotation.set(0, 0, 0)

          } else if (mode === 'orange') {
            // --- ORANGE JUSTICE (UPRIGHT BOUNCE & SWING) ---
            characterGroup.position.y = jumpY + Math.abs(Math.sin(beat * 2)) * 0.15
            characterGroup.rotation.set(0, Math.sin(beat) * 0.35, 0)

            const armCross = Math.sin(beat * 2) * 0.7
            leftArmPivot.rotation.x = -0.6
            rightArmPivot.rotation.x = -0.6
            leftArmPivot.rotation.z = 0.4 + armCross
            rightArmPivot.rotation.z = -0.4 - armCross

            leftLegPivot.rotation.x = Math.sin(beat * 2) * 0.35
            rightLegPivot.rotation.x = -Math.sin(beat * 2) * 0.35
            leftLegPivot.rotation.z = 0
            rightLegPivot.rotation.z = 0
            headMesh.rotation.set(0, 0, 0)

          } else if (mode === 'hype') {
            // --- HYPE BOUNCE ---
            characterGroup.position.y = jumpY + Math.abs(Math.sin(beat * 3)) * 0.35
            characterGroup.rotation.set(0, 0, 0)
            leftLegPivot.rotation.x = Math.sin(beat * 3) * 0.7
            rightLegPivot.rotation.x = -Math.sin(beat * 3) * 0.7
            leftArmPivot.rotation.x = -1.8 + Math.sin(beat * 3) * 0.5
            rightArmPivot.rotation.x = -1.8 - Math.sin(beat * 3) * 0.5
            headMesh.rotation.x = Math.sin(beat * 3) * 0.25

          } else if (mode === 'carlton') {
            // --- CARLTON SWING ---
            characterGroup.position.y = jumpY + Math.abs(Math.sin(beat * 1.5)) * 0.1
            characterGroup.rotation.set(0, 0, Math.sin(beat * 1.5) * 0.28)
            leftArmPivot.rotation.z = 1.2 + Math.sin(beat * 1.5) * 0.4
            rightArmPivot.rotation.z = -1.2 + Math.sin(beat * 1.5) * 0.4
            leftArmPivot.rotation.x = -0.4
            rightArmPivot.rotation.x = -0.4
            headMesh.rotation.z = -Math.sin(beat * 1.5) * 0.2
          }
        } else {
          // IDLE STATE
          characterGroup.position.y = jumpY + Math.sin(danceTime * 2) * 0.04
          characterGroup.rotation.y = Math.sin(danceTime * 0.8) * 0.08
          characterGroup.rotation.z = 0

          leftArmPivot.rotation.set(0, 0, 0.1)
          rightArmPivot.rotation.set(0, 0, -0.1)
          leftLegPivot.rotation.set(0, 0, 0)
          rightLegPivot.rotation.set(0, 0, 0)
          headMesh.rotation.set(0, 0, 0)
        }
      }

    // 3. DISCO BALL & RAYS
    if (discoBallGroup) {
      discoBallGroup.rotation.y += isPlaying ? dt * 1.2 : dt * 0.3
      discoRays.forEach((ray, idx) => {
        ray.material.opacity = isPlaying ? (0.1 + Math.sin(danceTime * 4 + idx) * 0.08) : 0.04
      })
    }

    // 4. OBBY PLATFORMS & COINS
    obbyPlatforms.forEach((p, idx) => {
      p.mesh.position.y = p.baseY + Math.sin(danceTime * p.speed + idx) * 0.35
      p.mesh.rotation.y += dt * 0.5
    })

    floatingRobuxCoins.forEach((c, idx) => {
      c.mesh.position.y = c.baseY + Math.sin(danceTime * c.speed + idx) * 0.4
      c.mesh.rotation.z += dt * 2.0
    })

    // 5. DISCO LASERS
    laserBeams.forEach((l, idx) => {
      l.mesh.rotation.z = Math.sin(danceTime * 2 + l.angleOffset) * 0.5
      l.mesh.rotation.x = Math.cos(danceTime * 1.5 + l.angleOffset) * 0.25
      l.mesh.material.opacity = isPlaying ? (0.3 + midVal * 0.4) : 0.1
    })

    // 6. SPOTLIGHT COLORS
    if (spotlightMeshLeft && spotlightMeshRight) {
      const hue1 = (danceTime * 0.1) % 1
      const hue2 = (danceTime * 0.1 + 0.5) % 1
      spotlightMeshLeft.color.setHSL(hue1, 1, 0.5)
      spotlightMeshRight.color.setHSL(hue2, 1, 0.5)

      if (centerSpotlight) {
        centerSpotlight.color.setHSL((danceTime * 0.15 + 0.25) % 1, 1, 0.5)
      }
    }

    // 7. 3D EQUALIZER BARS SPECTRUM SYNC
    eqBars.forEach((bar, idx) => {
      const freqVal = isPlaying ? (audioFrequencies[idx % audioFrequencies.length] || 0.15) : (Math.sin(danceTime + idx) * 0.15 + 0.15)
      const targetH = Math.max(0.4, freqVal * 8.0)
      bar.scale.y = THREE.MathUtils.lerp(bar.scale.y, targetH, 0.2)
      bar.position.y = bar.scale.y / 2
    })

    renderer.render(scene, camera)
  }

  render()
}

// -----------------------------------------------------------------
// 5. SDK CONTROLS & EVENT LISTENERS
// -----------------------------------------------------------------
function togglePlay() {
  if (playerState.value === 'playing') {
    playerSdk.pause()
  } else {
    playerSdk.play()
    getAudioCtx()
  }
}

function toggleLike() {
  // const nextReaction = reaction.value === 'LIKE' ? 'NONE' : 'LIKE'
  // reaction.value = nextReaction
  if (reaction.value === 'LIKE' || reaction.value === 'DISLIKE') {
    playerSdk.reaction('')
  } else {
    playerSdk.reaction('LIKE')
  }
}

function toggleRepeat() {
  const modes = ['none', 'queue', 'track']
  const nextIdx = (modes.indexOf(repeatMode.value) + 1) % modes.length
  repeatMode.value = modes[nextIdx]
  playerSdk.setRepeat(repeatMode.value)
}

function handleProgressClick(e) {
  const target = e.currentTarget
  if (!target || !durationMs.value) return
  const rect = target.getBoundingClientRect()
  const clickX = e.clientX - rect.left
  const pct = Math.max(0, Math.min(1, clickX / rect.width))
  const newPos = pct * durationMs.value
  playedMs.value = newPos
  danceTime = (newPos / 1000) * ((trackBpm.value || 120) / 60)
  playerSdk.seek(newPos)
}

// SDK Handlers
const onInit = (state) => {
  if (!state) return
  if (state.theme) theme.value = state.theme
  if (state.locale?.locale) activeLocale.value = state.locale.locale

  if (state.styles) {
    const root = document.documentElement
    Object.entries(state.styles).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        root.style.setProperty(k, v)
      }
    })
    nextTick(() => updateTopUiHeight())
  }

  const pane = state.panes?.default
  if (pane) {
    if (pane.track) {
      currentTrack.value = pane.track
      durationMs.value = pane.track.duration || 180000
    }
    playedMs.value = pane.position || 0
    if ('state' in pane) playerState.value = pane.state || 'paused'
    if ('reaction' in pane) reaction.value = pane.reaction || 'NONE'
    if ('repeat' in pane) repeatMode.value = pane.repeat || 'none'
    if ('nextDisabled' in pane) nextDisabled.value = !!pane.nextDisabled
    if ('prevDisabled' in pane) prevDisabled.value = !!pane.prevDisabled
    if ('hasQueue' in pane) hasQueue.value = !!pane.hasQueue
  }
}

const onOpen = (payload) => {
  if (payload?.track) {
    currentTrack.value = payload.track
    durationMs.value = payload.track.duration || 180000
    playedMs.value = payload.position || 0
  }
}

const onPosition = (payload) => {
  if (payload && typeof payload.position === 'number') {
    playedMs.value = payload.position
  }
}

const onState = (payload) => {
  if (payload && 'state' in payload) {
    playerState.value = payload.state
  }
}

const onTheme = (payload) => {
  if (payload?.theme) theme.value = payload.theme
}

const onReaction = (payload) => {
  reaction.value = payload.reaction
}

const onRepeat = (payload) => {
  if (payload && 'repeat' in payload) {
    repeatMode.value = payload.repeat
  }
}

const onChange = ({ pane, type, payload }) => {
  if (pane !== 'default') return
  if (type === 'prevDisabled') prevDisabled.value = !!payload?.value
  if (type === 'nextDisabled') nextDisabled.value = !!payload?.value
  if (type === 'hasQueue') hasQueue.value = !!payload?.value
}

const onAudioFrame = (dataArray) => {
  if (!dataArray || !dataArray.length) return
  const blockSize = Math.floor(dataArray.length / 16)
  const newSpec = []
  for (let i = 0; i < 16; i++) {
    let sum = 0
    const start = i * blockSize
    for (let j = start; j < start + blockSize; j++) {
      sum += dataArray[j]
    }
    newSpec.push(sum / blockSize / 255)
  }
  audioFrequencies = newSpec
}

const onLocale = (payload) => {
  if (payload?.locale) activeLocale.value = payload.locale
}

// -----------------------------------------------------------------
// 6. LIFECYCLE
// -----------------------------------------------------------------
onMounted(() => {
  if (typeof playerSdk.setUiConfig === 'function') {
    playerSdk.setUiConfig({
      carousel: false,
      interactive: true,
      trackInfo: false,
      progressBar: false,
      controls: {
        like: false,
        dislike: false,
        playPause: false,
        next: false,
        prev: false
      },
      actions: {
        repeat: false,
        playlist: false
      },
      minimize: false
    })
  }

  playerSdk.on('init', onInit)
  playerSdk.on('locale', onLocale)
  playerSdk.on('open', onOpen, 'default')
  playerSdk.on('position', onPosition)
  playerSdk.on('state', onState, 'default')
  playerSdk.on('theme', onTheme)
  playerSdk.on('reaction', onReaction)
  playerSdk.on('repeat', onRepeat)
  playerSdk.on('change', onChange)
  playerSdk.on('audioFrame', onAudioFrame, 'default')

  if (playerSdk.state) {
    onInit(playerSdk.state)
  }

  nextTick(() => {
    updateTopUiHeight()
    initThreeScene()
  })

  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  playerSdk.off('init', onInit)
  playerSdk.off('locale', onLocale)
  playerSdk.off('open', onOpen, 'default')
  playerSdk.off('position', onPosition)
  playerSdk.off('state', onState, 'default')
  playerSdk.off('theme', onTheme)
  playerSdk.off('reaction', onReaction)
  playerSdk.off('repeat', onRepeat)
  playerSdk.off('change', onChange)
  playerSdk.off('audioFrame', onAudioFrame, 'default')

  window.removeEventListener('resize', handleResize)

  if (animFrameId) cancelAnimationFrame(animFrameId)
  if (renderer) renderer.dispose()
})
</script>

<style scoped>
.roblox-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #080a14;
  color: #ffffff;
  overflow: hidden;
  user-select: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* TOP HEADER */
.roblox-topbar {
  position: relative;
  z-index: 25;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: rgba(16, 18, 24, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 2px solid #e2231a;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
}

.track-info-group {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 75%;
  overflow: hidden;
}

.cover-wrapper {
  position: relative;
  width: 42px;
  height: 42px;
  border-radius: 6px;
  border: 2px solid #e2231a;
  overflow: hidden;
  flex-shrink: 0;
  background: #141720;
}

.cover-wrapper.is-playing {
  box-shadow: 0 0 12px rgba(226, 35, 26, 0.8);
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1e2230;
}

.roblox-tile-svg {
  width: 24px;
  height: 24px;
}

.text-meta {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.roblox-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 9px;
  color: #e2231a;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #666;
}

.live-dot.active {
  background: #00ff66;
  box-shadow: 0 0 6px #00ff66;
}

.track-title {
  font-size: 13px;
  font-weight: bold;
  color: #ffffff;
}

.track-artist {
  font-size: 11px;
  color: #9ea5b3;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.roblox-top-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #181b24;
  border: 2px solid #323846;
  color: #ffffff;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 3px 0 #000;
  transition: transform 0.1s, border-color 0.15s;
}

.roblox-top-btn:active {
  transform: translateY(2px);
  box-shadow: none;
}

.playlist-btn:hover:not(:disabled) {
  border-color: #00a2ff;
}

.roblox-top-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-svg-icon {
  width: 14px;
  height: 14px;
}

/* CANVAS WRAPPER */
.canvas-wrapper {
  position: relative;
  flex: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent !important;
  -webkit-touch-callout: none;
  user-select: none;
}

.three-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

/* CANVAS TOP HUD CHIPS */
.canvas-top-hud {
  position: absolute;
  top: 10px;
  left: 10px;
  right: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  z-index: 10;
  pointer-events: none;
  flex-wrap: wrap;
}

.hud-chip {
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(16, 18, 24, 0.88);
  backdrop-filter: blur(8px);
  border: 1px solid #323846;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 10px;
  color: #fff;
  font-weight: bold;
}

.style-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.bpm-chip {
  border-color: #e2231a;
  color: #e2231a;
}

/* CANVAS ENVIRONMENT THEME SELECTOR BAR */
.canvas-env-bar {
  position: absolute;
  top: 44px;
  left: 8px;
  right: 8px;
  z-index: 12;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 6px;
  background: rgba(12, 14, 20, 0.92);
  backdrop-filter: blur(10px);
  border: 2px solid #000;
  border-radius: 8px;
  padding: 5px 8px;
  overflow-x: auto;
  scrollbar-width: none;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.7);
}

.canvas-env-bar::-webkit-scrollbar {
  display: none;
}

.env-group {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
}

.group-label {
  font-size: 9px;
  color: #a0a8b8;
  font-weight: 900;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.theme-pill-row {
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  overflow-x: auto;
}

.theme-mini-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #181c28;
  border: 1.5px solid #2d3548;
  color: #fff;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 10px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
  box-shadow: 0 2px 0 #000;
}

.theme-mini-btn:hover {
  border-color: #00a2ff;
  background: #202738;
}

.theme-mini-btn.active {
  background: #e2231a;
  border-color: #ffd700;
  color: #ffffff;
  box-shadow: 0 0 10px rgba(226, 35, 26, 0.7);
}

.theme-icon {
  font-size: 12px;
}

.theme-name {
  font-size: 9px;
  letter-spacing: 0.3px;
}

/* CANVAS BOTTOM ACTION BUTTONS (THUMB-FRIENDLY OVERLAY) */
.canvas-bottom-controls {
  position: absolute;
  bottom: 10px;
  left: 8px;
  right: 8px;
  z-index: 15;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.roblox-action-btn {
  flex: 1;
  max-width: 125px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: rgba(20, 24, 34, 0.95);
  backdrop-filter: blur(10px);
  border: 2px solid #000;
  border-radius: 8px;
  color: #ffffff;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 0 #000;
  transition: transform 0.1s, border-color 0.15s, background-color 0.15s;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.roblox-action-btn:active {
  transform: translateY(3px);
  box-shadow: none;
}

.outfit-action-btn {
  border-color: #ffd700;
  color: #ffd700;
}

.outfit-action-btn:hover {
  background: rgba(255, 215, 0, 0.18);
}

.dance-action-btn {
  border-color: #00a2ff;
  color: #00a2ff;
}

.dance-action-btn:hover {
  background: rgba(0, 162, 255, 0.18);
}

.world-action-btn {
  border-color: #ff007f;
  color: #ff007f;
}

.world-action-btn:hover {
  background: rgba(255, 0, 127, 0.18);
}

.btn-emoji-icon {
  font-size: 13px;
  line-height: 1;
}

.collapse-action-btn {
  border-color: #00ff66;
  color: #00ff66;
}

.collapse-action-btn:hover {
  background: rgba(0, 255, 102, 0.18);
}

.collapse-action-btn.is-active-collapse {
  background: #00ff66;
  color: #000000;
  border-color: #ffffff;
  box-shadow: 0 0 10px rgba(0, 255, 102, 0.6);
}

.btn-icon-lg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

/* BOTTOM DECK */
.roblox-bottom-deck {
  position: relative;
  z-index: 25;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(16, 18, 24, 0.95);
  backdrop-filter: blur(12px);
  border-top: 2px solid #e2231a;
  transition: padding 0.2s ease, gap 0.2s ease;
}

.roblox-bottom-deck.is-collapsed {
  padding: 6px 12px;
  gap: 0;
}

.progress-container {
  cursor: pointer;
  -webkit-tap-highlight-color: transparent !important;
  -webkit-touch-callout: none;
  user-select: none;
}

.progress-track {
  position: relative;
  height: 8px;
  background: #141720;
  border: 2px solid #000;
  border-radius: 4px;
  overflow: visible;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #e2231a, #00a2ff, #ffd700);
  border-radius: 2px;
}

.progress-thumb {
  position: absolute;
  top: -5px;
  transform: translateX(-50%);
  pointer-events: none;
}

.mini-block-head {
  width: 16px;
  height: 16px;
  background: #ffd700;
  border: 2px solid #000;
  border-radius: 3px;
  box-shadow: 0 2px 0 #000;
}

.progress-time-row {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #888e9b;
  margin-top: 4px;
}

.time-readout {
  color: #fff;
  font-weight: bold;
}

/* CONTROLS ROW */
.controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.roblox-ctrl-btn {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  background: #1c202b;
  border: 2px solid #000;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 3px 0 #000;
  position: relative;
  transition: transform 0.1s, background-color 0.15s;
}

.roblox-ctrl-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

.roblox-ctrl-btn:active:not(:disabled) {
  transform: translateY(2px);
  box-shadow: none;
}

.roblox-ctrl-btn.is-liked {
  border-color: #e2231a;
  background: #2b181d;
}

.roblox-ctrl-btn.active-repeat {
  border-color: #00a2ff;
  color: #00a2ff;
}

.repeat-one-badge {
  position: absolute;
  top: 2px;
  right: 4px;
  font-size: 9px;
  font-weight: 900;
  color: #00a2ff;
}

.ctrl-svg {
  width: 18px;
  height: 18px;
}

.roblox-play-btn {
  flex: 1;
  height: 44px;
  border-radius: 8px;
  border: 2px solid #000;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
  cursor: pointer;
  box-shadow: 0 4px 0 #000;
  transition: transform 0.1s;
}

.roblox-play-btn.is-playing {
  background: #00a2ff;
}

.roblox-play-btn.is-paused {
  background: #e2231a;
}

.roblox-play-btn:active {
  transform: translateY(3px);
  box-shadow: none;
}

.play-svg {
  width: 18px;
  height: 18px;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
