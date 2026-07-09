<template>
    <div class="gd-container" :class="[theme]" id="gd-app-container">
        <canvas ref="canvasRef" class="gd-canvas" id="gd-game-canvas"></canvas>

        <!-- TOP PANEL: track info -->
        <div class="ui-panel top-panel" id="gd-top-panel">
            <div class="track-card" id="gd-track-card">
                <div class="track-cover" id="gd-track-cover">
                    <img
                        v-if="trackInfo.cover?.crop"
                        :src="trackInfo.cover.crop"
                        class="track-cover-img"
                        :class="{ 'is-visible': isCoverLoaded }"
                        @load="isCoverLoaded = true"
                        id="gd-track-cover-img"
                    />
                    <div v-else class="cover-placeholder" id="gd-cover-placeholder">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="6" cy="17" r="3"/>
                            <circle cx="17" cy="14" r="3"/>
                            <path d="M9 17V6l11-2v10" stroke="currentColor" stroke-width="1.6" fill="none"/>
                        </svg>
                    </div>
                </div>
                <div class="track-meta" id="gd-track-meta">
                    <div class="title" id="gd-track-title">{{ trackInfo.title }}</div>
                    <div class="artist" v-if="trackInfo.artists" id="gd-track-artist">{{ trackInfo.artists }}</div>
                </div>
            </div>
            <div class="plugin-spacer" id="gd-plugin-spacer"></div>
        </div>

        <!-- HUD -->
        <div class="score-panel" id="gd-hud-panel">
            <div class="hud-line hud-wins" id="gd-hud-finishes">FINISHES: {{ formatNumber(score) }}</div>
            <div class="hud-line hud-attempt" id="gd-hud-attempts">ATTEMPT #{{ formatNumber(attempts) }}</div>
            <div class="hud-line hud-best" id="gd-hud-best">BEST: {{ Math.round(bestProgressPct) }}%</div>
            <div class="hud-line hud-status" :class="statusClass" id="gd-hud-status">{{ statusText }}</div>
        </div>

        <!-- Left hand: lean -->
        <div class="touch-hand touch-hand-left" v-show="playerState === 'playing'" id="gd-touch-left">
            <button
                class="touch-btn"
                @pointerdown.prevent="setInput('leanBack', true)"
                @pointerup.prevent="setInput('leanBack', false)"
                @pointercancel.prevent="setInput('leanBack', false)"
                @pointerleave.prevent="setInput('leanBack', false)"
                id="gd-btn-lean-back"
            >4</button>
            <button
                class="touch-btn"
                @pointerdown.prevent="setInput('leanFwd', true)"
                @pointerup.prevent="setInput('leanFwd', false)"
                @pointercancel.prevent="setInput('leanFwd', false)"
                @pointerleave.prevent="setInput('leanFwd', false)"
                id="gd-btn-lean-fwd"
            >6</button>
        </div>

        <!-- Right hand: brake / gas -->
        <div class="touch-hand touch-hand-right" v-show="playerState === 'playing'" id="gd-touch-right">
            <button
                class="touch-btn"
                @pointerdown.prevent="setInput('brake', true)"
                @pointerup.prevent="setInput('brake', false)"
                @pointercancel.prevent="setInput('brake', false)"
                @pointerleave.prevent="setInput('brake', false)"
                id="gd-btn-brake"
            >2</button>
            <button
                class="touch-btn touch-btn-gas"
                @pointerdown.prevent="setInput('gas', true)"
                @pointerup.prevent="setInput('gas', false)"
                @pointercancel.prevent="setInput('gas', false)"
                @pointerleave.prevent="setInput('gas', false)"
                id="gd-btn-gas"
            >8</button>
        </div>

        <!-- Bottom progress strip -->
        <div class="progress-strip" ref="minimapContainerRef" :title="'Прогресс: ' + Math.round(raceProgressPct) + '%'" id="gd-progress-strip">
            <canvas ref="minimapCanvasRef" class="progress-strip-canvas" id="gd-progress-canvas"></canvas>
        </div>

        <!-- SIDE PANEL: player controls -->
        <div class="side-panel" id="gd-side-panel">
            <div class="side-controls" id="gd-side-controls">
                <button class="gd-btn" @click="handleLikeToggle" :title="reaction === 'LIKE' ? 'Unlike' : 'Like'" id="gd-btn-like">
                    <svg width="18" height="18" viewBox="0 0 24 24" :fill="reaction === 'LIKE' ? '#39ff6a' : 'none'" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </button>
                <button class="gd-btn" :disabled="prevDisabled" @click="playerSdk.prev()" title="Previous" id="gd-btn-prev">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                </button>
                <button class="gd-btn" @click="togglePlay" title="Play/Pause" id="gd-btn-play">
                    <svg v-if="playerState !== 'playing'" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                </button>
                <button class="gd-btn" :disabled="nextDisabled" @click="playerSdk.next()" title="Next" id="gd-btn-next">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6zm9-12h2v12h-2z"/></svg>
                </button>
                <button class="gd-btn" @click="handleRepeat" :class="{ 'is-active': repeat !== 'none' }" title="Repeat" id="gd-btn-repeat">
                    <svg v-if="repeat === 'track'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                        <text x="9" y="16" font-size="9" font-weight="bold" fill="currentColor" stroke="none">1</text>
                    </svg>
                    <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline>
                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                    </svg>
                </button>
                <button class="gd-btn" :disabled="!hasQueue" @click="openPlaylist" title="Queue" id="gd-btn-queue">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                        <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                    </svg>
                </button>
                <button class="gd-btn" @click="collapse" title="Collapse" id="gd-btn-collapse">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"/>
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { playerSdk } from '@bilbomusic/player-plugin-sdk'

const canvasRef = ref(null)
const minimapCanvasRef = ref(null)
const minimapContainerRef = ref(null)

const theme = ref('dark')
const isExpanded = ref(true)
const playerState = ref('paused')
const reaction = ref('')
const repeat = ref('none')
const isCoverLoaded = ref(false)

const nextDisabled = ref(false)
const prevDisabled = ref(true)
const hasQueue = ref(false)

const score = ref(Number(localStorage.getItem('gravity-defied-score')) || 0)
const attempts = ref(1)
const bestProgressPct = ref(0)
const statusText = ref('READY')

const trackInfo = ref({
    title: 'Waiting for track...',
    artists: 'Loading...',
    cover: null,
    duration: 0,
    wave: []
})

// Game constants
const TOP_UI_HEIGHT = 90
const FLAT_START_PX = 180
const FLAT_FINISH_PX = 220
const SEGMENT_PX = 58
const HALF_WHEELBASE = 30
const WHEEL_R = 12
const GRAVITY = 0.62
const WAVE_MAX = 500
const TRACK_DEPTH = 14
const CRASH_ANGLE = (100 * Math.PI) / 180
const FOLLOW_OFFSET_X = 150
const FOLLOW_OFFSET_Y = 0.42

const LEAN_TORQUE = 0.0055
const GAS_FORCE = 0.075
const BRAKE_FORCE = 0.11
const MAX_SPEED = 9.5
const GROUND_FRICTION = 0.993
const TERRAIN_ALIGN = 0.07
const RIDER_LEAN_SPEED = 0.07
const RIDER_LEAN_RETURN = 0.09

// Game state (Refs because they change inside render/physics tick)
const bike = {
    worldX: 0,
    y: 0,
    vy: 0,
    vx: 0,
    angle: 0,
    angularVelocity: 0,
    grounded: true,
    rearWheelAngle: 0,
    frontWheelAngle: 0
}

const input = {
    gas: false,
    brake: false,
    leanFwd: false,
    leanBack: false
}

const camera = { worldX: 0, worldY: 0 }
let riderLean = 0
let particles = []
let shakeTimer = 0
let flashTimer = 0
let flashColor = '#ffffff'
let decorativeTimer = 0
const audioData = { bass: 0, mid: 0, high: 0 }
let currentTime = 0

const smoothedWave = ref([])
const levelWaveStats = { min: 0, max: WAVE_MAX, range: WAVE_MAX, peakNorm: 1 }
const trackLengthPx = ref(FLAT_START_PX + FLAT_FINISH_PX)
let animationFrameId = null
let lastTimestamp = 0

const upsampleWave = (raw, targetLen) => {
    if (!raw.length) return Array(targetLen).fill(120)
    if (raw.length >= targetLen) return raw.map(v => Math.max(0, Math.min(WAVE_MAX, v)))
    const result = []
    for (let i = 0; i < targetLen; i++) {
        const srcIdx = (i / (targetLen - 1)) * (raw.length - 1)
        const i0 = Math.floor(srcIdx)
        const t = srcIdx - i0
        const v0 = raw[i0] ?? 0
        const v1 = raw[Math.min(i0 + 1, raw.length - 1)] ?? v0
        result.push(Math.max(0, Math.min(WAVE_MAX, v0 * (1 - t) + v1 * t)))
    }
    return result
}

const buildLevelWave = (raw, durationMs) => {
    const baseLen = raw.length || 60
    const durationSec = Math.max(30, (durationMs || 180000) / 1000)
    const targetLen = Math.max(baseLen * 2, Math.min(280, Math.round(durationSec * 1.8)))
    let wave = upsampleWave(raw, targetLen)

    const srcMin = Math.min(...wave)
    const srcMax = Math.max(...wave)
    const srcRange = Math.max(1, srcMax - srcMin)
    
    levelWaveStats.min = srcMin
    levelWaveStats.max = srcMax
    levelWaveStats.range = srcRange
    levelWaveStats.peakNorm = Math.min(1, srcRange / WAVE_MAX)

    wave = wave.map((v, i) => {
        const norm = (v - srcMin) / srcRange
        const progress = i / Math.max(1, wave.length - 1)
        const difficulty = 0.52 + progress * progress * 0.95
        const peakBoost = 1 + Math.pow(progress, 1.6) * 0.42
        return norm * difficulty * peakBoost
    })

    wave = wave.map((v, i) => {
        const prev = wave[i - 1] ?? v
        const next = wave[i + 1] ?? v
        return prev * 0.08 + v * 0.84 + next * 0.08
    })

    wave = wave.map((v, i) => {
        const prev = wave[i - 1] ?? v
        const next = wave[i + 1] ?? v
        const neighborAvg = (prev + next) / 2
        const sharpen = v + (v - neighborAvg) * 0.35
        return Math.max(0, Math.min(WAVE_MAX, sharpen * WAVE_MAX))
    })

    return wave
}

const resetRun = (isFullReset) => {
    bike.worldX = 0
    bike.vy = 0
    bike.vx = 0
    bike.angle = 0
    bike.angularVelocity = 0
    bike.grounded = true
    bike.y = 0
    bike.rearWheelAngle = 0
    bike.frontWheelAngle = 0
    
    camera.worldX = -FOLLOW_OFFSET_X
    camera.worldY = 0
    
    input.gas = false
    input.brake = false
    input.leanFwd = false
    input.leanBack = false
    
    riderLean = 0

    if (isFullReset) {
        particles = []
        flashTimer = 0
        shakeTimer = 0
    }
}

const terrainHeightAt = (worldX, playableHeight, baseGroundY) => {
    const wave = smoothedWave.value
    if (!wave.length) return baseGroundY

    if (worldX <= FLAT_START_PX) return baseGroundY
    const trackEndX = trackLengthPx.value - FLAT_FINISH_PX
    if (worldX >= trackEndX) return baseGroundY

    const idxF = (worldX - FLAT_START_PX) / SEGMENT_PX
    let i0 = Math.floor(idxF)
    let t = idxF - i0
    if (i0 < 0) { i0 = 0; t = 0 }
    if (i0 >= wave.length - 1) { i0 = wave.length - 2; t = 1 }

    const v0 = wave[i0] || 0
    const v1 = wave[i0 + 1] || 0
    const val = v0 * (1 - t) + v1 * t
    const norm = Math.min(1, Math.max(0, val / WAVE_MAX))

    const trackProgress = (worldX - FLAT_START_PX) / Math.max(1, trackEndX - FLAT_START_PX)
    const minAmp = playableHeight * (0.34 + levelWaveStats.peakNorm * 0.12)
    const maxAmp = playableHeight * (0.68 + levelWaveStats.peakNorm * 0.48)
    const amplitude = minAmp + (maxAmp - minAmp) * Math.min(1, trackProgress * 1.25)

    const distFromStart = worldX - FLAT_START_PX
    const distFromEnd = trackEndX - worldX
    const easeZone = 80
    const easeIn = Math.min(1, distFromStart / easeZone)
    const easeOut = Math.min(1, distFromEnd / easeZone)
    const ease = Math.min(easeIn, easeOut)

    return baseGroundY - norm * amplitude * ease
}

const trackRideHeightAt = (worldX, playableHeight, baseGroundY) => {
    return terrainHeightAt(worldX, playableHeight, baseGroundY) + TRACK_DEPTH * 0.58
}

const triggerCrash = (reason) => {
    statusText.value = reason
    flashTimer = 260
    flashColor = '#ff3347'
    shakeTimer = 260

    const px = bike.worldX
    const py = bike.y
    for (let i = 0; i < 14; i++) {
        particles.push({
            x: px,
            y: py,
            vx: (Math.random() - 0.5) * 7,
            vy: -Math.random() * 5,
            r: Math.random() * 2.5 + 1.5,
            a: 1,
            color: 'debris'
        })
    }

    const currentProgress = trackLengthPx.value ? Math.max(0, Math.min(100, (bike.worldX / trackLengthPx.value) * 100)) : 0
    bestProgressPct.value = Math.max(bestProgressPct.value, currentProgress)
    attempts.value += 1
    
    resetRun(false)
}

const triggerFinish = () => {
    score.value += 1
    localStorage.setItem('gravity-defied-score', score.value.toString())
    bestProgressPct.value = 100
    statusText.value = 'FINISHED!'
    flashTimer = 320
    flashColor = '#4ade80'

    for (let i = 0; i < 24; i++) {
        particles.push({
            x: bike.worldX,
            y: bike.y,
            vx: (Math.random() - 0.5) * 8,
            vy: -Math.random() * 7 - 2,
            r: Math.random() * 2.5 + 1.5,
            a: 1,
            color: Math.random() > 0.5 ? '#ffcc00' : '#4ade80'
        })
    }

    attempts.value += 1
    resetRun(false)
}

const updatePhysics = (dt, playableHeight, baseGroundY) => {
    const timeScale = dt / 16.66

    if (input.leanFwd) {
        riderLean = Math.min(1, riderLean + RIDER_LEAN_SPEED * timeScale)
    } else if (input.leanBack) {
        riderLean = Math.max(-1, riderLean - RIDER_LEAN_SPEED * timeScale)
    } else {
        riderLean += (0 - riderLean) * RIDER_LEAN_RETURN * timeScale
    }

    const frontWorldX = bike.worldX + Math.cos(bike.angle) * HALF_WHEELBASE
    const rearWorldX = bike.worldX - Math.cos(bike.angle) * HALF_WHEELBASE
    const frontGroundY = trackRideHeightAt(frontWorldX, playableHeight, baseGroundY) - WHEEL_R
    const rearGroundY = trackRideHeightAt(rearWorldX, playableHeight, baseGroundY) - WHEEL_R
    const frontWheelY = bike.y + Math.sin(bike.angle) * HALF_WHEELBASE
    const rearWheelY = bike.y - Math.sin(bike.angle) * HALF_WHEELBASE

    const frontPenetration = frontWheelY - frontGroundY
    const rearPenetration = rearWheelY - rearGroundY

    const frontGrounded = frontPenetration >= -3
    const rearGrounded = rearPenetration >= -3
    const grounded = frontGrounded || rearGrounded

    const sBack = terrainHeightAt(bike.worldX - 12, playableHeight, baseGroundY)
    const sFwd = terrainHeightAt(bike.worldX + 12, playableHeight, baseGroundY)
    const localSlope = (sFwd - sBack) / 24
    const terrainAngle = Math.atan(localSlope)

    if (input.leanFwd) bike.angularVelocity += LEAN_TORQUE * timeScale
    if (input.leanBack) bike.angularVelocity -= LEAN_TORQUE * timeScale

    if (grounded) {
        bike.grounded = true

        // Apply engine and braking torque reactions to the frame's angular velocity
        if (input.gas && rearGrounded) {
            bike.angularVelocity -= 0.0016 * timeScale // lift front wheel - significantly reduced from 0.0085 to prevent instant flipping
        }
        if (input.brake && frontGrounded) {
            bike.angularVelocity += 0.0016 * timeScale // lift rear wheel / nose dive
        }

        const leanTorque = riderLean * 0.018 * timeScale
        bike.angularVelocity += leanTorque

        if (frontGrounded && rearGrounded) {
            // Both wheels on ground: align smoothly with terrain slope
            bike.angle += (terrainAngle - bike.angle) * TERRAIN_ALIGN
            bike.angle += bike.angularVelocity * timeScale
            bike.angularVelocity *= 0.84

            const targetY = (frontGroundY + rearGroundY) / 2
            bike.y += (targetY - bike.y) * 0.42
            bike.vy = bike.vx * localSlope
        } else if (rearGrounded) {
            // Wheelie: only rear wheel on ground. Pivot around the rear wheel.
            // Gravity pulls the elevated front wheel down!
            const gravityInfluence = 0.0035 * Math.cos(bike.angle) * timeScale
            bike.angularVelocity += gravityInfluence

            // Cap the angular velocity to prevent wild uncontrollable spins
            const MAX_ANG_VEL = 0.08
            bike.angularVelocity = Math.max(-MAX_ANG_VEL, Math.min(MAX_ANG_VEL, bike.angularVelocity))

            bike.angle += bike.angularVelocity * timeScale
            bike.angularVelocity *= 0.95

            const targetY = rearGroundY + Math.sin(bike.angle) * HALF_WHEELBASE
            bike.y += (targetY - bike.y) * 0.42
            bike.vy = bike.vx * localSlope
        } else if (frontGrounded) {
            // Stoppie: only front wheel on ground. Pivot around the front wheel.
            // Gravity pulls the elevated rear wheel down!
            const gravityInfluence = 0.0035 * Math.cos(bike.angle) * timeScale
            bike.angularVelocity -= gravityInfluence

            // Cap the angular velocity to prevent wild uncontrollable spins
            const MAX_ANG_VEL = 0.08
            bike.angularVelocity = Math.max(-MAX_ANG_VEL, Math.min(MAX_ANG_VEL, bike.angularVelocity))

            bike.angle += bike.angularVelocity * timeScale
            bike.angularVelocity *= 0.95

            const targetY = frontGroundY - Math.sin(bike.angle) * HALF_WHEELBASE
            bike.y += (targetY - bike.y) * 0.42
            bike.vy = bike.vx * localSlope
        }

        // Only accelerate and apply bass boost if the player actually presses GAS key AND the rear wheel is touching!
        if (input.gas && rearGrounded) {
            const bassBoost = audioData.bass * 0.05
            bike.vx += (GAS_FORCE + bassBoost) * timeScale
        } else if (input.brake) {
            bike.vx -= BRAKE_FORCE * timeScale
        } else {
            bike.vx *= GROUND_FRICTION
        }

        if (Math.abs(bike.vx) < 0.005) {
            bike.vx = 0
        }

        bike.vx = Math.max(0, Math.min(MAX_SPEED, bike.vx))

        if (Math.random() < 0.45 && bike.vx > 0.8) {
            particles.push({
                x: bike.worldX - Math.cos(bike.angle) * HALF_WHEELBASE,
                y: rearWheelY,
                vx: -1.5 - Math.random() * 1.5,
                vy: -Math.random() * 1.2,
                r: Math.random() * 2 + 1,
                a: 0.5,
                color: 'dust'
            })
        }
    } else {
        bike.grounded = false
        bike.vy += GRAVITY * timeScale
        bike.y += bike.vy * timeScale
        bike.angularVelocity *= 0.998

        // Cap the angular velocity in the air
        const MAX_ANG_VEL = 0.08
        bike.angularVelocity = Math.max(-MAX_ANG_VEL, Math.min(MAX_ANG_VEL, bike.angularVelocity))

        bike.angle += bike.angularVelocity * timeScale
    }

    // Wheel spin physics (rotation)
    if (frontGrounded) {
        bike.frontWheelAngle += (bike.vx * timeScale) / WHEEL_R
    } else {
        bike.frontWheelAngle += (bike.vx * 0.5 * timeScale) / WHEEL_R
    }

    if (rearGrounded) {
        if (!input.brake) {
            bike.rearWheelAngle += (bike.vx * timeScale) / WHEEL_R
        }
    } else {
        if (input.gas) {
            bike.rearWheelAngle += 0.45 * timeScale // spins up fast in air
        } else if (input.brake) {
            bike.rearWheelAngle *= 0.8 // lock up in air
        } else {
            bike.rearWheelAngle += (bike.vx * 0.5 * timeScale) / WHEEL_R
        }
    }

    bike.frontWheelAngle = bike.frontWheelAngle % (Math.PI * 2)
    bike.rearWheelAngle = bike.rearWheelAngle % (Math.PI * 2)

    bike.worldX += bike.vx * timeScale

    if (Math.abs(bike.angle) > CRASH_ANGLE) {
        triggerCrash('FLIPPED')
        return
    }
    if (grounded && Math.max(frontPenetration, rearPenetration) > 46) {
        triggerCrash('CRASHED')
        return
    }

    if (bike.worldX >= trackLengthPx.value) {
        triggerFinish()
    }
}

const drawWireframeTrack = (ctx, w, playableHeight, baseGroundY, toScreenY) => {
    const trackGreen = '#22bb22'
    const trackGreenDark = '#1a991a'
    const step = 4
    const topPts = []
    const botPts = []
    const camX = camera.worldX

    for (let sx = -10; sx <= w + 10; sx += step) {
        const worldX = sx + camX
        const topY = toScreenY(terrainHeightAt(worldX, playableHeight, baseGroundY))
        topPts.push({ sx, topY, worldX })
        botPts.push({ sx, topY: topY + TRACK_DEPTH, worldX })
    }

    ctx.strokeStyle = trackGreenDark
    ctx.lineWidth = 2
    ctx.lineJoin = 'miter'
    ctx.beginPath()
    topPts.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.sx, p.topY)
        else ctx.lineTo(p.sx, p.topY)
    })
    ctx.stroke()

    ctx.beginPath()
    botPts.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.sx, p.topY)
        else ctx.lineTo(p.sx, p.topY)
    })
    ctx.stroke()

    const ribStart = Math.max(0, Math.floor((camX - FLAT_START_PX) / SEGMENT_PX) - 1)
    const ribEnd = Math.min(smoothedWave.value.length, Math.ceil((camX + w - FLAT_START_PX) / SEGMENT_PX) + 1)

    ctx.strokeStyle = trackGreen
    ctx.lineWidth = 1.5
    for (let i = ribStart; i <= ribEnd; i++) {
        const worldX = FLAT_START_PX + i * SEGMENT_PX
        const sx = worldX - camX
        if (sx < -20 || sx > w + 20) continue
        const topY = toScreenY(terrainHeightAt(worldX, playableHeight, baseGroundY))
        ctx.beginPath()
        ctx.moveTo(sx, topY)
        ctx.lineTo(sx, topY + TRACK_DEPTH)
        ctx.stroke()
    }
}

const drawMarker = (ctx, screenX, groundY, label, type) => {
    if (screenX < -60 || screenX > ctx.canvas.width + 60) return

    const poleH = 72
    const flagW = 22
    const accent = type === 'start' ? '#22bb22' : '#e6a800'
    const accent2 = type === 'start' ? '#157015' : '#996600'

    ctx.save()
    ctx.strokeStyle = accent2
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(screenX, groundY)
    ctx.lineTo(screenX, groundY - poleH)
    ctx.stroke()

    if (type === 'finish') {
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 2; col++) {
                ctx.fillStyle = (row + col) % 2 === 0 ? '#ffffff' : '#222222'
                ctx.fillRect(screenX + 1 + col * (flagW / 2), groundY - poleH + row * 7, flagW / 2, 7)
            }
        }
    } else {
        ctx.fillStyle = accent
        ctx.fillRect(screenX + 1, groundY - poleH, flagW, 14)
        ctx.fillStyle = accent2
        ctx.fillRect(screenX + 1, groundY - poleH + 14, flagW, 14)
    }

    ctx.fillStyle = accent2
    ctx.font = 'bold 10px "Courier New", monospace'
    ctx.textAlign = 'center'
    ctx.fillText(label, screenX + flagW / 2, groundY - poleH - 6)
    ctx.restore()
}

const drawBikeAndRider = (ctx, bx, by, angle, rLean, isDark, rWheelAngle, fWheelAngle) => {
    const cosA = Math.cos(angle)
    const sinA = Math.sin(angle)
    
    const toWorld = (lx, ly) => ({
        x: bx + lx * cosA - ly * sinA,
        y: by + lx * sinA + ly * cosA
    })

    const rearX = -HALF_WHEELBASE
    const frontX = HALF_WHEELBASE
    const seatX = -6
    const seatY = -20
    const engineX = 2
    const engineY = -14
    const barX = 16
    const barY = -24
    const fenderX = -18
    const fenderY = -6

    const rear = toWorld(rearX, 0)
    const front = toWorld(frontX, 0)
    const seat = toWorld(seatX, seatY)
    const engine = toWorld(engineX, engineY)
    const bar = toWorld(barX, barY)
    const fender = toWorld(fenderX, fenderY)

    // DRAW WHEELS (PROCEDURAL VECTORS)
    const drawWheelProcedural = (wx, wy, wAngle) => {
        ctx.save()
        ctx.beginPath()
        ctx.arc(wx, wy, WHEEL_R, 0, Math.PI * 2)
        ctx.fillStyle = isDark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.15)"
        ctx.fill()

        // Tire Outer Ring
        ctx.beginPath()
        ctx.arc(wx, wy, WHEEL_R, 0, Math.PI * 2)
        ctx.lineWidth = 3.5
        ctx.strokeStyle = isDark ? "#121214" : "#1a1a1c"
        ctx.stroke()

        // Rugged tire treads
        ctx.strokeStyle = isDark ? "#28282c" : "#3c3c40"
        ctx.lineWidth = 1.4
        const treadCount = 14
        for (let t = 0; t < treadCount; t++) {
            const tAngle = (t / treadCount) * Math.PI * 2 + wAngle
            ctx.beginPath()
            ctx.moveTo(wx + Math.cos(tAngle) * (WHEEL_R - 1.5), wy + Math.sin(tAngle) * (WHEEL_R - 1.5))
            ctx.lineTo(wx + Math.cos(tAngle) * (WHEEL_R + 1.2), wy + Math.sin(tAngle) * (WHEEL_R + 1.2))
            ctx.stroke()
        }

        // Rim Highlight
        ctx.beginPath()
        ctx.arc(wx, wy, WHEEL_R - 2.5, 0, Math.PI * 2)
        ctx.lineWidth = 1.2
        ctx.strokeStyle = isDark ? "#39ff6a" : "#1a7832"
        ctx.stroke()

        // Spokes
        ctx.strokeStyle = isDark ? "rgba(57, 255, 106, 0.4)" : "rgba(26, 120, 50, 0.3)"
        ctx.lineWidth = 0.8
        const spokeCount = 12
        for (let s = 0; s < spokeCount; s++) {
            const sAngle = (s / spokeCount) * Math.PI * 2 + wAngle
            ctx.beginPath()
            ctx.moveTo(wx, wy)
            ctx.lineTo(wx + Math.cos(sAngle) * (WHEEL_R - 2.5), wy + Math.sin(sAngle) * (WHEEL_R - 2.5))
            ctx.stroke()
        }

        // Hub Center
        ctx.beginPath()
        ctx.arc(wx, wy, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = isDark ? "#ffffff" : "#333333"
        ctx.fill()
        ctx.restore()
    }

    drawWheelProcedural(rear.x, rear.y, rWheelAngle ?? 0)
    drawWheelProcedural(front.x, front.y, fWheelAngle ?? 0)

    // DRAW FRAME & MECHANICALS
    ctx.save()
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    const primaryColor = isDark ? "#39ff6a" : "#1a7832"
    const frameColor = isDark ? "#55555d" : "#77777c"
    const chromeColor = isDark ? "#e0e0e5" : "#555558"

    // Rear Swingarm
    ctx.beginPath()
    ctx.moveTo(engine.x, engine.y)
    ctx.lineTo(rear.x, rear.y)
    ctx.lineWidth = 4
    ctx.strokeStyle = frameColor
    ctx.stroke()
    ctx.lineWidth = 2
    ctx.strokeStyle = chromeColor
    ctx.stroke()

    // Suspension coil spring
    ctx.beginPath()
    ctx.moveTo(rear.x + (engine.x - rear.x) * 0.5, rear.y + (engine.y - rear.y) * 0.5)
    ctx.lineTo(seat.x, seat.y + 4)
    ctx.lineWidth = 3
    ctx.strokeStyle = "#ff3347"
    ctx.stroke()

    // Front Forks
    ctx.beginPath()
    ctx.moveTo(bar.x, bar.y + 3)
    ctx.lineTo(front.x, front.y)
    ctx.lineWidth = 3.5
    ctx.strokeStyle = frameColor
    ctx.stroke()
    
    ctx.beginPath()
    ctx.moveTo(bar.x + (front.x - bar.x) * 0.4, bar.y + 3 + (front.y - bar.y) * 0.4)
    ctx.lineTo(front.x, front.y)
    ctx.lineWidth = 2.2
    ctx.strokeStyle = chromeColor
    ctx.stroke()

    // Main Chassis Triangles
    ctx.beginPath()
    ctx.moveTo(rear.x, rear.y)
    ctx.lineTo(seat.x, seat.y)
    ctx.lineTo(engine.x, engine.y)
    ctx.closePath()
    ctx.lineWidth = 3.2
    ctx.strokeStyle = primaryColor
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(engine.x, engine.y)
    ctx.lineTo(bar.x, bar.y)
    ctx.lineTo(seat.x, seat.y)
    ctx.closePath()
    ctx.lineWidth = 3.2
    ctx.strokeStyle = primaryColor
    ctx.stroke()

    // Handlebars T-bar and handgrip
    const barTop = toWorld(barX - 2, barY - 4)
    const grip = toWorld(barX - 5, barY - 5)
    ctx.beginPath()
    ctx.moveTo(bar.x, bar.y)
    ctx.lineTo(barTop.x, barTop.y)
    ctx.lineWidth = 3
    ctx.strokeStyle = frameColor
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(barTop.x, barTop.y)
    ctx.lineTo(grip.x, grip.y)
    ctx.lineWidth = 2.5
    ctx.strokeStyle = isDark ? "#ffffff" : "#111111"
    ctx.stroke()

    // Winding Chrome Exhaust Pipe
    const exhaustMidi = toWorld(engineX - 6, engineY - 3)
    const exhaustSilencer = toWorld(fenderX + 2, fenderY - 8)
    ctx.beginPath()
    ctx.moveTo(engine.x, engine.y - 1)
    ctx.quadraticCurveTo(exhaustMidi.x, exhaustMidi.y, exhaustSilencer.x, exhaustSilencer.y)
    ctx.lineWidth = 2.5
    ctx.strokeStyle = chromeColor
    ctx.stroke()

    // Silencer Body
    const silencerEnd = toWorld(fenderX - 4, fenderY - 10)
    ctx.beginPath()
    ctx.moveTo(exhaustSilencer.x, exhaustSilencer.y)
    ctx.lineTo(silencerEnd.x, silencerEnd.y)
    ctx.lineWidth = 4.2
    ctx.strokeStyle = "#44444a"
    ctx.stroke()

    // Engine Crankcase & Fin Layout
    ctx.fillStyle = isDark ? "#2d2d32" : "#dddddf"
    ctx.beginPath()
    ctx.arc(engine.x, engine.y, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = isDark ? "#ffffff" : "#333333"
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.strokeStyle = isDark ? "#ffffff" : "#444448"
    ctx.lineWidth = 1.2
    for (let f = 0; f < 3; f++) {
        const finY = engine.y - 4 + f * 2.2
        ctx.beginPath()
        ctx.moveTo(engine.x - 4, finY)
        ctx.lineTo(engine.x + 4, finY)
        ctx.stroke()
    }

    // Drive Chain
    ctx.beginPath()
    ctx.moveTo(engine.x, engine.y)
    ctx.lineTo(rear.x, rear.y)
    ctx.lineWidth = 1
    ctx.strokeStyle = isDark ? "rgba(255,200,0,0.6)" : "rgba(180,120,0,0.6)"
    ctx.stroke()

    // Trial-style Minimal Rear Fender
    ctx.beginPath()
    ctx.moveTo(seat.x, seat.y)
    ctx.quadraticCurveTo(fender.x + 3, fender.y - 4, fender.x, fender.y)
    ctx.lineTo(fender.x + 2, fender.y + 4)
    ctx.lineTo(seat.x, seat.y + 2)
    ctx.closePath()
    ctx.fillStyle = primaryColor
    ctx.fill()

    ctx.restore()

    // DRAW ACTIVE RIDER (PROCEDURAL VECTORS)
    const lean = rLean * 0.5
    const hip = toWorld(seatX + 2, seatY + 1)
    const shoulder = toWorld(seatX + 2 + lean * 10, seatY - 15)
    const head = toWorld(seatX + 4 + lean * 12, seatY - 28)
    const elbow = toWorld(barX - 4 + lean * 6, seatY - 18)
    const hand = toWorld(barX, barY)
    const knee = toWorld(seatX - 2, seatY + 10)
    const foot = toWorld(rearX + 10, 4)

    ctx.save()
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    const jerseyColor = isDark ? "#2979ff" : "#1565c0"
    const pantsColor = isDark ? "#1a237e" : "#0d47a1"
    const skinColor = "#ffd54f"
    const bootColor = isDark ? "#e0e0e0" : "#333333"

    // Thigh
    ctx.beginPath()
    ctx.moveTo(hip.x, hip.y)
    ctx.lineTo(knee.x, knee.y)
    ctx.lineWidth = 6
    ctx.strokeStyle = pantsColor
    ctx.stroke()

    // Calf
    ctx.beginPath()
    ctx.moveTo(knee.x, knee.y)
    ctx.lineTo(foot.x, foot.y)
    ctx.lineWidth = 4.8
    ctx.strokeStyle = pantsColor
    ctx.stroke()

    // Boot
    ctx.beginPath()
    ctx.moveTo(foot.x - 2, foot.y)
    ctx.lineTo(foot.x + 4, foot.y + 1)
    ctx.lineWidth = 3.5
    ctx.strokeStyle = bootColor
    ctx.stroke()

    // Torso Jersey
    ctx.beginPath()
    ctx.moveTo(hip.x, hip.y)
    ctx.lineTo(shoulder.x, shoulder.y)
    ctx.lineWidth = 7.5
    ctx.strokeStyle = jerseyColor
    ctx.stroke()

    // Accent Stripe
    ctx.beginPath()
    ctx.moveTo(hip.x + (shoulder.x - hip.x) * 0.3, hip.y + (shoulder.y - hip.y) * 0.3)
    ctx.lineTo(shoulder.x, shoulder.y)
    ctx.lineWidth = 2.5
    ctx.strokeStyle = primaryColor
    ctx.stroke()

    // Upper Arm
    ctx.beginPath()
    ctx.moveTo(shoulder.x, shoulder.y)
    ctx.lineTo(elbow.x, elbow.y)
    ctx.lineWidth = 4.5
    ctx.strokeStyle = jerseyColor
    ctx.stroke()

    // Forearm
    ctx.beginPath()
    ctx.moveTo(elbow.x, elbow.y)
    ctx.lineTo(hand.x, hand.y)
    ctx.lineWidth = 3.5
    ctx.strokeStyle = jerseyColor
    ctx.stroke()

    // Glove
    ctx.beginPath()
    ctx.arc(hand.x, hand.y, 2.2, 0, Math.PI * 2)
    ctx.fillStyle = skinColor
    ctx.fill()

    // Trials Helmet with Peak/Visor
    ctx.beginPath()
    ctx.arc(head.x, head.y, 6.5, 0, Math.PI * 2)
    ctx.fillStyle = primaryColor
    ctx.fill()
    ctx.strokeStyle = isDark ? "#ffffff" : "#222222"
    ctx.lineWidth = 1
    ctx.stroke()

    const visorAngle = angle - 0.2 + lean * 0.1
    ctx.beginPath()
    ctx.moveTo(head.x + Math.cos(visorAngle) * 2, head.y + Math.sin(visorAngle) * 2 - 2)
    ctx.lineTo(head.x + Math.cos(visorAngle + 0.4) * 11, head.y + Math.sin(visorAngle + 0.4) * 8 - 4)
    ctx.lineWidth = 2.5
    ctx.strokeStyle = primaryColor
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(head.x + Math.cos(visorAngle + 0.5) * 3.5, head.y + Math.sin(visorAngle + 0.5) * 3 + 1, 3, 0, Math.PI * 2)
    ctx.fillStyle = "#111111"
    ctx.fill()

    ctx.restore()
}

const sampleWaveAtWorldX = (worldX, wave) => {
    if (!wave.length) return 0
    if (worldX <= FLAT_START_PX) return 0
    const trackEndX = trackLengthPx.value - FLAT_FINISH_PX
    if (worldX >= trackEndX) return 0
    
    const idxF = (worldX - FLAT_START_PX) / SEGMENT_PX
    let i0 = Math.floor(idxF)
    let t = idxF - i0
    if (i0 < 0) { i0 = 0; t = 0 }
    if (i0 >= wave.length - 1) { i0 = wave.length - 2; t = 1 }
    
    const v0 = wave[i0] || 0
    const v1 = wave[i0 + 1] || 0
    const val = v0 * (1 - t) + v1 * t
    return Math.min(1, Math.max(0, val / WAVE_MAX))
}

const drawLevelPreview = (isDark) => {
    const canvas = minimapCanvasRef.value
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    ctx.clearRect(0, 0, w, h)

    const wave = smoothedWave.value
    const totalBars = Math.max(64, Math.min(w, wave.length || 1))
    const progress = Math.max(0, Math.min(1, bike.worldX / Math.max(1, trackLengthPx.value)))
    const progressX = progress * w
    const segmentW = w / totalBars
    const filledColor = isDark ? 'rgba(57,255,106,0.85)' : 'rgba(26,120,50,0.85)'
    const emptyColor = isDark ? 'rgba(57,255,106,0.18)' : 'rgba(0,0,0,0.1)'

    for (let i = 0; i < totalBars; i++) {
        const t = i / Math.max(1, totalBars - 1)
        const worldX = t * trackLengthPx.value
        const norm = sampleWaveAtWorldX(worldX, wave)
        const barHeight = Math.max(2, norm * (h - 4))
        const x = t * w
        const barWidth = Math.max(1, (i < totalBars - 1 ? segmentW : w - x))

        ctx.fillStyle = x + barWidth <= progressX + 0.5 ? filledColor : emptyColor
        ctx.fillRect(x, h - barHeight - 1, barWidth, barHeight)
    }

    ctx.fillStyle = isDark ? '#cc2222' : '#991515'
    ctx.fillRect(Math.min(w - 1, progressX) - 1, 0, 2, h)
}

const togglePlay = () => {
    if (playerState.value === 'playing') playerSdk.pause()
    else playerSdk.play()
}

const handleLikeToggle = () => {
    playerSdk.reaction(reaction.value === 'LIKE' ? '' : 'LIKE')
}

const openPlaylist = () => {
    if (typeof playerSdk.openPlaylist === 'function') playerSdk.openPlaylist()
}

const collapse = () => {
    playerSdk.collapse()
}

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

const formatNumber = (num) => {
    if (num === undefined || num === null) return '0'
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

const setInput = (key, value) => {
    if (key in input) input[key] = value
}

// Compute reactive properties
const statusClass = computed(() => {
    if (statusText.value === 'READY' || statusText.value === 'RIDING') return 'status-riding'
    if (statusText.value === 'FINISHED!') return 'status-finish'
    return 'status-crash'
})

// Calculate race progress
const raceProgressPct = computed(() => {
    if (!trackLengthPx.value) return 0
    return Math.max(0, Math.min(100, (bike.worldX / trackLengthPx.value) * 100))
})

// Setup animation loop and key listener
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

    const canvas = canvasRef.value
    const minimapCanvas = minimapCanvasRef.value
    const minimapContainer = minimapContainerRef.value

    const handleResize = () => {
        if (canvas && canvas.parentElement) {
            canvas.width = canvas.parentElement.clientWidth
            canvas.height = canvas.parentElement.clientHeight
        }
        if (minimapCanvas && minimapContainer) {
            const rect = minimapContainer.getBoundingClientRect()
            minimapCanvas.width = Math.max(120, Math.round(rect.width))
            minimapCanvas.height = Math.max(20, Math.round(rect.height))
        }
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    const handleKeyDown = (e) => {
        const keyMap = {
            ArrowUp: 'gas', KeyW: 'gas', Digit8: 'gas', Numpad8: 'gas',
            ArrowDown: 'brake', KeyS: 'brake', Digit2: 'brake', Numpad2: 'brake',
            ArrowRight: 'leanFwd', KeyD: 'leanFwd', Digit6: 'leanFwd', Numpad6: 'leanFwd',
            ArrowLeft: 'leanBack', KeyA: 'leanBack', Digit4: 'leanBack', Numpad4: 'leanBack'
        }
        const field = keyMap[e.code]
        if (field) {
            e.preventDefault()
            setInput(field, true)
        }
    }

    const handleKeyUp = (e) => {
        const keyMap = {
            ArrowUp: 'gas', KeyW: 'gas', Digit8: 'gas', Numpad8: 'gas',
            ArrowDown: 'brake', KeyS: 'brake', Digit2: 'brake', Numpad2: 'brake',
            ArrowRight: 'leanFwd', KeyD: 'leanFwd', Digit6: 'leanFwd', Numpad6: 'leanFwd',
            ArrowLeft: 'leanBack', KeyA: 'leanBack', Digit4: 'leanBack', Numpad4: 'leanBack'
        }
        const field = keyMap[e.code]
        if (field) {
            e.preventDefault()
            setInput(field, false)
        }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    // Start animation loop
    const render = (timestamp) => {
        if (!isExpanded.value) return
        if (!canvasRef.value) {
            animationFrameId = requestAnimationFrame(render)
            return
        }
        const ctx = canvasRef.value.getContext('2d')
        if (!ctx) return

        if (!lastTimestamp) lastTimestamp = timestamp
        const deltaTime = Math.min(48, timestamp - lastTimestamp)
        lastTimestamp = timestamp

        const w = canvasRef.value.width
        const h = canvasRef.value.height
        const gameTopY = TOP_UI_HEIGHT
        const gameBottomY = h - 12
        const playableHeight = Math.max(80, gameBottomY - gameTopY)
        const baseGroundY = gameTopY + playableHeight * 0.78
        const isDark = theme.value === 'dark'

        if (flashTimer > 0) flashTimer -= deltaTime
        if (shakeTimer > 0) shakeTimer -= deltaTime
        
        if (flashTimer <= 0 && (statusText.value === 'FINISHED!' || statusText.value === 'FLIPPED' || statusText.value === 'CRASHED')) {
            statusText.value = playerState.value === 'playing' ? 'RIDING' : 'READY'
        }

        if (playerState.value === 'playing') {
            updatePhysics(deltaTime, playableHeight, baseGroundY)

            const targetCamX = bike.worldX - FOLLOW_OFFSET_X
            const targetCamY = bike.y - playableHeight * FOLLOW_OFFSET_Y
            camera.worldX += (targetCamX - camera.worldX) * 0.14
            camera.worldY += (targetCamY - camera.worldY) * 0.14
        } else {
            decorativeTimer += 0.03
            bike.y = trackRideHeightAt(bike.worldX, playableHeight, baseGroundY) - WHEEL_R
                - Math.abs(Math.sin(decorativeTimer)) * 4
            
            const targetCamX = bike.worldX - FOLLOW_OFFSET_X
            const targetCamY = bike.y - playableHeight * FOLLOW_OFFSET_Y
            camera.worldX += (targetCamX - camera.worldX) * 0.08
            camera.worldY += (targetCamY - camera.worldY) * 0.08
        }

        let shakeX = 0, shakeY = 0
        if (shakeTimer > 0) {
            const amt = (shakeTimer / 260) * 6
            shakeX = (Math.random() - 0.5) * amt
            shakeY = (Math.random() - 0.5) * amt
        }

        ctx.save()
        ctx.translate(shakeX, shakeY)

        ctx.clearRect(-10, -10, w + 20, h + 20)
        ctx.fillStyle = isDark ? '#0a0a0c' : '#ffffff'
        ctx.fillRect(-10, -10, w + 20, h + 20)

        const toScreenY = (worldY) => worldY - camera.worldY

        drawWireframeTrack(ctx, w, playableHeight, baseGroundY, toScreenY)

        const startWorldX = 20
        const finishWorldX = trackLengthPx.value - FLAT_FINISH_PX / 2
        const startGroundY = toScreenY(terrainHeightAt(startWorldX, playableHeight, baseGroundY))
        const finishGroundY = toScreenY(terrainHeightAt(finishWorldX, playableHeight, baseGroundY))
        
        drawMarker(ctx, startWorldX - camera.worldX, startGroundY, 'START', 'start')
        drawMarker(ctx, finishWorldX - camera.worldX, finishGroundY, 'FINISH', 'finish')

        const bikeScreenX = bike.worldX - camera.worldX
        const bikeScreenY = toScreenY(bike.y)
        
        drawBikeAndRider(ctx, bikeScreenX, bikeScreenY, bike.angle, riderLean, isDark, bike.rearWheelAngle, bike.frontWheelAngle)

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i]
            p.x += p.vx
            p.y += p.vy
            p.vy += 0.15
            p.a -= p.color === 'dust' ? 0.02 : 0.025
            if (p.a <= 0) {
                particles.splice(i, 1)
                continue
            }
            const psx = p.x - camera.worldX
            const psy = toScreenY(p.y)
            ctx.save()
            ctx.globalAlpha = Math.max(0, p.a)
            ctx.fillStyle = p.color === 'dust' ? '#888888' : (p.color === 'debris' ? '#cc2222' : p.color)
            ctx.beginPath()
            ctx.arc(psx, psy, p.r, 0, Math.PI * 2)
            ctx.fill()
            ctx.restore()
        }

        if (flashTimer > 0) {
            ctx.save()
            ctx.globalAlpha = (flashTimer / 300) * 0.25
            ctx.fillStyle = flashColor
            ctx.fillRect(0, gameTopY, w, playableHeight)
            ctx.restore()
        }

        ctx.restore()

        drawLevelPreview(isDark)
        animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)

    // Bind playerSdk event handlers
    const onInit = (state) => {
        if (state?.player) isExpanded.value = state.player.expanded !== false
        if (state?.theme) theme.value = state.theme
        repeat.value = state.panes?.default?.repeat || 'none'
        nextDisabled.value = !!state.panes?.default?.nextDisabled
        prevDisabled.value = !!state.panes?.default?.prevDisabled
        hasQueue.value = !!state.panes?.default?.hasQueue
        
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
        }
    }

    const onPosition = (payload) => {
        currentTime = payload.position
    }

    const onState = (payload) => {
        if (payload?.state) {
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
        const tb = (bSum / bEnd) / 255
        const tm = (mSum / (mEnd - bEnd)) / 255
        const th = (hSum / (len - mEnd)) / 255
        
        audioData.bass += ((isFinite(tb) ? tb : 0) - audioData.bass) * 0.2
        audioData.mid += ((isFinite(tm) ? tm : 0) - audioData.mid) * 0.2
        audioData.high += ((isFinite(th) ? th : 0) - audioData.high) * 0.2
    }

    const updateTrackData = (track) => {
        if (!track) return

        if (track.cover?.crop !== trackInfo.value?.cover?.crop) {
            isCoverLoaded.value = false
        }

        trackInfo.value = {
            title: track.title || 'Waiting for track...',
            artists: track.artists || (track.contributors?.primary?.map((a) => a.name).join(', ')),
            cover: track.cover || null,
            duration: track.duration || 0,
            wave: track.wave && track.wave.length ? track.wave : Array(60).fill(120)
        }

        const waveData = track.wave && track.wave.length ? track.wave : Array(60).fill(120)
        smoothedWave.value = buildLevelWave(waveData, track.duration || 0)
        trackLengthPx.value = FLAT_START_PX + (smoothedWave.value.length - 1) * SEGMENT_PX + FLAT_FINISH_PX

        attempts.value = 1
        bestProgressPct.value = 0
        resetRun(true)
    }

    const onPlayer = (payload) => {
        if (payload && 'expanded' in payload) {
            const wasExpanded = isExpanded.value
            isExpanded.value = !!payload.expanded
            if (isExpanded.value && !wasExpanded) {
                cancelAnimationFrame(animationFrameId)
                lastTimestamp = 0
                animationFrameId = requestAnimationFrame(render)
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

    // Cleanup references on unmount
    onBeforeUnmount(() => {
        cancelAnimationFrame(animationFrameId)
        window.removeEventListener('resize', handleResize)
        window.removeEventListener('keydown', handleKeyDown)
        window.removeEventListener('keyup', handleKeyUp)

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
    })
})
</script>

<style scoped>
.progress-strip,
.side-panel,
.side-panel button,
.touch-hand button,
.ui-panel * {
    -webkit-tap-highlight-color: transparent !important;
    -webkit-touch-callout: none;
    user-select: none;
}

.gd-container {
    position: fixed;
    top: 0;
    padding-top: calc(var(--max-safe-area-inset-top, var(--tg-safe-area-inset-top, 0px)) + var(--max-content-safe-area-inset-top, var(--tg-content-safe-area-inset-top, 0px)));
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1;
    overflow: hidden;
    font-family: 'Courier New', monospace;
}

.gd-container.dark { background: #0a0a0c; }
.gd-container.light { background: #ffffff; }

.gd-canvas {
    display: block;
    width: 100%;
    height: 100%;
    touch-action: none;
}

.ui-panel {
    position: fixed;
    left: 0;
    width: calc(100vw - 52px);
    box-sizing: border-box;
    display: flex;
    align-items: center;
    z-index: 10;
    transition: background 0.3s, border-color 0.3s;
}

.dark .ui-panel { background: rgba(10, 10, 12, 0.92); color: #39ff6a; border-color: rgba(57,255,106,0.2); }
.light .ui-panel { background: rgba(255,255,255,0.95); color: #1a1a20; border-color: #e4e4e9; }

.top-panel {
    top: 0;
    min-height: 90px;
    border-bottom: 1px solid;
    padding: 0 16px 12px;
    justify-content: space-between;
    gap: 12px;
    padding-top: calc(var(--max-safe-area-inset-top, var(--tg-safe-area-inset-top, 0px)) + var(--max-content-safe-area-inset-top, var(--tg-content-safe-area-inset-top, 0px)));
}

.track-card { display: flex; align-items: center; gap: 12px; flex-grow: 1; min-width: 0; }

.track-cover {
    width: 52px;
    height: 52px;
    border-radius: 4px;
    overflow: hidden;
    background: #23232A;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(57,255,106,0.2);
}

.light .track-cover { background: #eef2f5; border-color: rgba(0,0,0,0.1); }

.track-cover-img { width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 0.2s; }
.track-cover-img.is-visible { opacity: 1; }
.cover-placeholder { color: #8E8E93; }

.track-meta { display: flex; flex-direction: column; gap: 2px; min-width: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
.track-meta .title { font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 50vw; }
.track-meta .artist { font-size: 11px; opacity: 0.6; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 50vw; }

.plugin-spacer { width: 40px; height: 40px; flex-shrink: 0; }

.score-panel {
    position: fixed;
    top: calc(var(--max-safe-area-inset-top, var(--tg-safe-area-inset-top, 0px)) + var(--max-content-safe-area-inset-top, var(--tg-content-safe-area-inset-top, 0px)) + 88px);

    left: 14px;
    z-index: 10;
    pointer-events: none;
    font-size: 11px;
    font-weight: 700;
    display: flex;
    flex-direction: column;
    gap: 2px;
    letter-spacing: 0.5px;
}

.dark .hud-line { color: rgba(57, 255, 106, 0.85); text-shadow: 0 0 6px rgba(57,255,106,0.4); }
.light .hud-line { color: rgba(26, 26, 32, 0.75); }
.hud-controls { opacity: 0.55; font-size: 10px; margin-top: 4px; }

.hud-status.status-crash { color: #ff3347 !important; text-shadow: 0 0 6px rgba(255,51,71,0.5); }
.hud-status.status-finish { color: #4ade80 !important; text-shadow: 0 0 8px rgba(74,222,128,0.6); }

.side-panel {
    position: fixed;
    top: 0;
    right: 0;
    width: 52px;
    height: 100vh;
    z-index: 20;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    padding: 96px 4px 12px 4px;
    box-sizing: border-box;
    gap: 10px;
    border-left: 1px solid rgba(57,255,106,0.25);
    background: rgba(8, 10, 8, 0.88);
    backdrop-filter: blur(6px);
}

.light .side-panel {
    background: rgba(240, 244, 248, 0.92);
    border-left-color: rgba(0,0,0,0.12);
}

.progress-strip {
    position: fixed;
    left: 14px;
    right: 68px;
    bottom: 12px;
    height: 28px;
    z-index: 12;
    border-radius: 4px;
    overflow: hidden;
    background: rgba(8, 10, 8, 0.55);
    backdrop-filter: blur(4px);
    pointer-events: none;
}

.light .progress-strip {
    background: rgba(255, 255, 255, 0.55);
}

.progress-strip-canvas {
    display: block;
    width: 100%;
    height: 100%;
}

.side-controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
}

.gd-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: 1px solid rgba(57,255,106,0.3);
    border-radius: 4px;
    color: rgba(57,255,106,0.9);
    cursor: pointer;
    padding: 0;
    transition: background 0.15s, border-color 0.15s, transform 0.1s;
}

.light .gd-btn {
    color: #1a1a20;
    border-color: rgba(0,0,0,0.15);
}

.gd-btn:hover {
    background: rgba(57,255,106,0.1);
    border-color: rgba(57,255,106,0.6);
}

.gd-btn:active { transform: scale(0.9); }

.gd-btn.is-active {
    background: rgba(57,255,106,0.18);
    box-shadow: 0 0 6px rgba(57,255,106,0.4);
}

.gd-btn:disabled {
    opacity: 0.25;
    pointer-events: none;
}

.touch-hand {
    position: fixed;
    bottom: 48px;
    z-index: 15;
    display: flex;
    gap: 10px;
    pointer-events: auto;
}

.touch-hand-left {
    left: 16px;
}

.touch-hand-right {
    right: 68px;
}

.touch-btn {
    width: 58px;
    height: 58px;
    border: 2px solid rgba(34,187,34,0.55);
    border-radius: 10px;
    background: rgba(255,255,255,0.82);
    color: #157015;
    font-family: 'Courier New', monospace;
    font-size: 20px;
    font-weight: 700;
    cursor: pointer;
    backdrop-filter: blur(4px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}

.touch-btn:active,
.touch-btn-gas:active {
    background: rgba(34,187,34,0.25);
    transform: scale(0.94);
}

.touch-btn-gas {
    border-color: rgba(204,34,34,0.55);
    color: #991515;
}

@media (min-width: 900px) and (pointer: fine) {
    .touch-hand { display: none; }
}
</style>