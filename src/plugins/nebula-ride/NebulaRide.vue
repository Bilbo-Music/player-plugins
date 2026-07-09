<template>
    <div class="nebula-container" :class="[theme]" id="neb-app-container">
        <!-- TOP TRACK INFO BAR -->
        <div class="neb-top-panel" id="neb-top-panel">
            <div class="neb-track-card" id="neb-track-card">
                <div class="neb-cover-wrapper" id="neb-cover-wrapper">
                    <img
                        v-if="trackInfo.cover?.crop"
                        :src="trackInfo.cover.crop"
                        class="neb-cover-img"
                        :class="{ 'is-loaded': isCoverLoaded }"
                        @load="isCoverLoaded = true"
                        id="neb-cover-img"
                    />
                    <div v-else class="neb-cover-placeholder" id="neb-cover-placeholder">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M8 12h8M12 8v8" />
                        </svg>
                    </div>
                </div>
                <div class="neb-track-meta" id="neb-track-meta">
                    <div class="neb-track-title" id="neb-track-title">{{ trackInfo.title }}</div>
                    <div class="neb-track-artist" id="neb-track-artist">{{ trackInfo.artists }}</div>
                </div>
            </div>
        </div>

        <!-- GAME VIEWPORT -->
        <div class="neb-viewport-wrapper" id="neb-viewport-wrapper">
            <canvas 
                ref="canvasRef" 
                class="nebula-canvas" 
                id="neb-game-canvas"
                @pointerdown="handlePointerDown"
                @pointermove="handlePointerMove"
                @pointerup="handlePointerUp"
                @pointercancel="handlePointerUp"
            ></canvas>

            <!-- FLOATING HUD -->
            <div class="neb-hud" id="neb-hud">
                <div class="neb-hud-item" id="neb-score">
                    <span class="hud-label">SCORE:</span>
                    <span class="hud-val neon-green-text">{{ formatScore(score) }}</span>
                </div>
                <div class="neb-hud-item" id="neb-multiplier">
                    <span class="hud-label">MULT:</span>
                    <span class="hud-val neon-pink-text">x{{ multiplier }}</span>
                </div>
                <div class="neb-hud-item" id="neb-combo" v-if="combo > 0">
                    <span class="hud-val neon-blue-text">{{ combo }} STREAK!</span>
                </div>
                <div class="neb-hud-item" id="neb-time">
                    <span class="hud-label">TIME:</span>
                    <span class="hud-val neon-blue-text">{{ formatTime(currentTime) }} / {{ formatTime(trackInfo.duration) }}</span>
                </div>
                <div class="neb-hud-item" id="neb-stunt" v-if="feedbackText">
                    <span class="hud-stunt" :class="feedbackClass">{{ feedbackText }}</span>
                </div>
            </div>

            <!-- INSTRUCTIONS TUTORIAL OVERLAY -->
            <div class="tutorial-overlay" v-if="showTutorial" id="neb-tutorial">
                <div class="tutorial-card">
                    <div class="tutorial-icon-pulse">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#05d9e8" stroke-width="1.5">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <path d="M12 6v10M8 11h8" />
                        </svg>
                    </div>
                    <div class="tutorial-title">SONIC WAVERIDER</div>
                    <div class="tutorial-text">Drag or glide your finger/mouse vertically anywhere on the space corridor to surf rhythm waves, catch cosmic notes, and dodge red electromagnetic solar flares!</div>
                    <button class="tutorial-btn" @click="showTutorial = false">ENTER COSMOS</button>
                </div>
            </div>
        </div>

        <!-- COCKPIT CONTROL DECK -->
        <div class="neb-console-deck" id="neb-console-deck">
            <div class="console-media-deck" id="neb-console-media">
                <button class="media-deck-btn btn-like" @click="handleLikeToggle" :class="{ 'is-liked': reaction === 'LIKE' }" :title="reaction === 'LIKE' ? 'Unlike' : 'Like'" id="neb-btn-like">
                    <svg width="18" height="18" viewBox="0 0 24 24" :fill="reaction === 'LIKE' ? '#ff2a6d' : 'none'" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </button>
                
                <button class="media-deck-btn" :disabled="prevDisabled" @click="playerSdk.prev()" title="Previous" id="neb-btn-prev">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                </button>
                
                <button class="media-deck-btn btn-play-main" @click="togglePlay" title="Play/Pause" id="neb-btn-play">
                    <svg v-if="playerState !== 'playing'" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                </button>
                
                <button class="media-deck-btn" :disabled="nextDisabled" @click="playerSdk.next()" title="Next" id="neb-btn-next">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6zm9-12h2v12h-2z"/></svg>
                </button>
                
                <button class="media-deck-btn" @click="handleRepeat" :class="{ 'is-active': repeat !== 'none' }" title="Repeat" id="neb-btn-repeat">
                    <svg v-if="repeat === 'track'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                        <text x="9" y="16" font-size="9" font-weight="bold" fill="currentColor" stroke="none">1</text>
                    </svg>
                    <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                    </svg>
                </button>
                
                <button class="media-deck-btn" :disabled="!hasQueue" @click="openPlaylist" title="Queue" id="neb-btn-queue">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                    </svg>
                </button>
                
                <button class="media-deck-btn btn-collapse" @click="collapse" title="Collapse" id="neb-btn-collapse">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"/>
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { playerSdk } from '@bilbomusic/player-plugin-sdk'

const canvasRef = ref(null)
const theme = ref('dark')
const playerState = ref('paused')
const reaction = ref('')
const repeat = ref('none')
const isCoverLoaded = ref(false)

const nextDisabled = ref(false)
const prevDisabled = ref(true)
const hasQueue = ref(false)

// Timeline & Progress tracking
const currentTime = ref(0)
let smoothTime = 0
const SYNC_THRESHOLD = 1000

const formatTime = (ms) => {
    if (!ms || isNaN(ms)) return '0:00'
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const handleWaveSeek = (clientX, width) => {
    if (!trackInfo.value.duration || width <= 0) return
    const percentage = Math.max(0, Math.min(1, clientX / width))
    const targetTime = percentage * trackInfo.value.duration
    if (typeof playerSdk.seek === 'function') {
        playerSdk.seek(targetTime)
        currentTime.value = targetTime
        smoothTime = targetTime
    }
}

// Gameplay reactive states
const score = ref(0)
const multiplier = ref(1)
const combo = ref(0)
const feedbackText = ref('')
const feedbackClass = ref('neon-green-text')
const showTutorial = ref(false)

const trackInfo = ref({
    title: 'Waiting for track...',
    artists: 'Loading...',
    cover: null,
    duration: 0,
    wave: []
})

// Audio analytical state
const audioData = {
    bass: 0,
    mid: 0,
    high: 0
}

// Game entity declarations
const ship = {
    x: 140,
    y: 200,
    targetY: 200,
    angle: 0,
    width: 32,
    height: 18,
    invincibilityTimer: 0,
    hoverOffset: 0
}

let starfield = []
let orbs = []
let obstacles = []
let particles = []
let floatingTexts = []
let isDragging = false
let dragPoint = { x: 0, y: 0 }

let lastTimestamp = 0
let animationFrameId = null
let waveData = []
let nextSpawnTimer = 0
let systemTimer = 0

// Starfield initialization
const createStarfield = (w, h) => {
    const list = []
    const count = 75
    for (let i = 0; i < count; i++) {
        list.push({
            x: Math.random() * w,
            y: Math.random() * h,
            size: Math.random() * 2 + 0.5,
            depth: Math.random() * 0.7 + 0.3, // speed scaling factor
            hue: Math.random() > 0.6 ? (Math.random() > 0.5 ? 320 : 190) : 0 // pink, cyan, or white
        })
    }
    return list
}

// Generate fallback wave
const generateWave = () => {
    const arr = []
    for (let i = 0; i < 120; i++) {
        arr.push(110 + Math.sin(i * 0.15) * 45 + Math.cos(i * 0.3) * 20)
    }
    return arr
}

// Pointer event handlers
const handlePointerDown = (e) => {
    if (showTutorial.value) return
    const canvas = canvasRef.value
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    
    const clientY = e.clientY - rect.top
    const clientX = e.clientX - rect.left
    
    if (clientY > canvas.height - 65) {
        isDragging = false
        handleWaveSeek(clientX, canvas.width)
        return
    }
    
    isDragging = true
    ship.targetY = Math.max(40, Math.min(canvas.height - 40, clientY))
    dragPoint.x = clientX
    dragPoint.y = clientY

    // Spawn lovely energy touch ripples
    createRipples(clientX, clientY, '#05d9e8', 6)
}

const handlePointerMove = (e) => {
    if (!isDragging || showTutorial.value) return
    const canvas = canvasRef.value
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    
    const clientY = e.clientY - rect.top
    const clientX = e.clientX - rect.left
    
    ship.targetY = Math.max(40, Math.min(canvas.height - 40, clientY))
    dragPoint.x = clientX
    dragPoint.y = clientY

    // Emit light dust on movement trail
    if (Math.random() < 0.25) {
        particles.push({
            x: clientX,
            y: clientY,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            size: Math.random() * 2 + 1,
            alpha: 0.6,
            decay: 0.03,
            color: '#05d9e8'
        })
    }
}

const handlePointerUp = () => {
    isDragging = false
}

// Helper ripples emitter
const createRipples = (x, y, color, count) => {
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2
        particles.push({
            x,
            y,
            vx: Math.cos(angle) * 3,
            vy: Math.sin(angle) * 3,
            size: Math.random() * 3 + 1.5,
            alpha: 0.9,
            decay: 0.04,
            color
        })
    }
}

// Physics & Gameplay tick
const updateGamePhysics = (dt, w, h) => {
    const timeScale = dt / 16.66
    systemTimer += 0.015 * timeScale

    const isPlaying = playerState.value === 'playing'

    // Update invincibility
    if (ship.invincibilityTimer > 0) {
        ship.invincibilityTimer -= dt
    }

    // Ship motion
    if (isPlaying) {
        if (isDragging) {
            // Smoothly lerp towards pointer position
            const diffY = ship.targetY - ship.y
            ship.y += diffY * 0.16 * timeScale
            ship.angle = Math.max(-0.4, Math.min(0.4, diffY * 0.007))
        } else {
            // Passive autopilot hovering
            const baseCenterY = h / 2
            const floatOffset = Math.sin(systemTimer * 2) * 16
            ship.y += (baseCenterY + floatOffset - ship.y) * 0.08 * timeScale
            ship.angle *= Math.pow(0.85, timeScale)
        }
    } else {
        // Slow frozen hover when paused
        const idleCenterY = h / 2
        ship.y += (idleCenterY + Math.sin(systemTimer * 0.8) * 6 - ship.y) * 0.04 * timeScale
        ship.angle *= Math.pow(0.9, timeScale)
    }

    // Warp dust trailing behind the ship
    if (isPlaying && Math.random() < 0.6) {
        particles.push({
            x: ship.x - 14,
            y: ship.y + (Math.random() - 0.5) * 6,
            vx: -3 - Math.random() * 4 - (audioData.bass * 3),
            vy: (Math.random() - 0.5) * 1.5,
            size: Math.random() * 2.5 + 1,
            alpha: 0.8,
            decay: 0.02 + Math.random() * 0.02,
            color: Math.random() > 0.5 ? '#ff2a6d' : '#05d9e8'
        })
    }

    // Dynamic warp scroll speed governed by audio
    const baseWarpSpeed = 3.5
    const dynamicScroll = isPlaying ? (baseWarpSpeed + audioData.bass * 3.8) * timeScale : 0.4 * timeScale

    // Update Starfield parallax
    starfield.forEach(star => {
        star.x -= dynamicScroll * star.depth
        if (star.x < -10) {
            star.x = w + 10
            star.y = Math.random() * h
        }
    });

    if (!isPlaying) return

    // Spawn mechanics synchronized to audio spikes
    nextSpawnTimer -= dt
    if (nextSpawnTimer <= 0) {
        nextSpawnTimer = Math.max(600, 1500 - audioData.bass * 700) // faster spawn on beats
        
        const rSpawn = Math.random()
        const targetSpawnY = Math.max(50, Math.min(h - 80, Math.random() * h))

        if (rSpawn < 0.68) {
            // Spawn standard glowing orbs (Pink / Cyan / Yellow)
            const typeProb = Math.random()
            let orbType = 'mid'
            let orbColor = '#05d9e8'
            let value = 100

            if (typeProb < 0.3) {
                orbType = 'bass'
                orbColor = '#ff2a6d'
                value = 150
            } else if (typeProb > 0.8) {
                orbType = 'treble'
                orbColor = '#ffe600'
                value = 200
            }

            orbs.push({
                x: w + 40,
                y: targetSpawnY,
                r: 8 + (orbType === 'bass' ? audioData.bass * 8 : 0),
                type: orbType,
                color: orbColor,
                scoreValue: value,
                pulse: 0
            })
        } else if (rSpawn < 0.85) {
            // Spawn Solar Storm Obstacles (Dangerous electromagnetism)
            obstacles.push({
                x: w + 50,
                y: targetSpawnY,
                w: 22 + Math.random() * 12,
                h: 22 + Math.random() * 12,
                color: '#ff3347',
                speedMultiplier: 1.1 + Math.random() * 0.4
            })
        } else {
            // Spawn a rare Super Nebula Ring
            orbs.push({
                x: w + 40,
                y: targetSpawnY,
                r: 16,
                type: 'ring',
                color: '#39ff6a',
                scoreValue: 400,
                pulse: 0
            })
        }
    }

    // Update Orbs collection
    for (let i = orbs.length - 1; i >= 0; i--) {
        const orb = orbs[i]
        orb.x -= dynamicScroll * 1.1
        orb.pulse += 0.1 * timeScale

        // Check collection collision
        const dist = Math.hypot(orb.x - ship.x, orb.y - ship.y)
        if (dist < orb.r + 15) {
            // Hit! Gathered notes
            const collectedPoints = orb.scoreValue * multiplier.value
            score.value += collectedPoints
            combo.value += 1

            // Dynamic scaling multiplier on streak
            if (combo.value % 6 === 0) {
                multiplier.value = Math.min(10, multiplier.value + 1)
                triggerFeedback(`MULTIPLIER UP! x${multiplier.value}`, 'neon-pink-text')
            } else {
                triggerFeedback(`+${collectedPoints}`, orb.type === 'bass' ? 'neon-pink-text' : (orb.type === 'treble' ? 'neon-yellow-text' : 'neon-blue-text'))
            }

            // Spawn lovely particle burst
            createRipples(orb.x, orb.y, orb.color, 12)

            // Spawn tiny floating number
            floatingTexts.push({
                x: orb.x - 20,
                y: orb.y,
                text: `+${collectedPoints}`,
                color: orb.color,
                alpha: 1,
                vy: -1.5
            })

            orbs.splice(i, 1)
            continue
        }

        // Clean offscreen
        if (orb.x < -60) {
            orbs.splice(i, 1)
        }
    }

    // Update Obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i]
        obs.x -= dynamicScroll * obs.speedMultiplier

        // Check collision (AABB vs point simplification)
        const shipRadius = 10
        const overlapX = ship.x + shipRadius > obs.x - obs.w/2 && ship.x - shipRadius < obs.x + obs.w/2
        const overlapY = ship.y + shipRadius > obs.y - obs.h/2 && ship.y - shipRadius < obs.y + obs.h/2

        if (overlapX && overlapY) {
            if (ship.invincibilityTimer <= 0) {
                // Collided with electromagnetic solar flare!
                ship.invincibilityTimer = 1100 // 1.1s invincibility
                combo.value = 0
                multiplier.value = 1
                score.value = Math.max(0, score.value - 100) // subtle penalty

                triggerFeedback('SHIELD DISRUPTED!', 'neon-red-text')
                
                // Red smoke particle debris
                for (let k = 0; k < 18; k++) {
                    particles.push({
                        x: ship.x,
                        y: ship.y,
                        vx: (Math.random() - 0.5) * 5,
                        vy: (Math.random() - 0.5) * 5,
                        size: Math.random() * 4 + 2,
                        alpha: 1,
                        decay: 0.03,
                        color: k % 2 === 0 ? '#ff3347' : '#555'
                    })
                }

                floatingTexts.push({
                    x: ship.x,
                    y: ship.y - 20,
                    text: '-100',
                    color: '#ff3347',
                    alpha: 1,
                    vy: -1
                })
            }
        }

        if (obs.x < -60) {
            obstacles.splice(i, 1)
        }
    }

    // Update Floating text objects
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const f = floatingTexts[i]
        f.y += f.vy * timeScale
        f.alpha -= 0.02 * timeScale
        if (f.alpha <= 0) {
            floatingTexts.splice(i, 1)
        }
    }
}

// Spark system updater
const updateParticles = (timeScale) => {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx * timeScale
        p.y += p.vy * timeScale
        p.alpha -= p.decay * timeScale
        if (p.alpha <= 0) {
            particles.splice(i, 1)
        }
    }
}

// Set popup status feed message
let feedbackTimeout = null
const triggerFeedback = (text, cls) => {
    feedbackText.value = text
    feedbackClass.value = cls
    if (feedbackTimeout) clearTimeout(feedbackTimeout)
    feedbackTimeout = setTimeout(() => {
        feedbackText.value = ''
    }, 1800)
}

// Draw the ship vector graphics
const drawHoverShip = (ctx, x, y, angle) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)

    // Flickering on damage shield frames
    if (ship.invincibilityTimer > 0 && Math.floor(Date.now() / 60) % 2 === 0) {
        ctx.restore()
        return
    }

    // Outer plasma shield bubble
    ctx.save()
    ctx.shadowBlur = 10 + audioData.bass * 15
    ctx.shadowColor = '#05d9e8'
    ctx.strokeStyle = 'rgba(5, 217, 232, 0.4)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(0, 0, 22, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()

    // Thruster Plume Flame
    ctx.save()
    const plumeLength = 12 + audioData.bass * 18
    const plumeGrad = ctx.createLinearGradient(-15, 0, -15 - plumeLength, 0)
    plumeGrad.addColorStop(0, '#ffffff')
    plumeGrad.addColorStop(0.3, '#ff2a6d')
    plumeGrad.addColorStop(1, 'rgba(255, 42, 109, 0)')
    ctx.fillStyle = plumeGrad
    ctx.beginPath()
    ctx.moveTo(-14, -5)
    ctx.lineTo(-14 - plumeLength, 0)
    ctx.lineTo(-14, 5)
    ctx.closePath()
    ctx.fill()
    ctx.restore()

    // Cyber hover ship body
    ctx.fillStyle = '#0f0c24'
    ctx.strokeStyle = '#05d9e8'
    ctx.lineWidth = 2
    ctx.shadowBlur = 6
    ctx.shadowColor = '#05d9e8'

    ctx.beginPath()
    ctx.moveTo(18, 0) // nose
    ctx.lineTo(2, -7)
    ctx.lineTo(-12, -10) // rear left wing
    ctx.lineTo(-8, 0)
    ctx.lineTo(-12, 10) // rear right wing
    ctx.lineTo(2, 7)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // Glowing energy strip
    ctx.strokeStyle = '#ff2a6d'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(4, -3)
    ctx.lineTo(-6, -3)
    ctx.moveTo(4, 3)
    ctx.lineTo(-6, 3)
    ctx.stroke()

    // Pilot cockpit glass
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 0.8
    ctx.beginPath()
    ctx.ellipse(3, 0, 6, 3, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    ctx.restore()
}

// Draw dynamically fluctuating sound wave ribbon at the bottom
const drawSoundwaveRibbon = (ctx, w, h) => {
    ctx.save()
    const groundY = h - 18
    const segmentCount = 64
    const step = w / segmentCount

    // Calculate current ratio
    const totalDuration = trackInfo.value.duration || 1
    const ratio = Math.max(0, Math.min(1, smoothTime / totalDuration))
    const playheadX = ratio * w

    // 1. Draw the unplayed part first (dimmed cosmic purple)
    ctx.beginPath()
    ctx.moveTo(-10, h)

    for (let i = 0; i <= segmentCount; i++) {
        const x = i * step
        const waveIdx = Math.floor((i / segmentCount) * (waveData.length || 1))
        const val = waveData[waveIdx] || 120
        const normalized = val / 255

        // Bending formula responsive to audio bass frequency
        const offset = normalized * 38 * (1 + audioData.bass * 1.5)
        const y = groundY - offset - Math.sin(systemTimer * 2.5 + i * 0.15) * 8

        if (i === 0) ctx.lineTo(x, y)
        else ctx.lineTo(x, y)
    }

    ctx.lineTo(w + 10, h)
    ctx.closePath()

    // Unplayed styling: dimmed purple/gray gradient
    const gradUnplayed = ctx.createLinearGradient(0, h - 90, 0, h)
    gradUnplayed.addColorStop(0, 'rgba(111, 80, 160, 0.05)')
    gradUnplayed.addColorStop(0.6, 'rgba(15, 7, 36, 0.95)')
    gradUnplayed.addColorStop(1, '#05020c')
    ctx.fillStyle = gradUnplayed
    ctx.fill()

    ctx.strokeStyle = 'rgba(111, 80, 160, 0.4)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // 2. Now clip and draw the played part in bright glowing cyan/pink!
    ctx.save()
    ctx.beginPath()
    ctx.rect(-20, 0, playheadX + 20, h + 20)
    ctx.clip()

    ctx.beginPath()
    ctx.moveTo(-10, h)

    for (let i = 0; i <= segmentCount; i++) {
        const x = i * step
        const waveIdx = Math.floor((i / segmentCount) * (waveData.length || 1))
        const val = waveData[waveIdx] || 120
        const normalized = val / 255

        // Bending formula responsive to audio bass frequency
        const offset = normalized * 38 * (1 + audioData.bass * 1.5)
        const y = groundY - offset - Math.sin(systemTimer * 2.5 + i * 0.15) * 8

        if (i === 0) ctx.lineTo(x, y)
        else ctx.lineTo(x, y)
    }

    ctx.lineTo(w + 10, h)
    ctx.closePath()

    // Played styling: bright neon cyan/pink
    const gradPlayed = ctx.createLinearGradient(0, h - 90, 0, h)
    gradPlayed.addColorStop(0, 'rgba(5, 217, 232, 0.15)')
    gradPlayed.addColorStop(0.6, 'rgba(15, 7, 36, 0.95)')
    gradPlayed.addColorStop(1, '#05020c')
    ctx.fillStyle = gradPlayed
    ctx.fill()

    // Glowing played borders
    ctx.shadowBlur = 8 + audioData.mid * 14
    ctx.shadowColor = '#05d9e8'
    ctx.strokeStyle = '#05d9e8'
    ctx.lineWidth = 3
    ctx.stroke()

    ctx.shadowColor = '#ff2a6d'
    ctx.strokeStyle = '#ff2a6d'
    ctx.lineWidth = 1
    ctx.stroke()
    ctx.restore()

    // 3. Draw playhead visual: vertical scanner line and a glowing playhead dot exactly on the wave
    if (totalDuration > 1 && smoothTime > 0) {
        // Find playhead Y coordinate
        const waveIdxAtPlayhead = Math.floor(ratio * (waveData.length || 1))
        const valAtPlayhead = waveData[waveIdxAtPlayhead] || 120
        const normalizedAtPlayhead = valAtPlayhead / 255
        const offsetAtPlayhead = normalizedAtPlayhead * 38 * (1 + audioData.bass * 1.5)
        const playheadY = groundY - offsetAtPlayhead - Math.sin(systemTimer * 2.5 + (ratio * segmentCount) * 0.15) * 8

        // Vertical laser beam
        ctx.save()
        const beamGrad = ctx.createLinearGradient(playheadX, playheadY - 20, playheadX, h)
        beamGrad.addColorStop(0, 'rgba(5, 217, 232, 0.8)')
        beamGrad.addColorStop(1, 'rgba(255, 42, 109, 0)')
        ctx.strokeStyle = beamGrad
        ctx.lineWidth = 1.5
        ctx.shadowBlur = 8
        ctx.shadowColor = '#05d9e8'
        ctx.beginPath()
        ctx.moveTo(playheadX, playheadY - 30)
        ctx.lineTo(playheadX, h)
        ctx.stroke()
        ctx.restore()

        // Glowing playhead node
        ctx.save()
        ctx.shadowBlur = 12 + audioData.bass * 10
        ctx.shadowColor = '#05d9e8'
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(playheadX, playheadY, 4 + audioData.bass * 3, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.strokeStyle = '#ff2a6d'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.arc(playheadX, playheadY, 8 + audioData.bass * 4, 0, Math.PI * 2)
        ctx.stroke()
        ctx.restore()

        // Drawing small text playhead label (elapsed time) above the playhead
        ctx.save()
        ctx.fillStyle = '#05d9e8'
        ctx.font = 'bold 10px "Courier New", monospace'
        ctx.textAlign = 'center'
        ctx.shadowBlur = 4
        ctx.shadowColor = '#05d9e8'
        ctx.fillText(formatTime(smoothTime), playheadX, playheadY - 14)
        ctx.restore()
    }

    ctx.restore()
}

// Media interface mappings
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

const formatScore = (num) => {
    return num.toString().padStart(6, '0')
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
    const handleResize = () => {
        if (canvas && canvas.parentElement) {
            canvas.width = canvas.parentElement.clientWidth
            canvas.height = canvas.parentElement.clientHeight
            
            // Build starfields matched to viewport size
            if (starfield.length === 0) {
                starfield = createStarfield(canvas.width, canvas.height)
                ship.y = canvas.height / 2
                ship.targetY = canvas.height / 2
            }
        }
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    // Start principal animation loop
    const renderLoop = (timestamp) => {
        if (!canvasRef.value) {
            animationFrameId = requestAnimationFrame(renderLoop)
            return
        }

        const ctx = canvasRef.value.getContext('2d')
        if (!ctx) return

        if (!lastTimestamp) lastTimestamp = timestamp
        const deltaTime = Math.min(48, timestamp - lastTimestamp)
        lastTimestamp = timestamp

        const w = canvasRef.value.width
        const h = canvasRef.value.height
        const timeScale = deltaTime / 16.66

        // Update smooth playback time
        if (playerState.value === 'playing') {
            smoothTime += deltaTime
            const diff = Math.abs(currentTime.value - smoothTime)
            if (diff > SYNC_THRESHOLD) {
                smoothTime = currentTime.value
            }
        } else {
            smoothTime = currentTime.value || 0
        }

        // Compute space background color responsive to mids/bass
        ctx.fillStyle = '#05020c'
        ctx.fillRect(0, 0, w, h)

        // Draw soft nebulae auroras underlay
        const nebulaRad = Math.min(w, h) * 0.45
        const midGlow = ctx.createRadialGradient(w/2, h/2, 20, w/2, h/2, nebulaRad)
        midGlow.addColorStop(0, `rgba(13, 5, 40, ${0.15 + audioData.mid * 0.2})`)
        midGlow.addColorStop(0.5, `rgba(5, 217, 232, ${0.03 + audioData.bass * 0.04})`)
        midGlow.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = midGlow
        ctx.fillRect(0,0,w,h)

        // Draw Starfield stars
        starfield.forEach(star => {
            ctx.fillStyle = star.hue === 320 ? '#ff2a6d' : (star.hue === 190 ? '#05d9e8' : '#ffffff')
            ctx.globalAlpha = star.depth
            ctx.beginPath()
            ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
            ctx.fill()
        })
        ctx.globalAlpha = 1

        // Tick physics
        updateGamePhysics(deltaTime, w, h)
        updateParticles(timeScale)

        // Draw active pointer feedback ripple locator
        if (isDragging) {
            ctx.save()
            ctx.strokeStyle = 'rgba(5, 217, 232, 0.28)'
            ctx.lineWidth = 1.5
            ctx.beginPath()
            ctx.arc(dragPoint.x, dragPoint.y, 16 + Math.sin(systemTimer * 3.5) * 4, 0, Math.PI * 2)
            ctx.stroke()
            ctx.restore()
        }

        // Draw particles
        particles.forEach(p => {
            ctx.save()
            ctx.globalAlpha = p.alpha
            ctx.fillStyle = p.color
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
            ctx.fill()
            ctx.restore()
        })
        ctx.globalAlpha = 1

        // Draw solar flare obstacles
        obstacles.forEach(obs => {
            ctx.save()
            ctx.shadowBlur = 10 + audioData.bass * 10
            ctx.shadowColor = obs.color
            
            // Draw rotating electromagnetic squares
            ctx.translate(obs.x, obs.y)
            ctx.rotate(systemTimer * 1.5)
            ctx.fillStyle = '#11050a'
            ctx.strokeStyle = obs.color
            ctx.lineWidth = 2.5
            ctx.strokeRect(-obs.w/2, -obs.h/2, obs.w, obs.h)
            
            // Core hazard energy core
            ctx.fillStyle = obs.color
            ctx.fillRect(-obs.w/4, -obs.h/4, obs.w/2, obs.h/2)
            ctx.restore()
        })

        // Draw glowing rhythm orbs
        orbs.forEach(orb => {
            ctx.save()
            ctx.shadowBlur = 8 + audioData.high * 12
            ctx.shadowColor = orb.color
            
            if (orb.type === 'ring') {
                // Nebula speed pass-through rings
                ctx.strokeStyle = orb.color
                ctx.lineWidth = 3
                ctx.beginPath()
                ctx.arc(orb.x, orb.y, orb.r + Math.sin(orb.pulse * 1.8) * 3, 0, Math.PI * 2)
                ctx.stroke()
            } else {
                // Normal round rhythmic beats
                ctx.fillStyle = orb.color
                ctx.beginPath()
                ctx.arc(orb.x, orb.y, orb.r + Math.sin(orb.pulse * 2) * 1.5, 0, Math.PI * 2)
                ctx.fill()

                // Inside spark highlight
                ctx.fillStyle = '#ffffff'
                ctx.beginPath()
                ctx.arc(orb.x - orb.r * 0.3, orb.y - orb.r * 0.3, orb.r * 0.3, 0, Math.PI * 2)
                ctx.fill()
            }
            ctx.restore()
        })

        // Render hover ship
        drawHoverShip(ctx, ship.x, ship.y, ship.angle)

        // Draw dynamic sound terrain strip
        drawSoundwaveRibbon(ctx, w, h)

        // Render Floating Score texts
        floatingTexts.forEach(f => {
            ctx.save()
            ctx.globalAlpha = f.alpha
            ctx.fillStyle = f.color
            ctx.shadowBlur = 6
            ctx.shadowColor = f.color
            ctx.font = 'bold 13px "Courier New", monospace'
            ctx.textAlign = 'center'
            ctx.fillText(f.text, f.x, f.y)
            ctx.restore()
        })
        ctx.globalAlpha = 1

        animationFrameId = requestAnimationFrame(renderLoop)
    }

    animationFrameId = requestAnimationFrame(renderLoop)

    // Player SDK sub callbacks
    const onInit = (state) => {
        if (state?.theme) theme.value = state.theme
        repeat.value = state.panes?.default?.repeat || 'none'
        nextDisabled.value = !!state.panes?.default?.nextDisabled
        prevDisabled.value = !!state.panes?.default?.prevDisabled
        hasQueue.value = !!state.panes?.default?.hasQueue
        
        if (state?.panes?.default?.track) {
            updateTrackInfo(state.panes.default.track)
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
            updateTrackInfo(payload.track)
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
            audioData.bass *= 0.82
            audioData.mid *= 0.82
            audioData.high *= 0.82
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
        
        audioData.bass += (tb - audioData.bass) * 0.22
        audioData.mid += (tm - audioData.mid) * 0.22
        audioData.high += (th - audioData.high) * 0.22
    }

    const onPosition = (payload) => {
        if (payload && typeof payload.position === 'number') {
            currentTime.value = payload.position
        }
    }

    const updateTrackInfo = (track) => {
        if (!track) return

        if (track.cover?.crop !== trackInfo.value?.cover?.crop) {
            isCoverLoaded.value = false
        }

        trackInfo.value = {
            title: track.title || 'Unknown Cosmic Wave',
            artists: track.artists || (track.contributors?.primary?.map((a) => a.name).join(', ') || 'Cosmic DJ'),
            cover: track.cover || null,
            duration: track.duration || 0,
            wave: track.wave && track.wave.length ? track.wave : generateWave()
        }

        waveData = track.wave && track.wave.length ? track.wave : generateWave()
        orbs = []
        obstacles = []
        particles = []
        floatingTexts = []
        score.value = 0
        multiplier.value = 1
        combo.value = 0
        currentTime.value = 0
        smoothTime = 0
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

    onBeforeUnmount(() => {
        cancelAnimationFrame(animationFrameId)
        window.removeEventListener('resize', handleResize)

        playerSdk.off('init', onInit)
        playerSdk.off('open', onOpen)
        playerSdk.off('position', onPosition)
        playerSdk.off('state', onState)
        playerSdk.off('theme', onTheme)
        playerSdk.off('reaction', onReaction)
        playerSdk.off('repeat', onRepeat)
        playerSdk.off('change', onChange)
        playerSdk.off('audioFrame', onAudioFrame)
    })
})
</script>

<style scoped>
.nebula-container,
.neb-console-deck,
.media-deck-btn,
.tutorial-overlay,
.tutorial-card {
    -webkit-tap-highlight-color: transparent !important;
    -webkit-touch-callout: none;
    user-select: none;
}

.nebula-container {
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

.nebula-container.dark { background: #05020c; }
.nebula-container.light { background: #0c0818; } /* Keep deep space aesthetic even in light mode for glowing neon contrast */

.neb-viewport-wrapper {
    position: relative;
    flex-grow: 1;
    width: 100%;
    overflow: hidden;
    background: #05020c;
}

.nebula-canvas {
    display: block;
    width: 100%;
    height: 100%;
    touch-action: none;
    cursor: crosshair;
}

/* TOP TRACK HEADER BAR */
.neb-top-panel {
    width: 100%;
    min-height: 72px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    z-index: 10;
    padding: 0 16px 12px;
    border-bottom: 1.5px solid rgba(5, 217, 232, 0.2);
    background: rgba(10, 2, 24, 0.96);
    backdrop-filter: blur(8px);
    flex-shrink: 0;
    padding-top: calc(var(--max-safe-area-inset-top, var(--tg-safe-area-inset-top, 0px)) + var(--max-content-safe-area-inset-top, var(--tg-content-safe-area-inset-top, 0px)) + 12px);
}

.neb-track-card {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-grow: 1;
    min-width: 0;
}

.neb-cover-wrapper {
    width: 44px;
    height: 44px;
    border-radius: 6px;
    overflow: hidden;
    background: #14052e;
    border: 1px solid rgba(255, 42, 109, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 0 6px rgba(255, 42, 109, 0.2);
}

.neb-cover-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 0.25s ease;
}

.neb-cover-img.is-loaded {
    opacity: 1;
}

.neb-cover-placeholder {
    color: rgba(255, 42, 109, 0.5);
}

.neb-track-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.neb-track-title {
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 65vw;
    color: #ffffff;
    letter-spacing: 0.3px;
}

.neb-track-artist {
    font-size: 11px;
    opacity: 0.7;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 65vw;
    color: #05d9e8;
}

/* FLOATING OVERLAY HUD */
.neb-hud {
    position: absolute;
    top: 16px;
    left: 16px;
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 3px;
    pointer-events: none;
}

.neb-hud-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 1px;
}

.hud-label {
    opacity: 0.65;
}

.hud-val {
    font-size: 14px;
}

.hud-stunt {
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.5px;
    animation: pulseGlow 0.4s ease-out infinite alternate;
}

@keyframes pulseGlow {
    from { transform: scale(1); filter: brightness(1); }
    to { transform: scale(1.05); filter: brightness(1.2); }
}

/* RETRO-COCKPIT MEDIA CONSOLE */
.neb-console-deck {
    width: 100%;
    background: linear-gradient(180deg, #0d0722 0%, #04010b 100%);
    border-top: 2px solid #05d9e8;
    box-shadow: 0 -6px 20px rgba(5, 217, 232, 0.2);
    padding: 14px 16px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex-shrink: 0;
    z-index: 15;
}

.console-media-deck {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
}

.media-deck-btn {
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(5, 217, 232, 0.04);
    border: 1px solid rgba(5, 217, 232, 0.3);
    border-radius: 8px;
    color: #05d9e8;
    cursor: pointer;
    padding: 0;
    transition: all 0.15s ease-out;
}

/*.media-deck-btn:hover:not(:disabled) {
    background: rgba(5, 217, 232, 0.12);
    border-color: #05d9e8;
    box-shadow: 0 0 8px rgba(5, 217, 232, 0.35);
}*/

.media-deck-btn:active:not(:disabled) {
    transform: scale(0.92);
}

.media-deck-btn:disabled {
    opacity: 0.2;
    cursor: not-allowed;
}

.media-deck-btn.btn-like {
    color: #ff2a6d;
    border-color: rgba(255, 42, 109, 0.3);
    background: rgba(255, 42, 109, 0.04);
}

.media-deck-btn.btn-like:hover:not(:disabled) {
    background: rgba(255, 42, 109, 0.12);
    border-color: #ff2a6d;
    box-shadow: 0 0 8px rgba(255, 42, 109, 0.35);
}

.media-deck-btn.btn-like.is-liked {
    background: rgba(255, 42, 109, 0.2);
    border-color: #ff2a6d;
    color: #ff2a6d;
    box-shadow: 0 0 10px rgba(255, 42, 109, 0.5);
}

.media-deck-btn.btn-play-main {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    border-color: #ff2a6d;
    color: #ff2a6d;
    background: rgba(255, 42, 109, 0.08);
    box-shadow: 0 0 6px rgba(255, 42, 109, 0.3);
}

.media-deck-btn.btn-play-main:hover:not(:disabled) {
    background: rgba(255, 42, 109, 0.18);
    border-color: #ff2a6d;
    box-shadow: 0 0 12px rgba(255, 42, 109, 0.6);
}

.media-deck-btn.is-active {
    background: rgba(5, 217, 232, 0.16);
    border-color: #05d9e8;
    box-shadow: 0 0 8px rgba(5, 217, 232, 0.45);
}

/* TUTORIAL OVERLAY */
.tutorial-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(3, 1, 10, 0.88);
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    box-sizing: border-box;
    backdrop-filter: blur(6px);
}

.tutorial-card {
    max-width: 320px;
    background: linear-gradient(135deg, #100624 0%, #06020e 100%);
    border: 1.5px solid #05d9e8;
    border-radius: 12px;
    padding: 24px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    box-shadow: 0 0 24px rgba(5, 217, 232, 0.25);
}

.tutorial-icon-pulse {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: rgba(5, 217, 232, 0.05);
    border: 1px dashed #05d9e8;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    animation: pulseDashed 2s infinite linear;
}

@keyframes pulseDashed {
    0% { transform: scale(1) rotate(0deg); box-shadow: 0 0 0 rgba(5, 217, 232, 0); }
    50% { transform: scale(1.08) rotate(180deg); box-shadow: 0 0 14px rgba(5, 217, 232, 0.3); }
    100% { transform: scale(1) rotate(360deg); box-shadow: 0 0 0 rgba(5, 217, 232, 0); }
}

.tutorial-title {
    font-size: 16px;
    font-weight: 800;
    letter-spacing: 2px;
    color: #ffffff;
    margin-bottom: 8px;
    text-shadow: 0 0 8px rgba(5, 217, 232, 0.5);
}

.tutorial-text {
    font-size: 11px;
    line-height: 1.6;
    color: #ccd;
    opacity: 0.9;
    margin-bottom: 20px;
}

.tutorial-btn {
    width: 100%;
    height: 42px;
    background: linear-gradient(135deg, #05d9e8 0%, #008ca3 100%);
    border: 1.5px solid #05d9e8;
    border-radius: 8px;
    color: #ffffff;
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 1.5px;
    cursor: pointer;
    transition: all 0.15s ease-out;
    box-shadow: 0 0 10px rgba(5, 217, 232, 0.3);
}

.tutorial-btn:hover {
    box-shadow: 0 0 18px rgba(5, 217, 232, 0.6);
    filter: brightness(1.1);
}

.tutorial-btn:active {
    transform: scale(0.96);
}

/* NEON COLORS FOR FEEDBACK MESSAGE TEXTS */
.neon-green-text {
    color: #39ff6a;
    text-shadow: 0 0 6px rgba(57, 255, 106, 0.6);
}

.neon-blue-text {
    color: #05d9e8;
    text-shadow: 0 0 6px rgba(5, 217, 232, 0.6);
}

.neon-pink-text {
    color: #ff2a6d;
    text-shadow: 0 0 6px rgba(255, 42, 109, 0.6);
}

.neon-yellow-text {
    color: #ffe600;
    text-shadow: 0 0 6px rgba(255, 230, 0, 0.7);
}

.neon-red-text {
    color: #ff3347;
    text-shadow: 0 0 8px rgba(255, 51, 71, 0.8);
    font-weight: 900;
}
</style>
