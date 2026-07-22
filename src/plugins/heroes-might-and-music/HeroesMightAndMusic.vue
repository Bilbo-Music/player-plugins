<template>
    <div class="heroes-container" :class="[theme]">
        <!-- Adventure map canvas: hex grid, fog of war, road and hero -->
        <canvas
            ref="canvasRef"
            class="game-canvas"
            @click="handleCanvasSeek"
            @touchstart="handleCanvasSeek"
        ></canvas>

        <!-- TOP PANEL: scroll banner with track "portrait" -->
        <div ref="topPanelRef" class="ui-panel top-panel">
            <div class="track-card" @click="playerSdk.openTrackKebab()">
                <div class="portrait-frame">
                    <div class="track-cover" :class="{ 'is-loading': !isCoverLoaded }">
                        <img
                            v-if="trackInfo.cover?.crop"
                            :src="trackInfo.cover.crop"
                            class="track-cover-img"
                            :class="{ 'is-visible': isCoverLoaded }"
                            @load="isCoverLoaded = true"
                        />
                        <div v-else class="cover-placeholder">⚔</div>
                    </div>
                </div>
                <div class="track-meta">
                    <div class="title">{{ trackInfo.title }}</div>
                    <div class="artist" v-if="trackInfo.artists">{{ trackInfo.artists }}</div>
                </div>
            </div>
            <div class="plugin-spacer"></div>
        </div>

        <!-- HUD: resource bar, Heroes III style -->
        <div class="resource-bar">
            <div class="resource-chip">
                <span class="res-icon">📜</span>
                <span class="res-value">ДЕНЬ {{ dayCount }}</span>
            </div>
            <div class="resource-chip">
                <span class="res-icon">💰</span>
                <span class="res-value">{{ formatNumber(goldTotal) }}</span>
            </div>
        </div>

        <!-- BOTTOM PANEL: wooden command bar -->
        <div class="ui-panel bottom-panel">
            <div class="scroll-progress">
                <div class="scroll-progress-fill" :style="{ width: progressPercent + '%' }"></div>
            </div>

            <div class="controls-row">
                <button class="ui-btn" :class="{ 'is-active': reaction === 'LIKE' }" @click="handleLikeToggle" title="Похвала">
                    <svg width="20" height="20" viewBox="0 0 24 24" :fill="reaction === 'LIKE' ? '#ffd76a' : 'none'" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </button>
                <button class="ui-btn" :disabled="prevDisabled" @click="playerSdk.prev()" title="Прошлый привал">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                </button>
                <button class="ui-btn play-btn" @click="togglePlay" title="В путь!">
                    <svg v-if="playerState !== 'playing'" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                </button>
                <button class="ui-btn" :disabled="nextDisabled" @click="playerSdk.next()" title="Следующий привал">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6zm9-12h2v12h-2z"/></svg>
                </button>
                
                <button class="ui-btn" :class="{ 'is-active': repeat !== 'none' }" @click="handleRepeat" title="Заклятье повтора">
                    <svg v-if="repeat === 'track'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                        <text x="9" y="16" font-size="9" font-weight="bold" fill="currentColor" stroke="none">1</text>
                    </svg>
                    <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline>
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                    </svg>
                </button>
                <button class="ui-btn" :disabled="!hasQueue" @click="openPlaylist" title="Свиток похода">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line>
                        <line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>
                    </svg>
                </button>
                <button class="ui-btn" @click="collapse" title="Свернуть шатёр">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { playerSdk } from '@bilbomusic/player-plugin-sdk'

// -----------------------------------------------------------------
// 1. STATE & CONSTANTS
// -----------------------------------------------------------------
const canvasRef = ref(null)
const topPanelRef = ref(null)

const theme = ref('dark')
const isExpanded = ref(true)
const playerState = ref('paused')
const reaction = ref('')
const repeat = ref('none')
const isCoverLoaded = ref(false)

const nextDisabled = ref(false)
const prevDisabled = ref(true)
const hasQueue = ref(false)

const trackInfo = ref({ title: 'Путь ещё не начат...', artists: '', cover: null, duration: 0, id: null })

const goldTotal = ref(Number(localStorage.getItem('homm-plugin-gold')) || 0)
const dayCount = ref(1)
const progressPercent = ref(0)

const TOP_UI_HEIGHT = ref(96)
const BOTTOM_UI_HEIGHT = 118
const SYNC_THRESHOLD = 1000

const updateTopUiHeight = () => {
    if (topPanelRef.value) {
        TOP_UI_HEIGHT.value = topPanelRef.value.offsetHeight || 96
    }
}
const COLS = 64
const ROWS = 9
const REVEAL_RADIUS = 5

const TERRAIN = {
    grass: { base: '#4a7a3a', accent: '#3d6a30', dark: '#2c4d22' },
    water: { base: '#3f7fb5', accent: '#5a9bd0', dark: '#274c70' },
    sand:  { base: '#d8c584', accent: '#e6d9a0', dark: '#af9a56' },
    snow:  { base: '#e9eef2', accent: '#ffffff', dark: '#bcc6cc' },
    swamp: { base: '#5b6a44', accent: '#4a5736', dark: '#333c1e' },
    rough: { base: '#8a7864', accent: '#a0917d', dark: '#54473a' },
    lava:  { base: '#7a2a10', accent: '#c9481c', dark: '#3f1408' },
    road:  { base: '#9c7b4f', accent: '#b0925f', dark: '#6f5738' }
}

let animationFrameId = null
let lastTimestamp = 0
let currentTime = 0
let smoothX = 0
let decorativeTimer = 0
let cameraX = 0
let clockTime = 0

let audioData = { bass: 0, mid: 0, high: 0 }
let map = null // { path, terrain, resourceIdxs, decorSeed }
let collectedResources = new Set()
let dustParticles = []
let goldPopups = []
let maxRevealedCol = REVEAL_RADIUS

// -----------------------------------------------------------------
// OPTIONAL REAL TEXTURES
// -----------------------------------------------------------------
// Paste direct image URLs here (CC0 recommended, e.g. from kenney.nl/assets/hexagon-kit
// or your own hosting). Any left empty automatically falls back to the
// hand-painted procedural tile/hero rendering below - nothing breaks either way.
const TEXTURE_URLS = {
    grass: '',
    water: '',
    sand: '',
    snow: '',
    swamp: '',
    rough: '',
    lava: '',
    road: '',
    hero: ''   // top-down or side knight/rider sprite, square-ish aspect works best
}

const textureImages = {}
const loadTextures = () => {
    Object.entries(TEXTURE_URLS).forEach(([key, url]) => {
        if (!url) return
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => { textureImages[key] = img }
        img.onerror = () => { delete textureImages[key] }
        img.src = url
    })
}

// -----------------------------------------------------------------
// 2. DETERMINISTIC MAP GENERATION (seeded by track id)
// -----------------------------------------------------------------
const strHash = (str) => {
    let h = 1779033703 ^ str.length
    for (let i = 0; i < str.length; i++) {
        h = Math.imul(h ^ str.charCodeAt(i), 3432918353)
        h = (h << 13) | (h >>> 19)
    }
    return () => {
        h = Math.imul(h ^ (h >>> 16), 2246822507)
        h = Math.imul(h ^ (h >>> 13), 3266489909)
        h ^= h >>> 16
        return h >>> 0
    }
}

const mulberry32 = (a) => () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const weightedPick = (types, weights, rand) => {
    const total = weights.reduce((a, b) => a + b, 0)
    let r = rand() * total
    for (let i = 0; i < types.length; i++) {
        if (r < weights[i]) return types[i]
        r -= weights[i]
    }
    return types[types.length - 1]
}

const generateMap = (seedStr) => {
    const seedFn = strHash(seedStr || 'heroes-might-music')
    const rand = mulberry32(seedFn())

    // Winding road across the whole map (one hex per column)
    const path = []
    let row = Math.floor(ROWS / 2)
    for (let c = 0; c < COLS; c++) {
        path.push({ col: c, row })
        if (c < COLS - 1) {
            const move = rand()
            if (move < 0.32 && row > 1) row--
            else if (move > 0.68 && row < ROWS - 2) row++
        }
    }
    const pathSet = new Set(path.map(p => `${p.col},${p.row}`))

    // Biome blobs (Voronoi-ish, clipped by radius) scattered around the road
    const blobTypes = ['water', 'sand', 'rough', 'snow', 'swamp', 'lava']
    const blobWeights = [28, 16, 24, 10, 16, 4]
    const blobCount = 9 + Math.floor(rand() * 8)
    const blobs = []
    let lavaUsed = false
    for (let i = 0; i < blobCount; i++) {
        const type = weightedPick(blobTypes, blobWeights, rand)
        if (type === 'lava') {
            if (lavaUsed) continue
            lavaUsed = true
        }
        blobs.push({
            col: rand() * COLS,
            row: rand() * ROWS,
            type,
            radius: (type === 'lava' ? 1.2 : type === 'water' ? 2.6 : 1.8) + rand() * 2
        })
    }

    const terrain = {}
    for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < ROWS; r++) {
            const key = `${c},${r}`
            if (pathSet.has(key)) { terrain[key] = 'road'; continue }
            let best = null, bestDist = Infinity
            for (const b of blobs) {
                const dc = c - b.col, dr = (r - b.row) * 1.15
                const d = Math.sqrt(dc * dc + dr * dr) / b.radius
                if (d < 1 && d < bestDist) { bestDist = d; best = b.type }
            }
            terrain[key] = best || 'grass'
        }
    }

    const resourceIdxs = []
    for (let i = 4; i < path.length - 3; i += 4 + Math.floor(rand() * 3)) {
        resourceIdxs.push(i)
    }

    return { path, terrain, resourceIdxs, decorSeed: seedFn() }
}

// -----------------------------------------------------------------
// 3. HEX GEOMETRY
// -----------------------------------------------------------------
const getHexSize = (playableHeight) => {
    const size = playableHeight / ((ROWS + 0.5) * Math.sqrt(3))
    return Math.max(16, Math.min(40, size))
}

const hexCenter = (col, row, size) => {
    const w = size * 2
    const h = Math.sqrt(3) * size
    const x = col * (w * 0.75) + size
    const y = row * h + (col % 2 ? h / 2 : 0) + h / 2
    return { x, y }
}

const hexPath = (ctx, cx, cy, size) => {
    ctx.beginPath()
    for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 180) * (60 * i)
        const x = cx + size * Math.cos(a)
        const y = cy + size * Math.sin(a)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
    }
    ctx.closePath()
}

const hexRand = (col, row, base) => {
    let h = (base ^ (col * 374761393) ^ (row * 668265263)) | 0
    h = Math.imul(h ^ (h >>> 13), 1274126177)
    h ^= h >>> 16
    return (h >>> 0) / 4294967296
}

// Lighten (positive percent) or darken (negative percent) a "#rrggbb" color
const shadeColor = (hex, percent) => {
    const num = parseInt(hex.slice(1), 16)
    const amt = Math.round(2.55 * percent)
    let r = (num >> 16) + amt
    let g = ((num >> 8) & 0x00ff) + amt
    let b = (num & 0x0000ff) + amt
    r = Math.max(0, Math.min(255, r))
    g = Math.max(0, Math.min(255, g))
    b = Math.max(0, Math.min(255, b))
    return '#' + (0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)
}

// -----------------------------------------------------------------
// 4. INITIALIZATION & LIFECYCLE
// -----------------------------------------------------------------
let handleCanvasResize = null
const initCanvas = () => {
    const canvas = canvasRef.value
    if (!canvas) return
    handleCanvasResize = () => {
        canvas.width = canvas.parentElement.clientWidth
        canvas.height = canvas.parentElement.clientHeight
        updateTopUiHeight()
    }
    handleCanvasResize()
    window.addEventListener('resize', handleCanvasResize)
}

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
    initCanvas()
    loadTextures()
    map = generateMap('heroes-might-music')
    startLoop()
    nextTick(() => {
        updateTopUiHeight()
    })
})

onBeforeUnmount(() => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId)
    playerSdk.off('init', onInit)
    playerSdk.off('open', onOpen)
    playerSdk.off('position', onPosition)
    playerSdk.off('state', onState)
    playerSdk.off('theme', onTheme)
    playerSdk.off('reaction', onReaction)
    playerSdk.off('repeat', onRepeat)
    playerSdk.off('change', onChange)
    playerSdk.off('audioFrame', onAudioFrame)
    playerSdk.off('player', onPlayer)
    if (handleCanvasResize) window.removeEventListener('resize', handleCanvasResize)
})

// -----------------------------------------------------------------
// 5. SDK EVENT SUBSCRIPTIONS
// -----------------------------------------------------------------
const onInit = (state) => {
    if (state?.player) isExpanded.value = state.player.expanded !== false
    if (state?.theme) theme.value = state.theme
    repeat.value = state.panes?.default?.repeat || 'none'
    nextDisabled.value = !!state.panes?.default?.nextDisabled
    prevDisabled.value = !!state.panes?.default?.prevDisabled
    hasQueue.value = !!state.panes?.default?.hasQueue
    if (state?.panes?.default?.track) updateTrackData(state.panes.default.track)
    if (state?.panes?.default?.state) playerState.value = state.panes.default.state
    if (state?.panes?.default?.reaction) reaction.value = state.panes.default.reaction

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
}

const onOpen = (payload) => { if (payload?.track) updateTrackData(payload.track) }

const onPosition = (payload) => {
    currentTime = payload.position
    if (!currentTime) smoothX = 0
}

const onState = (payload) => { if (payload?.state) playerState.value = payload.state }
const onTheme = (payload) => { if (payload?.theme) theme.value = payload.theme }
const onReaction = (payload) => { reaction.value = payload.reaction }
const onRepeat = (payload) => { repeat.value = payload.value }
const onChange = ({ pane, type, payload }) => {
    if (pane !== 'default') return
    if (type === 'prevDisabled') prevDisabled.value = payload?.value
    if (type === 'nextDisabled') nextDisabled.value = payload?.value
    if (type === 'hasQueue') hasQueue.value = payload?.value
}

const onAudioFrame = (dataArray) => {
    if (!dataArray || !dataArray.length || playerState.value !== 'playing') {
        audioData.bass *= 0.9; audioData.mid *= 0.9; audioData.high *= 0.9
        return
    }
    const len = dataArray.length
    let bassSum = 0, midSum = 0, highSum = 0
    const bassEnd = Math.floor(len * 0.15) || 1
    const midEnd = Math.floor(len * 0.6) || 2
    for (let i = 0; i < len; i++) {
        const v = dataArray[i] || 0
        if (i < bassEnd) bassSum += v
        else if (i < midEnd) midSum += v
        else highSum += v
    }
    const b = (bassSum / bassEnd) / 255
    const m = (midSum / (midEnd - bassEnd)) / 255
    const h = (highSum / (len - midEnd)) / 255
    audioData.bass += ((isFinite(b) ? b : 0) - audioData.bass) * 0.2
    audioData.mid += ((isFinite(m) ? m : 0) - audioData.mid) * 0.2
    audioData.high += ((isFinite(h) ? h : 0) - audioData.high) * 0.2
}

const onPlayer = (payload) => {
    if (payload && 'expanded' in payload) {
        const wasExpanded = isExpanded.value
        isExpanded.value = !!payload.expanded
        if (isExpanded.value && !wasExpanded) {
            cancelAnimationFrame(animationFrameId)
            lastTimestamp = 0
            startLoop()
        }
    }
}

playerSdk.on('init', onInit)
playerSdk.on('open', onOpen)
playerSdk.on('position', onPosition)
playerSdk.on('state', onState)
playerSdk.on('theme', onTheme)
playerSdk.on('reaction', onReaction)
playerSdk.on('repeat', onRepeat)
playerSdk.on('change', onChange)
playerSdk.on('audioFrame', onAudioFrame)
playerSdk.on('player', onPlayer)

// -----------------------------------------------------------------
// 6. GAME LOOP & RENDERER
// -----------------------------------------------------------------
const startLoop = () => {
    const render = (timestamp) => {
        if (!isExpanded.value) return
        const canvas = canvasRef.value
        if (!canvas || !map) { animationFrameId = requestAnimationFrame(render); return }
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        if (!lastTimestamp) lastTimestamp = timestamp
        const deltaTime = timestamp - lastTimestamp
        lastTimestamp = timestamp
        clockTime += deltaTime

        const w = canvas.width
        const h = canvas.height
        const isDark = theme.value === 'dark'

        const gameTopY = TOP_UI_HEIGHT.value
        const gameBottomY = h - BOTTOM_UI_HEIGHT
        const playableHeight = Math.max(60, gameBottomY - gameTopY)

        // Sky backdrop
        const sky = ctx.createLinearGradient(0, gameTopY, 0, gameBottomY)
        if (isDark) {
            sky.addColorStop(0, '#1c1408'); sky.addColorStop(1, '#100b04')
        } else {
            sky.addColorStop(0, '#e8d9a8'); sky.addColorStop(1, '#cdb87a')
        }
        ctx.fillStyle = sky
        ctx.fillRect(0, gameTopY, w, playableHeight)

        // Timeline sync
        const duration = trackInfo.value.duration || 0
        if (playerState.value === 'playing') {
            smoothX += deltaTime
            if (Math.abs(currentTime - smoothX) > SYNC_THRESHOLD) smoothX = currentTime
        } else {
            smoothX = currentTime || 0
        }
        const progress = duration ? Math.min(1, Math.max(0, smoothX / duration)) : 0
        progressPercent.value = progress * 100

        const size = getHexSize(playableHeight)
        const path = map.path
        const heroFloat = progress * (path.length - 1)
        const heroIdx = Math.min(path.length - 2, Math.floor(heroFloat))
        const t = heroFloat - heroIdx
        const p0 = hexCenter(path[heroIdx].col, path[heroIdx].row, size)
        const p1 = hexCenter(path[Math.min(path.length - 1, heroIdx + 1)].col, path[Math.min(path.length - 1, heroIdx + 1)].row, size)
        let heroX = p0.x + (p1.x - p0.x) * t
        let heroY = p0.y + (p1.y - p0.y) * t

        // Camera follows hero horizontally
        const mapWidthPx = COLS * (size * 1.5) + size * 0.5
        const cameraMax = Math.max(0, mapWidthPx - w)
        const cameraTarget = Math.min(cameraMax, Math.max(0, heroX - w / 2))
        cameraX += (cameraTarget - cameraX) * 0.08

        // Fog reveal frontier
        maxRevealedCol = Math.max(maxRevealedCol, Math.floor(heroFloat) + REVEAL_RADIUS)

        // Visible column range
        const colWidth = size * 1.5
        const colStart = Math.max(0, Math.floor((cameraX - size * 2) / colWidth))
        const colEnd = Math.min(COLS - 1, Math.ceil((cameraX + w + size * 2) / colWidth))

        ctx.save()
        ctx.translate(-cameraX, gameTopY)
        ctx.beginPath()
        ctx.rect(cameraX, 0, w, playableHeight)
        ctx.clip()

        for (let c = colStart; c <= colEnd; c++) {
            for (let r = 0; r < ROWS; r++) {
                const { x: cx, y: cy } = hexCenter(c, r, size)
                const revealed = c <= maxRevealedCol
                const type = map.terrain[`${c},${r}`] || 'grass'

                if (!revealed) {
                    drawShroudHex(ctx, cx, cy, size, c, r, map.decorSeed)
                    continue
                }

                drawTerrainHex(ctx, cx, cy, size, type, c, r, map.decorSeed, clockTime, audioData, isDark)
            }
        }

        // Start & goal markers
        if (path.length) {
            const startHex = hexCenter(path[0].col, path[0].row, size)
            drawCastle(ctx, startHex.x, startHex.y, size)
            const endP = path[path.length - 1]
            if (endP.col <= maxRevealedCol) {
                const endHex = hexCenter(endP.col, endP.row, size)
                drawBanner(ctx, endHex.x, endHex.y, size, clockTime)
            }
        }

        // Resource piles (collect as hero passes)
        map.resourceIdxs.forEach((idx) => {
            const rp = path[idx]
            if (rp.col > maxRevealedCol) return
            const rc = hexCenter(rp.col, rp.row, size)
            const key = `${trackInfo.value.id || 'x'}:${idx}`
            const collected = collectedResources.has(key)
            if (!collected) {
                drawResourcePile(ctx, rc.x, rc.y - size * 0.7, size, clockTime)
                if (playerState.value === 'playing' && heroFloat > idx - 0.15) {
                    collectedResources.add(key)
                    const reward = 40 + Math.floor(hexRand(idx, rp.row, map.decorSeed) * 60)
                    goldTotal.value += reward
                    localStorage.setItem('homm-plugin-gold', Math.floor(goldTotal.value).toString())
                    for (let i = 0; i < 10; i++) {
                        const ang = (Math.PI * 2 * i) / 10
                        dustParticles.push({
                            x: rc.x, y: rc.y - size * 0.7,
                            vx: Math.cos(ang) * (0.6 + Math.random() * 1.2),
                            vy: Math.sin(ang) * (0.6 + Math.random() * 1.2) - 1,
                            life: 1, color: i % 3 === 0 ? '#fff3c9' : '#ffd76a'
                        })
                    }
                    goldPopups.push({ x: rc.x, y: rc.y - size * 0.7, life: 1, text: '+' + reward })
                }
            }
        })

        // Hero idle bob vs riding hop
        let bobOffset
        if (playerState.value === 'playing' && duration) {
            bobOffset = -Math.sin(t * Math.PI) * (size * 0.35 + audioData.bass * size * 0.3)
        } else {
            decorativeTimer += 0.03
            bobOffset = -Math.abs(Math.sin(decorativeTimer)) * size * 0.15
        }
        const facingRight = p1.x >= p0.x
        drawHero(ctx, heroX, heroY + bobOffset, size, isDark, facingRight, audioData)

        // Dust / gold sparkle particles
        for (let i = dustParticles.length - 1; i >= 0; i--) {
            const p = dustParticles[i]
            p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life -= 0.025
            if (p.life <= 0) { dustParticles.splice(i, 1); continue }
            ctx.save()
            ctx.globalAlpha = Math.max(0, p.life)
            ctx.fillStyle = p.color
            ctx.shadowColor = p.color
            ctx.shadowBlur = 4
            ctx.beginPath(); ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2); ctx.fill()
            ctx.restore()
        }

        // Floating "+gold" popups
        for (let i = goldPopups.length - 1; i >= 0; i--) {
            const g = goldPopups[i]
            g.y -= 0.6; g.life -= 0.014
            if (g.life <= 0) { goldPopups.splice(i, 1); continue }
            ctx.save()
            ctx.globalAlpha = Math.max(0, Math.min(1, g.life * 1.4))
            ctx.font = `bold ${Math.max(12, size * 0.42)}px Cinzel, serif`
            ctx.textAlign = 'center'
            ctx.fillStyle = '#3f2a0a'
            ctx.fillText(g.text, g.x + 1, g.y + 1)
            ctx.fillStyle = '#ffd76a'
            ctx.fillText(g.text, g.x, g.y)
            ctx.restore()
        }

        ctx.restore()

        // Vignette frame
        const vign = ctx.createRadialGradient(w / 2, gameTopY + playableHeight / 2, playableHeight * 0.35, w / 2, gameTopY + playableHeight / 2, playableHeight * 0.9)
        vign.addColorStop(0, 'rgba(0,0,0,0)')
        vign.addColorStop(1, isDark ? 'rgba(0,0,0,0.55)' : 'rgba(40,25,5,0.35)')
        ctx.fillStyle = vign
        ctx.fillRect(0, gameTopY, w, playableHeight)

        // Day counter - gold no longer trickles on its own; it only grows when the hero collects a resource pile
        dayCount.value = 1 + Math.floor(heroFloat / 3)

        animationFrameId = requestAnimationFrame(render)
    }
    animationFrameId = requestAnimationFrame(render)
}

// -----------------------------------------------------------------
// 7. TILE / SPRITE DRAWING HELPERS
// -----------------------------------------------------------------
const drawTerrainHex = (ctx, cx, cy, size, type, col, row, seed, clock, audio, isDark) => {
    const pal = TERRAIN[type] || TERRAIN.grass
    const tex = textureImages[type]

    if (tex) {
        ctx.save()
        hexPath(ctx, cx, cy, size * 0.98)
        ctx.clip()
        ctx.drawImage(tex, cx - size, cy - size, size * 2, size * 2)
        ctx.restore()
        hexPath(ctx, cx, cy, size * 0.99)
        ctx.strokeStyle = isDark ? 'rgba(202,161,83,0.28)' : 'rgba(90,60,15,0.28)'
        ctx.lineWidth = 1
        ctx.stroke()
        return
    }

    // Base fill
    hexPath(ctx, cx, cy, size * 0.99)
    ctx.fillStyle = pal.base
    ctx.fill()

    // Painterly "3D" bevel: warm light top-left, cool shadow bottom-right (isometric adventure-map feel)
    ctx.save()
    hexPath(ctx, cx, cy, size * 0.99)
    ctx.clip()
    const bevel = ctx.createLinearGradient(cx - size * 0.8, cy - size * 0.8, cx + size * 0.8, cy + size * 0.8)
    bevel.addColorStop(0, shadeColor(pal.base, 16))
    bevel.addColorStop(0.45, pal.base)
    bevel.addColorStop(1, shadeColor(pal.base, -14))
    ctx.globalAlpha = 0.85
    ctx.fillStyle = bevel
    ctx.fillRect(cx - size, cy - size, size * 2, size * 2)
    ctx.globalAlpha = 1
    ctx.restore()

    // Per-tile organic texture
    drawTileTexture(ctx, cx, cy, size, type, col, row, seed, clock, audio)

    // decoration
    const rv = hexRand(col, row, seed)
    if (type === 'grass' && rv > 0.55) drawTree(ctx, cx + (rv - 0.5) * size * 0.4, cy + (hexRand(row, col, seed) - 0.5) * size * 0.4, size * 0.34, pal)
    else if (type === 'rough') drawMountain(ctx, cx, cy, size * 0.58, pal, rv > 0.6)
    else if (type === 'swamp' && rv > 0.5) drawReeds(ctx, cx, cy, size * 0.32, pal.dark)
    else if (type === 'snow' && rv > 0.5) drawTree(ctx, cx, cy, size * 0.32, { base: '#dfe8ec', accent: '#ffffff', dark: '#a9b7bf' })
    else if (type === 'lava') drawLavaGlow(ctx, cx, cy, size * 0.62, clock, audio.bass)
    else if (type === 'road') drawRoadMarks(ctx, cx, cy, size, col, row, seed)

    // crisp hex outline (mortar/parchment grid line)
    hexPath(ctx, cx, cy, size * 0.99)
    ctx.strokeStyle = isDark ? 'rgba(20,15,6,0.45)' : 'rgba(60,40,10,0.3)'
    ctx.lineWidth = 1
    ctx.stroke()
    // faint inner highlight along the top edge for extra depth
    ctx.save()
    hexPath(ctx, cx, cy, size * 0.99)
    ctx.clip()
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.moveTo(cx - size * 0.9, cy - size * 0.5)
    ctx.lineTo(cx, cy - size)
    ctx.lineTo(cx + size * 0.9, cy - size * 0.5)
    ctx.stroke()
    ctx.restore()
}

// Organic per-biome surface texture (grain, tufts, sparkle) rendered inside the hex clip
const drawTileTexture = (ctx, cx, cy, size, type, col, row, seed, clock, audio) => {
    const pal = TERRAIN[type] || TERRAIN.grass
    ctx.save()
    hexPath(ctx, cx, cy, size * 0.97)
    ctx.clip()

    if (type === 'water') {
        const wob = Math.sin(clock * 0.002 + col * 0.6) * (2 + audio.mid * 4)
        ctx.strokeStyle = pal.accent
        ctx.globalAlpha = 0.5
        ctx.lineWidth = 1.3
        for (let i = -1; i <= 1; i++) {
            ctx.beginPath()
            ctx.moveTo(cx - size, cy + i * size * 0.35 + wob)
            ctx.quadraticCurveTo(cx, cy + i * size * 0.35 - wob, cx + size, cy + i * size * 0.35 + wob)
            ctx.stroke()
        }
        // specular sparkle
        ctx.globalAlpha = 1
        for (let i = 0; i < 3; i++) {
            const rr = hexRand(col * 3 + i, row * 3 + i, seed)
            const tw = 0.4 + 0.6 * Math.abs(Math.sin(clock * 0.003 + rr * 20))
            ctx.fillStyle = `rgba(255,255,255,${0.35 * tw})`
            ctx.beginPath()
            ctx.arc(cx + (rr - 0.5) * size * 1.3, cy + (hexRand(row * 5 + i, col * 5 + i, seed) - 0.5) * size * 1.1, size * 0.05, 0, Math.PI * 2)
            ctx.fill()
        }
    } else if (type === 'grass') {
        for (let i = 0; i < 6; i++) {
            const rx = (hexRand(col * 7 + i, row * 3, seed) - 0.5) * size * 1.4
            const ry = (hexRand(row * 7 + i, col * 3, seed) - 0.5) * size * 1.0
            ctx.strokeStyle = i % 2 ? pal.dark : shadeColor(pal.accent, 10)
            ctx.globalAlpha = 0.5
            ctx.lineWidth = size * 0.045
            ctx.beginPath()
            ctx.moveTo(cx + rx, cy + ry + size * 0.12)
            ctx.quadraticCurveTo(cx + rx + size * 0.06, cy + ry - size * 0.05, cx + rx + size * 0.1, cy + ry - size * 0.16)
            ctx.stroke()
        }
        ctx.globalAlpha = 1
    } else if (type === 'sand') {
        for (let i = 0; i < 10; i++) {
            const rx = (hexRand(col * 11 + i, row, seed) - 0.5) * size * 1.5
            const ry = (hexRand(row * 11 + i, col, seed) - 0.5) * size * 1.1
            ctx.fillStyle = i % 2 ? pal.dark : pal.accent
            ctx.globalAlpha = 0.35
            ctx.beginPath()
            ctx.arc(cx + rx, cy + ry, size * 0.035, 0, Math.PI * 2)
            ctx.fill()
        }
        ctx.globalAlpha = 1
    } else if (type === 'snow') {
        for (let i = 0; i < 8; i++) {
            const rx = (hexRand(col * 13 + i, row, seed) - 0.5) * size * 1.5
            const ry = (hexRand(row * 13 + i, col, seed) - 0.5) * size * 1.1
            const tw = 0.5 + 0.5 * Math.abs(Math.sin(clock * 0.002 + i * 3 + col))
            ctx.fillStyle = `rgba(255,255,255,${0.55 * tw})`
            ctx.beginPath()
            ctx.arc(cx + rx, cy + ry, size * 0.03, 0, Math.PI * 2)
            ctx.fill()
        }
    } else if (type === 'swamp') {
        for (let i = 0; i < 4; i++) {
            const rx = (hexRand(col * 17 + i, row, seed) - 0.5) * size * 1.3
            const ry = (hexRand(row * 17 + i, col, seed) - 0.5) * size * 1.0
            const pulse = 0.3 + 0.25 * Math.sin(clock * 0.0015 + i * 2)
            ctx.strokeStyle = pal.dark
            ctx.globalAlpha = pulse
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.arc(cx + rx, cy + ry, size * 0.1, 0, Math.PI * 2)
            ctx.stroke()
        }
        ctx.globalAlpha = 1
    } else if (type === 'rough') {
        for (let i = 0; i < 6; i++) {
            const rx = (hexRand(col * 19 + i, row, seed) - 0.5) * size * 1.5
            const ry = (hexRand(row * 19 + i, col, seed) - 0.5) * size * 1.1
            ctx.fillStyle = pal.dark
            ctx.globalAlpha = 0.3
            ctx.beginPath()
            ctx.ellipse(cx + rx, cy + ry, size * 0.06, size * 0.04, hexRand(i, col, seed) * Math.PI, 0, Math.PI * 2)
            ctx.fill()
        }
        ctx.globalAlpha = 1
    }
    ctx.restore()
}

const drawShroudHex = (ctx, cx, cy, size, col, row, seed) => {
    hexPath(ctx, cx, cy, size * 0.99)
    ctx.fillStyle = '#080604'
    ctx.globalAlpha = 0.85 + hexRand(col, row, seed) * 0.1
    ctx.fill()
    ctx.globalAlpha = 1
    const rv = hexRand(col + 7, row + 3, seed)
    ctx.fillStyle = 'rgba(90,90,95,0.18)'
    ctx.beginPath()
    ctx.arc(cx + (rv - 0.5) * size * 0.6, cy + (hexRand(row + 9, col + 2, seed) - 0.5) * size * 0.6, size * 0.4, 0, Math.PI * 2)
    ctx.fill()
    hexPath(ctx, cx, cy, size * 0.99)
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'
    ctx.lineWidth = 1
    ctx.stroke()
}

const drawTree = (ctx, x, y, s, pal) => {
    const dark = pal.dark
    const base = pal.base || pal.accent
    // ground shadow
    ctx.fillStyle = 'rgba(0,0,0,0.28)'
    ctx.beginPath()
    ctx.ellipse(x + s * 0.08, y + s * 0.42, s * 0.42, s * 0.13, 0, 0, Math.PI * 2)
    ctx.fill()
    // trunk with a lit side
    ctx.fillStyle = '#3d2c18'
    ctx.fillRect(x - s * 0.09, y, s * 0.18, s * 0.42)
    ctx.fillStyle = '#5c4326'
    ctx.fillRect(x - s * 0.09, y, s * 0.07, s * 0.42)
    // three layered canopy tiers, dark base -> lit accent tip, with a highlighted left flank
    for (let i = 0; i < 3; i++) {
        const ty = y - s * (0.95 - i * 0.32)
        const wy = y - s * (0.25 - i * 0.32)
        ctx.fillStyle = dark
        ctx.beginPath()
        ctx.moveTo(x, ty)
        ctx.lineTo(x - s * 0.52, wy)
        ctx.lineTo(x + s * 0.52, wy)
        ctx.closePath()
        ctx.fill()
        // sunlit facet
        ctx.fillStyle = base
        ctx.globalAlpha = 0.55
        ctx.beginPath()
        ctx.moveTo(x, ty)
        ctx.lineTo(x - s * 0.52, wy)
        ctx.lineTo(x - s * 0.05, wy)
        ctx.closePath()
        ctx.fill()
        ctx.globalAlpha = 1
    }
}

const drawMountain = (ctx, cx, cy, s, pal, snowCap) => {
    const color = pal.dark
    // back (smaller, cooler) peak for depth
    ctx.fillStyle = shadeColor(color, -8)
    ctx.beginPath()
    ctx.moveTo(cx + s * 0.15, cy + s * 0.45)
    ctx.lineTo(cx + s * 0.55, cy - s * 0.55)
    ctx.lineTo(cx + s * 0.95, cy + s * 0.45)
    ctx.closePath()
    ctx.fill()

    // main peak, lit face + shadow face
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(cx - s, cy + s * 0.5)
    ctx.lineTo(cx - s * 0.15, cy - s * 0.9)
    ctx.lineTo(cx + s * 0.35, cy - s * 0.15)
    ctx.lineTo(cx + s * 0.75, cy + s * 0.5)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = shadeColor(color, 20)
    ctx.globalAlpha = 0.65
    ctx.beginPath()
    ctx.moveTo(cx - s * 0.15, cy - s * 0.9)
    ctx.lineTo(cx - s, cy + s * 0.5)
    ctx.lineTo(cx - s * 0.35, cy + s * 0.5)
    ctx.closePath()
    ctx.fill()
    ctx.globalAlpha = 1

    // rocky strata lines
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'
    ctx.lineWidth = 1
    for (let i = 1; i <= 2; i++) {
        ctx.beginPath()
        ctx.moveTo(cx - s * (1 - i * 0.28), cy + s * (0.5 - i * 0.35))
        ctx.lineTo(cx + s * (0.35 - i * 0.15), cy + s * (0.5 - i * 0.32))
        ctx.stroke()
    }

    if (snowCap) {
        ctx.fillStyle = '#f2f6f8'
        ctx.beginPath()
        ctx.moveTo(cx - s * 0.15, cy - s * 0.9)
        ctx.lineTo(cx - s * 0.4, cy - s * 0.35)
        ctx.lineTo(cx + s * 0.08, cy - s * 0.35)
        ctx.closePath()
        ctx.fill()
        ctx.fillStyle = '#bcd2dc'
        ctx.beginPath()
        ctx.moveTo(cx - s * 0.15, cy - s * 0.9)
        ctx.lineTo(cx - s * 0.4, cy - s * 0.35)
        ctx.lineTo(cx - s * 0.22, cy - s * 0.35)
        ctx.closePath()
        ctx.fill()
    }
}

const drawReeds = (ctx, cx, cy, s, color) => {
    ctx.strokeStyle = color
    ctx.lineWidth = 1.5
    for (let i = -1; i <= 1; i++) {
        ctx.beginPath()
        ctx.moveTo(cx + i * s * 0.4, cy + s * 0.4)
        ctx.quadraticCurveTo(cx + i * s * 0.4 + s * 0.15, cy, cx + i * s * 0.4, cy - s * 0.6)
        ctx.stroke()
    }
}

const drawLavaGlow = (ctx, cx, cy, s, clock, bass) => {
    const pulse = 0.5 + Math.sin(clock * 0.004) * 0.2 + bass * 0.3
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, s)
    g.addColorStop(0, `rgba(255,210,110,${0.75 * pulse})`)
    g.addColorStop(0.5, `rgba(255,140,40,${0.5 * pulse})`)
    g.addColorStop(1, 'rgba(255,80,20,0)')
    ctx.fillStyle = g
    ctx.beginPath(); ctx.arc(cx, cy, s, 0, Math.PI * 2); ctx.fill()

    // jagged glowing cracks
    ctx.strokeStyle = `rgba(255,180,70,${0.6 * pulse})`
    ctx.lineWidth = s * 0.06
    ctx.beginPath()
    ctx.moveTo(cx - s * 0.5, cy + s * 0.2)
    ctx.lineTo(cx - s * 0.1, cy - s * 0.1)
    ctx.lineTo(cx + s * 0.15, cy + s * 0.15)
    ctx.lineTo(cx + s * 0.55, cy - s * 0.25)
    ctx.stroke()

    // rising embers
    for (let i = 0; i < 3; i++) {
        const phase = (clock * 0.0006 + i * 0.33) % 1
        const ex = cx + Math.sin(clock * 0.001 + i * 4) * s * 0.35
        const ey = cy + s * 0.5 - phase * s * 1.4
        ctx.fillStyle = `rgba(255,200,90,${(1 - phase) * 0.8})`
        ctx.beginPath()
        ctx.arc(ex, ey, s * 0.05 * (1 - phase * 0.5), 0, Math.PI * 2)
        ctx.fill()
    }
}

const drawRoadMarks = (ctx, cx, cy, size, col, row, seed) => {
    ctx.save()
    hexPath(ctx, cx, cy, size * 0.97)
    ctx.clip()
    // worn dirt-road gradient down the middle
    const wear = ctx.createLinearGradient(cx, cy - size * 0.6, cx, cy + size * 0.6)
    wear.addColorStop(0, 'rgba(60,42,20,0.15)')
    wear.addColorStop(0.5, 'rgba(60,42,20,0.35)')
    wear.addColorStop(1, 'rgba(60,42,20,0.15)')
    ctx.fillStyle = wear
    ctx.fillRect(cx - size, cy - size * 0.55, size * 2, size * 1.1)

    // staggered cobblestones
    const rowsOfStones = 3
    for (let rIdx = 0; rIdx < rowsOfStones; rIdx++) {
        const py = cy - size * 0.32 + rIdx * size * 0.32
        const offset = rIdx % 2 ? size * 0.22 : 0
        for (let sIdx = -2; sIdx <= 2; sIdx++) {
            const rv = hexRand(col * 5 + sIdx + 30, row * 5 + rIdx, seed)
            const px = cx + sIdx * size * 0.42 + offset
            if (px < cx - size * 0.95 || px > cx + size * 0.95) continue
            ctx.fillStyle = rv > 0.5 ? '#8a6b45' : '#6f5738'
            ctx.beginPath()
            ctx.ellipse(px, py, size * 0.16, size * 0.09, 0, 0, Math.PI * 2)
            ctx.fill()
            ctx.strokeStyle = 'rgba(40,28,12,0.4)'
            ctx.lineWidth = 1
            ctx.stroke()
        }
    }
    ctx.restore()
}

const drawCastle = (ctx, cx, cy, size) => {
    const s = size * 1.05
    ctx.save()
    ctx.translate(cx, cy)

    // ground shadow
    ctx.fillStyle = 'rgba(0,0,0,0.32)'
    ctx.beginPath()
    ctx.ellipse(s * 0.08, s * 0.62, s * 0.85, s * 0.18, 0, 0, Math.PI * 2)
    ctx.fill()

    const stone = '#8f8f8f'
    const stoneDark = '#5f5f5f'
    const stoneLight = '#b3b3b3'
    const roof = '#7a2020'
    const roofDark = '#521414'

    const tower = (tx, ty, tw, th, roofH) => {
        // body with left-lit / right-shadow shading
        const g = ctx.createLinearGradient(tx - tw / 2, 0, tx + tw / 2, 0)
        g.addColorStop(0, stoneLight); g.addColorStop(0.55, stone); g.addColorStop(1, stoneDark)
        ctx.fillStyle = g
        ctx.fillRect(tx - tw / 2, ty - th, tw, th)
        // brick courses
        ctx.strokeStyle = 'rgba(0,0,0,0.18)'
        ctx.lineWidth = 1
        for (let by = ty - th + th * 0.18; by < ty; by += th * 0.22) {
            ctx.beginPath(); ctx.moveTo(tx - tw / 2, by); ctx.lineTo(tx + tw / 2, by); ctx.stroke()
        }
        // crenellations
        ctx.fillStyle = stoneDark
        const merlon = tw / 4
        for (let m = 0; m < 4; m++) {
            ctx.fillRect(tx - tw / 2 + m * merlon, ty - th - th * 0.12, merlon * 0.6, th * 0.12)
        }
        // conical roof
        ctx.fillStyle = roof
        ctx.beginPath()
        ctx.moveTo(tx - tw * 0.62, ty - th - th * 0.1)
        ctx.lineTo(tx, ty - th - roofH)
        ctx.lineTo(tx + tw * 0.62, ty - th - th * 0.1)
        ctx.closePath()
        ctx.fill()
        ctx.fillStyle = roofDark
        ctx.beginPath()
        ctx.moveTo(tx, ty - th - roofH)
        ctx.lineTo(tx + tw * 0.62, ty - th - th * 0.1)
        ctx.lineTo(tx + tw * 0.2, ty - th - th * 0.1)
        ctx.closePath()
        ctx.fill()
    }

    // side towers (drawn first, behind central gatehouse)
    tower(-s * 0.55, s * 0.5, s * 0.42, s * 0.95, s * 0.42)
    tower(s * 0.55, s * 0.5, s * 0.42, s * 0.95, s * 0.42)

    // central curtain wall
    const wg = ctx.createLinearGradient(-s * 0.42, 0, s * 0.42, 0)
    wg.addColorStop(0, stoneLight); wg.addColorStop(0.55, stone); wg.addColorStop(1, stoneDark)
    ctx.fillStyle = wg
    ctx.fillRect(-s * 0.42, -s * 0.05, s * 0.84, s * 0.55)
    ctx.strokeStyle = 'rgba(0,0,0,0.18)'
    for (let by = -s * 0.05 + s * 0.1; by < s * 0.5; by += s * 0.13) {
        ctx.beginPath(); ctx.moveTo(-s * 0.42, by); ctx.lineTo(s * 0.42, by); ctx.stroke()
    }
    // crenellations on curtain wall
    ctx.fillStyle = stoneDark
    for (let m = 0; m < 5; m++) {
        ctx.fillRect(-s * 0.42 + m * (s * 0.84 / 5), -s * 0.17, s * 0.84 / 5 * 0.6, s * 0.12)
    }
    // gate arch
    ctx.fillStyle = '#241a0e'
    ctx.beginPath()
    ctx.moveTo(-s * 0.14, s * 0.5)
    ctx.lineTo(-s * 0.14, s * 0.16)
    ctx.quadraticCurveTo(0, -s * 0.02, s * 0.14, s * 0.16)
    ctx.lineTo(s * 0.14, s * 0.5)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = '#6f5738'
    ctx.lineWidth = s * 0.03
    ctx.beginPath()
    ctx.moveTo(-s * 0.03, s * 0.5); ctx.lineTo(-s * 0.03, s * 0.2)
    ctx.moveTo(s * 0.03, s * 0.5); ctx.lineTo(s * 0.03, s * 0.2)
    ctx.stroke()

    // flag on the taller central point
    const flutter = Math.sin(Date.now() * 0.003) * s * 0.08
    ctx.strokeStyle = '#4a3418'
    ctx.lineWidth = s * 0.025
    ctx.beginPath(); ctx.moveTo(0, -s * 0.05); ctx.lineTo(0, -s * 0.55); ctx.stroke()
    ctx.fillStyle = '#c9a13a'
    ctx.beginPath()
    ctx.moveTo(0, -s * 0.55)
    ctx.lineTo(s * 0.28 + flutter, -s * 0.48)
    ctx.lineTo(0, -s * 0.38)
    ctx.closePath()
    ctx.fill()

    ctx.restore()
}

const drawBanner = (ctx, cx, cy, size, clock) => {
    const flutter = Math.sin(clock * 0.005) * 3
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)'
    ctx.beginPath()
    ctx.ellipse(cx, cy + size * 0.32, size * 0.24, size * 0.08, 0, 0, Math.PI * 2)
    ctx.fill()
    // pole
    ctx.strokeStyle = '#5c4326'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(cx, cy + size * 0.3)
    ctx.lineTo(cx, cy - size * 1.15)
    ctx.stroke()
    // finial
    ctx.fillStyle = '#e6c568'
    ctx.beginPath(); ctx.arc(cx, cy - size * 1.18, size * 0.07, 0, Math.PI * 2); ctx.fill()
    // two-tone fluttering pennant with a swallowtail notch
    ctx.fillStyle = '#8f2a2a'
    ctx.beginPath()
    ctx.moveTo(cx, cy - size * 1.08)
    ctx.lineTo(cx + size * 0.75 + flutter, cy - size * 0.92)
    ctx.lineTo(cx + size * 0.48 + flutter * 0.6, cy - size * 0.8)
    ctx.lineTo(cx + size * 0.75 + flutter, cy - size * 0.68)
    ctx.lineTo(cx, cy - size * 0.55)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = '#c9a13a'
    ctx.beginPath()
    ctx.moveTo(cx, cy - size * 1.08)
    ctx.lineTo(cx + size * 0.4 + flutter * 0.7, cy - size * 0.94)
    ctx.lineTo(cx + size * 0.28 + flutter * 0.5, cy - size * 0.815)
    ctx.lineTo(cx, cy - size * 0.87)
    ctx.closePath()
    ctx.fill()
}

const drawResourcePile = (ctx, cx, cy, size, clock) => {
    const bob = Math.sin(clock * 0.004) * size * 0.08
    const s = size * 0.62
    ctx.save()
    ctx.translate(cx, cy + bob)

    // soft glow halo
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 1.8)
    glow.addColorStop(0, 'rgba(255,215,106,0.35)')
    glow.addColorStop(1, 'rgba(255,215,106,0)')
    ctx.fillStyle = glow
    ctx.beginPath(); ctx.arc(0, 0, s * 1.8, 0, Math.PI * 2); ctx.fill()

    // ground shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)'
    ctx.beginPath()
    ctx.ellipse(0, s * 0.55, s * 0.6, s * 0.16, 0, 0, Math.PI * 2)
    ctx.fill()

    // chest base
    ctx.fillStyle = '#6b4a2c'
    ctx.fillRect(-s * 0.5, -s * 0.05, s, s * 0.5)
    ctx.fillStyle = '#4a3218'
    ctx.fillRect(-s * 0.5, s * 0.35, s, s * 0.1)
    // chest lid (open, tilted back)
    ctx.fillStyle = '#7a5537'
    ctx.beginPath()
    ctx.moveTo(-s * 0.5, -s * 0.05)
    ctx.quadraticCurveTo(-s * 0.5, -s * 0.55, 0, -s * 0.6)
    ctx.quadraticCurveTo(s * 0.5, -s * 0.55, s * 0.5, -s * 0.05)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = '#3a2818'
    ctx.lineWidth = 1.2
    ctx.stroke()
    // gold trim + lock
    ctx.strokeStyle = '#c9a13a'
    ctx.lineWidth = 1.5
    ctx.strokeRect(-s * 0.5, -s * 0.05, s, s * 0.5)
    ctx.fillStyle = '#c9a13a'
    ctx.fillRect(-s * 0.08, s * 0.05, s * 0.16, s * 0.16)

    // coins spilling out of the chest
    ctx.fillStyle = '#ffd76a'
    ctx.strokeStyle = '#a87b1e'
    ctx.lineWidth = 1
    for (let i = 0; i < 5; i++) {
        const cxo = -s * 0.35 + i * s * 0.18
        const cyo = -s * 0.15 - Math.abs(Math.sin(i * 1.7)) * s * 0.22
        ctx.beginPath()
        ctx.ellipse(cxo, cyo, s * 0.15, s * 0.1, 0, 0, Math.PI * 2)
        ctx.fill(); ctx.stroke()
    }
    // sparkle glints
    const tw = 0.5 + 0.5 * Math.sin(clock * 0.006)
    ctx.fillStyle = `rgba(255,255,255,${0.7 * tw})`
    ctx.beginPath(); ctx.arc(-s * 0.15, -s * 0.25, s * 0.05, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = `rgba(255,255,255,${0.5 * (1 - tw)})`
    ctx.beginPath(); ctx.arc(s * 0.2, -s * 0.1, s * 0.04, 0, Math.PI * 2); ctx.fill()

    ctx.restore()
}

const drawHero = (ctx, x, y, size, isDark, facingRight, audio) => {
    const s = size * 1.15
    const gallop = Math.sin(Date.now() * 0.008)
    const canter = Math.sin(Date.now() * 0.008 + Math.PI / 2)
    ctx.save()
    ctx.translate(x, y)
    if (!facingRight) ctx.scale(-1, 1)

    // contact shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)'
    ctx.beginPath()
    ctx.ellipse(0, s * 0.58, s * 0.58, s * 0.15, 0, 0, Math.PI * 2)
    ctx.fill()

    const heroTex = textureImages.hero
    if (heroTex) {
        const dim = s * 2.1
        ctx.drawImage(heroTex, -dim / 2, -dim * 0.85, dim, dim)
        ctx.restore()
        return
    }

    // --- rear legs (galloping stride) ---
    ctx.strokeStyle = '#3a2818'
    ctx.lineWidth = s * 0.1
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(-s * 0.32, s * 0.28); ctx.lineTo(-s * 0.42 - gallop * s * 0.12, s * 0.58 + Math.max(0, gallop) * s * 0.05)
    ctx.moveTo(-s * 0.2, s * 0.3); ctx.lineTo(-s * 0.14 + gallop * s * 0.1, s * 0.6 - Math.max(0, gallop) * s * 0.05)
    ctx.stroke()

    // --- horse body: two-tone barrel with light top / shaded belly ---
    const bodyGrad = ctx.createLinearGradient(0, s * 0.0, 0, s * 0.35)
    bodyGrad.addColorStop(0, '#8a6440')
    bodyGrad.addColorStop(1, '#4a3218')
    ctx.fillStyle = bodyGrad
    ctx.beginPath()
    ctx.ellipse(0, s * 0.14, s * 0.52, s * 0.29, 0, 0, Math.PI * 2)
    ctx.fill()

    // neck + chest leading forward
    ctx.fillStyle = '#6b4a2c'
    ctx.beginPath()
    ctx.moveTo(s * 0.32, s * 0.1)
    ctx.quadraticCurveTo(s * 0.55, -s * 0.05, s * 0.5, -s * 0.32)
    ctx.quadraticCurveTo(s * 0.38, -s * 0.28, s * 0.28, -s * 0.05)
    ctx.closePath()
    ctx.fill()

    // horse head
    ctx.fillStyle = '#5c4326'
    ctx.beginPath()
    ctx.moveTo(s * 0.46, -s * 0.3)
    ctx.quadraticCurveTo(s * 0.68, -s * 0.34, s * 0.78, -s * 0.22)
    ctx.quadraticCurveTo(s * 0.66, -s * 0.15, s * 0.5, -s * 0.16)
    ctx.closePath()
    ctx.fill()
    // mane
    ctx.fillStyle = '#2c2013'
    ctx.beginPath()
    ctx.moveTo(s * 0.5, -s * 0.34)
    ctx.quadraticCurveTo(s * 0.4, -s * 0.28 + canter * s * 0.03, s * 0.35, -s * 0.05)
    ctx.quadraticCurveTo(s * 0.45, -s * 0.15, s * 0.5, -s * 0.16)
    ctx.closePath()
    ctx.fill()
    // tail (flows behind, animated)
    ctx.fillStyle = '#2c2013'
    ctx.beginPath()
    ctx.moveTo(-s * 0.46, -s * 0.02)
    ctx.quadraticCurveTo(-s * 0.75 - gallop * s * 0.08, s * 0.1, -s * 0.68 - gallop * s * 0.1, s * 0.4)
    ctx.quadraticCurveTo(-s * 0.55, s * 0.15, -s * 0.4, s * 0.1)
    ctx.closePath()
    ctx.fill()

    // --- front legs (galloping stride, opposite phase) ---
    ctx.strokeStyle = '#3a2818'
    ctx.lineWidth = s * 0.1
    ctx.beginPath()
    ctx.moveTo(s * 0.22, s * 0.3); ctx.lineTo(s * 0.16 - gallop * s * 0.1, s * 0.6 + Math.max(0, -gallop) * s * 0.05)
    ctx.moveTo(s * 0.34, s * 0.28); ctx.lineTo(s * 0.46 - gallop * s * 0.14, s * 0.58 - Math.max(0, -gallop) * s * 0.05)
    ctx.stroke()
    // hooves
    ctx.fillStyle = '#1a1208'
    ctx.beginPath(); ctx.arc(s * 0.16 - gallop * s * 0.1, s * 0.6 + Math.max(0, -gallop) * s * 0.05, s * 0.05, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(s * 0.46 - gallop * s * 0.14, s * 0.58 - Math.max(0, -gallop) * s * 0.05, s * 0.05, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(-s * 0.42 - gallop * s * 0.12, s * 0.58 + Math.max(0, gallop) * s * 0.05, s * 0.05, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(-s * 0.14 + gallop * s * 0.1, s * 0.6 - Math.max(0, gallop) * s * 0.05, s * 0.05, 0, Math.PI * 2); ctx.fill()

    // saddle blanket
    ctx.fillStyle = '#8f2a2a'
    ctx.fillRect(-s * 0.15, -s * 0.06, s * 0.32, s * 0.16)
    ctx.strokeStyle = '#c9a13a'
    ctx.lineWidth = 1
    ctx.strokeRect(-s * 0.15, -s * 0.06, s * 0.32, s * 0.16)

    // flowing cloak (behind the rider, billowing with speed)
    ctx.fillStyle = '#7a2020'
    ctx.beginPath()
    ctx.moveTo(-s * 0.06, -s * 0.22)
    ctx.quadraticCurveTo(-s * 0.4 - audio.bass * s * 0.15, -s * 0.02, -s * 0.5 - audio.bass * s * 0.2, s * 0.22)
    ctx.quadraticCurveTo(-s * 0.25, s * 0.1, -s * 0.04, s * 0.04)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = '#5c1414'
    ctx.beginPath()
    ctx.moveTo(-s * 0.06, -s * 0.22)
    ctx.quadraticCurveTo(-s * 0.25, -s * 0.02, -s * 0.32 - audio.bass * s * 0.1, s * 0.14)
    ctx.quadraticCurveTo(-s * 0.16, s * 0.06, -s * 0.04, s * 0.04)
    ctx.closePath()
    ctx.fill()

    // rider torso (armored, lit facet)
    ctx.fillStyle = '#2a4d8f'
    ctx.beginPath()
    ctx.ellipse(s * 0.02, -s * 0.18, s * 0.2, s * 0.28, -0.1, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#3f66b8'
    ctx.beginPath()
    ctx.ellipse(-s * 0.03, -s * 0.24, s * 0.09, s * 0.2, -0.1, 0, Math.PI * 2)
    ctx.fill()
    // pauldron
    ctx.fillStyle = '#c9a13a'
    ctx.beginPath(); ctx.arc(-s * 0.06, -s * 0.32, s * 0.09, 0, Math.PI * 2); ctx.fill()

    // small shield on the off arm
    ctx.fillStyle = '#8a1f1f'
    ctx.beginPath()
    ctx.moveTo(-s * 0.18, -s * 0.08)
    ctx.quadraticCurveTo(-s * 0.3, -s * 0.05, -s * 0.28, s * 0.1)
    ctx.quadraticCurveTo(-s * 0.22, s * 0.18, -s * 0.15, s * 0.13)
    ctx.closePath()
    ctx.fill()
    ctx.strokeStyle = '#e6c568'
    ctx.lineWidth = 1.2
    ctx.stroke()

    // head + helmet
    ctx.fillStyle = '#e0b48a'
    ctx.beginPath()
    ctx.arc(s * 0.08, -s * 0.48, s * 0.15, 0, Math.PI * 2)
    ctx.fill()
    const helmGrad = ctx.createLinearGradient(s * 0.08 - s * 0.16, -s * 0.5, s * 0.08 + s * 0.16, -s * 0.5)
    helmGrad.addColorStop(0, '#e6c568')
    helmGrad.addColorStop(1, '#a37e2a')
    ctx.fillStyle = helmGrad
    ctx.beginPath()
    ctx.arc(s * 0.08, -s * 0.5, s * 0.165, Math.PI, Math.PI * 2)
    ctx.fill()
    ctx.fillRect(s * 0.03, -s * 0.5, s * 0.1, s * 0.06)
    // helmet shine
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.beginPath(); ctx.arc(s * 0.02, -s * 0.55, s * 0.03, 0, Math.PI * 2); ctx.fill()
    // plume
    ctx.strokeStyle = '#c0392b'
    ctx.lineWidth = s * 0.065
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(s * 0.08, -s * 0.63)
    ctx.quadraticCurveTo(s * 0.28 + Math.sin(Date.now() * 0.006) * 3, -s * 0.78, s * 0.18, -s * 0.93)
    ctx.stroke()

    // lance with pennant, bobbing slightly with the beat
    const lanceTip = { x: s * 0.68 + audio.bass * s * 0.12, y: -s * 0.78 - audio.high * s * 0.05 }
    ctx.strokeStyle = '#7a5f3c'
    ctx.lineWidth = s * 0.05
    ctx.beginPath()
    ctx.moveTo(s * 0.22, -s * 0.08)
    ctx.lineTo(lanceTip.x, lanceTip.y)
    ctx.stroke()
    ctx.fillStyle = '#d8dde0'
    ctx.beginPath()
    ctx.moveTo(lanceTip.x, lanceTip.y)
    ctx.lineTo(lanceTip.x + s * 0.14, lanceTip.y + s * 0.09)
    ctx.lineTo(lanceTip.x - s * 0.05, lanceTip.y + s * 0.14)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = '#c9a13a'
    ctx.beginPath()
    ctx.moveTo(s * 0.4, -s * 0.42)
    ctx.lineTo(s * 0.58 + audio.mid * s * 0.1, -s * 0.5)
    ctx.lineTo(s * 0.4, -s * 0.34)
    ctx.closePath()
    ctx.fill()

    ctx.restore()
}

// -----------------------------------------------------------------
// 8. INTERACTIVE UI HANDLERS
// -----------------------------------------------------------------
const handleCanvasSeek = (e) => {
    if (!map || !trackInfo.value.duration || !canvasRef.value) return
    const rect = canvasRef.value.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const x = clientX - rect.left
    const y = clientY - rect.top
    if (y < TOP_UI_HEIGHT.value || y > canvasRef.value.height - BOTTOM_UI_HEIGHT) return

    const worldX = x + cameraX
    const playableHeight = Math.max(60, canvasRef.value.height - TOP_UI_HEIGHT.value - BOTTOM_UI_HEIGHT)
    const size = getHexSize(playableHeight)

    let bestIdx = 0, bestDist = Infinity
    map.path.forEach((p, idx) => {
        const c = hexCenter(p.col, p.row, size)
        const d = Math.abs(c.x - worldX)
        if (d < bestDist) { bestDist = d; bestIdx = idx }
    })

    const targetTime = (bestIdx / (map.path.length - 1)) * trackInfo.value.duration
    if (typeof playerSdk.seek === 'function') {
        playerSdk.seek(targetTime)
        smoothX = targetTime
        currentTime = targetTime
    }
}

const handleLikeToggle = () => {
    if (reaction.value === 'LIKE' || reaction.value === 'DISLIKE') playerSdk.reaction('')
    else playerSdk.reaction('LIKE')
}

const togglePlay = () => {
    if (playerState.value === 'playing') playerSdk.pause()
    else playerSdk.play()
}

const openPlaylist = () => { if (typeof playerSdk.openPlaylist === 'function') playerSdk.openPlaylist() }

const handleRepeat = () => {
    if (repeat.value === 'none') {
        playerSdk.repeat('track')
    }
    else if (repeat.value === 'track') {
        playerSdk.repeat('queue')
    }
    else {
        playerSdk.repeat('none')
    }
}

const collapse = () => { playerSdk.collapse() }

// -----------------------------------------------------------------
// 9. AUXILIARY UTIL FUNCTIONS
// -----------------------------------------------------------------
const updateTrackData = (track) => {
    if (!track) return
    if (track.cover?.crop !== trackInfo.value?.cover?.crop) isCoverLoaded.value = false
    trackInfo.value = {
        ...track,
        artists: formatArtists(track),
        duration: track.duration || 0,
        cover: track.cover || null
    }
    map = generateMap(String(track.id || track.title || 'heroes-might-music'))
    collectedResources.clear()
    dustParticles = []
    goldPopups = []
    maxRevealedCol = REVEAL_RADIUS
    smoothX = 0
    currentTime = 0
    audioData = { bass: 0, mid: 0, high: 0 }
}

const formatArtists = (trackData) => {
    if (!trackData) return ''
    if (typeof trackData.artists === 'string') return trackData.artists
    const primary = trackData.contributors?.primary?.map(a => a.name).join(', ') || ''
    const featured = trackData.contributors?.featured?.length
        ? ` (feat. ${trackData.contributors.featured.map(a => a.name).join(', ')})`
        : ''
    return primary + featured
}

const formatNumber = (num) => {
    if (num === undefined || num === null) return '0'
    return Math.floor(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700&display=swap');

.minimap-container, .bottom-panel button, .controls-row button, .ui-panel * {
    -webkit-tap-highlight-color: transparent !important;
    -webkit-touch-callout: none;
}
.controls-row button:focus { outline: none !important; box-shadow: none !important; }

.heroes-container {
    position: fixed;
    top: 0; left: 0;
    width: 100vw; height: 100vh;
    z-index: 1;
    overflow: hidden;
    user-select: none;
    -webkit-user-select: none;
    font-family: 'Cinzel', Georgia, 'Times New Roman', serif;

    &.dark { background: #100b04; }
    &.light { background: #cdb87a; }
}

.game-canvas {
    display: block;
    width: 100%;
    height: 100%;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    outline: none;
    user-select: none;
}

.ui-panel {
    position: fixed;
    left: 0;
    width: 100vw;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    z-index: 10;
    background: linear-gradient(180deg, #4a3418 0%, #2c1d0d 100%);
    border-color: #c9a13a;
}

.top-panel {
    top: 0;
    min-height: 96px;
    padding: 0 20px 12px;
    justify-content: space-between;
    gap: 16px;
    border-bottom: 3px solid #7a5f3c;
    box-shadow: 0 2px 0 #c9a13a inset;
    align-items: end;
    padding-top: calc(var(--max-safe-area-inset-top, var(--tg-safe-area-inset-top, 0px)) + var(--max-content-safe-area-inset-top, var(--tg-content-safe-area-inset-top, 0px)));
}

.track-card {
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 0;
}

.portrait-frame {
    width: 62px; height: 62px;
    border-radius: 6px;
    padding: 3px;
    background: linear-gradient(135deg, #e6c568, #8a6a2a, #e6c568);
    box-shadow: 0 0 0 2px #2c1d0d, 0 2px 6px rgba(0,0,0,0.5);
    flex-shrink: 0;
}

.track-cover {
    width: 100%; height: 100%;
    border-radius: 3px;
    overflow: hidden;
    position: relative;
    background: #1a1208;
    display: flex; align-items: center; justify-content: center;
}
.track-cover.is-loading { background: #241a0c; }
.track-cover-img { width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 0.3s ease; }
.track-cover-img.is-visible { opacity: 1; }
.cover-placeholder { font-size: 22px; color: #c9a13a; }

.track-meta { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.track-meta .title {
    font-size: 15px; font-weight: 700; color: #f2e2b8;
    white-space: nowrap; max-width: 62vw; overflow: hidden; text-overflow: ellipsis;
    text-shadow: 1px 1px 0 #000;
    letter-spacing: 0.3px;
}
.track-meta .artist {
    font-size: 12px; color: #b89a5c;
    max-width: 62vw; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.plugin-spacer { width: 50px; height: 50px; flex-shrink: 0; }

.resource-bar {
    position: absolute;
    top: calc(var(--max-safe-area-inset-top, var(--tg-safe-area-inset-top, 0px)) + var(--max-content-safe-area-inset-top, var(--tg-content-safe-area-inset-top, 0px)) + 100px);
    left: 16px;
    z-index: 10;
    display: flex;
    gap: 8px;
    pointer-events: none;
}
.resource-chip {
    display: flex; align-items: center; gap: 6px;
    background: linear-gradient(180deg, #4a3418, #2c1d0d);
    border: 1.5px solid #c9a13a;
    border-radius: 5px;
    padding: 4px 10px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.5);
}
.res-icon { font-size: 13px; }
.res-value { font-size: 12px; font-weight: 700; color: #f2e2b8; letter-spacing: 0.5px; }

.bottom-panel {
    bottom: 0;
    height: 118px;
    border-top: 3px solid #7a5f3c;
    box-shadow: 0 -2px 0 #c9a13a inset;
    flex-direction: column;
    justify-content: center;
    padding: 0;
    gap: 10px;
}

.scroll-progress {
    position: absolute;
    top: 0; left: 0;
    width: 100%; height: 4px;
    background: rgba(0,0,0,0.4);
}
.scroll-progress-fill {
    height: 100%; width: 0;
    background: linear-gradient(90deg, #c9a13a, #ffd76a);
    transition: width 0.1s linear;
}

.controls-row {
    display: flex;
    justify-content: space-around;
    align-items: center;
    width: 100%;
    min-height: 60px;
    padding: 0 20px;
}
.controls-row .ui-btn {
    background: radial-gradient(circle at 35% 30%, #6b4a24, #2c1d0d 75%);
    border: 2px solid #c9a13a;
    border-radius: 50%;
    width: 42px; height: 42px;
    display: flex; align-items: center; justify-content: center;
    color: #f2e2b8;
    cursor: pointer;
    transition: transform 0.1s ease, box-shadow 0.15s ease;
    box-shadow: 0 2px 3px rgba(0,0,0,0.5);
}
.controls-row .ui-btn.play-btn {
    width: 52px; height: 52px;
    background: radial-gradient(circle at 35% 30%, #8f2a2a, #4a1414 75%);
}
.controls-row .ui-btn:active { transform: scale(0.88); }
.controls-row .ui-btn.is-active {
    box-shadow: 0 0 8px 2px #ffd76a, 0 2px 3px rgba(0,0,0,0.5) !important;
}
.controls-row .ui-btn:disabled { opacity: 0.35; filter: grayscale(0.6); cursor: default; }

.light .ui-panel { background: linear-gradient(180deg, #8a6a2a, #5c4318); }
.light .track-meta .title { color: #fff3d6; }
.light .track-meta .artist { color: #ead9a6; }
</style>