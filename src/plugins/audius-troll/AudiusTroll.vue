<template>
  <div class="audius-app-container">
    <!-- BACKGROUND GLOW EFFECTS -->
    <div class="audius-bg-glow">
      <div class="glow-orb top-orb"></div>
      <div class="glow-orb bottom-orb"></div>
      <div class="glow-orb center-orb"></div>
    </div>

    <!-- MAIN PLAYER SCREEN -->
    <div class="audius-player-screen">
      <!-- 1. TOP NAVBAR -->
      <header ref="topPanelRef" class="audius-header">
        <!-- Official Audius Brand Logo -->
        <div class="header-brand-group">
          <svg width="100%" height="20" viewBox="0 0 354 72" fill="#9AA1B0" xmlns="http://www.w3.org/2000/svg" class="css-jk4ihc" aria-hidden="true"><path d="M32.6138 4.51152C31.1998 1.97342 30.4913 0.704376 29.5678 0.279215C28.7611 -0.0928029 27.8408 -0.0928028 27.0341 0.277604C26.109 0.702769 25.4005 1.97021 23.9818 4.50668L2.03171 43.7667C0.614569 46.303 -0.095558 47.5708 0.0103363 48.6108C0.102217 49.5192 0.561621 50.3437 1.27642 50.8818C2.094 51.4969 3.51112 51.4983 6.34387 51.5001L14.2269 51.5048C15.2749 51.5048 15.7998 51.5048 16.2685 51.3487C16.6843 51.2101 17.0658 50.9817 17.3913 50.6802C17.7573 50.339 18.0205 49.8704 18.5453 48.9313L26.6089 34.5081C26.6556 34.4244 26.707 34.3454 26.7616 34.2729C27.5822 33.1827 29.2594 33.2616 29.9556 34.5097L39.4956 51.6226C39.5811 51.7755 39.6434 51.9333 39.6856 52.0912C40.0158 53.315 39.1373 54.6196 37.82 54.6179L22.0196 54.6068C20.9715 54.6068 20.4467 54.6068 19.978 54.7629C19.5622 54.9014 19.1806 55.1302 18.8552 55.4313C18.4892 55.7729 18.226 56.2412 17.7012 57.1803L13.755 64.2374C12.3379 66.7737 11.6277 68.0411 11.7337 69.0816C11.8255 69.9899 12.285 70.8144 12.9997 71.3522C13.8173 71.9676 15.2344 71.9691 18.0672 71.9709L61.6138 71.9999C64.4465 72.0013 65.8622 72.0031 66.6812 71.3876C67.3959 70.8517 67.857 70.0271 67.949 69.1202C68.0546 68.0798 67.3478 66.8109 65.9339 64.2729L32.6138 4.51152Z" fill="#9AA1B0"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M89.9035 56.8194C89.2729 56.8194 88.8464 56.1549 89.0918 55.5548L105.587 15.2522C105.725 14.9153 106.044 14.6964 106.398 14.6964H116.048C116.402 14.6964 116.722 14.9153 116.86 15.2522L133.355 55.5548C133.601 56.1549 133.174 56.8194 132.543 56.8194H122.431C122.073 56.8194 121.751 56.5956 121.615 56.253L119.113 49.9169C118.977 49.5746 118.655 49.3509 118.297 49.3509H103.865C103.505 49.3509 103.181 49.5771 103.047 49.9226L100.598 56.2472C100.464 56.5928 100.14 56.8194 99.7797 56.8194H89.9035ZM107.045 39.0829C106.816 39.6801 107.242 40.3285 107.864 40.3285H114.357C114.978 40.3285 115.404 39.6833 115.178 39.0865L111.952 30.5866C111.66 29.8178 110.607 29.8154 110.313 30.5829L107.045 39.0829Z" fill="#9AA1B0"></path><path d="M161.329 57.5959C149.817 57.5959 142.585 51.5614 142.585 38.4764V15.9052C142.585 15.4026 142.979 14.9952 143.466 14.9952H153.101C153.587 14.9952 153.982 15.4026 153.982 15.9052V38.2376C153.982 44.2722 156.932 47.14 161.445 47.14C165.957 47.14 168.908 44.3914 168.908 38.5362V15.9052C168.908 15.4026 169.302 14.9952 169.789 14.9952H179.423C179.91 14.9952 180.304 15.4026 180.304 15.9052V38.1778C180.304 51.6809 172.842 57.5959 161.329 57.5959Z" fill="#9AA1B0"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M194.77 56.8194C194.283 56.8194 193.889 56.4119 193.889 55.9093V15.9052C193.889 15.4026 194.283 14.9952 194.77 14.9952H209.509C223.972 14.9952 232.36 23.599 232.36 35.6684V35.7876C232.36 47.8572 223.856 56.8194 209.277 56.8194H194.77ZM205.112 45.6324C205.112 46.1351 205.507 46.5425 205.993 46.5425H209.682C216.393 46.5425 220.848 42.7187 220.848 35.967V35.8474C220.848 29.1557 216.393 25.272 209.682 25.272H205.993C205.507 25.272 205.112 25.6794 205.112 26.182V45.6324Z" fill="#9AA1B0"></path><path d="M246.18 56.8194C245.693 56.8194 245.299 56.4119 245.299 55.9093V15.9052C245.299 15.4026 245.693 14.9952 246.18 14.9952H255.699C256.185 14.9952 256.58 15.4026 256.58 15.9052V55.9093C256.58 56.4119 256.185 56.8194 255.699 56.8194H246.18Z" fill="#9AA1B0"></path><path d="M289.159 57.5959C277.646 57.5959 270.415 51.5614 270.415 38.4764V15.9052C270.415 15.4026 270.81 14.9952 271.296 14.9952H280.931C281.417 14.9952 281.812 15.4026 281.812 15.9052V38.2376C281.812 44.2722 284.762 47.14 289.275 47.14C293.787 47.14 296.738 44.3914 296.738 38.5362V15.9052C296.738 15.4026 297.132 14.9952 297.619 14.9952H307.253C307.74 14.9952 308.134 15.4026 308.134 15.9052V38.1778C308.134 51.6809 300.671 57.5959 289.159 57.5959Z" fill="#9AA1B0"></path><path d="M337.628 57.5365C330.76 57.5365 324.21 55.4002 319.298 51.1808C318.933 50.8668 318.895 50.3068 319.2 49.9305L324.348 43.5791C324.656 43.2003 325.198 43.1451 325.582 43.4405C329.397 46.3746 333.612 47.917 338.033 47.917C341.041 47.917 342.661 46.8414 342.661 45.0488V44.9292C342.661 43.1967 341.331 42.2408 335.835 40.9261C327.215 38.8946 320.562 36.3852 320.562 27.7814V27.6619C320.562 19.8946 326.521 14.2782 336.24 14.2782C342.785 14.2782 347.97 16.0068 352.245 19.3098C352.619 19.5982 352.692 20.1413 352.422 20.5341L347.797 27.2801C347.517 27.6894 346.97 27.7856 346.562 27.5115C343.062 25.1512 339.304 23.8978 335.95 23.8978C333.231 23.8978 331.901 25.0927 331.901 26.5865V26.7059C331.901 28.6179 333.289 29.4544 338.901 30.7689C348.216 32.8601 354 35.967 354 43.7942V43.9135C354 52.4579 347.462 57.5365 337.628 57.5365Z" fill="#9AA1B0"></path></svg>
        </div>

      </header>

      <!-- 2. ALBUM ARTWORK CARD WITH AUDIO SPECTRUM -->
      <div class="artwork-hero-wrapper">
        <div class="artwork-card" :class="{ 'is-playing': playerState === 'playing' }">
          <img 
            v-if="coverUrl" 
            :src="coverUrl" 
            class="artwork-image" 
            alt="Track Artwork"
            referrerPolicy="no-referrer"
          />
          <div v-else class="artwork-placeholder">
            <svg class="w-20 h-20 text-purple-400 opacity-60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke-dasharray="3 3" />
            </svg>
          </div>

          <!-- Real-Time Audio Frequency Visualizer Canvas at Artwork Footer -->
          <div class="artwork-spectrum-bar">
            <canvas ref="canvasRef" class="spectrum-canvas"></canvas>
          </div>
        </div>
      </div>

      <!-- 3. PROGRESS BAR & TIMERS -->
      <div class="progress-section">
        <div class="progress-slider-area" @click="handleProgressClick">
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: progressPercent + '%' }">
              <div class="progress-glow-head"></div>
            </div>
          </div>
        </div>
        <div class="time-labels font-mono">
          <span class="time-cur">{{ formattedCurrentTime }}</span>
          <span class="time-dur">{{ formattedDuration }}</span>
        </div>
      </div>

      <!-- 4. TRACK METADATA & ARTIST INFO -->
      <div class="track-info-section">
        <div class="title-row">
          <h1 class="track-title text-truncate" :title="trackTitle">
            {{ trackTitle }}
          </h1>
        </div>

        <div class="artist-row">
          <span class="artist-name text-truncate">{{ trackArtist }}</span>
          <span class="verified-badge" title="Verified Audius Artist">
            <svg class="w-4 h-4 fill-purple-500 text-white" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </span>
        </div>
      </div>

      <!-- 5. MAIN PLAYBACK CONTROLS (SHUFFLE, PREV, PLAY/PAUSE, NEXT, REPEAT) -->
      <div class="controls-main-bar">
        <!-- Shuffle -->
        <button 
          class="ctrl-btn" 
          :class="{ 'is-active': isShuffle }"
          @click="playerSdk.openTrackKebab()"
          title="Shuffle"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class="css-0 harmony-10rzb7m" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.26316 12.0002C7.26316 13.4536 6.08496 14.6318 4.63158 14.6318C3.1782 14.6318 2 13.4536 2 12.0002C2 10.5469 3.1782 9.36865 4.63158 9.36865C6.08496 9.36865 7.26316 10.5469 7.26316 12.0002ZM14.6316 12.0002C14.6316 13.4536 13.4534 14.6318 12 14.6318C10.5466 14.6318 9.36842 13.4536 9.36842 12.0002C9.36842 10.5469 10.5466 9.36865 12 9.36865C13.4534 9.36865 14.6316 10.5469 14.6316 12.0002ZM19.3684 14.6318C20.8218 14.6318 22 13.4536 22 12.0002C22 10.5469 20.8218 9.36865 19.3684 9.36865C17.915 9.36865 16.7368 10.5469 16.7368 12.0002C16.7368 13.4536 17.915 14.6318 19.3684 14.6318Z"fill="white"></path></svg>
        </button>

        <!-- Previous Track -->
        <button 
          class="ctrl-btn prev-btn" 
          :disabled="prevDisabled" 
          @click="playerSdk.prev()" 
          title="Previous Track"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" class="css-0" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M3.36364 17C2.61052 17 2 16.4564 2 15.7857V8.21427C2 7.54365 2.61052 7 3.36364 7C4.11675 7 4.72727 7.54365 4.72727 8.21427V10.9573L12.3726 7.10799C12.8236 6.88094 13.3711 7.024 13.6483 7.42383L13.7073 7.5206C13.7802 7.65744 13.8182 7.80927 13.8182 7.96335L13.8182 10.7391L20.6339 7.10799C21.0601 6.88094 21.5775 7.024 21.8395 7.42383L21.8953 7.5206C21.9641 7.65744 22 7.80927 22 7.96335V16.0369C22 16.5688 21.581 17 21.0641 17C20.9144 17 20.7668 16.963 20.6339 16.8922L13.8182 13.2618V16.0369C13.8182 16.5333 13.4319 16.9421 12.9357 16.9943L12.8278 17C12.6694 17 12.5133 16.963 12.3726 16.8922L4.72727 13.0436V15.7857C4.72727 16.4169 4.18647 16.9356 3.49496 16.9944L3.36364 17Z" fill="white"></path></svg>
        </button>

        <!-- Main Play/Pause Button -->
        <button 
          class="play-main-circle" 
          :class="{ 'is-playing': playerState === 'playing' }"
          @click="togglePlay"
          title="Play / Pause"
        >
          <svg v-if="playerState === 'playing'" class="w-9 h-9 text-white" viewBox="0 0 24 24" fill="white">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
          <svg v-else class="w-9 h-9 text-white ml-1" viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>

        <!-- Next Track -->
        <button 
          class="ctrl-btn next-btn" 
          :disabled="nextDisabled" 
          @click="playerSdk.next()" 
          title="Next Track"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#ffffff" xmlns="http://www.w3.org/2000/svg" class="css-0" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M20.6364 7C21.3895 7 22 7.54365 22 8.21427V15.7857C22 16.4564 21.3895 17 20.6364 17C19.8832 17 19.2727 16.4564 19.2727 15.7857V13.0427L11.6274 16.892C11.1764 17.1191 10.6289 16.976 10.3517 16.5762L10.2927 16.4794C10.2198 16.3426 10.1818 16.1907 10.1818 16.0367V13.2609L3.36611 16.892C2.93987 17.1191 2.42248 16.976 2.16051 16.5762L2.10474 16.4794C2.03592 16.3426 2 16.1907 2 16.0367V7.96315C2 7.43121 2.41902 7 2.9359 7C3.08562 7 3.23315 7.03697 3.36612 7.10779L10.1818 10.7382V7.96315C10.1818 7.46668 10.5681 7.05794 11.0643 7.00565L11.1722 7C11.3306 7 11.4867 7.03697 11.6274 7.10779L19.2727 10.9564V8.21427C19.2727 7.58309 19.8135 7.0644 20.505 7.00556L20.6364 7Z" fill="#ffffff"></path></svg>
        </button>

        <!-- Repeat Mode -->
        <button 
          class="ctrl-btn" 
          :class="{ 'is-active': repeatMode !== 'none' }" 
          @click="toggleRepeat" 
          title="Repeat Mode"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3" />
          </svg>
          <span v-if="repeatMode === 'track'" class="repeat-one-badge">1</span>
        </button>
      </div>

      <!-- 6. ACTION & SOCIAL TOOLBAR -->
      <div class="action-toolbar">
        <button 
          class="tool-btn" 
          :class="{ 'is-liked': reaction === 'LIKE' }" 
          @click="toggleLike"
          title="Favorite Track"
        >
          <svg class="w-6 h-6" viewBox="0 0 24 24" :fill="reaction === 'LIKE' ? '#E100FF' : 'none'" stroke="currentColor" stroke-width="2">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span class="tool-label">Favorite</span>
        </button>

        <button 
          class="tool-btn" 
          @click="playerSdk.openPlaylist()"
          title="Queue / Playlist"
        >
          <svg viewBox="0 0 24 24" fill="#9AA1B0" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="css-f5379f harmony-0"><path fill-rule="evenodd" clip-rule="evenodd" d="M21 18.25C21.5523 18.25 22 18.6977 22 19.25V19.75C22 20.3023 21.5523 20.75 21 20.75H3C2.44772 20.75 2 20.3023 2 19.75V19.25C2 18.6977 2.44772 18.25 3 18.25H21ZM2 10.25C2 9.42595 2.94076 8.95557 3.6 9.45L5.93333 11.2C6.46667 11.6 6.46667 12.4 5.93333 12.8L3.6 14.55C2.94076 15.0444 2 14.574 2 13.75V10.25ZM21 13.25C21.5523 13.25 22 13.6977 22 14.25V14.75C22 15.3023 21.5523 15.75 21 15.75H10.5C9.94772 15.75 9.5 15.3023 9.5 14.75V14.25C9.5 13.6977 9.94772 13.25 10.5 13.25H21ZM21 8.25C21.5523 8.25 22 8.69772 22 9.25V9.75C22 10.3023 21.5523 10.75 21 10.75H10.5C9.94772 10.75 9.5 10.3023 9.5 9.75V9.25C9.5 8.69772 9.94772 8.25 10.5 8.25H21ZM21 3.25C21.5523 3.25 22 3.69772 22 4.25V4.75C22 5.30228 21.5523 5.75 21 5.75H3C2.44772 5.75 2 5.30228 2 4.75V4.25C2 3.69772 2.44772 3.25 3 3.25H21Z" fill="#9AA1B0"></path></svg>
          <span class="tool-label">Playlist</span>
        </button>

        <button class="tool-btn" @click="handleMinimize" title="Collapse Player">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 9l-7 7-7-7" />
          </svg>
          <span class="tool-label">Collapse</span>
        </button>
      </div>
    </div>

    <!-- TOAST NOTIFICATION -->
    <transition name="toast-fade">
      <div v-if="toastMessage" class="audius-toast font-mono">
        <span>{{ toastMessage }}</span>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { playerSdk } from '@bilbomusic/player-plugin-sdk'

// -----------------------------------------------------------------
// 1. STATE VARIABLES
// -----------------------------------------------------------------
const theme = ref('dark')
const playerState = ref('paused')
const reaction = ref('NONE')
const repeatMode = ref('none')
const isShuffle = ref(false)

const currentTrack = ref(null)
const playedMs = ref(0)
const durationMs = ref(225000)

const nextDisabled = ref(false)
const prevDisabled = ref(true)
const hasQueue = ref(true)

const toastMessage = ref('')
let toastTimer = null

// Top UI Height
const topPanelRef = ref(null)
const topUiHeight = ref(60)

const updateTopUiHeight = () => {
  if (topPanelRef.value) {
    topUiHeight.value = topPanelRef.value.offsetHeight || 60
    if (typeof playerSdk.updateTopUiHeight === 'function') {
      playerSdk.updateTopUiHeight(topUiHeight.value)
    }
  }
}

// Canvas Visualizer
const canvasRef = ref(null)
let audioFrequencies = new Array(32).fill(0.15)
let animFrameId = null

// -----------------------------------------------------------------
// 2. COMPUTED HELPERS
// -----------------------------------------------------------------
const trackTitle = computed(() => currentTrack.value?.title || 'Escape Velocity')
const trackArtist = computed(() => currentTrack.value?.artists || currentTrack.value?.artist || 'Jacuzzi')

const coverUrl = computed(() => {
  if (!currentTrack.value?.cover) return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'
  if (typeof currentTrack.value.cover === 'string') return currentTrack.value.cover
  return currentTrack.value.cover.crop || currentTrack.value.cover.resized || currentTrack.value.cover.original || null
})

const currentTimeSec = computed(() => Math.floor((playedMs.value || 0) / 1000))
const durationSec = computed(() => Math.max(1, Math.floor((durationMs.value || 225000) / 1000)))

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

// -----------------------------------------------------------------
// 3. ACTIONS & TOASTS
// -----------------------------------------------------------------
function handleToast(msg) {
  toastMessage.value = msg
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
  }, 2000)
}

function toggleShuffle() {
  isShuffle.value = !isShuffle.value
  handleToast(isShuffle.value ? 'Shuffle ON' : 'Shuffle OFF')
}

function handleMinimize() {
  playerSdk.collapse()
}

// -----------------------------------------------------------------
// 4. CANVAS VISUALIZER
// -----------------------------------------------------------------
function startSpectrumVisualizer() {
  if (!canvasRef.value) return
  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')

  const render = () => {
    animFrameId = requestAnimationFrame(render)

    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
      canvas.width = canvas.clientWidth || 320
      canvas.height = canvas.clientHeight || 32
    }

    const w = canvas.width
    const h = canvas.height
    ctx.clearRect(0, 0, w, h)

    const isPlaying = playerState.value === 'playing'
    const barCount = 32
    const gap = 2
    const barWidth = (w - (barCount - 1) * gap) / barCount

    for (let i = 0; i < barCount; i++) {
      const rawVal = isPlaying 
        ? (audioFrequencies[i % audioFrequencies.length] || 0.15) 
        : (Math.sin(Date.now() * 0.0025 + i * 0.25) * 0.12 + 0.15)

      const barHeight = Math.max(3, rawVal * h * 0.9)
      const x = i * (barWidth + gap)
      const y = h - barHeight

      const grad = ctx.createLinearGradient(0, h, 0, 0)
      grad.addColorStop(0, 'rgba(126, 27, 204, 0.3)')
      grad.addColorStop(0.6, '#A200FF')
      grad.addColorStop(1, '#E100FF')

      ctx.fillStyle = grad
      ctx.fillRect(x, y, barWidth, barHeight)
    }
  }

  render()
}

// -----------------------------------------------------------------
// 5. SDK INTEGRATION
// -----------------------------------------------------------------
function togglePlay() {
  if (playerState.value === 'playing') {
    playerSdk.pause()
  } else {
    playerSdk.play()
  }
}

function toggleLike() {
  // const nextReaction = reaction.value === 'LIKE' ? 'NONE' : 'LIKE'
  // reaction.value = nextReaction
  // playerSdk.setReaction(nextReaction)

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
  playerSdk.seek(newPos)
}

// SDK Event Listeners
const onInit = (state) => {
  if (!state) return
  if (state.theme) theme.value = state.theme

  if (state?.styles) {
    const root = document.documentElement;

    Object.entries(state.styles).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        root.style.setProperty(key, value);
      }
    });
    nextTick(() => {
      updateTopUiHeight()
    })
  }

  const pane = state.panes?.default
  if (pane) {
    if (pane.track) {
      currentTrack.value = pane.track
      durationMs.value = pane.track.duration || 225000
    }
    playedMs.value = pane.position || 0
    if ('state' in pane) playerState.value = pane.state || 'paused'
    if ('reaction' in pane) reaction.value = pane.reaction || 'NONE'
    if ('repeat' in pane) repeatMode.value = pane.repeat || 'none'
    if ('nextDisabled' in pane) nextDisabled.value = !!pane.nextDisabled
    if ('prevDisabled' in pane) prevDisabled.value = !!pane.prevDisabled
    if ('hasQueue' in pane) hasQueue.value = !!pane.hasQueue
  }
  nextTick(() => updateTopUiHeight())
}

const onOpen = (payload) => {
  if (payload?.track) {
    currentTrack.value = payload.track
    durationMs.value = payload.track.duration || 225000
    playedMs.value = payload.position || 0
  }
  nextTick(() => updateTopUiHeight())
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
  const blockSize = Math.floor(dataArray.length / 32)
  const newSpec = []
  for (let i = 0; i < 32; i++) {
    let sum = 0
    const start = i * blockSize
    for (let j = start; j < start + blockSize; j++) {
      sum += dataArray[j]
    }
    newSpec.push(sum / blockSize / 255)
  }
  audioFrequencies = newSpec
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

  window.addEventListener('resize', updateTopUiHeight)

  nextTick(() => {
    updateTopUiHeight()
    startSpectrumVisualizer()
  })
})

onBeforeUnmount(() => {
  playerSdk.off('init', onInit)
  playerSdk.off('open', onOpen, 'default')
  playerSdk.off('position', onPosition)
  playerSdk.off('state', onState, 'default')
  playerSdk.off('theme', onTheme)
  playerSdk.off('reaction', onReaction)
  playerSdk.off('repeat', onRepeat)
  playerSdk.off('change', onChange)
  playerSdk.off('audioFrame', onAudioFrame, 'default')

  window.removeEventListener('resize', updateTopUiHeight)

  if (animFrameId) cancelAnimationFrame(animFrameId)
})
</script>

<style scoped>
/* MAIN CONTAINER & THEME */
.audius-app-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 540px;
  background-color: #0c0218;
  color: #ffffff;
  overflow: hidden;
  user-select: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  display: flex;
  justify-content: center;
  box-sizing: border-box;
  padding-top: calc(var(--max-safe-area-inset-top, var(--tg-safe-area-inset-top, 0px)) + var(--max-content-safe-area-inset-top, var(--tg-content-safe-area-inset-top, 0px)));

  -webkit-tap-highlight-color: transparent !important;
  -webkit-touch-callout: none;
  user-select: none;
}

/* BACKGROUND AMBIENT GLOW */
.audius-bg-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
}

.top-orb {
  top: -20%;
  left: 50%;
  transform: translateX(-50%);
  width: 500px;
  height: 400px;
  background: radial-gradient(circle, rgba(225, 0, 255, 0.28) 0%, transparent 70%);
}

.bottom-orb {
  bottom: -20%;
  right: -10%;
  width: 450px;
  height: 450px;
  background: radial-gradient(circle, rgba(126, 27, 204, 0.22) 0%, transparent 70%);
}

.center-orb {
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, rgba(162, 0, 255, 0.15) 0%, transparent 70%);
}

/* MAIN PLAYER SCREEN */
.audius-player-screen {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 440px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px 22px 24px;
  box-sizing: border-box;
  overflow-y: auto;
  gap: 16px;
}

/* 1. TOP NAVBAR */
.audius-header {
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-icon-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.85);
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.nav-icon-btn:hover:not(:disabled) {
  color: #ffffff;
  background: rgba(225, 0, 255, 0.2);
  border-color: rgba(225, 0, 255, 0.4);
  box-shadow: 0 0 12px rgba(225, 0, 255, 0.3);
}

.nav-icon-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.header-brand-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.audius-official-logo {
  width: 26px;
  height: 26px;
  filter: drop-shadow(0 0 8px rgba(225, 0, 255, 0.8));
}

.brand-text {
  font-size: 16px;
  letter-spacing: 1.5px;
  background: linear-gradient(90deg, #FFFFFF, #E100FF);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* 2. ARTWORK CARD */
.artwork-hero-wrapper {
  display: flex;
  justify-content: center;
  padding: 4px 0;
  max-width: 250px;
  aspect-ratio: 1 / 1;
  margin: auto;
}

.artwork-card {
  position: relative;
  width: 100%;
  max-width: 320px;
  aspect-ratio: 1 / 1;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(225, 0, 255, 0.3);
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.7), 0 0 35px rgba(162, 0, 255, 0.3);
  background: #160828;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.artwork-card.is-playing {
  box-shadow: 0 22px 55px rgba(0, 0, 0, 0.8), 0 0 50px rgba(225, 0, 255, 0.5);
  border-color: rgba(225, 0, 255, 0.6);
}

.artwork-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.artwork-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.artwork-spectrum-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 32px;
  background: linear-gradient(0deg, rgba(12, 2, 24, 0.85) 0%, transparent 100%);
  display: flex;
  align-items: flex-end;
}

.spectrum-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

/* 3. PROGRESS BAR */
.progress-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 4px;
  -webkit-tap-highlight-color: transparent !important;
  -webkit-touch-callout: none;
  user-select: none;
}

.progress-slider-area {
  cursor: pointer;
  padding: 6px 0;
}

.progress-track {
  position: relative;
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  position: relative;
  height: 100%;
  background: linear-gradient(90deg, #7E1BCC, #A200FF, #E100FF);
  border-radius: 4px;
  transition: width 0.1s linear;
}

.progress-glow-head {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 8px;
  background: #FFFFFF;
  box-shadow: 0 0 10px #FFFFFF, 0 0 15px #E100FF;
}

.time-labels {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.55);
}

/* 4. TRACK METADATA */
.track-info-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: center;
  padding: 0 4px;
}

.track-title {
  font-size: 22px;
  font-weight: 900;
  color: #ffffff;
  margin: 0;
  line-height: 1.2;
  letter-spacing: -0.3px;
}

.artist-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.artist-name {
  font-size: 15px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.75);
}

.verified-badge {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 5. MAIN PLAYBACK CONTROLS */
.controls-main-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
}

.ctrl-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.75);
  cursor: pointer;
  padding: 10px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.2s ease;
}
.ctrl-btn svg {
  min-width: 24px;
  min-height: 24px;
}

.ctrl-btn:hover:not(:disabled) {
  color: #ffffff;
  transform: scale(1.1);
}

.ctrl-btn.is-active {
  color: #E100FF;
}

.ctrl-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.repeat-one-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 9px;
  font-weight: 900;
  color: #E100FF;
}

.play-main-circle {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: linear-gradient(135deg, #E100FF, #A200FF, #7E1BCC);
  border: 1px solid rgba(255, 255, 255, 0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 28px rgba(225, 0, 255, 0.6);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.play-main-circle:hover {
  transform: scale(1.06);
  box-shadow: 0 0 38px rgba(225, 0, 255, 0.85);
}

.play-main-circle:active {
  transform: scale(0.95);
}

/* 6. ACTION TOOLBAR */
.action-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 8px 12px;
  backdrop-filter: blur(12px);
}

.tool-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.65);
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  transition: all 0.15s;
}
.tool-btn svg {
  width: 32px;
  height: 32px;
}


.tool-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
}

.tool-btn.is-liked {
  color: #E100FF;
}

.tool-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.2px;
}

/* TOAST */
.audius-toast {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(18, 6, 32, 0.92);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(225, 0, 255, 0.5);
  color: #ffffff;
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: bold;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
  z-index: 100;
  pointer-events: none;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toast-fade-enter-active, .toast-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-fade-enter-from, .toast-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px);
}
</style>
