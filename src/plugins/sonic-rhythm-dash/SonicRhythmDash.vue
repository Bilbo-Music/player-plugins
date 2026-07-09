<template>
    <div class="sonic-monolith-container" :class="[theme]">
        <!-- Game canvas for physics, Sonic, road, and rings -->
        <canvas 
            ref="canvasRef" 
            class="game-canvas" 
            @mousedown="handlePressStart" 
            @mouseup="handlePressEnd"
            @touchstart="handlePressStart"
            @touchend="handlePressEnd"
        ></canvas>

        <!-- TOP PANEL: Track information -->
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
                </div>
                <div class="track-meta">
                    <div class="title">{{ trackInfo.title }}</div>
                    <div class="artist" v-if="trackInfo.artists">{{ trackInfo.artists }}</div>
                </div>
            </div>
            <!-- Spacer for parent container button alignment -->
            <div class="plugin-spacer"></div>
        </div>

        <!-- GAME HUD: Absolute score panel overlay -->
        <div class="score-panel">
            <div class="hud-score">ALL: {{ formatNumber(score) }}</div>
            <div class="hud-track-score">TRACK: {{ formatNumber(trackScore) }}</div>
        </div>

        <!-- BOTTOM PANEL: Interactive HTML UI -->
        <div class="ui-panel bottom-panel">
            <!-- Thin progress bar -->
            <div class="progress-bar-container">
                <div class="progress-bar-fill" :style="{ width: progressPercent + '%' }"></div>
            </div>

            <!-- Interactive minimap with waveform and progress tracking -->
            <div class="minimap-container" ref="minimapRef" @mousedown="handleMinimapSeek" @touchstart="handleMinimapSeek">
                <canvas ref="minimapCanvasRef" class="minimap-canvas"></canvas>
            </div>
            
            <!-- Player control buttons -->
            <div class="controls-row">
                <button class="ui-btn like-btn" @click="handleLikeToggle">
                    {{ reaction === 'LIKE' ? '❤️' : ( reaction === 'DISLIKE' ? '💔' : '🤍' ) }}
                </button>
                <button class="ui-btn prev-btn" :disabled="prevDisabled" @click="playerSdk.prev()">⏮️</button>
                <button class="ui-btn play-btn" @click="togglePlay">
                    {{ playerState === 'playing' ? '⏸️' : '▶️' }}
                </button>
                <button class="ui-btn next-btn" :disabled="nextDisabled" @click="playerSdk.next()">⏭️</button>
                <button class="ui-btn next-btn" @click="handleRepeat">
                    <span v-if="repeat === 'none'" class="repeat-none">🔁</span>
                    <template v-if="repeat === 'queue'">🔁</template>
                    <template v-if="repeat === 'track'">🔂</template>
                </button>
                <button class="ui-btn list-btn" :disabled="!hasQueue" @click="openPlaylist">🎶</button>
                <button class="ui-btn list-btn" @click="collapse">🔽</button>
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

const score = ref(Number(localStorage.getItem('sonic-rhytm-dash-score')) || 0)
const trackScore = ref(0)
const collectedRings = ref(new Set())

const trackInfo = ref({
    title: 'Waiting for track...',
    artists: 'Loading...',
    cover: null,
    duration: 0,
    wave: []
})

// UI Layout constants for canvas boundaries
const TOP_UI_HEIGHT = 100
const BOTTOM_UI_HEIGHT = 110
const SYNC_THRESHOLD = 1000

// Physics state
let currentTime = 0
let animationFrameId = null
let lastTimestamp = 0
let smoothX = 0
let decorativeTimer = 0 

let sonic = {
    x: 100,
    y: 200,
    radius: 14,
    vy: 0,
    gravity: 0.45,
    baseJumpForce: -5,
    maxJumpForce: -11,
    isGrounded: false,
    rotation: 0
}

let isChargingJump = false
let jumpCharge = 0
let particles = [] 
let chargeParticles = []
let audioData = { bass: 0, mid: 0, high: 0 }

// Computed
const progressPercent = computed(() => {
    if (!trackInfo.value.duration) return 0
    return (smoothX / trackInfo.value.duration) * 100
})

// -----------------------------------------------------------------
// 2. INITIALIZATION & LIFECYCLE
// -----------------------------------------------------------------
let handleCanvasResize = null;
let handleMinimapResize = null;

const initCanvas = () => {
    const canvas = canvasRef.value
    if (!canvas) return

    handleCanvasResize = () => {
        canvas.width = canvas.parentElement.clientWidth
        canvas.height = canvas.parentElement.clientHeight
    }
    handleCanvasResize ()
    window.addEventListener('resize', handleCanvasResize)
}

const initMinimap = () => {
    const canvas = minimapCanvasRef.value
    if (!canvas) return

    handleMinimapResize = () => {
        canvas.width = canvas.parentElement.clientWidth
        canvas.height = 45
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
    initCanvas()
    initMinimap()
    startLoop()
})

onBeforeUnmount(() => {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
    }

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

    if (handleCanvasResize) {
        window.removeEventListener('resize', handleCanvasResize)
    }

    if (handleMinimapResize) {
        window.removeEventListener('resize', handleMinimapResize)
    }
});

// -----------------------------------------------------------------
// 3. SDK EVENT SUBSCRIPTIONS
// -----------------------------------------------------------------
const onInit = (state) => {
    if (state?.player) {
        isExpanded.value = state.player.expanded !== false
    }
    if (state?.theme) {
        theme.value = state.theme
    }

    repeat.value = state.panes?.default?.repeat
    nextDisabled.value = state.panes?.default?.nextDisabled
    prevDisabled.value = state.panes?.default?.prevDisabled
    hasQueue.value = state.panes?.default?.hasQueue

    if (state?.panes?.default?.track) {
        updateTrackData(state.panes.default.track)
    }

    if (state?.panes?.default?.state) {
        playerState.value = state.panes.default.state
    }

    if (state?.panes?.default?.reaction) {
        reaction.value = state.panes.default.reaction
    }

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
    if (payload?.track) {
        updateTrackData(payload.track)
        collectedRings.value.clear()
    }
}

const onPosition = (payload) => {
    currentTime = payload.position
    if (!currentTime) {
        smoothX = 0
    }
}

const onState = (payload) => {
    if (payload?.state) {
        playerState.value = payload.state
    }
}

const onTheme = (payload) => {
    if (payload?.theme) {
        theme.value = payload.theme
    }
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
    let bassSum = 0, midSum = 0, highSum = 0
    
    const bassEnd = Math.floor(len * 0.15) || 1
    const midEnd = Math.floor(len * 0.60) || 2

    for (let i = 0; i < len; i++) {
        const val = dataArray[i] || 0
        if (i < bassEnd) {
            bassSum += val
        } else if (i < midEnd) {
            midSum += val
        } else {
            highSum += val
        }
    }

    const targetBass = (bassSum / bassEnd) / 255
    const targetMid = (midSum / (midEnd - bassEnd)) / 255
    const targetHigh = (highSum / (len - midEnd)) / 255

    const safeBass = isNaN(targetBass) || !isFinite(targetBass) ? 0 : targetBass
    const safeMid = isNaN(targetMid) || !isFinite(targetMid) ? 0 : targetMid
    const safeHigh = isNaN(targetHigh) || !isFinite(targetHigh) ? 0 : targetHigh

    // Smooth transition using linear interpolation (Lerp)
    audioData.bass += (safeBass - audioData.bass) * 0.2
    audioData.mid += (safeMid - audioData.mid) * 0.2
    audioData.high += (safeHigh - audioData.high) * 0.2
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

playerSdk.on('init', onInit);
playerSdk.on('open', onOpen);
playerSdk.on('position', onPosition)
playerSdk.on('state', onState)
playerSdk.on('theme', onTheme)
playerSdk.on('reaction', onReaction)
playerSdk.on('repeat', onRepeat)
playerSdk.on('change', onChange)
playerSdk.on('audioFrame', onAudioFrame)
playerSdk.on('player', onPlayer)

// -----------------------------------------------------------------
// 4. GAME LOOP, PHYSICS & RENDERERS
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
        
        const colorFloor = isDark ? '#18181b' : '#e4e4e7'
        const colorSonic = isDark ? '#00f0ff' : '#2082f0'
        
        const gameTopY = TOP_UI_HEIGHT
        const gameBottomY = h - BOTTOM_UI_HEIGHT
        const playableHeight = gameBottomY - gameTopY
        const gameMidY = gameTopY + playableHeight * 0.6
        
        ctx.fillStyle = isDark ? '#09090b' : '#ffffff'
        ctx.fillRect(0, gameTopY, w, playableHeight)

        // 1. Timeline Synchronization
        if (playerState.value === 'playing') {
            smoothX += deltaTime
            const diff = Math.abs(currentTime - smoothX)
            if (diff > SYNC_THRESHOLD) {
                smoothX = currentTime
            } 
        } else {
            smoothX = currentTime || 0
        }

        // 2. Jump Charge Update
        if (isChargingJump && playerState.value === 'playing' && currentTime) {
            jumpCharge -= 0.011 * deltaTime
            if (jumpCharge < sonic.maxJumpForce) {
                jumpCharge = sonic.maxJumpForce
            }
        }

        // 3. Render Road Base Geometry
        ctx.fillStyle = colorFloor
        ctx.beginPath()
        ctx.moveTo(0, gameBottomY)
        
        for (let x = 0; x <= w; x += 8) {
            const roadY = getRoadHeightAtX(x, w, playableHeight, gameMidY)
            ctx.lineTo(x, roadY)
        }
        ctx.lineTo(w, gameBottomY)
        ctx.fill()

        // 4. Render Road Stroke Border
        ctx.strokeStyle = colorSonic
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(0, getRoadHeightAtX(0, w, playableHeight, gameMidY))
        for (let x = 8; x <= w; x += 8) {
            ctx.lineTo(x, getRoadHeightAtX(x, w, playableHeight, gameMidY))
        }
        ctx.stroke()

        // 5. Ball/Sonic Physics Engine
        const currentFloorUnderSonic = getRoadHeightAtX(sonic.x, w, playableHeight, gameMidY)
        if (playerState.value === 'playing' && currentTime) {
            const timeScale = deltaTime / 16.66 
            sonic.vy += sonic.gravity * timeScale
            sonic.y += sonic.vy * timeScale
            sonic.rotation += 0.12 * timeScale
        } else {
            decorativeTimer += 0.04
            sonic.y = currentFloorUnderSonic - sonic.radius - Math.abs(Math.sin(decorativeTimer)) * 25
            sonic.rotation += 0.02
        }

        if (playerState.value === 'playing' && sonic.y > currentFloorUnderSonic - sonic.radius) {
            sonic.y = currentFloorUnderSonic - sonic.radius
            sonic.vy = 0
            sonic.isGrounded = true
        }

        // 6. Render Sonic Character Node
        ctx.save()
        ctx.translate(sonic.x, sonic.y)
        ctx.rotate(sonic.rotation)
        ctx.lineWidth = 4
        ctx.strokeStyle = colorSonic
        
        const dynamicRadius = sonic.radius + (audioData.bass * 5)
        ctx.beginPath()
        ctx.arc(0, 0, dynamicRadius, 0, Math.PI * 2)
        ctx.stroke()

        ctx.fillStyle = isDark ? '#fff' : '#000'
        ctx.beginPath()
        ctx.arc(5, 0, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        // 7. Particle Effects (High Frequencies)
        if (playerState.value === 'playing' && audioData.high > 0.4 && Math.random() < audioData.high) {
            particles.push({
                x: sonic.x - 10,
                y: sonic.y + (Math.random() - 0.5) * sonic.radius,
                vx: -2 - Math.random() * 2,
                vy: (Math.random() - 0.5) * 2,
                radius: Math.random() * 2 + 1,
                color: isDark ? '#ffffff' : '#2082f0',
                alpha: 0.8
            })
        }

        // 8. Jump Charge Ring Aura Generation
        if (isChargingJump && playerState.value === 'playing' && currentTime) {
            const chargePct = (jumpCharge - sonic.baseJumpForce) / (sonic.maxJumpForce - sonic.baseJumpForce)
            const spawnCount = Math.ceil(2 * (deltaTime / 16.66) * (1 + chargePct * 2))
            
            for (let i = 0; i < spawnCount; i++) {
                const angle = Math.random() * Math.PI * 2
                const startRadius = sonic.radius + 15 + Math.random() * 25 
                
                chargeParticles.push({
                    angle: angle,
                    radius: startRadius,
                    angularSpeed: (0.05 + Math.random() * 0.05) * (1 + chargePct),
                    shrinkSpeed: (0.4 + Math.random() * 0.6) * (deltaTime / 16.66),
                    size: Math.random() * 2 + 1,
                    color: chargePct > 0.85 ? '#ffffff' : (chargePct > 0.5 ? '#00f0ff' : '#eab308'),
                    alpha: 1
                })
            }
        }

        // 9. Process Charge Vortex Particles
        for (let i = chargeParticles.length - 1; i >= 0; i--) {
            let p = chargeParticles[i]
            p.radius -= p.shrinkSpeed
            p.angle += p.angularSpeed
            
            if (p.radius <= sonic.radius - 2 || p.alpha <= 0) {
                chargeParticles.splice(i, 1)
                continue
            }
            
            const pX = sonic.x + Math.cos(p.angle) * p.radius
            const pY = sonic.y + Math.sin(p.angle) * p.radius
            p.alpha = Math.max(0, (p.radius - sonic.radius) / 25)

            ctx.save()
            ctx.globalAlpha = p.alpha
            ctx.fillStyle = p.color
            ctx.shadowColor = p.color
            ctx.shadowBlur = 4
            
            ctx.beginPath()
            ctx.arc(pX, pY, p.size, 0, Math.PI * 2)
            ctx.fill()
            ctx.restore()
        }

        // 10. Coin / Ring Grid Management & Collection
        ctx.lineWidth = 2.5
        ctx.strokeStyle = '#eab308'
        const wave = trackInfo.value.wave

        if (playerState.value === 'playing' && currentTime) {
            for (let i = 0; i < wave.length; i++) {
                if (collectedRings.value.has(i)) continue

                const totalWaveLengthInPx = wave.length * 140
                const progressOffset = (smoothX / trackInfo.value.duration) * totalWaveLengthInPx
                let ringX = (i * 140) - progressOffset + sonic.x
                
                if (ringX < -30) continue
                if (ringX > w + 30) break
                
                const baseRoadY = getRoadHeightAtX(ringX, w, playableHeight, gameMidY)
                let ringHeightOffset = 35
                if (i % 3 === 0) ringHeightOffset = 85
                if (i % 3 === 1) ringHeightOffset = 60
                
                const bounce = audioData.bass * 35 
                const ringY = baseRoadY - ringHeightOffset - bounce

                ctx.beginPath()
                ctx.arc(ringX, ringY, 7, 0, Math.PI * 2)
                ctx.stroke()

                // Hitbox detection
                if (Math.hypot(sonic.x - ringX, sonic.y - ringY) < sonic.radius + 7) {
                    score.value += 10
                    trackScore.value += 10
                    saveScoreToStorage()
                    createExplosion(ringX, ringY, '#eab308')
                    collectedRings.value.add(i) 
                }
            }
        }

        // 11. Render Burst Explosion Particles
        const scrollSpeed = playerState.value === 'playing' && currentTime ? (2.5 + audioData.bass * 3) : 0
        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i]
            p.x += p.vx - scrollSpeed * 0.4
            p.y += p.vy
            p.alpha -= 0.04

            if (p.alpha <= 0) { 
                particles.splice(i, 1)
                continue 
            }

            ctx.save()
            ctx.globalAlpha = p.alpha
            ctx.fillStyle = p.color
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
            ctx.fill()
            ctx.restore()
        }

        drawMinimap()
        ctx.globalAlpha = 1.0
        animationFrameId = requestAnimationFrame(render)
    }
    animationFrameId = requestAnimationFrame(render)
}
const drawMinimap = () => {
    const canvas = minimapCanvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    const isDark = theme.value === 'dark'
    
    ctx.globalAlpha = 1.0
    ctx.clearRect(0, 0, w, h)

    const wave = trackInfo.value.wave || Array(100).fill(20)
    const totalPoints = wave.length
    if (totalPoints < 2) return

    const currentProgress = trackInfo.value.duration ? (smoothX / trackInfo.value.duration) : 0
    const colorSonic = isDark ? '#00f0ff' : '#2082f0'
    const colorUnplayed = isDark ? '#3f3f46' : '#cbd5e1'
    
    const sonicRadius = 4 + (audioData.bass * 4)
    const auraRadius = sonicRadius * 2
    
    const paddingX = 24 
    const paddingY = auraRadius + 4 
    
    const maxPlayableWidth = w - (paddingX * 2)
    const maxPlayableHeight = h - (paddingY * 2)
    const musicFlex = 1 + (audioData.mid * 0.4) 

    const points = new Array(totalPoints)
    for (let i = 0; i < totalPoints; i++) {
        const rawVal = wave[i] || 0
        const normalizedVal = Math.min(350, rawVal)
        const currentWaveH = (normalizedVal / 350) * maxPlayableHeight * musicFlex
        const clampedWaveH = Math.max(0, Math.min(maxPlayableHeight, currentWaveH))
        
        points[i] = {
            x: paddingX + (i / (totalPoints - 1)) * maxPlayableWidth,
            y: h - paddingY - clampedWaveH
        }
    }

    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // 1. Render unplayed road segment
    ctx.lineWidth = 2
    ctx.strokeStyle = colorUnplayed
    ctx.globalAlpha = 1.0 
    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    for (let i = 1; i < totalPoints; i++) {
        ctx.lineTo(points[i].x, points[i].y)
    }
    ctx.stroke()

    // 2. Render active played track with neon glow overlay
    if (currentProgress > 0) {
        const targetIndexLength = currentProgress * (totalPoints - 1)
        const maxActiveIdx = Math.floor(targetIndexLength)
        
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(points[0].x, points[0].y)
        for (let i = 1; i <= maxActiveIdx; i++) {
            ctx.lineTo(points[i].x, points[i].y)
        }
        
        let sonicX = points[maxActiveIdx].x
        let sonicY = points[maxActiveIdx].y
        if (maxActiveIdx < totalPoints - 1) {
            const t = targetIndexLength - maxActiveIdx
            sonicX = points[maxActiveIdx].x + (points[maxActiveIdx + 1].x - points[maxActiveIdx].x) * t
            sonicY = points[maxActiveIdx].y + (points[maxActiveIdx + 1].y - points[maxActiveIdx].y) * t
            ctx.lineTo(sonicX, sonicY)
        }

        // Layer A: Blurred glow layer
        ctx.lineWidth = 6 + (audioData.bass * 8) 
        ctx.strokeStyle = colorSonic
        ctx.globalAlpha = 0.25 + (audioData.mid * 0.4)
        ctx.stroke()

        // Layer B: Main sharp neon core line
        ctx.lineWidth = 3
        ctx.globalAlpha = 1.0
        ctx.stroke()
        ctx.restore() 

        // 3. Render tracking node indicator and its aura
        ctx.save()
        ctx.fillStyle = colorSonic
        ctx.globalAlpha = 0.4
        ctx.beginPath()
        ctx.arc(sonicX, sonicY, auraRadius, 0, Math.PI * 2)
        ctx.fill()

        ctx.globalAlpha = 1.0
        ctx.fillStyle = isDark ? '#ffffff' : colorSonic
        ctx.beginPath()
        ctx.arc(sonicX, sonicY, sonicRadius, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
    } else {
        ctx.save()
        ctx.fillStyle = colorSonic
        ctx.globalAlpha = 1.0
        ctx.beginPath()
        ctx.arc(points[0].x, points[0].y, 4, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
    }
}

// -----------------------------------------------------------------
// 5. INTERACTIVE UI HANDLERS
// -----------------------------------------------------------------
const handlePressStart = (e) => {
    const rect = canvasRef.value.getBoundingClientRect()
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const y = clientY - rect.top
    const canvasH = canvasRef.value.height

    if (y > canvasH - BOTTOM_UI_HEIGHT || y < TOP_UI_HEIGHT) return
    if (sonic.isGrounded && playerState.value === 'playing') {
        isChargingJump = true
        jumpCharge = sonic.baseJumpForce
    }
}

const handlePressEnd = () => {
    if (isChargingJump) {
        isChargingJump = false
        const chargePct = (jumpCharge - sonic.baseJumpForce) / (sonic.maxJumpForce - sonic.baseJumpForce)
        const burstColor = chargePct > 0.6 ? '#00f0ff' : '#eab308'
        
        createExplosion(sonic.x, sonic.y + sonic.radius, burstColor)
        if (chargePct > 0.7) {
            createExplosion(sonic.x, sonic.y, '#ffffff')
        }
        chargeParticles = []
        sonic.vy = jumpCharge
        sonic.isGrounded = false
    }
}

const handleMinimapSeek = (e) => {
    if (!trackInfo.value.duration || !minimapRef.value || !minimapCanvasRef.value) return
    
    const rect = minimapRef.value.getBoundingClientRect()
    const clientX = e.touches ? e.touches.clientX : e.clientX
    const clickX = clientX - rect.left
    
    const paddingX = 24
    const playableWidth = rect.width - (paddingX * 2)
    
    const percentage = Math.max(0, Math.min(1, (clickX - paddingX) / playableWidth))
    const targetTime = percentage * trackInfo.value.duration
    
    if (typeof playerSdk.seek === 'function' && targetTime) {
        playerSdk.seek(targetTime)
        smoothX = targetTime 
        currentTime = targetTime
    }
}

const handleLikeToggle = () => {
    if (reaction.value === 'LIKE' || reaction.value === 'DISLIKE') {
        playerSdk.reaction('')
    } else {
        playerSdk.reaction('LIKE')
    }
}

const togglePlay = () => {
    if (playerState.value === 'playing') {
        playerSdk.pause()
    } else {
        playerSdk.play()
    }
}

const openPlaylist = () => {
    if (typeof playerSdk.openPlaylist === 'function') {
        playerSdk.openPlaylist()
    }
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

const collapse = () => {
    playerSdk.collapse()
}

// -----------------------------------------------------------------
// 6. AUXILIARY UTIL FUNCTIONS
// -----------------------------------------------------------------
const updateTrackData = (track) => {
    if (!track) return
    if (track.cover?.crop !== trackInfo.value?.cover?.crop) {
        isCoverLoaded.value = false 
    }
    trackInfo.value = {
        ...track,
        artists: formatArtists(track),
        duration: track.duration || 0,
        bpm: track.bpm || null,
        isExplicit: !!track.isExplicit,
        cover: track.cover || null,
        wave: track.wave && track.wave.length ? track.wave : Array(100).fill(20)
    }
    loadTrackScore(track.id)
    smoothX = 0
    currentTime = 0
    // lastSyncTime = Date.now()
    collectedRings.value.clear()
    chargeParticles = []
    audioData.bass = 0
    audioData.mid = 0
    audioData.high = 0
}

const loadTrackScore = (trackId) => {
    if (!trackId) {
        trackScore.value = 0
        return
    }
    const scores = JSON.parse(localStorage.getItem('sonic-rhytm-dash-track-score') || '{}')
    trackScore.value = scores[trackId] || 0
}

const saveScoreToStorage = () => {
    localStorage.setItem('sonic-rhytm-dash-score', score.value.toString())
    const currentTrackId = trackInfo.value?.id
    if (currentTrackId && trackScore.value) {
        const scores = JSON.parse(localStorage.getItem('sonic-rhytm-dash-track-score') || '{}')
        scores[currentTrackId] = trackScore.value
        localStorage.setItem('sonic-rhytm-dash-track-score', JSON.stringify(scores))
    }
}

const getRoadHeightAtX = (screenX, canvasWidth, playableHeight, midY) => {
    const wave = trackInfo.value.wave
    if (!wave || !wave.length || !trackInfo.value.duration || playerState.value !== 'playing' || !currentTime) {
        return midY
    }
    const totalWaveLengthInPx = wave.length * 140
    const progressOffset = (smoothX / trackInfo.value.duration) * totalWaveLengthInPx
    const targetXOnMap = progressOffset + (screenX - sonic.x)
    
    let targetIndex = targetXOnMap / 140
    if (targetIndex < 0) targetIndex = 0
    if (targetIndex >= wave.length - 1) targetIndex = wave.length - 1
    
    const idxBase = Math.floor(targetIndex)
    const t = targetIndex - idxBase
    const maxAmplitude = playableHeight * 0.5
    const h1 = (wave[idxBase] / 500) * maxAmplitude
    const h2 = (wave[idxBase + 1] / 500) * maxAmplitude
    const currentWaveH = h1 + (h2 - h1) * t
    
    const isAudioReady = currentTime && playerState.value === 'playing' && audioData.mid > 0.001
    const audioWobble = isAudioReady 
        ? Math.sin(screenX * 0.05 + Date.now() * 0.01) * (audioData.mid * 20)
        : 0 
    return midY + (maxAmplitude * 0.3) - currentWaveH - audioWobble
}

const createExplosion = (x, y, color) => {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: x, 
            y: y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5 - 1.5,
            radius: Math.random() * 2 + 1.5,
            color: color,
            alpha: 1
        })
    }
}

const formatArtists = (trackData) => {
    if (!trackData) return
    if (typeof trackData.artists === 'string') return trackData.artists
    
    const primary = trackData.contributors?.primary?.map(a => a.name).join(', ') || ''
    const featured = trackData.contributors?.featured?.length 
        ? ` (feat. ${trackData.contributors.featured.map(a => a.name).join(', ')})` 
        : ''
    return primary + featured
}

const formatNumber = (num) => {
    if (num === undefined || num === null) return '0'
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
</script>

<style scoped>
/* Clear webkit tap highlight and outlines on mobile layouts */
.minimap-container,
.bottom-panel button,
.controls-row button,
.ui-panel * {
    -webkit-tap-highlight-color: transparent !important;
    -webkit-touch-callout: none;
}

.minimap-container:focus,
.bottom-panel button:focus,
.controls-row button:focus {
    outline: none !important;
    box-shadow: none !important;
}

.sonic-monolith-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1;
    overflow: hidden;
    user-select: none;
    -webkit-user-select: none;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    
    &.dark {
        background: #09090b;
    }
    &.light {
        background: #f4f4f5;
    }
}

.game-canvas {
    display: block;
    width: 100%;
    height: 100%;
}

.ui-panel {
    position: fixed;
    left: 0;
    width: 100vw;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    z-index: 10;
    transition: background 0.3s, border-color 0.3s;
}

.dark .ui-panel {
    background: #121212;
    color: #ffffff;
    border-color: #1e1e24;
}

.light .ui-panel {
    background: #ffffff;
    color: #09090b;
    border-color: #e4e4e9;
}

/* TOP PANEL CONFIGURATION */
.top-panel {
    top: 0;
    min-height: 100px;
    border-bottom: 1px solid;
    padding: 0 24px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding-top: calc(var(--max-safe-area-inset-top, var(--tg-safe-area-inset-top, 0px)) + var(--max-content-safe-area-inset-top, var(--tg-content-safe-area-inset-top, 0px)) + 12px);
}

.top-panel .track-card {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-grow: 1;
    min-width: 0;
}

.top-panel .track-card .track-cover {
    width: 64px;
    height: 64px;
    border-radius: 4px;
    position: relative;
    overflow: hidden;
    background-color: transparent;
    flex-shrink: 0;
    --bg-skeleton: #27272a;
    --bg-skeleton-glow: #3f3f46;
}

.top-panel .track-card .track-cover.is-loading {
    background-image: linear-gradient(
        90deg, 
        var(--bg-skeleton) 25%, 
        var(--bg-skeleton-glow) 50%, 
        var(--bg-skeleton) 75%
    );
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite linear;
}

.top-panel .track-card .track-cover .track-cover-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.top-panel .track-card .track-cover .track-cover-img.is-visible {
    opacity: 1;
}

.top-panel .track-card .track-meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
}

.top-panel .track-card .track-meta .title {
    font-size: 16px;
    font-weight: bold;
    white-space: nowrap;
    max-width: 70vw;
    overflow: hidden;
    text-overflow: ellipsis;
}

.top-panel .track-card .track-meta .artist {
    font-size: 13px;
    max-width: 70vw;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical; 
    overflow: hidden;
    word-break: break-word;
    color: #71717a;
}

.top-panel .plugin-spacer {
    width: 50px;
    height: 50px;
    flex-shrink: 0;
}

/* INDEPENDENT SCORE HUD PANEL */
.score-panel {
    position: absolute;
    top: calc(var(--max-safe-area-inset-top, var(--tg-safe-area-inset-top, 0px)) + var(--max-content-safe-area-inset-top, var(--tg-content-safe-area-inset-top, 0px)) + 100px);
    left: 16px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: start;
    padding: 6px 8px;
    border-radius: 6px;
    pointer-events: none;
}

.score-panel .hud-score,
.score-panel .hud-track-score {
    font-family: monospace;
    font-weight: 900;
    font-size: 13px;
    white-space: nowrap;
    color: #ffffff;
}

.score-panel .hud-track-score {
    opacity: 0.5;
}

/* INTERACTIVE SCHEMES */
.dark .top-panel .track-card .track-cover {
    --bg-skeleton: #27272a;
    --bg-skeleton-glow: #3f3f46;
}

.dark .top-panel .track-card .track-meta .artist {
    color: #71717a;
}

.light .top-panel .track-card .track-cover {
    --bg-skeleton: #e4e4e7;
    --bg-skeleton-glow: #f4f4f5;
}

.light .top-panel .track-card .track-meta .artist {
    color: #a1a1aa;
}

.light .score-panel .hud-score,
.light .score-panel .hud-track-score {
    color: #09090b;
}

@keyframes skeleton-loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}

/* BOTTOM PANEL CONTROLS */
.minimap-container {
    width: 100%;
    margin: 0;
    height: 45px;
    cursor: pointer;
    position: relative;
    display: flex;
    align-items: center;
    border-radius: 8px;
    background: transparent;
    transition: background 0.2s ease;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    
    .minimap-canvas {
        display: block;
        width: 100%;
        height: 100%;
        background: transparent;
        pointer-events: none;
    }
}

.bottom-panel {
    bottom: 0;
    height: 150px;
    border-top: 1px solid;
    flex-direction: column;
    justify-content: center;
    padding: 0;
    gap: 12px;
}

.progress-bar-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: transparent;
}

.progress-bar-fill {
    height: 100%;
    width: 0;
    transition: width 0.1s linear;
}

.dark .progress-bar-fill { background: #00f0ff; }
.light .progress-bar-fill { background: #2082f0; }

.controls-row {
    display: flex;
    justify-content: space-around;
    align-items: center;
    width: 100%;
    min-height: 60px;
    padding: 0 24px;
    
    .ui-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        padding: 8px;
        user-select: none;
        transition: transform 0.1s ease;
        
        &:active {
            transform: scale(0.85);
        }
        &:disabled {
            filter: grayscale(1);
            opacity: .4;
        }
        .repeat-none {
            filter: grayscale(1);
        }
    }
}
</style>
