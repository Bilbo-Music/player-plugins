<template>
    <div class="yandex-pulse-container" :class="[theme]">
        <!-- Main interactive visualization canvas -->
        <canvas 
            ref="canvasRef" 
            class="visualizer-canvas" 
            @mousedown="handleGravityStart" 
            @mouseup="handleGravityEnd"
            @touchstart="handleGravityStart"
            @touchend="handleGravityEnd"
            @mousemove="handleGravityMove"
            @touchmove="handleGravityMove"
        ></canvas>

        <!-- TOP PANEL: Yandex Music style header with plugin spacer -->
        <div class="ui-panel top-panel">
            <div class="track-card">
                <div class="track-cover" :class="{ 'is-loading': !isCoverLoaded }">
                    <img 
                        v-if="trackInfo.cover?.crop"
                        :src="trackInfo.cover.crop" 
                        class="track-cover-img"
                        :class="{ 'is-visible': isCoverLoaded }"
                        @load="isCoverLoaded = true"
                    />
                    <div v-else class="cover-placeholder">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 11v1c0 1.66 1.34 3 3 3v2.93zm4.9-3.24c-.21-.4-.61-.69-1.09-.69h-.81v-3c0-.55-.45-1-1-1H10V7c0-.55-.45-1-1-1H7.07c1.55-1.88 3.91-3 6.56-3 3.95 0 7.23 2.76 7.93 6.5 0 .04-.01.08-.01.13v3.5c0 .72-.37 1.35-.95 1.71z"/>
                        </svg>
                    </div>
                </div>
                <div class="track-meta">
                    <div class="title">{{ trackInfo.title }}</div>
                    <div class="artist" v-if="trackInfo.artists">{{ trackInfo.artists }}</div>
                </div>
            </div>
            
            <!-- Spacer for parent container alignment -->
            <div class="plugin-spacer"></div>
        </div>

        <!-- HUD: Meditation score overlay -->
        <div class="score-panel">
            <div class="hud-score">ENERGY: {{ formatNumber(score) }}</div>
        </div>

        <!-- BOTTOM PANEL: Yandex Music minimalist footer -->
        <div class="ui-panel bottom-panel">
            <!-- Minimal wave progress minimap -->
            <div class="minimap-container" ref="minimapRef" @mousedown="handleMinimapSeek" @touchstart="handleMinimapSeek">
                <canvas ref="minimapCanvasRef" class="minimap-canvas"></canvas>
            </div>
            
            <!-- SVG Controls layout -->
            <div class="controls-row">
                <!-- Like Button -->
                <button class="ui-btn like-btn" @click="handleLikeToggle" :class="{ 'is-active': reaction === 'LIKE' }">
                    <svg width="24" height="24" viewBox="0 0 24 24" :fill="reaction === 'LIKE' ? '#FF3347' : 'none'" :stroke="reaction === 'LIKE' ? '#FF3347' : 'currentColor'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </button>

                <!-- Previous Track -->
                <button class="ui-btn prev-btn" :disabled="prevDisabled" @click="playerSdk.prev()">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                    </svg>
                </button>

                <!-- Main Circle Play/Pause Button -->
                <button class="ui-btn play-btn" @click="togglePlay">
                    <svg v-if="playerState !== 'playing'" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                    <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                </button>

                <!-- Next Track -->
                <button class="ui-btn next-btn" :disabled="nextDisabled" @click="playerSdk.next()">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 18l8.5-6L6 6zm9-12h2v12h-2z"/>
                    </svg>
                </button>

                <!-- Repeat Mode Button -->
                <button class="ui-btn repeat-btn" @click="handleRepeat" :class="{ 'is-active': repeat !== 'none' }">
                    <svg v-if="repeat === 'track'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="23 4 23 10 17 10"></polyline>
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                        <text x="9" y="16" font-size="10" font-weight="bold" fill="currentColor" stroke="none">1</text>
                    </svg>
                    <svg v-else-if="repeat === 'queue'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="23 4 23 10 17 10"></polyline>
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                    </svg>
                    <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="23 4 23 10 17 10"></polyline>
                        <polyline points="1 20 1 14 7 14"></polyline>
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                    </svg>
                </button>

                <!-- Open Queue Playlist -->
                <button class="ui-btn list-btn" :disabled="!hasQueue" @click="openPlaylist">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="8" y1="6" x2="21" y2="6"></line>
                        <line x1="8" y1="12" x2="21" y2="12"></line>
                        <line x1="8" y1="18" x2="21" y2="18"></line>
                        <line x1="3" y1="6" x2="3.01" y2="6"></line>
                        <line x1="3" y1="12" x2="3.01" y2="12"></line>
                        <line x1="3" y1="18" x2="3.01" y2="18"></line>
                    </svg>
                </button>

                <!-- Collapse Panel -->
                <button class="ui-btn list-btn" @click="collapse">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>


<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { playerSdk } from '@bilbomusic/player-plugin-sdk'

// -----------------------------------------------------------------
// 1. STATE & CONSTANTS
// -----------------------------------------------------------------
const canvasRef = ref(null)
const minimapRef = ref(null)
const minimapCanvasRef = ref(null)

const theme = ref('dark')
const isExpanded = ref(true)
const playerState = ref('paused')
const reaction = ref('')
const repeat = ref('none')
const isCoverLoaded = ref(false)

const nextDisabled = ref(false)
const prevDisabled = ref(true)
const hasQueue = ref(false)
const score = ref(Number(localStorage.getItem('yandex-pulse-score')) || 0)

const trackInfo = ref({
    title: 'Waiting for track...',
    artists: 'Loading...',
    cover: null,
    duration: 0,
    wave: []
})

const TOP_UI_HEIGHT = 90
const BOTTOM_UI_HEIGHT = 130
const SYNC_THRESHOLD = 1000

// Physics and generator parameters for elements
let currentTime = 0
let animationFrameId = null
let lastTimestamp = 0
let smoothX = 0
let noiseTime = 0 

let ringPos = { x: 200, y: 300, targetX: 200, targetY: 300, radius: 85 }
let isDragging = false
let pointerPos = { x: 0, y: 0 }
let particles = []
let audioData = { bass: 0, mid: 0, high: 0 }

// -----------------------------------------------------------------
// 2. INITIALIZATION & LIFECYCLE
// -----------------------------------------------------------------
let handleCanvasResize = null
let handleMinimapResize = null

const initCanvas = () => {
    const canvas = canvasRef.value
    if (!canvas) return
    
    handleCanvasResize = () => {
        canvas.width = canvas.parentElement.clientWidth
        canvas.height = canvas.parentElement.clientHeight
        if (!isDragging) {
            ringPos.targetX = canvas.width / 2
            ringPos.targetY = canvas.height / 2 + 15
        }
    }
    handleCanvasResize()
    window.addEventListener('resize', handleCanvasResize)
}

const initMinimap = () => {
    const canvas = minimapCanvasRef.value
    if (!canvas) return
    
    handleMinimapResize = () => {
        canvas.width = canvas.parentElement.clientWidth
        canvas.height = 36
    }
    handleMinimapResize()
    window.addEventListener('resize', handleMinimapResize)
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
    initMinimap()
    startLoop()
})

onBeforeUnmount(() => {
    if (animationFrameId) cancelAnimationFrame(animationFrameId)
    
    playerSdk.off('init', onInit, 'default')
    playerSdk.off('open', onOpen, 'default')
    playerSdk.off('position', onPosition, 'default')
    playerSdk.off('state', onState, 'default')
    playerSdk.off('theme', onTheme, 'default')
    playerSdk.off('reaction', onReaction, 'default')
    playerSdk.off('repeat', onRepeat, 'default')
    playerSdk.off('change', onChange, 'default')
    playerSdk.off('audioFrame', onAudioFrame, 'default')
    playerSdk.off('player', onPlayer, 'default')
    
    if (handleCanvasResize) window.removeEventListener('resize', handleCanvasResize)
    if (handleMinimapResize) window.removeEventListener('resize', handleMinimapResize)
})

// -----------------------------------------------------------------
// 3. SDK EVENT SUBSCRIPTIONS
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
    }
}

const onOpen = (payload) => { 
    if (payload?.track) updateTrackData(payload.track) 
}

const onPosition = (payload) => { 
    currentTime = payload.position
    if (!currentTime) smoothX = 0 
}

const onState = (payload) => { 
    if (payload?.state) playerState.value = payload.state 
}

const onTheme = (payload) => { 
    if (payload?.theme) theme.value = payload.theme 
}

const onReaction = (payload) => { 
    reaction.value = payload.reaction 
}

const onRepeat = (payload) => { 
    repeat.value = payload.value 
}

const onChange = ({ pane, type, payload }) => {
    if (pane !== 'default') return
    if (type === 'prevDisabled') prevDisabled.value = payload?.value
    if (type === 'nextDisabled') nextDisabled.value = payload?.value
    if (type === 'hasQueue') hasQueue.value = payload?.value
}

const onAudioFrame = (dataArray) => {
    if (!dataArray || !dataArray.length || playerState.value !== 'playing') {
        audioData.bass *= 0.85
        audioData.mid *= 0.85
        audioData.high *= 0.85
        return
    }
    const len = dataArray.length
    let bSum = 0, mSum = 0, hSum = 0
    const bEnd = Math.floor(len * 0.15) || 1
    const mEnd = Math.floor(len * 0.60) || 2
    
    for (let i = 0; i < len; i++) {
        const val = dataArray[i] || 0
        if (i < bEnd) bSum += val
        else if (i < mEnd) mSum += val
        else hSum += val
    }
    
    audioData.bass += ((bSum / bEnd / 255) - audioData.bass) * 0.2
    audioData.mid += ((mSum / (mEnd - bEnd) / 255) - audioData.mid) * 0.2
    audioData.high += ((hSum / (len - mEnd) / 255) - audioData.high) * 0.2
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

playerSdk.on('init', onInit, 'default')
playerSdk.on('open', onOpen, 'default')
playerSdk.on('position', onPosition, 'default')
playerSdk.on('state', onState, 'default')
playerSdk.on('theme', onTheme, 'default')
playerSdk.on('reaction', onReaction, 'default')
playerSdk.on('repeat', onRepeat, 'default')
playerSdk.on('change', onChange, 'default')
playerSdk.on('audioFrame', onAudioFrame, 'default')
playerSdk.on('player', onPlayer, 'default')

// -----------------------------------------------------------------
// 4. CANVAS INTERACTIVE HANDLERS (GRAVITY & FORCE)
// -----------------------------------------------------------------
const handleGravityStart = (e) => {
    const rect = canvasRef.value.getBoundingClientRect()
    
    const clientX = e.touches && e.touches.length ? e.touches[0].clientX : e.clientX
    const clientY = e.touches && e.touches.length ? e.touches[0].clientY : e.clientY
    
    const x = clientX - rect.left
    const y = clientY - rect.top
    
    if (y > canvasRef.value.height - BOTTOM_UI_HEIGHT || y < TOP_UI_HEIGHT) return
    
    isDragging = true
    pointerPos.x = x
    pointerPos.y = y
}

const handleGravityMove = (e) => {
    if (!isDragging) return
    const rect = canvasRef.value.getBoundingClientRect()
    
    const clientX = e.touches && e.touches.length ? e.touches[0].clientX : e.clientX
    const clientY = e.touches && e.touches.length ? e.touches[0].clientY : e.clientY
    
    pointerPos.x = clientX - rect.left
    pointerPos.y = clientY - rect.top
}

const handleGravityEnd = () => {
    isDragging = false
}

const handleMinimapSeek = (e) => {
    if (!trackInfo.value.duration || !minimapRef.value) return
    const rect = minimapRef.value.getBoundingClientRect()
    
    const clientX = e.touches && e.touches.length ? e.touches[0].clientX : e.clientX
    const clickX = clientX - rect.left
    
    const percentage = Math.max(0, Math.min(1, clickX / rect.width))
    const targetTime = percentage * trackInfo.value.duration
    
    if (typeof playerSdk.seek === 'function') {
        playerSdk.seek(targetTime)
        smoothX = targetTime
        currentTime = targetTime
    }
}



// -----------------------------------------------------------------
// 5. MAIN ANIMATION LOOP & CANVAS STREAM RENDER
// -----------------------------------------------------------------
const startLoop = () => {
    const render = (timestamp) => {
        if (!isExpanded.value) return
        const canvas = canvasRef.value
        if (!canvas) { 
            animationFrameId = requestAnimationFrame(render)
            return 
        }
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        if (!lastTimestamp) lastTimestamp = timestamp
        const deltaTime = timestamp - lastTimestamp
        lastTimestamp = timestamp

        const w = canvas.width
        const h = canvas.height
        const isDark = theme.value === 'dark'

        if (playerState.value === 'playing') {
            smoothX += deltaTime
            noiseTime += deltaTime * 0.003
            if (Math.abs(currentTime - smoothX) > SYNC_THRESHOLD) {
                smoothX = currentTime
            }
        } else {
            smoothX = currentTime || 0
        }

        ctx.fillStyle = isDark ? '#0A0A0C' : '#FFFFFF'
        ctx.fillRect(0, 0, w, h)

        const centerX = w > 0 ? w / 2 : 200
        const centerY = h > 0 ? h / 2 + 15 : 300

        if (isDragging) {
            ringPos.targetX = Number.isFinite(pointerPos.x) ? pointerPos.x : centerX
            ringPos.targetY = Number.isFinite(pointerPos.y) ? pointerPos.y : centerY
            
            if (playerState.value === 'playing') {
                score.value += Math.ceil(deltaTime * 0.05)
                localStorage.setItem('yandex-pulse-score', score.value.toString())
            }
        } else {
            ringPos.targetX = centerX
            ringPos.targetY = centerY
        }
        
        ringPos.x += (ringPos.targetX - ringPos.x) * 0.08
        ringPos.y += (ringPos.targetY - ringPos.y) * 0.08

        if (!Number.isFinite(ringPos.x) || !Number.isFinite(ringPos.y)) {
            ringPos.x = centerX
            ringPos.y = centerY
        }

        const yandexYellow = '#FFCC00'
        const yandexRed = '#FF3347'

        // Generate animation particle nodes
        if (playerState.value === 'playing' && audioData.bass > 0.4 && Math.random() < 0.6) {
            const angle = Math.random() * Math.PI * 2
            particles.push({
                x: ringPos.x + Math.cos(angle) * ringPos.radius,
                y: ringPos.y + Math.sin(angle) * ringPos.radius,
                vx: Math.cos(angle) * (1 + audioData.bass * 6) + (Math.random() - 0.5) * 2,
                vy: Math.sin(angle) * (1 + audioData.bass * 6) + (Math.random() - 0.5) * 2,
                size: Math.random() * 2 + 1,
                alpha: 1,
                color: Math.random() > 0.35 ? yandexYellow : '#FFFFFF'
            })
        }

        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i]
            p.x += p.vx
            p.y += p.vy
            p.alpha -= 0.015
            
            if (p.alpha <= 0) { 
                particles.splice(i, 1)
                continue 
            }
            
            ctx.save()
            ctx.globalAlpha = p.alpha
            ctx.fillStyle = p.color
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
            ctx.fill()
            ctx.restore()
        }

        const wave = trackInfo.value.wave || Array(100).fill(20)
        const totalPoints = wave.length
        const progressProgress = trackInfo.value.duration ? (smoothX / trackInfo.value.duration) : 0

        ctx.save()
        if (isDark) {
            ctx.shadowBlur = 20 + audioData.bass * 25
            ctx.shadowColor = yandexYellow
        }

        ctx.lineJoin = 'round'
        ctx.lineCap = 'round'
        ctx.beginPath()
        
        const baseRadius = ringPos.radius + (audioData.bass * 15)
        let cursorX = ringPos.x
        let cursorY = ringPos.y
        const targetCursorIdx = Math.max(0, Math.min(totalPoints - 1, Math.floor(progressProgress * (totalPoints - 1))))

        for (let i = 0; i < totalPoints; i++) {
            const rawVal = wave[i] || 0
            const normalizedVal = Math.min(350, rawVal)
            const waveNoise = Math.sin(i * 0.3 + noiseTime) * (5 + audioData.bass * 15) + 
                              Math.cos(i * 0.7 - noiseTime * 1.5) * (3 + audioData.mid * 10)
            
            const waveExtrusion = (normalizedVal / 350) * 40 * (1 + audioData.mid) + waveNoise
            const currentRadius = Math.max(ringPos.radius * 0.5, baseRadius + waveExtrusion)
            
            const angle = (i / totalPoints) * Math.PI * 2
            const x = ringPos.x + Math.cos(angle) * currentRadius
            const y = ringPos.y + Math.sin(angle) * currentRadius
            
            if (i === 0) {
                ctx.moveTo(x, y)
            } else {
                ctx.lineTo(x, y)
            }

            if (i === targetCursorIdx) {
                cursorX = x
                cursorY = y
            }
        }

        ctx.closePath()

        let ringGradient = ctx.createLinearGradient(ringPos.x - 100, ringPos.y, ringPos.x + 100, ringPos.y)
        ringGradient.addColorStop(0, yandexYellow)
        ringGradient.addColorStop(1, yandexRed)

        ctx.lineWidth = 4 + audioData.high * 4
        ctx.strokeStyle = ringGradient
        ctx.stroke()
        ctx.restore()

        // =================================================================
        // INFLATABLE JIGGLING YANDEX LOGO SKINNED MESH
        // =================================================================
        ctx.save()
        ctx.translate(ringPos.x, ringPos.y)

        // Tilt animation based on inertia and generative audio track node noise
        let windX = Math.sin(noiseTime * 2) * (3 + audioData.mid * 15)
        if (isDragging) {
            const angleToTarget = Math.atan2(ringPos.targetY - ringPos.y, ringPos.targetX - ringPos.x)
            ctx.rotate(Number.isFinite(angleToTarget) ? angleToTarget * 0.2 : 0)
        }

        // Y-avatar mesh parameters
        const baseWidth = 14 + audioData.bass * 6 
        const stemLength = 26                     
        const armLength = 32                      
        
        // Audio node wing wobbles mapping mid/high spectrums
        const leftArmWobbleX = Math.sin(noiseTime * 3) * (5 + audioData.high * 15) + windX
        const leftArmWobbleY = Math.cos(noiseTime * 2) * (3 + audioData.mid * 8)
        const rightArmWobbleX = Math.cos(noiseTime * 2.5) * (5 + audioData.high * 15) + windX
        const rightArmWobbleY = Math.sin(noiseTime * 3.5) * (3 + audioData.mid * 8)

        // Key skeleton nodes for skinned Y mesh
        const bottomPoint = { x: windX * 0.2, y: stemLength }
        const centerPoint = { x: windX * 0.6, y: 0 }
        const leftTopPoint = { x: -armLength + leftArmWobbleX, y: -armLength + leftArmWobbleY }
        const rightTopPoint = { x: armLength + rightArmWobbleX, y: -armLength + rightArmWobbleY }

        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.lineWidth = baseWidth

        // Complex brand gradient configuration: Orange -> Red -> Fuchsia
        let yGlowGradient = ctx.createLinearGradient(-armLength, -armLength, armLength, stemLength)
        yGlowGradient.addColorStop(0, '#FF6600') 
        yGlowGradient.addColorStop(0.5, '#FF1E43') 
        yGlowGradient.addColorStop(1, '#FF45B8')   

        ctx.strokeStyle = yGlowGradient

        // 1. Draw left segment down to root anchor
        ctx.beginPath()
        ctx.moveTo(leftTopPoint.x, leftTopPoint.y)
        ctx.lineTo(centerPoint.x, centerPoint.y)
        ctx.lineTo(bottomPoint.x, bottomPoint.y)
        ctx.stroke()

        // 2. Draw right wing segment intersecting at geometric center
        ctx.beginPath()
        ctx.moveTo(rightTopPoint.x, rightTopPoint.y)
        ctx.lineTo(centerPoint.x, centerPoint.y)
        ctx.stroke()
        
        ctx.restore()
        // =================================================================

        // Tracker node sphere cursor
        ctx.fillStyle = isDark ? '#FFFFFF' : '#0A0A0C'
        ctx.strokeStyle = yandexRed
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(cursorX, cursorY, 6 + audioData.mid * 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()

        drawMinimap()
        animationFrameId = requestAnimationFrame(render)
    }
    animationFrameId = requestAnimationFrame(render)
}



// -----------------------------------------------------------------
// 6. MINIMALIST PROGRESS WAVER MINIMAP RENDERER
// -----------------------------------------------------------------
const drawMinimap = () => {
    const canvas = minimapCanvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    const isDark = theme.value === 'dark'
    ctx.clearRect(0, 0, w, h)

    const wave = trackInfo.value.wave && trackInfo.value.wave.length ? trackInfo.value.wave : Array(100).fill(20)
    const totalBars = wave.length
    const gap = 1
    const barWidth = w / totalBars - gap
    const currentProgress = trackInfo.value.duration ? (smoothX / trackInfo.value.duration) : 0

    for (let i = 0; i < totalBars; i++) {
        const rawVal = wave[i] || 0
        const norm = Math.min(350, rawVal)
        const barHeight = Math.max(2, (norm / 350) * (h - 6))
        const x = i * (barWidth + gap)
        const y = (h - barHeight) / 2

        if ((i / totalBars) <= currentProgress) {
            ctx.fillStyle = isDark ? '#FFFFFF' : '#1A1A20'
        } else {
            ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)'
        }
        ctx.fillRect(x, y, barWidth, barHeight)
    }

    const progressX = currentProgress * w
    ctx.fillStyle = isDark ? '#FF3347' : '#F51B30'
    ctx.fillRect(progressX - 1, 0, 2, h)
}

// -----------------------------------------------------------------
// 7. AUXILIARY UTILS & PLAYER HANDLERS
// -----------------------------------------------------------------
const updateTrackData = (track) => {
    if (!track) return
    if (track.cover?.crop !== trackInfo.value?.cover?.crop) {
        isCoverLoaded.value = false
    }
    
    trackInfo.value = {
        ...track,
        artists: track.artists || (track.contributors?.primary?.map(a => a.name).join(', ') || 'Исполнитель'),
        duration: track.duration || 0,
        wave: track.wave && track.wave.length ? track.wave : Array(100).fill(20)
    }
    smoothX = 0
    currentTime = 0
    particles = []
}

const togglePlay = () => { 
    if (playerState.value === 'playing') {
        playerSdk.pause()
    } else {
        playerSdk.play()
    }
}

const handleLikeToggle = () => { 
    playerSdk.reaction(reaction.value === 'LIKE' ? '' : 'LIKE') 
}

const openPlaylist = () => { 
    if (typeof playerSdk.openPlaylist === 'function') {
        playerSdk.openPlaylist() 
    }
}

const collapse = () => { 
    playerSdk.collapse() 
}

const handleRepeat = () => { 
    if (repeat.value === 'none') {
        playerSdk.repeat('track')
    } else if (repeat.value === 'track') {
        playerSdk.repeat('queue')
    } else {
        playerSdk.repeat('none')
    }
}

const formatNumber = (num) => {
    if (num === undefined || num === null) return '0'
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
</script>

<style scoped>
.minimap-container, 
.controls-row button, 
.ui-panel * {
    -webkit-tap-highlight-color: transparent !important;
    -webkit-touch-callout: none;
    user-select: none;
}

.yandex-pulse-container {
    position: fixed; 
    top: 0; 
    left: 0; 
    width: 100vw; 
    height: 100vh;
    z-index: 1; 
    overflow: hidden;
    font-family: 'YS Text', -apple-system, BlinkMacSystemFont, Arial, sans-serif;
}

.yandex-pulse-container.dark { 
    background: #0A0A0C; 
}

.yandex-pulse-container.light { 
    background: #FFFFFF; 
}

.visualizer-canvas { 
    display: block; 
    width: 100%; 
    height: 100%; 
    cursor: grab; 
}

.visualizer-canvas:active { 
    cursor: grabbing; 
}

/* TOP PANEL */
.top-panel {
    position: fixed; 
    top: 0; 
    left: 0; 
    width: 100vw; 
    min-height: 90px;
    box-sizing: border-box; 
    display: flex; 
    align-items: center; 
    justify-content: space-between;
    padding: 0 24px 12px; 
    z-index: 10; 
    border-bottom: 1px solid transparent;
    padding-top: calc(var(--max-safe-area-inset-top, var(--tg-safe-area-inset-top, 0px)) + var(--max-content-safe-area-inset-top, var(--tg-content-safe-area-inset-top, 0px)) + 12px);
}

.dark .top-panel { 
    background: rgba(10, 10, 12, 0.75); 
    backdrop-filter: blur(20px); 
    border-color: rgba(255, 255, 255, 0.04); 
    color: #FFF; 
}

.light .top-panel { 
    background: rgba(255, 255, 255, 0.8); 
    backdrop-filter: blur(20px); 
    border-color: rgba(0, 0, 0, 0.04); 
    color: #1A1A20; 
}

.track-card { 
    display: flex; 
    align-items: center; 
    gap: 14px; 
    min-width: 0; 
    flex-grow: 1; 
}

.track-cover { 
    width: 52px; 
    height: 52px; 
    border-radius: 8px; 
    overflow: hidden; 
    background: #23232A; 
    flex-shrink: 0; 
}

.track-cover-img { 
    width: 100%; 
    height: 100%; 
    object-fit: cover; 
    opacity: 0; 
    transition: opacity 0.2s; 
}

.track-cover-img.is-visible { 
    opacity: 1; 
}

.cover-placeholder { 
    width: 100%; 
    height: 100%; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    font-size: 20px; 
    background: #23232A; 
    color: #8E8E93; 
}

.light .cover-placeholder { 
    background: #F4F4F5; 
    color: #A1A1AA; 
}

.track-meta { 
    display: flex; 
    flex-direction: column; 
    gap: 2px; 
    min-width: 0; 
}

.track-meta .title { 
    font-size: 15px; 
    font-weight: 600; 
    white-space: nowrap; 
    overflow: hidden; 
    text-overflow: ellipsis; 
    max-width: 55vw; 
}

.track-meta .artist { 
    font-size: 12px; 
    color: #8E8E93; 
    white-space: nowrap; 
    overflow: hidden; 
    text-overflow: ellipsis; 
    max-width: 55vw; 
}

/* Plugin system spacer */
.plugin-spacer { 
    width: 50px; 
    height: 50px; 
    flex-shrink: 0; 
}

/* HUD PANEL */
.score-panel {
    position: absolute; 
    top: calc(var(--max-safe-area-inset-top, var(--tg-safe-area-inset-top, 0px)) + var(--max-content-safe-area-inset-top, var(--tg-content-safe-area-inset-top, 0px)) + 100px);
    left: 24px; 
    z-index: 5; 
    pointer-events: none;
    font-family: monospace; 
    font-size: 12px; 
    font-weight: 700;
}

.dark .score-panel { 
    color: rgba(255, 255, 255, 0.4); 
}

.light .score-panel { 
    color: rgba(0, 0, 0, 0.4); 
}

.hud-score { 
    color: #FF3347 !important; 
    margin-bottom: 2px; 
}

/* BOTTOM PANEL */
.bottom-panel {
    position: fixed; 
    bottom: 0; 
    left: 0; 
    width: 100vw; 
    height: 130px;
    box-sizing: border-box; 
    display: flex; 
    flex-direction: column; 
    justify-content: space-between;
    padding: 12px 24px 20px 24px; 
    z-index: 10;
}

.dark .bottom-panel { 
    background: linear-gradient(to top, #0A0A0C 75%, transparent); 
    color: #FFFFFF; 
}

.light .bottom-panel { 
    background: linear-gradient(to top, #FFFFFF 75%, transparent); 
    color: #1A1A20; 
}

/* MINIMAP */
.minimap-container { 
    width: 100%; 
    height: 36px; 
    cursor: pointer; 
    border-radius: 6px; 
    position: relative; 
    transition: background 0.2s; 
}

.minimap-canvas { 
    display: block; 
    width: 100%; 
    height: 100%; 
    pointer-events: none; 
}

/* CONTROLS ROW */
.controls-row { 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    width: 100%; 
}

.ui-btn { 
    background: none; 
    border: none; 
    cursor: pointer; 
    padding: 8px; 
    color: inherit; 
    opacity: 0.8; 
    transition: transform 0.1s, opacity 0.2s, color 0.2s; 
    display: flex; 
    align-items: center; 
    justify-content: center;
}

.ui-btn:hover { 
    opacity: 1; 
}

.ui-btn:active { 
    transform: scale(0.9); 
}

.ui-btn:disabled { 
    opacity: 0.25; 
    filter: grayscale(1); 
    pointer-events: none; 
}

/* Big Play button in Yandex Music style */
.play-btn { 
    background: #FFCC00; 
    color: #000000; 
    width: 50px; 
    height: 50px; 
    border-radius: 50%; 
    box-shadow: 0 4px 14px rgba(255, 204, 0, 0.3); 
    opacity: 1 !important; 
}

.light .play-btn { 
    background: #1A1A20; 
    color: #FFFFFF; 
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15); 
}

.play-btn:active { 
    transform: scale(0.93); 
}

.like-btn.is-active { 
    color: #FF3347; 
    opacity: 1; 
    filter: drop-shadow(0 0 6px rgba(255, 51, 71, 0.4)); 
}

.repeat-btn.is-active { 
    color: #FFCC00; 
    opacity: 1; 
}

.light .repeat-btn.is-active { 
    color: #F51B30; 
}


</style>
