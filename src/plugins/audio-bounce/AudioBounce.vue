<template>
    <div class="bounce-container" :class="[theme]" id="ab-app-container">
        <!-- TOP TRACK META PANEL -->
        <div ref="topPanelRef" class="ab-top-panel" id="ab-top-panel">
            <div class="ab-track-card" id="ab-track-card" @click="playerSdk.openTrackKebab()">
                <div class="ab-cover-wrapper" id="ab-cover-wrapper">
                    <img
                        v-if="trackInfo.cover?.crop"
                        :src="trackInfo.cover.crop"
                        class="ab-cover-img"
                        :class="{ 'is-loaded': isCoverLoaded }"
                        @load="isCoverLoaded = true"
                        id="ab-cover-img"
                    />
                    <div v-else class="ab-cover-placeholder" id="ab-cover-placeholder">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                    </div>
                </div>
                <div class="ab-track-meta" id="ab-track-meta">
                    <div class="ab-track-title" id="ab-track-title">{{ trackInfo.title }}</div>
                    <div class="ab-track-artist" id="ab-track-artist">{{ trackInfo.artists }}</div>
                </div>
            </div>
        </div>

        <!-- MAIN INTERACTIVE VIEWPORT -->
        <div class="ab-viewport-wrapper" ref="viewportRef" @pointerdown="handlePointerDown" id="ab-viewport-wrapper">
            <canvas ref="canvasRef" class="ab-canvas" id="ab-game-canvas"></canvas>

            <!-- HUD STATS LAYER -->
            <div class="ab-hud" id="ab-hud">
                <div class="ab-hud-item" id="ab-balls-count">
                    <span class="hud-label">BALLS:</span>
                    <span class="hud-val neon-pink-text">{{ balls.length }} / {{ maxBalls }}</span>
                </div>
                <div class="ab-hud-item" id="ab-collisions">
                    <span class="hud-label">BOUNCES:</span>
                    <span class="hud-val neon-blue-text">{{ formatNumber(bounceCount) }}</span>
                </div>
                <div class="ab-hud-item" id="ab-energy">
                    <span class="hud-label">SYSTEM TEMP:</span>
                    <span class="hud-val neon-green-text" :style="{ filter: `brightness(${1 + audioData.bass * 0.5})` }">{{ Math.round(kineticEnergy) }}°C</span>
                </div>
            </div>

            <!-- TAP INSTRUCTION LAYER -->
            <div class="ab-tap-prompt" v-if="showTapPrompt" id="ab-tap-prompt">
                <span class="neon-blue-text pulse-text">TAP TO SPAWN BALLS</span>
            </div>
        </div>

        <!-- SYNTHWAVE CONSOLE CONTROLLER -->
        <div class="ab-console-deck" id="ab-console-deck">
            <!-- PHYSICS & INTERACTIVE SETTINGS CONTROLS -->
            <div class="physics-control-strip" id="ab-physics-strip">
                <div class="strip-item" id="ab-gravity-ctrl">
                    <span class="strip-label">GRAVITY</span>
                    <div class="strip-buttons">
                        <button class="strip-btn" :class="{ 'is-active': physicsConfig.gravityType === 'down' }" @click="setGravityType('down')" id="ab-btn-grav-down">⬇ DOWN</button>
                        <button class="strip-btn" :class="{ 'is-active': physicsConfig.gravityType === 'zero' }" @click="setGravityType('zero')" id="ab-btn-grav-zero">🌌 ZERO</button>
                        <button class="strip-btn" :class="{ 'is-active': physicsConfig.gravityType === 'orbit' }" @click="setGravityType('orbit')" id="ab-btn-grav-orbit">🌀 ORBIT</button>
                    </div>
                </div>

                <div class="strip-item" id="ab-preset-ctrl">
                    <span class="strip-label">THEME Preset</span>
                    <div class="strip-buttons">
                        <button class="strip-btn" :class="{ 'is-active': activePreset === 'neon-party' }" @click="applyPreset('neon-party')" id="ab-btn-theme-party">PARTY</button>
                        <button class="strip-btn" :class="{ 'is-active': activePreset === 'acid-toxic' }" @click="applyPreset('acid-toxic')" id="ab-btn-theme-toxic">TOXIC</button>
                        <button class="strip-btn" :class="{ 'is-active': activePreset === 'cyber-sunset' }" @click="applyPreset('cyber-sunset')" id="ab-btn-theme-sunset">SUNSET</button>
                    </div>
                </div>

                <div class="strip-item strip-item-actions" id="ab-action-ctrl">
                    <button class="action-trigger-btn btn-spawn" @click="spawnBallGroup" id="ab-btn-spawn-group">+3 BALLS</button>
                    <button class="action-trigger-btn btn-clear" @click="clearBalls" id="ab-btn-clear-all">RESET BOX</button>
                </div>
            </div>

            <!-- MEDIA PLAYER INTEGRATION DECK -->
            <div class="console-media-deck" id="ab-console-media">
                <button class="media-deck-btn btn-like" @click="handleLikeToggle" :class="{ 'is-liked': reaction === 'LIKE' }" :title="reaction === 'LIKE' ? 'Unlike' : 'Like'" id="ab-btn-like">
                    <svg width="18" height="18" viewBox="0 0 24 24" :fill="reaction === 'LIKE' ? '#ff2a6d' : 'none'" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </button>
                
                <button class="media-deck-btn" :disabled="prevDisabled" @click="playerSdk.prev()" title="Previous" id="ab-btn-prev">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                </button>
                
                <button class="media-deck-btn btn-play-main" @click="togglePlay" title="Play/Pause" id="ab-btn-play">
                    <svg v-if="playerState !== 'playing'" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                </button>
                
                <button class="media-deck-btn" :disabled="nextDisabled" @click="playerSdk.next()" title="Next" id="ab-btn-next">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6zm9-12h2v12h-2z"/></svg>
                </button>
                
                <button class="media-deck-btn" @click="handleRepeat" :class="{ 'is-active': repeat !== 'none' }" title="Repeat" id="ab-btn-repeat">
                    <svg v-if="repeat === 'track'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                        <text x="9" y="16" font-size="9" font-weight="bold" fill="currentColor" stroke="none">1</text>
                    </svg>
                    <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                    </svg>
                </button>
                
                <button class="media-deck-btn" :disabled="!hasQueue" @click="openPlaylist" title="Queue" id="ab-btn-queue">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                    </svg>
                </button>
                
                <button class="media-deck-btn btn-collapse" @click="collapse" title="Collapse" id="ab-btn-collapse">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"/>
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, reactive, nextTick } from 'vue'
import { playerSdk } from '@bilbomusic/player-plugin-sdk'

const canvasRef = ref(null)
const viewportRef = ref(null)
const topPanelRef = ref(null)
const theme = ref('dark')
const isExpanded = ref(true)
const playerState = ref('paused')
const reaction = ref('')
const repeat = ref('none')
const isCoverLoaded = ref(false)
const showTapPrompt = ref(true)

const TOP_UI_HEIGHT = ref(80)

const updateTopUiHeight = () => {
    if (topPanelRef.value) {
        TOP_UI_HEIGHT.value = topPanelRef.value.offsetHeight || 80
    }
}

const nextDisabled = ref(false)
const prevDisabled = ref(true)
const hasQueue = ref(false)

const trackInfo = ref({
    title: 'Waiting for track...',
    artists: 'Loading...',
    cover: null,
    duration: 0,
    wave: []
})

// Interactive Sandbox States
const balls = ref([])
const maxBalls = 60
const bounceCount = ref(0)
const kineticEnergy = ref(0)
const activePreset = ref('neon-party')

// Audio band analyzers
const audioData = reactive({
    bass: 0,
    mid: 0,
    high: 0,
    raw: []
})

const physicsConfig = reactive({
    gravityType: 'down', // down, zero, orbit
    restitution: 0.94,   // bounce elasticity
    gravityForce: 0.32,
    wallPower: 12        // speed multiplier added by pulsing walls
})

// Visual Preset Hues
const presets = {
    'neon-party': { hues: [320, 190, 280, 50], bg: '#03010a', boxColor: '#05d9e8', secondaryBoxColor: '#ff2a6d' },
    'acid-toxic': { hues: [110, 140, 80, 200], bg: '#010603', boxColor: '#39ff6a', secondaryBoxColor: '#ffe600' },
    'cyber-sunset': { hues: [15, 345, 45, 320], bg: '#0b020a', boxColor: '#ff2a6d', secondaryBoxColor: '#ff6c3b' }
}

let particles = []
let activeExplosions = []
let lastTimestamp = 0
let animationFrameId = null
let wavePhase = 0

// Define box coordinates (will dynamically adjust to canvas proportions)
const sandboxBox = reactive({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    padding: 40,
    // Current pulsated boundaries
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    // Wall velocity for bouncing physics
    vTop: 0,
    vBottom: 0,
    vLeft: 0,
    vRight: 0
})

const createExplosion = (x, y, hue, size = 12) => {
    for (let i = 0; i < size; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 1.5 + Math.random() * 4.5
        particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            r: 1.5 + Math.random() * 2,
            alpha: 1,
            hue,
            decay: 0.02 + Math.random() * 0.025
        })
    }
}

const addBall = (x, y, vx, vy) => {
    if (balls.value.length >= maxBalls) {
        // Remove oldest ball to make space
        balls.value.shift()
    }
    
    const currentHues = presets[activePreset.value].hues
    const pickedHue = currentHues[Math.floor(Math.random() * currentHues.length)]

    balls.value.push({
        x,
        y,
        vx: vx || (Math.random() - 0.5) * 8,
        vy: vy || (Math.random() - 0.5) * 8,
        r: 6 + Math.random() * 10,
        hue: pickedHue,
        trail: []
    })
    
    if (showTapPrompt.value) {
        showTapPrompt.value = false
    }
}

const spawnBallGroup = () => {
    const bx = sandboxBox.x + sandboxBox.width / 2
    const by = sandboxBox.y + sandboxBox.height / 2
    for (let i = 0; i < 3; i++) {
        const ox = bx + (Math.random() - 0.5) * 40
        const oy = by + (Math.random() - 0.5) * 40
        const vx = (Math.random() - 0.5) * 12
        const vy = (Math.random() - 0.5) * 12
        addBall(ox, oy, vx, vy)
    }
}

const clearBalls = () => {
    balls.value = []
    particles = []
    bounceCount.value = 0
}

const handlePointerDown = (e) => {
    if (!canvasRef.value) return
    const rect = canvasRef.value.getBoundingClientRect()
    const px = e.clientX - rect.left
    const py = e.clientY - rect.top

    // Spawn a ball at the pointer coordinates
    const vx = (Math.random() - 0.5) * 10
    const vy = (Math.random() - 0.5) * 10
    
    addBall(px, py, vx, vy)
    createExplosion(px, py, presets[activePreset.value].hues[0], 8)
}

const setGravityType = (type) => {
    physicsConfig.gravityType = type
}

const applyPreset = (presetName) => {
    if (presets[presetName]) {
        activePreset.value = presetName
        // Recolor existing balls to fit the theme nicely
        balls.value.forEach(ball => {
            const currentHues = presets[presetName].hues
            ball.hue = currentHues[Math.floor(Math.random() * currentHues.length)]
        })
    }
}

const updatePhysics = (dt) => {
    const timeScale = Math.min(2.5, dt / 16.66)
    let totalEnergy = 0

    // Decay audio data when paused so that walls stop smoothly
    if (playerState.value !== 'playing') {
        audioData.bass *= 0.85
        audioData.mid *= 0.85
        audioData.high *= 0.85
        if (audioData.bass < 0.001) audioData.bass = 0
        if (audioData.mid < 0.001) audioData.mid = 0
        if (audioData.high < 0.001) audioData.high = 0
    }

    // Phase speed is purely driven by music, zero when silent/paused!
    const phaseSpeed = (audioData.bass + audioData.mid + audioData.high) * 0.05
    wavePhase += phaseSpeed * timeScale

    // 1. Calculate Pulsating Wall Positions & Velocities based on frequencies (toned down)
    const bassPulse = audioData.bass * 6
    const midPulse = audioData.mid * 4
    const highPulse = audioData.high * 3

    const targetTop = sandboxBox.y + sandboxBox.padding + highPulse
    const targetBottom = sandboxBox.y + sandboxBox.height - sandboxBox.padding - bassPulse
    const targetLeft = sandboxBox.x + sandboxBox.padding + midPulse
    const targetRight = sandboxBox.x + sandboxBox.width - sandboxBox.padding - midPulse

    // Calculate Wall velocities (approx delta position)
    sandboxBox.vTop = (targetTop - sandboxBox.top)
    sandboxBox.vBottom = (targetBottom - sandboxBox.bottom)
    sandboxBox.vLeft = (targetLeft - sandboxBox.left)
    sandboxBox.vRight = (targetRight - sandboxBox.right)

    // Apply positions
    sandboxBox.top = targetTop
    sandboxBox.bottom = targetBottom
    sandboxBox.left = targetLeft
    sandboxBox.right = targetRight

    const cx = sandboxBox.x + sandboxBox.width / 2
    const cy = sandboxBox.y + sandboxBox.height / 2

    // Wave parameters for collision and drawing
    // Directly tied to music intensity. No constant base term, so they are flat (0) when silent!
    const A_top = audioData.high * 8
    const A_bottom = audioData.bass * 10
    const A_left = audioData.mid * 6
    const A_right = audioData.mid * 6

    const k_top = 0.035
    const k_bottom = 0.035
    const k_left = 0.035
    const k_right = 0.035

    const phase_top = wavePhase
    const phase_bottom = wavePhase
    const phase_left = wavePhase
    const phase_right = wavePhase

    const d_phase = phaseSpeed * timeScale

    // 2. Resolve Ball Physics
    for (let i = 0; i < balls.value.length; i++) {
        const ball = balls.value[i]

        // Save trail
        if (Math.random() < 0.4) {
            ball.trail.push({ x: ball.x, y: ball.y, a: 0.6 })
            if (ball.trail.length > 6) ball.trail.shift()
        }

        // Apply gravity
        if (physicsConfig.gravityType === 'down') {
            ball.vy += physicsConfig.gravityForce * timeScale
        } else if (physicsConfig.gravityType === 'orbit') {
            // Pull towards the center of the box
            const dx = cx - ball.x
            const dy = cy - ball.y
            const dist = Math.sqrt(dx * dx + dy * dy) || 1
            const pull = 0.45
            ball.vx += (dx / dist) * pull * timeScale
            ball.vy += (dy / dist) * pull * timeScale
        } // zero gravity has no force applied

        // Apply drag/air friction
        ball.vx *= 0.995
        ball.vy *= 0.995

        // Update positions
        ball.x += ball.vx * timeScale
        ball.y += ball.vy * timeScale

        // 3. Wall collisions (using wavy pulsating box bounds)
        let collided = false

        // A. Left wall collision check (Wavy)
        const yLocalLeft = Math.max(0, Math.min(sandboxBox.height, ball.y - sandboxBox.top))
        const left_x = sandboxBox.left + A_left * Math.sin(yLocalLeft * k_left + phase_left)
        if (ball.x - ball.r < left_x) {
            ball.x = left_x + ball.r
            const dx_dy = A_left * k_left * Math.cos(yLocalLeft * k_left + phase_left)
            const norm = Math.sqrt(dx_dy * dx_dy + 1)
            const nx = 1 / norm
            const ny = -dx_dy / norm

            const v_wall_x = sandboxBox.vLeft + A_left * Math.cos(yLocalLeft * k_left + phase_left) * d_phase
            const v_wall_y = 0

            const rx = ball.vx - v_wall_x
            const ry = ball.vy - v_wall_y
            const r_normal = rx * nx + ry * ny

            if (r_normal < 0) {
                const impactSpeed = -r_normal
                const isImpact = impactSpeed > 1.2
                const activeKick = isImpact ? (audioData.mid * 4.5) : 0
                const bounced_normal = -r_normal * physicsConfig.restitution + activeKick
                ball.vx = (rx - r_normal * nx) + bounced_normal * nx
                ball.vy = (ry - r_normal * ny) + bounced_normal * ny
                if (isImpact) {
                    collided = true
                }
            }
        }

        // B. Right wall collision check (Wavy)
        const yLocalRight = Math.max(0, Math.min(sandboxBox.height, ball.y - sandboxBox.top))
        const right_x = sandboxBox.right - A_right * Math.sin(yLocalRight * k_right - phase_right)
        if (ball.x + ball.r > right_x) {
            ball.x = right_x - ball.r
            const dx_dy = -A_right * k_right * Math.cos(yLocalRight * k_right - phase_right)
            const norm = Math.sqrt(dx_dy * dx_dy + 1)
            const nx = -1 / norm
            const ny = -dx_dy / norm

            const v_wall_x = sandboxBox.vRight - A_right * Math.cos(yLocalRight * k_right - phase_right) * (-d_phase)
            const v_wall_y = 0

            const rx = ball.vx - v_wall_x
            const ry = ball.vy - v_wall_y
            const r_normal = rx * nx + ry * ny

            if (r_normal < 0) {
                const impactSpeed = -r_normal
                const isImpact = impactSpeed > 1.2
                const activeKick = isImpact ? (audioData.mid * 4.5) : 0
                const bounced_normal = -r_normal * physicsConfig.restitution + activeKick
                ball.vx = (rx - r_normal * nx) + bounced_normal * nx
                ball.vy = (ry - r_normal * ny) + bounced_normal * ny
                if (isImpact) {
                    collided = true
                }
            }
        }

        // C. Top wall collision check (Wavy)
        const xLocalTop = Math.max(0, Math.min(sandboxBox.width, ball.x - sandboxBox.left))
        const top_y = sandboxBox.top + A_top * Math.sin(xLocalTop * k_top + phase_top)
        if (ball.y - ball.r < top_y) {
            ball.y = top_y + ball.r
            const dy_dx = A_top * k_top * Math.cos(xLocalTop * k_top + phase_top)
            const norm = Math.sqrt(dy_dx * dy_dx + 1)
            const nx = -dy_dx / norm
            const ny = 1 / norm

            const v_wall_x = 0
            const v_wall_y = sandboxBox.vTop + A_top * Math.cos(xLocalTop * k_top + phase_top) * d_phase

            const rx = ball.vx - v_wall_x
            const ry = ball.vy - v_wall_y
            const r_normal = rx * nx + ry * ny

            if (r_normal < 0) {
                const impactSpeed = -r_normal
                const isImpact = impactSpeed > 1.2
                const activeKick = isImpact ? (audioData.high * 5.0) : 0
                const bounced_normal = -r_normal * physicsConfig.restitution + activeKick
                ball.vx = (rx - r_normal * nx) + bounced_normal * nx
                ball.vy = (ry - r_normal * ny) + bounced_normal * ny
                if (isImpact) {
                    collided = true
                }
            }
        }

        // D. Bottom wall collision check (Wavy, holds motionless floor check)
        const xLocalBottom = Math.max(0, Math.min(sandboxBox.width, ball.x - sandboxBox.left))
        const bottom_y = sandboxBox.bottom - A_bottom * Math.sin(xLocalBottom * k_bottom - phase_bottom)
        if (ball.y + ball.r > bottom_y) {
            ball.y = bottom_y - ball.r
            const dy_dx = -A_bottom * k_bottom * Math.cos(xLocalBottom * k_bottom - phase_bottom)
            const norm = Math.sqrt(dy_dx * dy_dx + 1)
            const nx = -dy_dx / norm
            const ny = -1 / norm

            const v_wall_x = 0
            const v_wall_y = sandboxBox.vBottom - A_bottom * Math.cos(xLocalBottom * k_bottom - phase_bottom) * (-d_phase)

            const rx = ball.vx - v_wall_x
            const ry = ball.vy - v_wall_y
            const r_normal = rx * nx + ry * ny

            let bottomCollided = false
            if (r_normal < 0) {
                const impactSpeed = -r_normal
                const isImpact = impactSpeed > 1.2

                if (isImpact) {
                    const activeKick = audioData.bass * 6.0
                    const bounced_normal = -r_normal * physicsConfig.restitution + activeKick
                    ball.vx = (rx - r_normal * nx) + bounced_normal * nx
                    ball.vy = (ry - r_normal * ny) + bounced_normal * ny
                    bottomCollided = true
                } else {
                    // Slide/Rest smoothly on bottom wall without bouncing and infinite hit count
                    ball.vx *= 0.94
                    if (Math.abs(ball.vx) < 0.1) ball.vx = 0
                    ball.vy = 0
                }
            }
            if (bottomCollided) {
                if (playerState.value === 'playing') {
                    bounceCount.value++
                }
                createExplosion(ball.x, ball.y, ball.hue, 4)
            }
            collided = false
        }

        if (collided) {
            if (playerState.value === 'playing') {
                bounceCount.value++
            }
            createExplosion(ball.x, ball.y, ball.hue, 4)
        }

        // 4. Ball-to-Ball collisions
        for (let j = i + 1; j < balls.value.length; j++) {
            const other = balls.value[j]
            const dx = other.x - ball.x
            const dy = other.y - ball.y
            const dist = Math.sqrt(dx * dx + dy * dy) || 1
            const minDist = ball.r + other.r

            if (dist < minDist) {
                // Overlap correction
                const overlap = minDist - dist
                const nx = dx / dist
                const ny = dy / dist

                ball.x -= nx * overlap * 0.5
                ball.y -= ny * overlap * 0.5
                other.x += nx * overlap * 0.5
                other.y += ny * overlap * 0.5

                // Elastic momentum exchange
                const kx = ball.vx - other.vx
                const ky = ball.vy - other.vy
                const p = 2 * (nx * kx + ny * ky) / (ball.r + other.r)

                ball.vx -= p * other.r * nx * physicsConfig.restitution
                ball.vy -= p * other.r * ny * physicsConfig.restitution
                other.vx += p * ball.r * nx * physicsConfig.restitution
                other.vy += p * ball.r * ny * physicsConfig.restitution

                if (Math.random() < 0.2) {
                    createExplosion((ball.x + other.x) / 2, (ball.y + other.y) / 2, ball.hue, 3)
                }
            }
        }

        // Limit max speed to prevent balls from flying like crazy
        const currentSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy)
        const maxSpeed = 12
        if (currentSpeed > maxSpeed) {
            ball.vx = (ball.vx / currentSpeed) * maxSpeed
            ball.vy = (ball.vy / currentSpeed) * maxSpeed
        }

        // Keep score of kinetic energy
        totalEnergy += (ball.vx * ball.vx + ball.vy * ball.vy) * 0.5
    }

    // Update kinetic heat stats
    kineticEnergy.value = Math.max(10, totalEnergy * 0.25)
}

const drawBoxLines = (ctx, isDark) => {
    const current = presets[activePreset.value]
    ctx.save()

    // Draw background wireframe mesh inside box
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.03)'
    ctx.lineWidth = 1
    const gridSize = 30
    for (let x = sandboxBox.left; x < sandboxBox.right; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, sandboxBox.top)
        ctx.lineTo(x, sandboxBox.bottom)
        ctx.stroke()
    }
    for (let y = sandboxBox.top; y < sandboxBox.bottom; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(sandboxBox.left, y)
        ctx.lineTo(sandboxBox.right, y)
        ctx.stroke()
    }

    // Wave parameters for drawing
    const A_top = audioData.high * 8
    const A_bottom = audioData.bass * 10
    const A_left = audioData.mid * 6
    const A_right = audioData.mid * 6

    const k_top = 0.035
    const k_bottom = 0.035
    const k_left = 0.035
    const k_right = 0.035

    // Draw glowing pulsating bounding box walls as wavy lines
    ctx.shadowBlur = 12 + audioData.bass * 15
    ctx.shadowColor = current.boxColor
    ctx.strokeStyle = current.boxColor
    ctx.lineWidth = 4

    ctx.beginPath()

    // 1. Top wall: Left to Right
    ctx.moveTo(sandboxBox.left, sandboxBox.top + A_top * Math.sin(wavePhase))
    for (let x = sandboxBox.left; x <= sandboxBox.right; x += 5) {
        const xLocal = x - sandboxBox.left
        const y = sandboxBox.top + A_top * Math.sin(xLocal * k_top + wavePhase)
        ctx.lineTo(x, y)
    }

    // 2. Right wall: Top to Bottom
    for (let y = sandboxBox.top; y <= sandboxBox.bottom; y += 5) {
        const yLocal = y - sandboxBox.top
        const x = sandboxBox.right - A_right * Math.sin(yLocal * k_right - wavePhase)
        ctx.lineTo(x, y)
    }

    // 3. Bottom wall: Right to Left
    for (let x = sandboxBox.right; x >= sandboxBox.left; x -= 5) {
        const xLocal = x - sandboxBox.left
        const y = sandboxBox.bottom - A_bottom * Math.sin(xLocal * k_bottom - wavePhase)
        ctx.lineTo(x, y)
    }

    // 4. Left wall: Bottom to Top
    for (let y = sandboxBox.bottom; y >= sandboxBox.top; y -= 5) {
        const yLocal = y - sandboxBox.top
        const x = sandboxBox.left + A_left * Math.sin(yLocal * k_left + wavePhase)
        ctx.lineTo(x, y)
    }

    ctx.closePath()
    ctx.stroke()

    // Secondary outer glowing offset frame (also wavy but offsetted outwards)
    ctx.shadowColor = current.secondaryBoxColor
    ctx.strokeStyle = current.secondaryBoxColor
    ctx.lineWidth = 1.5
    const offset = 8 + audioData.mid * 4

    ctx.beginPath()
    // Top wall offset
    ctx.moveTo(sandboxBox.left - offset, sandboxBox.top - offset + A_top * Math.sin(wavePhase))
    for (let x = sandboxBox.left - offset; x <= sandboxBox.right + offset; x += 5) {
        const xClamped = Math.max(sandboxBox.left, Math.min(sandboxBox.right, x))
        const xLocal = xClamped - sandboxBox.left
        const y = sandboxBox.top - offset + A_top * Math.sin(xLocal * k_top + wavePhase)
        ctx.lineTo(x, y)
    }

    // Right wall offset
    for (let y = sandboxBox.top - offset; y <= sandboxBox.bottom + offset; y += 5) {
        const yClamped = Math.max(sandboxBox.top, Math.min(sandboxBox.bottom, y))
        const yLocal = yClamped - sandboxBox.top
        const x = sandboxBox.right + offset - A_right * Math.sin(yLocal * k_right - wavePhase)
        ctx.lineTo(x, y)
    }

    // Bottom wall offset
    for (let x = sandboxBox.right + offset; x >= sandboxBox.left - offset; x -= 5) {
        const xClamped = Math.max(sandboxBox.left, Math.min(sandboxBox.right, x))
        const xLocal = xClamped - sandboxBox.left
        const y = sandboxBox.bottom + offset - A_bottom * Math.sin(xLocal * k_bottom - wavePhase)
        ctx.lineTo(x, y)
    }

    // Left wall offset
    for (let y = sandboxBox.bottom + offset; y >= sandboxBox.top - offset; y -= 5) {
        const yClamped = Math.max(sandboxBox.top, Math.min(sandboxBox.bottom, y))
        const yLocal = yClamped - sandboxBox.top
        const x = sandboxBox.left - offset + A_left * Math.sin(yLocal * k_left + wavePhase)
        ctx.lineTo(x, y)
    }

    ctx.closePath()
    ctx.stroke()

    ctx.restore()
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

    const canvas = canvasRef.value
    const viewport = viewportRef.value

    const handleResize = () => {
        if (canvas && viewport) {
            canvas.width = viewport.clientWidth
            canvas.height = viewport.clientHeight

            sandboxBox.width = canvas.width
            sandboxBox.height = canvas.height
            sandboxBox.padding = Math.min(80, canvas.width * 0.1)

            // Initial wall coords
            sandboxBox.left = sandboxBox.padding
            sandboxBox.right = canvas.width - sandboxBox.padding
            sandboxBox.top = sandboxBox.padding
            sandboxBox.bottom = canvas.height - sandboxBox.padding

            updateTopUiHeight()
        }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    nextTick(() => {
        updateTopUiHeight()
    })

    // Seed with initial balls
    for (let i = 0; i < 3; i++) {
        const rx = sandboxBox.left + 50 + Math.random() * (sandboxBox.right - sandboxBox.left - 100)
        const ry = sandboxBox.top + 50 + Math.random() * (sandboxBox.bottom - sandboxBox.top - 100)
        const vx = (Math.random() - 0.5) * 8
        const vy = (Math.random() - 0.5) * 8
        addBall(rx, ry, vx, vy)
    }

    // Animation render tick
    const render = (timestamp) => {
        if (!isExpanded.value) return
        if (!canvasRef.value) {
            animationFrameId = requestAnimationFrame(render)
            return
        }
        const ctx = canvasRef.value.getContext('2d')
        if (!ctx) return

        if (!lastTimestamp) lastTimestamp = timestamp
        const dt = Math.min(50, timestamp - lastTimestamp)
        lastTimestamp = timestamp

        const isDark = theme.value === 'dark'
        const preset = presets[activePreset.value]

        // Clear background
        ctx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height)
        ctx.fillStyle = preset.bg
        ctx.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)

        // Update Physics
        updatePhysics(dt)

        // Render Box Boundaries
        drawBoxLines(ctx, isDark)

        // Render Trails
        ctx.save()
        balls.value.forEach(ball => {
            ball.trail.forEach((pt, index) => {
                const ratio = (index + 1) / ball.trail.length
                ctx.globalAlpha = pt.a * ratio
                ctx.fillStyle = `hsla(${ball.hue}, 95%, 60%, ${pt.a * ratio})`
                ctx.beginPath()
                ctx.arc(pt.x, pt.y, ball.r * 0.72 * ratio, 0, Math.PI * 2)
                ctx.fill()
            })
        })
        ctx.restore()

        // Render active particle sparks
        ctx.save()
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i]
            p.x += p.vx
            p.y += p.vy
            p.vy += 0.08 // slight gravity on sparks
            p.alpha -= p.decay

            if (p.alpha <= 0) {
                particles.splice(i, 1)
                continue
            }

            ctx.globalAlpha = p.alpha
            ctx.shadowBlur = 6
            ctx.shadowColor = `hsl(${p.hue}, 95%, 60%)`
            ctx.fillStyle = `hsl(${p.hue}, 95%, 60%)`
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
            ctx.fill()
        }
        ctx.restore()

        // Render Balls
        ctx.save()
        balls.value.forEach(ball => {
            ctx.shadowBlur = 8 + audioData.mid * 10
            ctx.shadowColor = `hsl(${ball.hue}, 95%, 55%)`
            
            // Outer ring
            ctx.strokeStyle = `hsl(${ball.hue}, 95%, 55%)`
            ctx.lineWidth = 2.5
            ctx.beginPath()
            ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2)
            ctx.stroke()

            // Filled glass core
            ctx.fillStyle = `hsla(${ball.hue}, 95%, 45%, 0.28)`
            ctx.beginPath()
            ctx.arc(ball.x, ball.y, ball.r - 1.5, 0, Math.PI * 2)
            ctx.fill()

            // Tiny inner shine highlight
            ctx.fillStyle = '#ffffff'
            ctx.beginPath()
            ctx.arc(ball.x - ball.r * 0.35, ball.y - ball.r * 0.35, ball.r * 0.18, 0, Math.PI * 2)
            ctx.fill()
        })
        ctx.restore()

        animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)

    // Setup SDK listeners
    const onInit = (state) => {
        if (state?.player) isExpanded.value = state.player.expanded !== false
        if (state?.theme) theme.value = state.theme
        repeat.value = state.panes?.default?.repeat || 'none'
        nextDisabled.value = !!state.panes?.default?.nextDisabled
        prevDisabled.value = !!state.panes?.default?.prevDisabled
        hasQueue.value = !!state.panes?.default?.hasQueue
        
        if (state?.panes?.default?.track) {
            updateTrack(state.panes.default.track)
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
            nextTick(() => {
                updateTopUiHeight()
            })
        }
    }

    const onOpen = (payload) => {
        if (payload?.track) {
            updateTrack(payload.track)
        }
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
            audioData.bass *= 0.8
            audioData.mid *= 0.8
            audioData.high *= 0.8
            return
        }

        const len = dataArray.length
        let bSum = 0, mSum = 0, hSum = 0
        const bEnd = Math.floor(len * 0.12) || 1
        const mEnd = Math.floor(len * 0.58) || 2

        for (let i = 0; i < len; i++) {
            const val = dataArray[i] || 0
            if (i < bEnd) bSum += val
            else if (i < mEnd) mSum += val
            else hSum += val
        }

        const tb = (bSum / bEnd) / 255
        const tm = (mSum / (mEnd - bEnd)) / 255
        const th = (hSum / (len - mEnd)) / 255
        
        audioData.bass += (tb - audioData.bass) * 0.2
        audioData.mid += (tm - audioData.mid) * 0.2
        audioData.high += (th - audioData.high) * 0.2

        // Dynamic high-beat impulse! Kick existing balls randomly on intense transients!
        if (tb > 0.82 && Math.random() < 0.15) {
            balls.value.forEach(ball => {
                if (Math.random() < 0.22) {
                    ball.vx += (Math.random() - 0.5) * 6
                    ball.vy += (Math.random() - 0.5) * 6
                    createExplosion(ball.x, ball.y, ball.hue, 2)
                }
            })
        }
    }

    const updateTrack = (track) => {
        if (!track) return

        if (track.cover?.crop !== trackInfo.value?.cover?.crop) {
            isCoverLoaded.value = false
        }

        trackInfo.value = {
            title: track.title || 'Interactive Waves',
            artists: track.artists || (track.contributors?.primary?.map((a) => a.name).join(', ') || 'Artist'),
            cover: track.cover || null,
            duration: track.duration || 0,
            wave: track.wave && track.wave.length ? track.wave : []
        }
        // Boost box energy on track changes
        bounceCount.value = 0
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
    playerSdk.on('state', onState)
    playerSdk.on('theme', onTheme)
    playerSdk.on('reaction', onReaction)
    playerSdk.on('repeat', onRepeat)
    playerSdk.on('change', onChange)
    playerSdk.on('audioFrame', onAudioFrame)
    playerSdk.on('player', onPlayer)

    onBeforeUnmount(() => {
        cancelAnimationFrame(animationFrameId)
        window.removeEventListener('resize', handleResize)

        playerSdk.off('init', onInit)
        playerSdk.off('open', onOpen)
        playerSdk.off('state', onState)
        playerSdk.off('theme', onTheme)
        playerSdk.off('reaction', onReaction)
        playerSdk.off('repeat', onRepeat)
        playerSdk.off('change', onChange)
        playerSdk.off('audioFrame', onAudioFrame)
        playerSdk.off('player', onPlayer)
    })
})

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
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
</script>

<style scoped>
.bounce-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1;
    overflow: hidden;
    font-family: 'Courier New', monospace;
    color: #ffffff;
    display: flex;
    flex-direction: column;
}

.ab-canvas {
    display: block;
    width: 100%;
    height: 100%;
    touch-action: none;
}

/* NEON COLORS & SHADOWS */
.neon-pink-text {
    color: #ff2a6d;
    text-shadow: 0 0 6px rgba(255, 42, 109, 0.6), 0 0 16px rgba(255, 42, 109, 0.3);
}

.neon-blue-text {
    color: #05d9e8;
    text-shadow: 0 0 6px rgba(5, 217, 232, 0.6), 0 0 16px rgba(5, 217, 232, 0.3);
}

.neon-green-text {
    color: #39ff6a;
    text-shadow: 0 0 6px rgba(57, 255, 106, 0.6), 0 0 16px rgba(57, 255, 106, 0.3);
}

/* VIEWPORT ENGINE */
.ab-viewport-wrapper {
    position: relative;
    flex-grow: 1;
    width: 100%;
    overflow: hidden;
    cursor: crosshair;
}

/* HUD STATS overlay */
.ab-hud {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 6px;
    pointer-events: none;
    background: rgba(8, 1, 24, 0.5);
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid rgba(5, 217, 232, 0.15);
    backdrop-filter: blur(4px);
}

.ab-hud-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 1px;
}

.hud-label {
    opacity: 0.65;
}

.hud-val {
    font-size: 14px;
    font-weight: 800;
}

/* TAP TO START FLING */
.ab-tap-prompt {
    position: absolute;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    pointer-events: none;
    z-index: 10;
}

.pulse-text {
    font-size: 14px;
    font-weight: 800;
    letter-spacing: 1.5px;
    animation: txt-pulse 1s ease-in-out infinite alternate;
}

@keyframes txt-pulse {
    from { opacity: 0.45; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1.05); }
}

/* TOP META PANEL */
.ab-top-panel {
    width: 100%;
    min-height: 80px;
    box-sizing: border-box;
    display: flex;
    align-items: end;
    z-index: 10;
    padding: 0 20px 12px;
    border-bottom: 2px solid rgba(5, 217, 232, 0.25);
    background: rgba(10, 1, 26, 0.95);
    flex-shrink: 0;
    padding-top: calc(var(--max-safe-area-inset-top, var(--tg-safe-area-inset-top, 0px)) + var(--max-content-safe-area-inset-top, var(--tg-content-safe-area-inset-top, 0px)));
}

.ab-track-card {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-grow: 1;
    min-width: 0;
}

.ab-cover-wrapper {
    width: 52px;
    height: 52px;
    border-radius: 6px;
    overflow: hidden;
    background: #14052e;
    border: 1px solid rgba(255, 42, 109, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.ab-cover-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 0.25s;
}

.ab-cover-img.is-loaded {
    opacity: 1;
}

.ab-cover-placeholder {
    color: rgba(255, 42, 109, 0.5);
}

.ab-track-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.ab-track-title {
    font-size: 15px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 60vw;
    color: #ffffff;
}

.ab-track-artist {
    font-size: 11px;
    opacity: 0.6;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 60vw;
    color: #05d9e8;
}

/* SYNTHWAVE CONSOLE DECK */
.ab-console-deck {
    width: 100%;
    background: linear-gradient(180deg, #0e0622 0%, #04010a 100%);
    border-top: 3px solid #ff2a6d;
    box-shadow: 0 -8px 24px rgba(255, 42, 109, 0.22);
    padding: 12px 16px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex-shrink: 0;
    z-index: 15;
}

/* PHYSICS STRIP */
.physics-control-strip {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding-bottom: 12px;
    border-bottom: 1px dashed rgba(5, 217, 232, 0.15);
}

.strip-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.strip-label {
    font-size: 10px;
    font-weight: 800;
    opacity: 0.6;
    letter-spacing: 1.5px;
}

.strip-buttons {
    display: flex;
    gap: 4px;
}

.strip-btn {
    padding: 5px 12px;
    border-radius: 6px;
    background: rgba(5, 217, 232, 0.05);
    border: 1px solid rgba(5, 217, 232, 0.22);
    color: rgba(255, 255, 255, 0.8);
    font-family: inherit;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s;
}

.strip-btn:hover {
    background: rgba(5, 217, 232, 0.12);
    border-color: #05d9e8;
}

.strip-btn.is-active {
    background: rgba(5, 217, 232, 0.18);
    border-color: #05d9e8;
    color: #05d9e8;
    box-shadow: 0 0 6px rgba(5, 217, 232, 0.4);
}

.strip-item-actions {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    margin-top: 14px;
}

.action-trigger-btn {
    padding: 8px 16px;
    border-radius: 8px;
    font-family: inherit;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
    transition: all 0.15s;
}

.action-trigger-btn.btn-spawn {
    background: rgba(57, 255, 106, 0.1);
    border: 1px solid #39ff6a;
    color: #39ff6a;
}

.action-trigger-btn.btn-spawn:active {
    transform: scale(0.94);
    background: rgba(57, 255, 106, 0.2);
}

.action-trigger-btn.btn-clear {
    background: rgba(255, 51, 71, 0.1);
    border: 1px solid #ff3347;
    color: #ff3347;
}

.action-trigger-btn.btn-clear:active {
    transform: scale(0.94);
    background: rgba(255, 51, 71, 0.2);
}

/* MEDIA DECK */
.console-media-deck {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.media-deck-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 42, 109, 0.04);
    border: 1px solid rgba(255, 42, 109, 0.3);
    border-radius: 8px;
    color: #ff2a6d;
    cursor: pointer;
    padding: 0;
    transition: all 0.15s ease-out;
}

.media-deck-btn:hover:not(:disabled) {
    background: rgba(255, 42, 109, 0.15);
    border-color: #ff2a6d;
    box-shadow: 0 0 8px rgba(255, 42, 109, 0.4);
    transform: translateY(-1px);
}

.media-deck-btn:active:not(:disabled) {
    transform: scale(0.93);
}

.media-deck-btn:disabled {
    opacity: 0.15;
    cursor: not-allowed;
}

.media-deck-btn.btn-like {
    color: #ff2a6d;
    border-color: rgba(255, 42, 109, 0.3);
}

.media-deck-btn.btn-like.is-liked {
    background: rgba(255, 42, 109, 0.25);
    border-color: #ff2a6d;
    color: #ff2a6d;
    box-shadow: 0 0 10px rgba(255, 42, 109, 0.6);
}

.media-deck-btn.btn-play-main {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border-color: #05d9e8;
    color: #05d9e8;
    background: rgba(5, 217, 232, 0.08);
    box-shadow: 0 0 6px rgba(5, 217, 232, 0.3);
}

.media-deck-btn.btn-play-main:hover:not(:disabled) {
    background: rgba(5, 217, 232, 0.2);
    border-color: #05d9e8;
    box-shadow: 0 0 12px rgba(5, 217, 232, 0.7);
}

.media-deck-btn.is-active {
    background: rgba(255, 42, 109, 0.2);
    border-color: #ff2a6d;
    box-shadow: 0 0 8px rgba(255, 42, 109, 0.5);
}

@media (max-width: 480px) {
    .physics-control-strip {
        justify-content: center;
    }
}
</style>
