<template>
  <div class="gunwest-container" :class="[theme]">
    <!-- TOP HEADER: Compact Glassmorphic Topbar for all aspect ratios (74px right padding for SDK buttons overlay) -->
    <header ref="topPanelRef" class="gunwest-topbar" :style="topbarSafeStyle">
      <!-- Live Track Widget -->
      <div class="top-track-card" @click="playerSdk.openTrackKebab()" title="Управление треком">
        <div class="top-cover-box" :class="{ 'is-playing': playerState === 'playing' }">
          <img v-if="coverUrl" :src="coverUrl" class="top-cover-img" alt="Cover" />
          <div v-else class="top-cover-fallback">
            <svg class="top-music-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 18V5l12-2v13M9 9l12-2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <!-- Playing Waves -->
          <div v-if="playerState === 'playing'" class="mini-equalizer">
            <span class="eq-bar bar-1"></span>
            <span class="eq-bar bar-2"></span>
            <span class="eq-bar bar-3"></span>
          </div>
        </div>

        <div class="top-track-meta">
          <div class="top-channel-badge font-sans">
            <span class="status-pulse-dot" :class="{ 'is-active': isOnline }"></span>
            <span class="channel-title">GUNWEST FA CHAT</span>
            <span class="tg-verified-badge" title="Подтвержденный канал">
              <svg viewBox="0 0 24 24" fill="currentColor" class="tg-verify-icon">
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.8 14.2l-3.6-3.6 1.4-1.4 2.2 2.2 6.2-6.2 1.4 1.4-7.6 7.6z"/>
              </svg>
            </span>
          </div>
          <div class="top-track-title text-truncate" :title="trackTitle">
            {{ trackTitle }}
          </div>
          <div class="top-track-artist text-truncate">
            {{ trackArtist }}
          </div>
        </div>
      </div>
    </header>

    <!-- MAIN CHAT VIEWPORT -->
    <main class="chat-viewport">
      <!-- Ambient Gradient Background -->
      <div class="ambient-mesh-bg">
        <div class="mesh-orb orb-purple"></div>
        <div class="mesh-orb orb-pink"></div>
        <div class="mesh-orb orb-cyan"></div>
        <div class="mesh-grid"></div>
      </div>

      <!-- Messages Stream -->
      <div ref="chatScrollRef" class="messages-container" @scroll="handleScroll">
        <!-- Live Chat Badge -->
        <div class="chat-date-separator font-mono">
          <span class="date-line"></span>
          <span class="date-chip">ПРЯМОЙ ЭФИР ГАНВЕСТА</span>
          <span class="date-line"></span>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="chat-status-card">
          <div class="modern-spinner"></div>
          <span class="status-text font-mono">ПОДКЛЮЧЕНИЕ К ЧАТУ FIREBASE...</span>
        </div>

        <!-- Connection Error Alert -->
        <div v-if="connectionError" class="chat-notice-card error font-mono">
          <div class="notice-icon">⚠️</div>
          <div class="notice-info">
            <div class="notice-title">СБОЙ ПОДКЛЮЧЕНИЯ</div>
            <div class="notice-desc">{{ connectionError }}</div>
          </div>
          <button class="retry-pill-btn" @click="initFirebaseChat">ПОВТОРИТЬ</button>
        </div>

        <!-- Empty Chat Placeholder -->
        <div v-if="!isLoading && chatMessages.length === 0" class="empty-chat-card font-sans">
          <div class="empty-vector-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" class="w-8 h-8">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="empty-card-title">ЧАТ ГАНВЕСТА ГОТОВ К ДРИПУ</div>
          <div class="empty-card-sub font-mono">Отправь первое «ПЭПЭ» или «ШНЕЙНЕ» в прямой эфир!</div>
        </div>

        <!-- Message List -->
        <div 
          v-for="msg in chatMessages" 
          :key="msg.id || msg.localId" 
          class="message-row"
          :class="{ 'is-mine': msg.userId === currentUserId }"
        >
          <!-- User Avatar -->
          <div class="msg-avatar-box" v-html="msg.avatarSvg || getAvatarSvgForUser(msg.userId)"></div>

          <!-- Message Bubble -->
          <div class="msg-glass-bubble" :class="getPhraseThemeClass(msg.text)">
            <!-- Sender Info -->
            <div class="msg-meta-header font-sans">
              <span class="msg-author-name">{{ msg.userName || 'Ганвест Нооб' }}</span>
              <div class="msg-time-meta font-mono">
                <span class="msg-time">{{ formatTime(msg.timestamp) }}</span>
                <span v-if="msg.userId === currentUserId" class="tg-read-checks" title="Прочитано">
                  <svg viewBox="0 0 18 12" fill="none" class="tg-check-svg">
                    <path d="M1.5 6.5L5 10L12 1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M6 6.5L9.5 10L16.5 1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              </div>
            </div>

            <!-- Meme Slang Phrase Content (Sleek Vector Badge + Typography) -->
            <div class="msg-slang-body font-mono">
              <div class="msg-phrase-badge" v-html="getPhraseSvgIcon(msg.text)"></div>
              <span class="msg-phrase-text">{{ msg.text }}</span>
            </div>

            <!-- Attached Track Card (Without 'Вайб трек' label) -->
            <div 
              v-if="msg.trackData" 
              class="attached-track-pill font-sans"
              @click="handleTrackCardClick(msg.trackData)"
              title="Нажмите для взаимодействия с треком"
            >
              <div class="pill-cover-box">
                <img v-if="msg.trackData.cover" :src="msg.trackData.cover" alt="Cover" />
                <div v-else class="pill-cover-fallback">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
                    <path d="M9 18V5l12-2v13M9 9l12-2" />
                  </svg>
                </div>
              </div>

              <div class="pill-track-info">
                <div class="pill-track-title text-truncate">{{ msg.trackData.title }}</div>
                <div class="pill-track-artist text-truncate">{{ msg.trackData.artist }}</div>
              </div>

              <div class="pill-play-action">
                <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Scroll to Bottom Button -->
      <button 
        v-if="showScrollDownBtn" 
        class="floating-scroll-btn font-mono" 
        @click="scrollToBottom(true)"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="w-4 h-4">
          <path d="M19 9l-7 7-7-7" />
        </svg>
        <span>ВНИЗ</span>
      </button>
    </main>

    <!-- COMPOSER CONTROLS PANEL (VECTOR PHRASE BUTTONS) -->
    <div class="chat-composer-deck font-sans" @click.stop @touchstart.stop>
      <!-- User Profile Badge, Track Attachment & SFX Bar -->
      <div class="composer-top-bar">
        <!-- Current User Profile Avatar Badge (Relocated from Top Header) -->
        <div class="user-chip-container" :title="'Ваш ID: ' + currentUserId">
          <div class="avatar-ring-glow">
            <div class="user-avatar-mini" v-html="userAvatarSvg"></div>
          </div>
          <div class="user-chip-details">
            <div class="user-chip-name text-truncate">{{ userGunwestName }}</div>
            <div class="user-chip-status font-mono">
              <span class="status-indicator"></span>ONLINE
            </div>
          </div>
        </div>

        <!-- Concise Track Attachment Button -->
        <button 
          class="attach-toggle-pill" 
          :class="{ 'is-active': isTrackAttached }"
          @click="toggleTrackAttachment"
          :title="isTrackAttached ? 'Открепить трек' : 'Прикрепить трек к сообщению'"
        >
          <span class="attach-status-icon">
            <svg v-if="isTrackAttached" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="w-3.5 h-3.5">
              <path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </span>
          <span class="attach-label text-truncate font-mono">
            {{ isTrackAttached ? trackTitle : 'Прикрепить трек' }}
          </span>
          <svg v-if="isTrackAttached" class="attach-remove-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12" stroke-linecap="round"/>
          </svg>
        </button>

        <!-- SFX Mute Switch -->
       <!--  <button 
          class="sfx-toggle-pill" 
          :class="{ 'is-muted': isMuted }"
          @click="isMuted = !isMuted" 
          :title="isMuted ? 'Включить звуковые эффекты' : 'Выключить звуковые эффекты'"
        >
          <svg v-if="!isMuted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" stroke-linecap="round"/>
          </svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"/>
            <line x1="23" y1="9" x2="17" y2="15" stroke-linecap="round"/>
            <line x1="17" y1="9" x2="23" y2="15" stroke-linecap="round"/>
          </svg>
        </button> -->
      </div>

      <!-- 5 STRICT SLANG ACTION PILLS WITH TELEGRAM GLASS STYLING -->
      <div class="slang-pills-grid">
        <button 
          v-for="phrase in allowedPhrases" 
          :key="phrase.id"
          class="slang-action-btn"
          :class="[phrase.themeClass, { 'is-sending': sendingPhrase === phrase.text }]"
          @click="sendMemeMessage(phrase.text)"
          :disabled="isSending"
          :title="'Отправить «' + phrase.text + '»'"
        >
          <div class="slang-icon-wrap" v-html="phrase.svg"></div>
          <span class="slang-label font-mono">{{ phrase.text }}</span>
        </button>
      </div>
    </div>

    <!-- BOTTOM MEDIA PLAYER DECK -->
    <div class="player-media-deck" :class="{ 'is-collapsed': isDeckCollapsed }">
      <!-- Track Progress Bar -->
      <div v-show="!isDeckCollapsed" class="player-progress-wrapper" @click="handleProgressClick">
        <div class="player-progress-bar">
          <div class="player-progress-fill" :style="{ width: progressPercent + '%' }"></div>
          <div class="player-progress-thumb" :style="{ left: progressPercent + '%' }"></div>
        </div>
        <div class="player-time-row font-mono">
          <span>{{ formattedCurrentTime }}</span>
          <span class="time-current-readout"></span>
          <span>{{ formattedDuration }}</span>
        </div>
      </div>

      <!-- Controls Row -->
      <div class="player-controls-row font-mono">
        <!-- Collapse Toggle -->
        <button 
          class="media-icon-btn collapse-toggle"
          :class="{ 'is-collapsed': isDeckCollapsed }"
          @click="toggleCollapseDeck"
          :title="isDeckCollapsed ? 'Развернуть плеер' : 'Свернуть плеер'"
        >
          <svg class="media-svg transition-transform duration-300" :class="{ 'rotate-180': isDeckCollapsed }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <!-- Like Heart -->
        <button 
          class="media-icon-btn like-btn"
          :class="{ 'is-liked': reaction === 'LIKE' }"
          @click="toggleLike"
          title="Нравится"
        >
          <svg class="media-svg" viewBox="0 0 24 24" :fill="reaction === 'LIKE' ? '#EC4899' : 'none'" stroke="currentColor" stroke-width="2.2">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>

        <!-- Prev Track -->
        <button 
          class="media-icon-btn" 
          :disabled="prevDisabled" 
          @click="playerSdk.prev()" 
          title="Предыдущий трек"
        >
          <svg class="media-svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>

        <!-- Main Play / Pause Hero Button -->
        <button 
          class="media-hero-play-btn font-sans"
          :class="playerState === 'playing' ? 'is-playing' : 'is-paused'"
          @click="togglePlay"
        >
          <svg v-if="playerState === 'playing'" class="hero-play-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
          <svg v-else class="hero-play-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
          <span class="hero-play-label">{{ playerState === 'playing' ? 'ПАУЗА' : 'ИГРАТЬ' }}</span>
        </button>

        <!-- Next Track -->
        <button 
          class="media-icon-btn" 
          :disabled="nextDisabled" 
          @click="playerSdk.next()" 
          title="Следующий трек"
        >
          <svg class="media-svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
          </svg>
        </button>

        <!-- Repeat Mode -->
        <button 
          class="media-icon-btn repeat-mode-btn" 
          :class="{ 'is-active': repeatMode !== 'none' }"
          @click="toggleRepeat" 
          title="Повтор"
        >
          <svg class="media-svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
          </svg>
          <span v-if="repeatMode === 'track'" class="repeat-tag">1</span>
        </button>

        <!-- Queue Playlist Button -->
        <button 
          class="media-icon-btn queue-playlist-btn" 
          :disabled="!hasQueue" 
          @click="playerSdk.openPlaylist()" 
          title="Очередь треков"
        >
          <svg class="media-svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18C16.69 14.07 16.35 14 16 14c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { playerSdk } from '@bilbomusic/player-plugin-sdk'
import { initializeApp, getApps, getApp } from 'firebase/app'
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limitToLast, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore'

// -----------------------------------------------------------------
// 1. FIREBASE INITIALIZATION
// -----------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCwyZ5lZ_dZR0OVYh86f-U1G41qTBFiiEU",
  authDomain: "bilbo-fa-pepe.firebaseapp.com",
  projectId: "bilbo-fa-pepe",
  storageBucket: "bilbo-fa-pepe.firebasestorage.app",
  messagingSenderId: "220519487980",
  appId: "1:220519487980:web:72928302f12320bc39c8c9"
}

let app = null
let db = null

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
  db = getFirestore(app)
} catch (e) {
  console.warn('[Gunwest Chat] Firebase init error:', e)
}

// -----------------------------------------------------------------
// 2. STATE & USER IDENTITY
// -----------------------------------------------------------------
const topPanelRef = ref(null)
const chatScrollRef = ref(null)

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
const isDeckCollapsed = ref(false)

// Chat specific state
const chatMessages = ref([])
const isLoading = ref(true)
const isSending = ref(false)
const sendingPhrase = ref('')
const isTrackAttached = ref(false)
const isMuted = ref(false)
const isOnline = ref(true)
const connectionError = ref('')
const showScrollDownBtn = ref(false)

// User ID & Unique Gunwest Identity
const currentUserId = ref('')
const userGunwestName = ref('')
const userAvatarSvg = ref('')

// Allowed phrases strictly specified by prompt with high-end vector SVG icons:
// «пэпэ», «шнейне», «фа», «втфа», «кхе-кхе»
const allowedPhrases = [
  { 
    id: 'pepe', 
    text: 'пэпэ', 
    themeClass: 'theme-pepe',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  },
  { 
    id: 'shneine', 
    text: 'шнейне', 
    themeClass: 'theme-shneine',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  },
  { 
    id: 'fa', 
    text: 'фа', 
    themeClass: 'theme-fa',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  },
  { 
    id: 'vtfa', 
    text: 'втфа', 
    themeClass: 'theme-vtfa',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><path d="M8 20v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M12 4a8 8 0 0 0-8 8c0 3.2 1.9 6 4.7 7.3L12 20l3.3-.7C18.1 18 20 15.2 20 12a8 8 0 0 0-8-8z" stroke-linecap="round"/></svg>`
  },
  { 
    id: 'kkhe', 
    text: 'кхе-кхе', 
    themeClass: 'theme-kkhe',
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m8.59 11.41A2 2 0 1 0 11 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
  }
]

// -----------------------------------------------------------------
// 3. DETERMINISTIC UNIQUE USER ID & GUNWEST IDENTITY GENERATOR
// -----------------------------------------------------------------
function getOrCreateUserId() {
  let storedId = ''
  try {
    storedId = localStorage.getItem('gunwest_chat_user_id') || ''
  } catch (e) {
    // Sandbox fallback
  }

  if (!storedId) {
    const rand = Math.random().toString(36).substring(2, 10) + Date.now().toString(36)
    storedId = 'user_' + rand
    try {
      localStorage.setItem('gunwest_chat_user_id', storedId)
    } catch (e) {}
  }
  return storedId
}

function stringToSeed(str) {
  let hash = 0
  if (!str) return 12345
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function generateGunwestName(userId) {
  const seed = stringToSeed(userId)
  
  const prefixes = [
    'Ганвест', 'Gunwest', 'Шнейне-Бро', 'Фа-Кинг', 'Пэпэ-Дрип', 
    'Втфа-Босс', 'Ганбичи-Сваг', 'Кхе-Кхе-Гангста', 'Трэп-Ганвест', 'Пимп-Шнейне', 
    'Брейнрот-Гун', 'Тату-Ганвест', 'Гриллз-Мастер', 'Вайб-Пэпэ', 'Фа-Легенда', 
    'Дрип-Шнейне', 'Эл-Пепе', 'Гун-Флексер', 'Аутсайдер-Фа', 'Шнейне-Кинг'
  ]

  const titles = [
    'TattooGod', 'GrillzMaster', 'DripLord', 'FlexKing', 'TrapStar', 
    'PepeLegend', 'ShneineBooster', 'FaRider', 'VtfaChaser', 'KkheGuru', 
    'AuraDemon', 'SwagBoss', 'LilPepe', 'BigShneine', 'FaVibe', 
    'VtfaMaster', 'SlangDemon', 'MemeGenius', 'BrainrotPro', 'TattooMaster'
  ]

  const prefixIndex = seed % prefixes.length
  const titleIndex = (Math.floor(seed / prefixes.length)) % titles.length
  
  // Unique 4-digit code (1000 to 9999) from seed
  const numberTag = (seed % 9000) + 1000

  return `${prefixes[prefixIndex]} ${titles[titleIndex]} #${numberTag}`
}

function getAvatarSvgForUser(userId) {
  const seed = stringToSeed(userId)
  
  const bgGradients = [
    ['#8b5cf6', '#ec4899'],
    ['#06b6d4', '#3b82f6'],
    ['#f59e0b', '#ef4444'],
    ['#10b981', '#059669'],
    ['#6366f1', '#a855f7'],
    ['#d946ef', '#831843']
  ]
  const hairColors = ['#ff007f', '#00f0ff', '#ffd700', '#00ff66', '#9900ff', '#ff3300']
  const tattoos = ['⚡ FA', '♥', 'ПЭПЭ', '✝', '🔥', '💀']

  const grad = bgGradients[seed % bgGradients.length]
  const hair = hairColors[(seed >> 3) % hairColors.length]
  const tat = tattoos[(seed >> 5) % tattoos.length]
  const gradId = 'grad_' + seed

  return `
    <svg viewBox="0 0 64 64" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${grad[0]}"/>
          <stop offset="100%" stop-color="${grad[1]}"/>
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="20" fill="url(#${gradId})"/>
      <!-- Cap/Hair -->
      <path d="M14 22 C 14 10, 50 10, 50 22 C 50 26, 14 26, 14 22 Z" fill="${hair}"/>
      <!-- Face -->
      <rect x="20" y="22" width="24" height="26" rx="8" fill="#ffd700"/>
      <!-- Tattoo -->
      <text x="35" y="34" font-size="5.5" font-weight="900" fill="#e2231a" font-family="sans-serif">${tat}</text>
      <!-- Glasses -->
      <rect x="22" y="27" width="9" height="6" rx="2" fill="#0f0716"/>
      <rect x="33" y="27" width="9" height="6" rx="2" fill="#0f0716"/>
      <line x1="31" y1="29" x2="33" y2="29" stroke="#0f0716" stroke-width="2"/>
      <!-- Grillz -->
      <rect x="27" y="38" width="10" height="4" rx="1" fill="#ff007f" stroke="#000" stroke-width="0.5"/>
      <line x1="29" y1="38" x2="29" y2="42" stroke="#ffd700" stroke-width="1"/>
      <line x1="32" y1="38" x2="32" y2="42" stroke="#ffd700" stroke-width="1"/>
      <line x1="35" y1="38" x2="35" y2="42" stroke="#ffd700" stroke-width="1"/>
      <!-- Chain -->
      <path d="M22 47 Q 32 55 42 47" fill="none" stroke="${hair}" stroke-width="2.5"/>
    </svg>
  `
}

// -----------------------------------------------------------------
// 4. COMPUTED HELPERS
// -----------------------------------------------------------------
const topbarSafeStyle = computed(() => ({
  paddingTop: 'calc(var(--max-safe-area-inset-top, var(--tg-safe-area-inset-top, 0px)) + var(--max-content-safe-area-inset-top, var(--tg-content-safe-area-inset-top, 0px)) + 6px)'
}))

const trackTitle = computed(() => currentTrack.value?.title || 'Тишина в чате...')
const trackArtist = computed(() => currentTrack.value?.artists || currentTrack.value?.artist || 'Неизвестный Нооб')
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

function formatTime(timestamp) {
  let date = null
  if (!timestamp) date = new Date()
  if (timestamp?.toDate) {
    date = timestamp.toDate()
  } else if (typeof timestamp === 'number') {
    date = new Date(timestamp)
  } else {
    date = new Date()
  }
  const h = date.getHours().toString().padStart(2, '0')
  const m = date.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

function getPhraseSvgIcon(text) {
  const match = allowedPhrases.find(p => p.text === text)
  return match ? match.svg : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>'
}

function getPhraseThemeClass(text) {
  const match = allowedPhrases.find(p => p.text === text)
  return match ? match.themeClass : 'theme-pepe'
}

// -----------------------------------------------------------------
// 5. AUDIO SFX SYNTHESIZER
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

function playPhraseSfx(phraseText) {
  if (isMuted.value) return
  try {
    const ctx = getAudioCtx()
    if (!ctx) return
    const now = ctx.currentTime

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    if (phraseText === 'пэпэ') {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(440, now)
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12)
      gain.gain.setValueAtTime(0.3, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15)
    } else if (phraseText === 'шнейне') {
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(300, now)
      osc.frequency.linearRampToValueAtTime(600, now + 0.2)
      gain.gain.setValueAtTime(0.25, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22)
    } else if (phraseText === 'фа') {
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(520, now)
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.18)
      gain.gain.setValueAtTime(0.35, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2)
    } else if (phraseText === 'втфа') {
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(150, now)
      osc.frequency.linearRampToValueAtTime(80, now + 0.25)
      gain.gain.setValueAtTime(0.4, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28)
    } else { // кхе-кхе
      osc.type = 'square'
      osc.frequency.setValueAtTime(200, now)
      osc.frequency.setValueAtTime(350, now + 0.08)
      gain.gain.setValueAtTime(0.2, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18)
    }

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.3)
  } catch (e) {
    console.warn(e)
  }
}

// -----------------------------------------------------------------
// 6. REAL-TIME FIREBASE CHAT ENGINE
// -----------------------------------------------------------------
let unsubscribeFirestore = null
let isFirstLoad = true

function initFirebaseChat() {
  isLoading.value = true
  connectionError.value = ''
  isFirstLoad = true

  if (!db) {
    connectionError.value = 'База данных Firebase не готова'
    isLoading.value = false
    setupFallbackLocalMessages()
    return
  }

  try {
    const messagesRef = collection(db, 'messages')
    const q = query(messagesRef, orderBy('timestamp', 'asc'), limitToLast(30))

    unsubscribeFirestore = onSnapshot(q, (snapshot) => {
      isLoading.value = false
      const msgs = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        msgs.push({
          id: doc.id,
          ...data,
          avatarSvg: getAvatarSvgForUser(data.userId)
        })
      })

      // Check if new message arrived for sfx
      if (msgs.length > chatMessages.value.length && chatMessages.value.length > 0) {
        const lastMsg = msgs[msgs.length - 1]
        if (lastMsg.userId !== currentUserId.value) {
          playPhraseSfx(lastMsg.text)
        }
      }

      chatMessages.value = msgs
      const forceScroll = isFirstLoad
      isFirstLoad = false

      nextTick(() => {
        scrollToBottom(true)
        if (forceScroll) {
          setTimeout(() => scrollToBottom(true), 100)
          setTimeout(() => scrollToBottom(true), 300)
        }
      })
    }, (error) => {
      console.error('[Gunwest Chat] Firestore snapshot error:', error)
      isLoading.value = false
      connectionError.value = 'Ошибка подключения к чату'
      setupFallbackLocalMessages()
    })
  } catch (err) {
    console.error('[Gunwest Chat] Init error:', err)
    isLoading.value = false
    connectionError.value = 'Не удалось загрузить сообщения'
    setupFallbackLocalMessages()
  }
}

function setupFallbackLocalMessages() {
  if (chatMessages.value.length > 0) return
  chatMessages.value = [
    {
      localId: 'loc_1',
      userId: 'bot_gunwest',
      userName: 'Ганвест Кинг #1001',
      text: 'пэпэ',
      timestamp: Date.now() - 120000,
      avatarSvg: getAvatarSvgForUser('bot_gunwest')
    },
    {
      localId: 'loc_2',
      userId: 'bot_shneine',
      userName: 'Шнейне Пимп #7777',
      text: 'шнейне',
      timestamp: Date.now() - 60000,
      avatarSvg: getAvatarSvgForUser('bot_shneine'),
      trackData: {
        id: 'demo_1',
        title: trackTitle.value,
        artist: trackArtist.value,
        cover: coverUrl.value
      }
    }
  ]
  nextTick(() => {
    scrollToBottom(true)
    setTimeout(() => scrollToBottom(true), 100)
  })
}

async function sendMemeMessage(phraseText) {
  if (!allowedPhrases.some(p => p.text === phraseText)) return
  if (isSending.value) return

  isSending.value = true
  sendingPhrase.value = phraseText
  playPhraseSfx(phraseText)

  const messagePayload = {
    text: phraseText,
    userId: currentUserId.value,
    userName: userGunwestName.value,
    timestamp: serverTimestamp() || Date.now()
  }

  if (isTrackAttached.value && currentTrack.value) {
    messagePayload.trackData = {
      id: currentTrack.value.id || currentTrack.value.trackId || 'tr_1',
      title: trackTitle.value,
      artist: trackArtist.value,
      cover: coverUrl.value
    }
  }

  try {
    if (db) {
      await addDoc(collection(db, 'messages'), messagePayload)
    } else {
      chatMessages.value.push({
        localId: 'loc_' + Date.now(),
        ...messagePayload,
        timestamp: Date.now(),
        avatarSvg: userAvatarSvg.value
      })
    }
  } catch (err) {
    console.warn('[Gunwest Chat] Add doc error, pushing locally:', err)
    chatMessages.value.push({
      localId: 'loc_' + Date.now(),
      ...messagePayload,
      timestamp: Date.now(),
      avatarSvg: userAvatarSvg.value
    })
  } finally {
    isSending.value = false
    sendingPhrase.value = ''
    nextTick(() => scrollToBottom(true))
  }
}

function toggleTrackAttachment() {
  isTrackAttached.value = !isTrackAttached.value
}

function handleTrackCardClick(trackData) {
  if (typeof playerSdk.openTrackKebab === 'function') {
    playerSdk.openTrackKebab(trackData?.id);
  }
}

function handleScroll() {
  if (!chatScrollRef.value) return
  const { scrollTop, scrollHeight, clientHeight } = chatScrollRef.value
  showScrollDownBtn.value = scrollHeight - scrollTop - clientHeight > 100
}

function scrollToBottom(force = false) {
  if (!chatScrollRef.value) return
  const el = chatScrollRef.value
  const { scrollTop, scrollHeight, clientHeight } = el
  if (force || scrollHeight - scrollTop - clientHeight < 200) {
    el.scrollTo({
      top: el.scrollHeight,
      behavior: force ? 'auto' : 'smooth'
    })
  }
}

function toggleCollapseDeck() {
  isDeckCollapsed.value = !isDeckCollapsed.value
  if (typeof playerSdk.collapse === 'function') {
    try {
      playerSdk.collapse()
    } catch (e) {
      console.warn('playerSdk.collapse error:', e)
    }
  }
}

function togglePlay() {
  if (playerState.value === 'playing') {
    playerSdk.pause()
  } else {
    playerSdk.play()
    getAudioCtx()
  }
}

function toggleLike() {
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
  playerSdk.repeat(repeatMode.value)
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

// -----------------------------------------------------------------
// 7. SDK LISTENERS
// -----------------------------------------------------------------
const onInit = (state) => {
  if (!state) return
  if (state.theme) theme.value = state.theme

  if (state.styles) {
    const root = document.documentElement
    Object.entries(state.styles).forEach(([k, v]) => {
      if (v !== undefined && v !== null) {
        root.style.setProperty(k, v)
      }
    })
  }

  const sdkUserId = state.userId || state.user?.id || state.device?.id
  if (sdkUserId) {
    currentUserId.value = sdkUserId
  } else if (!currentUserId.value) {
    currentUserId.value = getOrCreateUserId()
  }

  userGunwestName.value = generateGunwestName(currentUserId.value)
  userAvatarSvg.value = getAvatarSvgForUser(currentUserId.value)

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

// -----------------------------------------------------------------
// 8. LIFECYCLE
// -----------------------------------------------------------------
onMounted(() => {
  currentUserId.value = getOrCreateUserId()
  userGunwestName.value = generateGunwestName(currentUserId.value)
  userAvatarSvg.value = getAvatarSvgForUser(currentUserId.value)

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

  if (playerSdk.state) {
    onInit(playerSdk.state)
  }

  initFirebaseChat()
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

  if (unsubscribeFirestore) {
    unsubscribeFirestore()
  }
})
</script>

<style scoped>
/* =================================================================
   TELEGRAM GLASS WITH NEON REFLECTIONS THEME
   ================================================================= */

/* MAIN CONTAINER: Deep Telegram Dark Canvas */
.gunwest-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #0c121e;
  color: #f3f4f6;
  overflow: hidden;
  user-select: none;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;

  -webkit-tap-highlight-color: transparent;
  outline: none;
  user-select: none;
}

/* TOP HEADER: Telegram Glass Topbar with Neon Accents (With 74px right padding) */
.gunwest-topbar {
  position: relative;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 74px 8px 12px;
  background: rgba(15, 23, 38, 0.75);
  backdrop-filter: blur(28px) saturate(190%);
  -webkit-backdrop-filter: blur(28px) saturate(190%);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  border-bottom: 1px solid rgba(0, 240, 255, 0.18);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.top-track-card {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
  cursor: pointer;
  padding: 3px 6px;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.top-track-card:hover {
  background: rgba(255, 255, 255, 0.08);
}

.top-cover-box {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  background: #151d2a;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.3s ease;
}

.top-cover-box.is-playing {
  border-color: #00f0ff;
  box-shadow: 0 0 16px rgba(0, 240, 255, 0.7);
}

.top-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.top-cover-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00f0ff;
}

.top-music-icon {
  width: 18px;
  height: 18px;
}

.mini-equalizer {
  position: absolute;
  inset: 0;
  background: rgba(12, 18, 30, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.eq-bar {
  width: 2.5px;
  background: #00f0ff;
  border-radius: 2px;
  box-shadow: 0 0 6px #00f0ff;
  animation: eq-bounce 0.8s ease-in-out infinite alternate;
}

.bar-1 { height: 12px; animation-delay: 0s; }
.bar-2 { height: 18px; animation-delay: 0.2s; }
.bar-3 { height: 10px; animation-delay: 0.4s; }

@keyframes eq-bounce {
  0% { transform: scaleY(0.3); }
  100% { transform: scaleY(1); }
}

.top-track-meta {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
  gap: 0;
}

.top-channel-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.5px;
  line-height: 1.1;
}

.status-pulse-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #6b7280;
  flex-shrink: 0;
}

.status-pulse-dot.is-active {
  background: #00ff9d;
  box-shadow: 0 0 10px #00ff9d;
}

.channel-title {
  background: linear-gradient(135deg, #00f0ff, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  white-space: nowrap;
}

.tg-verified-badge {
  display: flex;
  align-items: center;
  color: #2b84ee;
  filter: drop-shadow(0 0 4px rgba(43, 132, 238, 0.6));
}

.tg-verify-icon {
  width: 12px;
  height: 12px;
}

.top-track-title {
  font-size: 11.5px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
}

.top-track-artist {
  font-size: 10px;
  color: #94a3b8;
  line-height: 1.1;
}

/* USER PROFILE CHIP (Telegram Glass Pill) */
.user-chip-container {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 12px;
  padding: 3px 8px 3px 4px;
  flex-shrink: 0;
  max-width: 130px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.avatar-ring-glow {
  position: relative;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  padding: 1.5px;
  background: linear-gradient(135deg, #00f0ff, #a855f7);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.5);
  flex-shrink: 0;
}

.user-avatar-mini {
  width: 100%;
  height: 100%;
  border-radius: 6px;
  overflow: hidden;
  background: #111827;
}

.user-chip-details {
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 4px;
  overflow: hidden;
}

.user-chip-name {
  font-size: 10px;
  font-weight: 700;
  color: #f8fafc;
  line-height: 1.1;
}

.user-chip-status {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 8px;
  color: #00ff9d;
  font-weight: 800;
  line-height: 1;
}

.status-indicator {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #00ff9d;
  box-shadow: 0 0 6px #00ff9d;
}

/* CHAT VIEWPORT & AMBIENT NEON BACKGROUND */
.chat-viewport {
  position: relative;
  flex: 1;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.ambient-mesh-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
}

.mesh-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  opacity: 0.22;
  animation: orb-pulse 8s ease-in-out infinite alternate;
}

.orb-purple {
  width: 280px;
  height: 280px;
  top: -60px;
  left: -60px;
  background: #a855f7;
}

.orb-pink {
  width: 240px;
  height: 240px;
  bottom: 20px;
  right: -50px;
  background: #ff007f;
  animation-delay: 2s;
}

.orb-cyan {
  width: 220px;
  height: 220px;
  top: 35%;
  left: 25%;
  background: #00f0ff;
  animation-delay: 4s;
}

@keyframes orb-pulse {
  0% { transform: scale(0.9) translate(0, 0); opacity: 0.18; }
  100% { transform: scale(1.15) translate(15px, -15px); opacity: 0.28; }
}

.mesh-grid {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(circle at 50% 50%, rgba(0, 240, 255, 0.03) 1px, transparent 1px);
  background-size: 28px 28px;
}

/* MESSAGES STREAM */
.messages-container {
  position: relative;
  z-index: 5;
  flex: 1;
  padding: 12px 12px 10px 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 240, 255, 0.25) transparent;
}

.messages-container::-webkit-scrollbar {
  width: 4px;
}

.messages-container::-webkit-scrollbar-thumb {
  background: rgba(0, 240, 255, 0.25);
  border-radius: 10px;
}

/* DATE SEPARATOR */
.chat-date-separator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 2px 0 6px 0;
}

.date-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.2), transparent);
}

.date-chip {
  font-size: 9px;
  font-weight: 800;
  color: #00f0ff;
  background: rgba(0, 240, 255, 0.08);
  border: 1px solid rgba(0, 240, 255, 0.25);
  padding: 3px 12px;
  border-radius: 20px;
  letter-spacing: 0.5px;
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.2);
}

/* STATUS CARDS */
.chat-status-card, .empty-chat-card, .chat-notice-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin: auto;
  padding: 20px;
  gap: 10px;
  background: rgba(18, 28, 45, 0.75);
  border: 1px solid rgba(0, 240, 255, 0.2);
  border-radius: 20px;
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.modern-spinner {
  width: 26px;
  height: 26px;
  border: 2.5px solid rgba(0, 240, 255, 0.2);
  border-top-color: #00f0ff;
  border-radius: 50%;
  animation: spin 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.5);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.status-text {
  font-size: 10px;
  color: #00f0ff;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.empty-vector-badge {
  width: 52px;
  height: 52px;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.25), rgba(168, 85, 247, 0.25));
  border: 1px solid rgba(0, 240, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00f0ff;
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.4);
}

.empty-card-title {
  font-size: 13.5px;
  font-weight: 800;
  background: linear-gradient(135deg, #ffffff, #00f0ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.empty-card-sub {
  font-size: 10px;
  color: #94a3b8;
  max-width: 240px;
}

.chat-notice-card.error {
  border-color: rgba(239, 68, 68, 0.4);
  background: rgba(239, 68, 68, 0.12);
}

.notice-title {
  font-size: 11px;
  font-weight: 800;
  color: #ef4444;
}

.notice-desc {
  font-size: 10px;
  color: #fca5a5;
}

.retry-pill-btn {
  background: #ef4444;
  color: #fff;
  border: none;
  padding: 5px 14px;
  border-radius: 16px;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.5);
}

/* TELEGRAM GLASS MESSAGE BUBBLES WITH NEON REFLECTIONS */
.message-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  max-width: 86%;
  animation: msg-appear 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes msg-appear {
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.message-row.is-mine {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.msg-avatar-box {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

/* Incoming Glass Bubble (Other Users) */
.msg-glass-bubble {
  position: relative;
  background: rgba(20, 30, 46, 0.72);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-top: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 18px 18px 18px 4px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

/* Specular Reflection Highlight Line for Glass */
.msg-glass-bubble::before {
  content: '';
  position: absolute;
  top: 0;
  left: 12px;
  right: 12px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent);
  pointer-events: none;
}

/* Outgoing Glass Bubble (Current User - Telegram Electric Blue/Purple Glass) */
.message-row.is-mine .msg-glass-bubble {
  border-radius: 18px 18px 4px 18px;
  background: linear-gradient(135deg, rgba(43, 132, 238, 0.85) 0%, rgba(147, 51, 234, 0.88) 100%);
  border: 1px solid rgba(0, 240, 255, 0.35);
  border-top: 1px solid rgba(255, 255, 255, 0.45);
  box-shadow: 0 8px 28px rgba(43, 132, 238, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.4);
}

.msg-meta-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 10px;
}

.msg-author-name {
  font-weight: 700;
  color: #00f0ff;
  text-shadow: 0 0 8px rgba(0, 240, 255, 0.4);
}

.message-row.is-mine .msg-author-name {
  color: #ffd700;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.5);
}

.msg-time-meta {
  display: flex;
  align-items: center;
  gap: 4px;
}

.msg-time {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.6);
}

.tg-read-checks {
  display: flex;
  align-items: center;
  color: #00f0ff;
  filter: drop-shadow(0 0 4px #00f0ff);
}

.tg-check-svg {
  width: 14px;
  height: 10px;
}

.msg-slang-body {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.msg-phrase-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

/* SLANG COLOR NEON ACCENTS */
.theme-pepe { border-left: 3px solid #f59e0b; }
.theme-pepe .msg-phrase-text, .theme-pepe .msg-phrase-badge { color: #f59e0b; }

.theme-shneine { border-left: 3px solid #ec4899; }
.theme-shneine .msg-phrase-text, .theme-shneine .msg-phrase-badge { color: #ec4899; }

.theme-fa { border-left: 3px solid #00f0ff; }
.theme-fa .msg-phrase-text, .theme-fa .msg-phrase-badge { color: #00f0ff; }

.theme-vtfa { border-left: 3px solid #ef4444; }
.theme-vtfa .msg-phrase-text, .theme-vtfa .msg-phrase-badge { color: #ef4444; }

.theme-kkhe { border-left: 3px solid #00ff9d; }
.theme-kkhe .msg-phrase-text, .theme-kkhe .msg-phrase-badge { color: #00ff9d; }

.message-row.is-mine .msg-phrase-text {
  color: #ffffff;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
}

.message-row.is-mine .msg-phrase-badge {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.22);
}

/* ATTACHED TRACK CARD IN GLASS BUBBLE */
.attached-track-pill {
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(12, 18, 30, 0.7);
  border: 1px solid rgba(0, 240, 255, 0.25);
  border-radius: 12px;
  padding: 6px 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.attached-track-pill:hover {
  background: rgba(12, 18, 30, 0.9);
  border-color: #00f0ff;
  box-shadow: 0 0 14px rgba(0, 240, 255, 0.4);
}

.pill-cover-box {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  overflow: hidden;
  background: #151d2a;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.pill-cover-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pill-cover-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00f0ff;
}

.pill-track-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.pill-track-label {
  font-size: 8px;
  font-weight: 800;
  color: #00ff9d;
  line-height: 1;
  letter-spacing: 0.5px;
}

.pill-track-title {
  font-size: 11px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
}

.pill-track-artist {
  font-size: 9px;
  color: #94a3b8;
  line-height: 1.1;
  max-width: 180px;
}

.pill-play-action {
  color: #ffd700;
  filter: drop-shadow(0 0 4px rgba(255, 215, 0, 0.6));
}

/* FLOATING SCROLL BUTTON */
.floating-scroll-btn {
  position: absolute;
  bottom: 12px;
  right: 14px;
  z-index: 15;
  display: flex;
  align-items: center;
  gap: 5px;
  background: linear-gradient(135deg, #00f0ff, #a855f7);
  color: #0c121e;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 10px;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(0, 240, 255, 0.5);
  transition: transform 0.15s ease;
}

.floating-scroll-btn:hover {
  transform: translateY(-2px);
}

/* COMPOSER DECK: Telegram Glass Bar with Quick Slang Pills */
.chat-composer-deck {
  position: relative;
  z-index: 25;
  background: rgba(15, 23, 38, 0.85);
  backdrop-filter: blur(28px) saturate(200%);
  -webkit-backdrop-filter: blur(28px) saturate(200%);
  border-top: 1px solid rgba(0, 240, 255, 0.2);
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.composer-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.attach-toggle-pill {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 12px;
  padding: 10px 10px;
  font-size: 10.5px;
  font-weight: 700;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 0;
  overflow: hidden;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
  min-height: 37px;
}

.attach-toggle-pill:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(0, 240, 255, 0.35);
  color: #f8fafc;
}

.attach-toggle-pill.is-active {
  background: rgba(0, 255, 157, 0.12);
  border-color: #00ff9d;
  color: #00ff9d;
  box-shadow: 0 0 12px rgba(0, 255, 157, 0.25);
}

.attach-label {
  flex: 1;
  text-align: left;
}

.attach-remove-icon {
  width: 14px;
  height: 14px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.attach-toggle-pill:hover .attach-remove-icon {
  opacity: 1;
}

.sfx-toggle-pill {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #00f0ff;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.sfx-toggle-pill:hover {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.4);
}

.sfx-toggle-pill.is-muted {
  color: #64748b;
}

/* SLANG PILLS GRID (Telegram Glass Buttons - Without Colored Bottom Borders) */
.slang-pills-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.slang-action-btn {
  height: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  background: rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-top: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 14px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.slang-action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(0, 240, 255, 0.35);
  box-shadow: 0 6px 20px rgba(0, 240, 255, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

.slang-action-btn:active:not(:disabled) {
  transform: translateY(1px);
  background: rgba(255, 255, 255, 0.05);
}

.slang-action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Subtle Icon Tint per Theme without colored bottom borders */
.slang-action-btn.theme-pepe .slang-icon-wrap { color: #f59e0b; }
.slang-action-btn.theme-shneine .slang-icon-wrap { color: #ec4899; }
.slang-action-btn.theme-fa .slang-icon-wrap { color: #00f0ff; }
.slang-action-btn.theme-vtfa .slang-icon-wrap { color: #ef4444; }
.slang-action-btn.theme-kkhe .slang-icon-wrap { color: #00ff9d; }

.slang-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.slang-label {
  font-size: 9.5px;
  font-weight: 800;
  text-transform: uppercase;
  line-height: 1;
  color: #ffffff;
  letter-spacing: 0.3px;
}

/* BOTTOM MEDIA PLAYER DECK (De-cramped Spacious Telegram Glass Player Controls) */
.player-media-deck {
  position: relative;
  z-index: 30;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 16px 14px 16px;
  background: rgba(12, 18, 30, 0.94);
  backdrop-filter: blur(28px) saturate(200%);
  -webkit-backdrop-filter: blur(28px) saturate(200%);
  border-top: 1px solid rgba(0, 240, 255, 0.2);
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.15);
  transition: all 0.25s ease;
}

.player-media-deck.is-collapsed {
  padding: 8px 16px;
  gap: 0;
}

.player-progress-wrapper {
  cursor: pointer;
  user-select: none;
  padding: 4px 0;
}

.player-progress-bar {
  position: relative;
  height: 6px;
  background: rgba(255, 255, 255, 0.14);
  border-radius: 4px;
  overflow: visible;
}

.player-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00f0ff, #a855f7, #ff007f);
  border-radius: 4px;
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.8);
}

.player-progress-thumb {
  position: absolute;
  top: -4px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.9), 0 0 14px #00f0ff;
  transform: translateX(-50%);
  pointer-events: none;
}

.player-time-row {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #64748b;
  margin-top: 4px;
}

.time-current-readout {
  color: #f8fafc;
  font-weight: 700;
}

/* PLAYER CONTROLS ROW - Breathable & Tactile */
.player-controls-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.media-icon-btn {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.media-icon-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(0, 240, 255, 0.35);
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.35);
}

.media-icon-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.media-icon-btn.like-btn.is-liked {
  border-color: #ff007f;
  background: rgba(255, 0, 127, 0.18);
  color: #ff007f;
  box-shadow: 0 0 12px rgba(255, 0, 127, 0.5);
}

.media-icon-btn.repeat-mode-btn.is-active {
  border-color: #00f0ff;
  color: #00f0ff;
  box-shadow: 0 0 12px rgba(0, 240, 255, 0.5);
}

.repeat-tag {
  position: absolute;
  top: 1px;
  right: 3px;
  font-size: 8px;
  font-weight: 900;
  color: #00f0ff;
}

.media-svg {
  width: 18px;
  height: 18px;
}

.media-hero-play-btn {
  flex: 1;
  height: 40px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 11.5px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(43, 132, 238, 0.5);
  transition: all 0.2s ease;
  min-width: 0;
  padding: 0 12px;
}
.media-hero-play-btn span {
  display: none;
}

.media-hero-play-btn.is-paused {
  background: linear-gradient(135deg, #2b84ee 0%, #a855f7 100%);
}

.media-hero-play-btn.is-playing {
  background: linear-gradient(135deg, #00f0ff 0%, #2b84ee 100%);
  color: #0c121e;
}

.media-hero-play-btn:hover {
  transform: translateY(-1px);
  filter: brightness(1.1);
  box-shadow: 0 6px 24px rgba(0, 240, 255, 0.6);
}

.hero-play-icon {
  width: 16px;
  height: 16px;
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
