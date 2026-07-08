<template>
    <div class="lofi-container" :class="[theme]" id="lofi-app-container">
        <!-- COZY TRACK HEADER PANEL -->
        <div class="lofi-top-panel" id="lofi-top-panel">
            <div class="lofi-track-card" id="lofi-track-card">
                <div class="lofi-cover-wrapper" id="lofi-cover-wrapper">
                    <img
                        v-if="trackInfo.cover?.crop"
                        :src="trackInfo.cover.crop"
                        class="lofi-cover-img"
                        :class="{ 'is-loaded': isCoverLoaded }"
                        @load="isCoverLoaded = true"
                        id="lofi-cover-img"
                    />
                    <div v-else class="lofi-cover-placeholder" id="lofi-cover-placeholder">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 18V5l12-2v13"/>
                            <circle cx="6" cy="18" r="3"/>
                            <circle cx="18" cy="16" r="3"/>
                        </svg>
                    </div>
                </div>
                <div class="lofi-track-meta" id="lofi-track-meta">
                    <div class="lofi-track-title" id="lofi-track-title">{{ trackInfo.title }}</div>
                    <div class="lofi-track-artist" id="lofi-track-artist">{{ trackInfo.artists }}</div>
                </div>
            </div>
        </div>

        <!-- MAIN VIEWPORT (LO-FI COZY CANVAS) -->
        <div class="lofi-viewport-wrapper" ref="viewportRef" @pointerdown="handleInteraction" id="lofi-viewport-wrapper">
            <canvas ref="canvasRef" class="lofi-canvas" id="lofi-cozy-canvas"></canvas>

            <!-- COZY RAIN / NIGHT AMBIENCE BUTTONS IN SCENE -->
            <div class="cozy-overlay-toggles" id="lofi-overlay-toggles">
                <button class="cozy-pill-btn" :class="{ 'is-active': activeWeather === 'rain' }" @click="setWeather('rain')" id="lofi-btn-rain">🌧️ RAIN</button>
                <button class="cozy-pill-btn" :class="{ 'is-active': activeWeather === 'snow' }" @click="setWeather('snow')" id="lofi-btn-snow">❄️ SNOW</button>
                <button class="cozy-pill-btn" :class="{ 'is-active': activeWeather === 'stars' }" @click="setWeather('stars')" id="lofi-btn-stars">✨ STARS</button>
            </div>

            <!-- INTERACTIVE WATERCOLOR NOTIFICATION -->
            <div class="lofi-bubble-info" v-if="clickSplashText" id="lofi-bubble-info">
                <span>✨ {{ clickSplashText }} ✨</span>
            </div>
        </div>

        <!-- RETRO WALNUT WOOD SYNTHESIZER RADIO CONSOLE -->
        <div class="lofi-console-deck" id="lofi-console-deck">
            <!-- DETAILED COZY CONTROLS PANEL -->
            <div class="cozy-adjustments" id="lofi-adjustments">
                <div class="cozy-slider-group" id="lofi-glow-adjust">
                    <span class="cozy-label">LAMP GLOW INTENSITY</span>
                    <div class="slider-container">
                        <input type="range" min="0.2" max="2.0" step="0.1" v-model.number="lampGlowMultiplier" class="cozy-slider" />
                        <span class="slider-val">{{ Math.round(lampGlowMultiplier * 100) }}%</span>
                    </div>
                </div>

                <div class="cozy-slider-group" id="lofi-bobbing-adjust">
                    <span class="cozy-label">HEAD-BOB INTENSITY</span>
                    <div class="slider-container">
                        <input type="range" min="0" max="2" step="0.1" v-model.number="headBobIntensity" class="cozy-slider" />
                        <span class="slider-val">{{ Math.round(headBobIntensity * 100) }}%</span>
                    </div>
                </div>

                <div class="cozy-quick-vibes" id="lofi-quick-vibes">
                    <button class="vibe-preset-btn" :class="{ 'is-active': currentPalette === 'midnight-study' }" @click="setPalette('midnight-study')" id="lofi-vibe-midnight">MIDNIGHT BLUE</button>
                    <button class="vibe-preset-btn" :class="{ 'is-active': currentPalette === 'sunset-cozy' }" @click="setPalette('sunset-cozy')" id="lofi-vibe-sunset">SUNSET WARMTH</button>
                    <button class="vibe-preset-btn" :class="{ 'is-active': currentPalette === 'forest-cabin' }" @click="setPalette('forest-cabin')" id="lofi-vibe-forest">FOREST CABIN</button>
                </div>
            </div>

            <!-- RETRO EMBEDDED MEDIA PANEL -->
            <div class="console-media-deck" id="lofi-console-media">
                <button class="media-deck-btn btn-like" @click="handleLikeToggle" :class="{ 'is-liked': reaction === 'LIKE' }" :title="reaction === 'LIKE' ? 'Unlike' : 'Like'" id="lofi-btn-like">
                    <svg width="18" height="18" viewBox="0 0 24 24" :fill="reaction === 'LIKE' ? '#ff7597' : 'none'" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                </button>
                
                <button class="media-deck-btn" :disabled="prevDisabled" @click="playerSdk.prev()" title="Previous" id="lofi-btn-prev">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                </button>
                
                <button class="media-deck-btn btn-play-main" @click="togglePlay" title="Play/Pause" id="lofi-btn-play">
                    <svg v-if="playerState !== 'playing'" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                </button>
                
                <button class="media-deck-btn" :disabled="nextDisabled" @click="playerSdk.next()" title="Next" id="lofi-btn-next">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6zm9-12h2v12h-2z"/></svg>
                </button>
                
                <button class="media-deck-btn" @click="handleRepeat" :class="{ 'is-active': repeat !== 'none' }" title="Repeat" id="lofi-btn-repeat">
                    <svg v-if="repeat === 'track'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                        <text x="9" y="16" font-size="9" font-weight="bold" fill="currentColor" stroke="none">1</text>
                    </svg>
                    <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                    </svg>
                </button>
                
                <button class="media-deck-btn" :disabled="!hasQueue" @click="openPlaylist" title="Queue" id="lofi-btn-queue">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                    </svg>
                </button>
                
                <button class="media-deck-btn btn-collapse" @click="collapse" title="Collapse" id="lofi-btn-collapse">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"/>
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, reactive } from 'vue'
import { playerSdk } from '@bilbomusic/player-plugin-sdk'

const canvasRef = ref(null)
const viewportRef = ref(null)
const theme = ref('dark')
const isExpanded = ref(true)
const playerState = ref('paused')
const reaction = ref('')
const repeat = ref('none')
const isCoverLoaded = ref(false)

const nextDisabled = ref(false)
const prevDisabled = ref(true)
const hasQueue = ref(false)

const trackInfo = ref({
    title: 'Lofi Chills',
    artists: 'Cozy Beats Generator',
    cover: null,
    duration: 0,
    wave: []
})

// Cozy Room Configuration
const activeWeather = ref('rain') // rain, snow, stars
const currentPalette = ref('midnight-study')
const lampGlowMultiplier = ref(1.0)
const headBobIntensity = ref(1.0)
const clickSplashText = ref('')

const palettes = {
    'midnight-study': {
        wall: '#111326',
        wallShadow: '#080914',
        desk: '#2d1e2f',
        deskHighlight: '#402c42',
        windowSky: '#050410',
        lampLight: 'rgba(255, 195, 115, 0.28)',
        lampCore: '#ffdf9e',
        fairyLight: '#05d9e8',
        fairyAlt: '#ff2a6d',
        sweater: '#ff7597',
        sweaterShadow: '#d65072',
        hair: '#4c3b32',
        mug: '#cbd5e1'
    },
    'sunset-cozy': {
        wall: '#382226',
        wallShadow: '#221417',
        desk: '#4a251c',
        deskHighlight: '#623528',
        windowSky: '#fc7b54',
        lampLight: 'rgba(255, 140, 60, 0.32)',
        lampCore: '#ffaa66',
        fairyLight: '#ffd633',
        fairyAlt: '#ff5533',
        sweater: '#e85a71',
        sweaterShadow: '#b5344a',
        hair: '#302020',
        mug: '#ffeedb'
    },
    'forest-cabin': {
        wall: '#1c221a',
        wallShadow: '#0f140e',
        desk: '#332314',
        deskHighlight: '#4d3620',
        windowSky: '#121a16',
        lampLight: 'rgba(255, 220, 150, 0.26)',
        lampCore: '#ffe0b2',
        fairyLight: '#39ff6a',
        fairyAlt: '#ffd633',
        sweater: '#4f7a6a',
        sweaterShadow: '#2a4e40',
        hair: '#231c15',
        mug: '#ebd9c8'
    }
}

// Audio-reactive metrics
const audioData = reactive({
    bass: 0,
    mid: 0,
    high: 0
})

// Particle & Sky elements
let precipitation = []
let skyClouds = []
let fairyLights = []
let dustSparks = []
let tapeReelsAngle = 0
let catTailAngle = 0
let catBreatheScale = 1.0

let lastTimestamp = 0
let animationFrameId = null
let clickBubbleTimer = 0

// Setup drift clouds
const initSkyElements = () => {
    skyClouds = []
    for (let i = 0; i < 4; i++) {
        skyClouds.push({
            x: Math.random() * 800,
            y: 40 + Math.random() * 120,
            size: 40 + Math.random() * 50,
            speed: 0.12 + Math.random() * 0.25
        })
    }

    // Setup static fairy light nodes
    fairyLights = []
    for (let i = 0; i < 10; i++) {
        fairyLights.push({
            x: 120 + i * 50,
            y: 35 + Math.sin(i * 0.8) * 12,
            phase: i * 0.5
        })
    }
}

const handleInteraction = (e) => {
    if (!canvasRef.value) return
    const rect = canvasRef.value.getBoundingClientRect()
    const px = e.clientX - rect.left
    const py = e.clientY - rect.top

    // Spawn visual music notes on pointer click/tap
    const expressions = ['Sip Lofi Coffee', 'Cat purrs...', 'Vinyl crackles...', 'Cozy rain vibe', 'Cozy beats active']
    clickSplashText.value = expressions[Math.floor(Math.random() * expressions.length)]
    clickBubbleTimer = 120

    for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 1.0 + Math.random() * 3.0
        dustSparks.push({
            x: px,
            y: py,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 0.5,
            alpha: 1.0,
            size: 3 + Math.random() * 4,
            isNote: Math.random() > 0.4
        })
    }
}

const setWeather = (mode) => {
    activeWeather.value = mode
}

const setPalette = (presetName) => {
    currentPalette.value = presetName
}

// Update loop for clouds, sparks, rain particles
const updateEnvironment = (dt, w, h) => {
    const timeScale = dt / 16.66
    const isPlaying = playerState.value === 'playing'

    // 1. Tape reels spinning
    if (isPlaying) {
        tapeReelsAngle += 0.05 * (1 + audioData.bass * 1.5) * timeScale
    }

    // 2. Head-bobbing & kitty breathing
    const bobFreq = isPlaying ? (0.08 + audioData.bass * 0.05) : 0.03
    catBreatheScale = 1 + Math.sin(Date.now() * 0.002) * 0.03 + (isPlaying ? audioData.bass * 0.02 : 0)
    catTailAngle = Math.sin(Date.now() * 0.002) * 0.3 + (isPlaying ? Math.sin(Date.now() * 0.008) * audioData.bass * 0.5 : 0)

    // 3. Sky Clouds
    skyClouds.forEach(cloud => {
        cloud.x -= cloud.speed * timeScale
        if (cloud.x < -150) {
            cloud.x = w + 100
            cloud.y = 40 + Math.random() * 120
        }
    })

    // 4. Weather: Rain/Snow/Stars
    const precipitationRate = activeWeather.value === 'rain' ? 30 : activeWeather.value === 'snow' ? 12 : 5
    // Adjust generation density slightly with audio high frequencies
    const extraPrecip = isPlaying ? Math.floor(audioData.high * 10) : 0
    
    if (precipitation.length < (precipitationRate + extraPrecip)) {
        precipitation.push({
            x: Math.random() * w,
            y: -10,
            vy: activeWeather.value === 'rain' ? 6 + Math.random() * 4 : 1.2 + Math.random() * 1.5,
            vx: activeWeather.value === 'rain' ? -1 - Math.random() * 1.5 : (Math.random() - 0.5) * 1.0,
            size: activeWeather.value === 'rain' ? 1.5 + Math.random() * 1 : 2 + Math.random() * 3,
            alpha: 0.3 + Math.random() * 0.6
        })
    }

    for (let i = precipitation.length - 1; i >= 0; i--) {
        const p = precipitation[i]
        p.y += p.vy * timeScale
        p.x += p.vx * timeScale

        // Recycle if out of bounds
        if (p.y > h || p.x < -20 || p.x > w + 20) {
            precipitation.splice(i, 1)
        }
    }

    // 5. Dust Sparks and Note Particles
    for (let i = dustSparks.length - 1; i >= 0; i--) {
        const s = dustSparks[i]
        s.x += s.vx * timeScale
        s.y += s.vy * timeScale
        s.vy -= 0.01 * timeScale // drift upward slightly
        s.alpha -= 0.012 * timeScale

        if (s.alpha <= 0) {
            dustSparks.splice(i, 1)
        }
    }

    // Ambient floating sparks when playing
    if (isPlaying && Math.random() < 0.12 && dustSparks.length < 50) {
        dustSparks.push({
            x: 100 + Math.random() * (w - 200),
            y: h - 180 + Math.random() * 100,
            vx: (Math.random() - 0.5) * 0.6,
            vy: -0.3 - Math.random() * 0.6,
            alpha: 0.8,
            size: 2 + Math.random() * 4,
            isNote: Math.random() > 0.72
        })
    }

    // Decrement click bubble timer
    if (clickBubbleTimer > 0) {
        clickBubbleTimer -= dt
        if (clickBubbleTimer <= 0) {
            clickSplashText.value = ''
        }
    }
}

// Draw room environment and anime desk character
const drawLofiScene = (ctx, w, h) => {
    const activePaletteName = palettes[currentPalette.value] ? currentPalette.value : 'midnight-study'
    const palette = palettes[activePaletteName]
    const isPlaying = playerState.value === 'playing'

    // Clear backdrop with deep room color
    ctx.fillStyle = palette.wallShadow
    ctx.fillRect(0, 0, w, h)

    // 1. CHOP-FREE SCALE ENGINE: Scale canvas uniformly to fit a virtual 800x500 design coordinate space
    ctx.save()
    const scaleX = w / 800
    const scaleY = h / 500
    const scale = Math.min(scaleX, scaleY)
    const offsetX = (w - 800 * scale) / 2
    const offsetY = (h - 500 * scale) / 2
    
    ctx.translate(offsetX, offsetY)
    ctx.scale(scale, scale)

    // Virtual coords: Canvas is now guaranteed 800 x 500
    const vW = 800
    const vH = 500

    // 2. SKY & WINDOW BACKDROP
    // Large atmospheric window centered at top
    const winX = 100
    const winY = 40
    const winW = 600
    const winH = 260
    const deskY = winY + winH // y = 300

    ctx.save()
    // Clip window area so nothing spills into room walls
    ctx.beginPath()
    ctx.roundRect(winX, winY, winW, winH, 4)
    ctx.clip()

    // Draw gradient sky
    const skyGrad = ctx.createLinearGradient(winX, winY, winX, winY + winH)
    if (currentPalette.value === 'midnight-study') {
        skyGrad.addColorStop(0, '#060312')
        skyGrad.addColorStop(0.5, '#0e0b24')
        skyGrad.addColorStop(1, '#201633')
    } else if (currentPalette.value === 'sunset-cozy') {
        skyGrad.addColorStop(0, '#2d142c')
        skyGrad.addColorStop(0.3, '#5b1c3f')
        skyGrad.addColorStop(0.6, '#b33939')
        skyGrad.addColorStop(0.85, '#ff793f')
        skyGrad.addColorStop(1, '#ffb142')
    } else {
        // Forest Cabin deep teal-green aurora
        skyGrad.addColorStop(0, '#02090b')
        skyGrad.addColorStop(0.5, '#071f1a')
        skyGrad.addColorStop(1, '#163a24')
    }
    ctx.fillStyle = skyGrad
    ctx.fillRect(winX, winY, winW, winH)

    // Draw Moon/Sun and soft glow bloom
    if (currentPalette.value === 'sunset-cozy') {
        // Beautiful massive golden sunset sun resting on the horizon
        const sunX = winX + winW * 0.72
        const sunY = winY + winH - 20
        const sunGlow = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, 120)
        sunGlow.addColorStop(0, 'rgba(255, 230, 180, 0.4)')
        sunGlow.addColorStop(0.4, 'rgba(255, 120, 50, 0.15)')
        sunGlow.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = sunGlow
        ctx.beginPath()
        ctx.arc(sunX, sunY, 120, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = '#ffdf9e'
        ctx.beginPath()
        ctx.arc(sunX, sunY, 35, 0, Math.PI * 2)
        ctx.fill()
    } else {
        // Gorgeous glowing crescent moon
        const moonX = winX + winW * 0.68
        const moonY = winY + 65
        
        // Moon halo
        const moonGlow = ctx.createRadialGradient(moonX, moonY, 2, moonX, moonY, 70)
        const haloColor = currentPalette.value === 'forest-cabin' ? 'rgba(150, 255, 200, 0.12)' : 'rgba(200, 220, 255, 0.15)'
        moonGlow.addColorStop(0, haloColor)
        moonGlow.addColorStop(0.5, 'rgba(200, 220, 255, 0.04)')
        moonGlow.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = moonGlow
        ctx.beginPath()
        ctx.arc(moonX, moonY, 70, 0, Math.PI * 2)
        ctx.fill()

        // Draw crescent shape
        ctx.save()
        ctx.fillStyle = currentPalette.value === 'forest-cabin' ? '#e0f5eb' : '#fff6d1'
        ctx.beginPath()
        ctx.arc(moonX, moonY, 18, -Math.PI * 0.2, Math.PI * 0.8)
        ctx.bezierCurveTo(moonX - 5, moonY + 12, moonX - 5, moonY - 12, moonX + 13, moonY - 11)
        ctx.closePath()
        ctx.fill()
        ctx.restore()
    }

    // Draw background stars/planets
    if (activeWeather.value === 'stars' || currentPalette.value === 'midnight-study' || currentPalette.value === 'forest-cabin') {
        ctx.fillStyle = '#ffffff'
        const seed = currentPalette.value === 'forest-cabin' ? 12 : 34
        for (let s = 0; s < 30; s++) {
            const sx = winX + ((s * 137 + seed * 9) % (winW - 10))
            const sy = winY + ((s * 89 + seed * 13) % (winH - 10))
            const blink = 0.2 + Math.sin(Date.now() * 0.002 + s * 0.7) * 0.6
            
            ctx.globalAlpha = blink
            // Draw small twinkles
            if (s % 7 === 0) {
                ctx.fillRect(sx, sy - 1, 1, 3)
                ctx.fillRect(sx - 1, sy, 3, 1)
            } else {
                ctx.fillRect(sx, sy, 1.8, 1.8)
            }
        }
        ctx.globalAlpha = 1.0

        // Rare cozy shooting star effect!
        const shootTime = (Date.now() % 12000)
        if (shootTime < 1800) {
            ctx.save()
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)'
            ctx.lineWidth = 1.2
            const progress = shootTime / 1800
            const sX = winX + winW * 0.2 + progress * 200
            const sY = winY + 30 + progress * 80
            ctx.beginPath()
            ctx.moveTo(sX - 35, sY - 14)
            ctx.lineTo(sX, sY)
            ctx.stroke()
            ctx.restore()
        }
    }

    // Beautiful layered mountains / rolling horizon hills
    // Mountain Layer 1 (Distant)
    ctx.fillStyle = currentPalette.value === 'sunset-cozy' ? '#441434' : currentPalette.value === 'forest-cabin' ? '#091d17' : '#0e0b20'
    ctx.beginPath()
    ctx.moveTo(winX, winY + winH)
    ctx.bezierCurveTo(winX + 120, winY + winH - 60, winX + 220, winY + winH - 90, winX + 320, winY + winH - 45)
    ctx.bezierCurveTo(winX + 420, winY + winH - 20, winX + 500, winY + winH - 75, winX + winW, winY + winH - 30)
    ctx.lineTo(winX + winW, winY + winH)
    ctx.closePath()
    ctx.fill()

    // Mountain Layer 2 (Mid-distance with silhouettes of tiny pine trees!)
    ctx.fillStyle = currentPalette.value === 'sunset-cozy' ? '#290720' : currentPalette.value === 'forest-cabin' ? '#04130f' : '#080514'
    ctx.beginPath()
    ctx.moveTo(winX, winY + winH)
    ctx.bezierCurveTo(winX + 80, winY + winH - 25, winX + 180, winY + winH - 45, winX + 280, winY + winH - 20)
    ctx.bezierCurveTo(winX + 380, winY + winH - 10, winX + 480, winY + winH - 40, winX + winW, winY + winH - 15)
    ctx.lineTo(winX + winW, winY + winH)
    ctx.closePath()
    ctx.fill()

    // Draw a few cute tiny distant cabin outline or forest spikes on the middle mountains
    ctx.save()
    ctx.fillStyle = ctx.fillStyle // Keep same color
    for (let t = winX + 30; t < winX + winW; t += 45) {
        const mY = winY + winH - 15 - Math.sin((t - winX) * 0.01) * 10
        ctx.beginPath()
        ctx.moveTo(t, mY)
        ctx.lineTo(t - 4, mY + 12)
        ctx.lineTo(t + 4, mY + 12)
        ctx.closePath()
        ctx.fill()
    }
    ctx.restore()

    // 3. DRIFTING ATMOSPHERIC CLOUDS IN WINDOW
    skyClouds.forEach((cloud, i) => {
        ctx.save()
        // Map coordinate from fluid room coordinate system to virtual 800 width
        const mapX = (cloud.x % w) * (800 / w)
        
        ctx.fillStyle = currentPalette.value === 'sunset-cozy' ? 'rgba(235, 90, 80, 0.28)' : 'rgba(255, 255, 255, 0.05)'
        ctx.beginPath()
        ctx.arc(mapX, cloud.y, cloud.size * 0.6, 0, Math.PI * 2)
        ctx.arc(mapX + cloud.size * 0.4, cloud.y - cloud.size * 0.15, cloud.size * 0.5, 0, Math.PI * 2)
        ctx.arc(mapX - cloud.size * 0.35, cloud.y + cloud.size * 0.1, cloud.size * 0.45, 0, Math.PI * 2)
        ctx.closePath()
        ctx.fill()
        ctx.restore()
    })

    // 4. WINDOW PANE CONDENSATION, WATER STREAKS, AND PRECIPITATION
    ctx.save()
    precipitation.forEach((p, index) => {
        // Map falling precipitation coordinates nicely to virtual coordinate frame
        const mappedX = (p.x / w) * winW + winX
        const mappedY = (p.y / h) * winH + winY

        ctx.globalAlpha = p.alpha
        if (activeWeather.value === 'rain') {
            ctx.strokeStyle = currentPalette.value === 'sunset-cozy' ? 'rgba(255, 180, 150, 0.5)' : 'rgba(150, 210, 255, 0.4)'
            ctx.lineWidth = p.size * 0.7
            ctx.beginPath()
            ctx.moveTo(mappedX, mappedY)
            ctx.lineTo(mappedX - 1.5, mappedY + 12)
            ctx.stroke()

            // Cute tiny condensation ripples on glass windowsill
            if (index % 4 === 0 && p.y > h - 40) {
                ctx.strokeStyle = 'rgba(255,255,255,0.12)'
                ctx.lineWidth = 1
                ctx.beginPath()
                ctx.ellipse(mappedX, winY + winH - 2, 4, 1.5, 0, 0, Math.PI * 2)
                ctx.stroke()
            }
        } else if (activeWeather.value === 'snow') {
            // Soft drift snowflakes
            ctx.fillStyle = '#ffffff'
            ctx.beginPath()
            const driftX = mappedX + Math.sin(Date.now() * 0.0015 + index) * 6
            ctx.arc(driftX, mappedY, p.size * 0.8, 0, Math.PI * 2)
            ctx.fill()
        } else {
            // Shimmering star dust falling
            ctx.fillStyle = '#ffeaa7'
            const starDriftX = mappedX + Math.sin(Date.now() * 0.001 + index) * 3
            ctx.beginPath()
            ctx.arc(starDriftX, mappedY, p.size * (0.5 + audioData.high * 0.6), 0, Math.PI * 2)
            ctx.fill()
        }
    })
    ctx.restore()

    // Delicate diagonal condensation reflections on glass
    const reflectGrad = ctx.createLinearGradient(winX, winY, winX + winW, winY + winH)
    reflectGrad.addColorStop(0, 'rgba(255, 255, 255, 0.03)')
    reflectGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.06)')
    reflectGrad.addColorStop(0.38, 'rgba(255, 255, 255, 0.0)')
    reflectGrad.addColorStop(0.55, 'rgba(255, 255, 255, 0.04)')
    reflectGrad.addColorStop(0.58, 'rgba(255, 255, 255, 0.0)')
    ctx.fillStyle = reflectGrad
    ctx.fillRect(winX, winY, winW, winH)

    // 5. WINDOW FRAME STRUCTURE (Rustic woodwork)
    ctx.strokeStyle = palette.wallShadow
    ctx.lineWidth = 10
    ctx.strokeRect(winX, winY, winW, winH)

    // Double window pane vertical separator grid
    ctx.fillStyle = palette.wallShadow
    ctx.fillRect(winX + winW / 2 - 4, winY, 8, winH)
    ctx.fillRect(winX, winY + winH / 2 - 3, winW, 6)

    // Beautiful subtle inner window shadow for deep cozy depth
    const innerShadow = ctx.createLinearGradient(winX, winY, winX, winY + 25)
    innerShadow.addColorStop(0, 'rgba(0,0,0,0.45)')
    innerShadow.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = innerShadow
    ctx.fillRect(winX, winY, winW, winH)

    ctx.restore() // End Sky window clipping

    // 6. COZY ROOM WALLS (with textured vertical panel borders)
    // Left wall panel
    ctx.fillStyle = palette.wall
    ctx.fillRect(0, 0, winX, winY + winH)
    // Right wall panel
    ctx.fillRect(winX + winW, 0, vW - (winX + winW), winY + winH)
    // Top ceiling header
    ctx.fillRect(0, 0, vW, winY)

    // Ambient vignetting of the room
    const vignetteGrad = ctx.createRadialGradient(vW / 2, vH / 2, 200, vW / 2, vH / 2, 450)
    vignetteGrad.addColorStop(0, 'rgba(0,0,0,0)')
    vignetteGrad.addColorStop(0.6, 'rgba(0,0,0,0.22)')
    vignetteGrad.addColorStop(1, 'rgba(0,0,0,0.72)')
    ctx.fillStyle = vignetteGrad
    ctx.fillRect(0, 0, vW, vH)

    // 7. DESK & TABLE BACKGROUND FLOOR
    // Table level is at y = 300, extends to y = 500
    const tableY = 300
    const tableH = 200

    // Wood tabletop linear gradient
    const deskGrad = ctx.createLinearGradient(0, tableY, 0, tableY + tableH)
    deskGrad.addColorStop(0, palette.desk)
    deskGrad.addColorStop(0.08, palette.deskHighlight)
    deskGrad.addColorStop(0.4, palette.desk)
    deskGrad.addColorStop(1, palette.wallShadow)
    ctx.fillStyle = deskGrad
    ctx.fillRect(0, tableY, vW, tableH)

    // Draw stylized horizontal wooden grain grooves
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)'
    ctx.lineWidth = 1.5
    for (let g = tableY + 25; g < vH; g += 30) {
        ctx.beginPath()
        ctx.moveTo(0, g)
        ctx.lineTo(vW, g)
        ctx.stroke()
    }

    // Soft shadow cast onto the desk right under the windowsill ledge
    const ledgeShadow = ctx.createLinearGradient(0, tableY, 0, tableY + 20)
    ledgeShadow.addColorStop(0, 'rgba(0, 0, 0, 0.65)')
    ledgeShadow.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = ledgeShadow
    ctx.fillRect(0, tableY, vW, 20)

    // 8. HANGING POT PLANT ON THE LEFT WALL (IVY CASCADE)
    ctx.save()
    const potX = 60
    const potY = 55
    
    // Hanging cord strings
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.moveTo(potX, 0)
    ctx.lineTo(potX - 10, potY - 12)
    ctx.moveTo(potX, 0)
    ctx.lineTo(potX + 10, potY - 12)
    ctx.stroke()

    // Terracotta clay pot
    ctx.fillStyle = '#cc7a5c'
    ctx.strokeStyle = '#221410'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.roundRect(potX - 12, potY - 12, 24, 15, 2)
    ctx.fill()
    ctx.stroke()

    // Hanging Ivy vines & leaves
    ctx.strokeStyle = currentPalette.value === 'forest-cabin' ? '#2f633f' : '#334035'
    ctx.lineWidth = 2
    const vineCount = 3
    for (let v = 0; v < vineCount; v++) {
        const vxOffset = (v - 1) * 8
        const vineLen = 40 + v * 25
        ctx.beginPath()
        ctx.moveTo(potX + vxOffset, potY + 2)
        // Sway gently with a sine function
        const sway = Math.sin(Date.now() * 0.0012 + v) * 4
        ctx.bezierCurveTo(
            potX + vxOffset - 8 + sway, potY + vineLen * 0.3,
            potX + vxOffset + 8 + sway, potY + vineLen * 0.7,
            potX + vxOffset + sway, potY + vineLen
        )
        ctx.stroke()

        // Draw little leafy nodes along the curve
        ctx.fillStyle = currentPalette.value === 'forest-cabin' ? '#5cad75' : '#4d6954'
        for (let l = 0; l < 6; l++) {
            const lRatio = l / 5
            const leafY = potY + 5 + lRatio * (vineLen - 10)
            const leafX = potX + vxOffset + Math.sin(Date.now() * 0.0012 + v) * 4 + Math.sin(l * 1.5) * 4
            ctx.beginPath()
            ctx.ellipse(leafX, leafY, 4, 3, l * 0.4, 0, Math.PI * 2)
            ctx.fill()
        }
    }
    ctx.restore()

    // 9. COZY WOOD SHELF AND PICTURE FRAME ON THE RIGHT WALL
    ctx.save()
    // Floating shelf at top right
    const shelfX = 705
    const shelfY = 80
    const shelfW = 85
    const shelfH = 8
    ctx.fillStyle = '#4a2c1a'
    ctx.strokeStyle = palette.wallShadow
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.roundRect(shelfX, shelfY, shelfW, shelfH, 2)
    ctx.fill()
    ctx.stroke()

    // Small potted books & plants on shelf
    ctx.fillStyle = '#a83c32'
    ctx.fillRect(shelfX + 15, shelfY - 18, 7, 18)
    ctx.fillStyle = '#3c7aa8'
    ctx.fillRect(shelfX + 25, shelfY - 14, 6, 14)
    // Leaning book
    ctx.save()
    ctx.translate(shelfX + 38, shelfY)
    ctx.rotate(0.3)
    ctx.fillStyle = '#e8a332'
    ctx.fillRect(-3, -16, 6, 16)
    ctx.restore()

    // Minimalist picture frame hanging below shelf
    const frameX = 715
    const frameY = 120
    const frameW = 60
    const frameH = 75
    ctx.fillStyle = '#111'
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'
    ctx.lineWidth = 3
    ctx.fillRect(frameX, frameY, frameW, frameH)
    ctx.strokeRect(frameX, frameY, frameW, frameH)

    // Abstract cute poster painting inside frame (sunset watercolor)
    ctx.fillStyle = '#fff9f0'
    ctx.fillRect(frameX + 4, frameY + 4, frameW - 8, frameH - 8)
    // Draw simplified abstract pink sun & teal sea
    ctx.fillStyle = '#ff7597'
    ctx.beginPath()
    ctx.arc(frameX + 30, frameY + 35, 12, 0, Math.PI, true)
    ctx.fill()
    ctx.fillStyle = '#05d9e8'
    ctx.fillRect(frameX + 10, frameY + 40, frameW - 20, 15)
    ctx.restore()

    // 10. SPLENDID SLEEPING CAT ON WINDOW CUSHION
    const cushionX = 175
    const cushionY = 296
    const cushionW = 75
    const cushionH = 14

    ctx.save()
    // Shadow under cushion
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)'
    ctx.beginPath()
    ctx.ellipse(cushionX, cushionY + 4, 34, 5, 0, 0, Math.PI * 2)
    ctx.fill()

    // Draw comfy tartan grid cushion
    ctx.fillStyle = '#c54b6c'
    ctx.strokeStyle = palette.wallShadow
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.roundRect(cushionX - cushionW/2, cushionY - cushionH/2, cushionW, cushionH, 5)
    ctx.fill()
    ctx.stroke()
    
    // Tartan stripe pattern
    ctx.strokeStyle = '#f4a2b1'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    for (let sx = cushionX - cushionW/2 + 8; sx < cushionX + cushionW/2; sx += 12) {
        ctx.moveTo(sx, cushionY - cushionH/2)
        ctx.lineTo(sx + 3, cushionY + cushionH/2)
    }
    ctx.stroke()

    // Sleeping Fluffy Tabby Cat sitting on cushion
    // Center coordinates of cat
    const catCX = cushionX
    const catCY = cushionY - 8
    
    ctx.save()
    ctx.translate(catCX, catCY)
    // Slow breathing scale
    ctx.scale(catBreatheScale, catBreatheScale)

    // Fluffy tail
    ctx.save()
    ctx.translate(16, 2)
    ctx.rotate(catTailAngle)
    ctx.fillStyle = currentPalette.value === 'sunset-cozy' ? '#d97d52' : '#ebedf0'
    ctx.strokeStyle = palette.wallShadow
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.ellipse(8, -2, 12, 5, 0.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    // Tail ginger stripes
    if (currentPalette.value === 'sunset-cozy') {
        ctx.strokeStyle = '#a84c20'
        ctx.beginPath()
        ctx.moveTo(8, -4); ctx.lineTo(8, 0)
        ctx.moveTo(12, -3); ctx.lineTo(12, 0)
        ctx.stroke()
    }
    ctx.restore()

    // Fluffy curled body
    ctx.fillStyle = currentPalette.value === 'sunset-cozy' ? '#f09267' : '#ffffff'
    ctx.strokeStyle = palette.wallShadow
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.ellipse(0, 0, 22, 13, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    // Cat Head
    const catHX = -14
    const catHY = -8
    ctx.beginPath()
    ctx.arc(catHX, catHY, 10, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    // Sleeping face curves
    ctx.strokeStyle = '#4a3b32'
    ctx.lineWidth = 1.2
    ctx.beginPath()
    // Sleeping eyes
    ctx.arc(catHX - 4, catHY - 1, 1.5, 0, Math.PI, false)
    ctx.arc(catHX + 1, catHY - 1, 1.5, 0, Math.PI, false)
    ctx.stroke()
    // Whisker lines
    ctx.beginPath()
    ctx.moveTo(catHX - 9, catHY + 2); ctx.lineTo(catHX - 14, catHY + 1)
    ctx.moveTo(catHX - 9, catHY + 4); ctx.lineTo(catHX - 13, catHY + 4)
    ctx.moveTo(catHX + 5, catHY + 2); ctx.lineTo(catHX + 10, catHY + 1)
    ctx.moveTo(catHX + 5, catHY + 4); ctx.lineTo(catHX + 9, catHY + 4)
    ctx.stroke()

    // Cute fluffy ears
    ctx.fillStyle = currentPalette.value === 'sunset-cozy' ? '#d97d52' : '#ffd6db' // Pink inner ear
    ctx.beginPath()
    ctx.moveTo(catHX - 8, catHY - 8)
    ctx.lineTo(catHX - 6, catHY - 16)
    ctx.lineTo(catHX - 1, catHY - 10)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(catHX + 1, catHY - 9)
    ctx.lineTo(catHX + 4, catHY - 17)
    ctx.lineTo(catHX + 8, catHY - 9)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    ctx.restore() // End Cat breathing transform

    // Cat floating cute "Zzz" bubble letters when playing music
    if (isPlaying) {
        const zTick = (Date.now() % 3500) / 3500
        const zY = catCY - 22 - zTick * 30
        const zX = catCX - 12 + Math.sin(zY * 0.1) * 6
        const zAlpha = 1 - zTick
        ctx.save()
        ctx.fillStyle = `rgba(255, 230, 200, ${zAlpha})`
        ctx.font = 'bold 11px "Courier New", monospace'
        ctx.fillText('z', zX, zY)
        ctx.font = 'bold 13px "Courier New", monospace'
        ctx.fillText('Z', zX + 8, zY - 8)
        ctx.restore()
    }

    ctx.restore() // End cushion/cat drawer

    // 11. REVERSED MASTERPIECE RECORD PLAYER (ON DESK)
    // Base located around x = 200, y = 350, w = 150, h = 80
    const rPlayX = 140
    const rPlayY = 345
    const rPlayW = 145
    const rPlayH = 85

    ctx.save()
    // Base Walnut wood console shadow
    ctx.shadowColor = 'rgba(0,0,0,0.5)'
    ctx.shadowBlur = 12
    ctx.shadowOffsetY = 6

    // Cabinet chassis
    ctx.fillStyle = '#3a2012' // Dark wood finish
    ctx.strokeStyle = palette.wallShadow
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.roundRect(rPlayX, rPlayY, rPlayW, rPlayH, 6)
    ctx.fill()
    ctx.stroke()
    ctx.shadowColor = 'transparent' // Reset shadow

    // Aluminum faceplate front panel
    ctx.fillStyle = '#cbd5e1'
    ctx.beginPath()
    ctx.roundRect(rPlayX + 1, rPlayY + rPlayH - 25, rPlayW - 2, 24, { bottomLeft: 6, bottomRight: 6 })
    ctx.fill()
    ctx.stroke()

    // Control knobs on front plate
    ctx.fillStyle = '#334155'
    ctx.beginPath()
    ctx.arc(rPlayX + 22, rPlayY + rPlayH - 12, 5, 0, Math.PI * 2)
    ctx.arc(rPlayX + 40, rPlayY + rPlayH - 12, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    // Interactive frequency spectrum bars (VU Equalizer) on the record player!
    const barCount = 10
    const barW = 5
    const barGap = 2
    const startEqualizerX = rPlayX + 62
    const equalizerY = rPlayY + rPlayH - 6
    
    for (let b = 0; b < barCount; b++) {
        const audioScale = b < 3 ? audioData.bass : b < 7 ? audioData.mid : audioData.high
        const randBounce = isPlaying ? (audioScale * 18 * (0.6 + Math.sin(b + Date.now() * 0.01) * 0.4)) : 1.5
        const barH = Math.max(2, Math.min(18, randBounce))
        
        // Choose neon color based on index
        ctx.fillStyle = b > 7 ? '#ef4444' : b > 4 ? '#f59e0b' : '#10b981'
        ctx.fillRect(startEqualizerX + b * (barW + barGap), equalizerY - barH, barW, barH)
    }

    // Draw the spinning vinyl record platter
    const plX = rPlayX + rPlayW / 2
    const plY = rPlayY + 28
    const plRadius = 35

    // Dark metallic platter rim
    ctx.fillStyle = '#1e293b'
    ctx.beginPath()
    ctx.ellipse(plX, plY, plRadius + 3, plRadius * 0.5 + 2, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    // The Vinyl record disk (Spinning dynamically when playing!)
    ctx.save()
    ctx.translate(plX, plY)
    // Flat projection squish factor
    ctx.scale(1.0, 0.52)
    
    const recordAngle = isPlaying ? (tapeReelsAngle * 1.5) : 0
    ctx.rotate(recordAngle)

    // Vinyl body (Glossy black)
    const vinGlow = ctx.createRadialGradient(0, 0, 10, 0, 0, plRadius)
    vinGlow.addColorStop(0, '#111827')
    vinGlow.addColorStop(0.82, '#0f172a')
    vinGlow.addColorStop(1, '#020617')
    ctx.fillStyle = vinGlow
    ctx.beginPath()
    ctx.arc(0, 0, plRadius, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#334155'
    ctx.lineWidth = 1
    ctx.stroke()

    // Groove rings
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'
    ctx.beginPath(); ctx.arc(0, 0, plRadius - 6, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath(); ctx.arc(0, 0, plRadius - 12, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath(); ctx.arc(0, 0, plRadius - 18, 0, Math.PI * 2); ctx.stroke()

    // Bright yellow/orange record center label disc
    ctx.fillStyle = currentPalette.value === 'sunset-cozy' ? '#ff7597' : '#f59e0b'
    ctx.beginPath()
    ctx.arc(0, 0, 9, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    // Spindle hole
    ctx.fillStyle = '#000000'
    ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI * 2); ctx.fill()

    ctx.restore()

    // Tonearm & Stylus Needle resting on the record!
    const armX = rPlayX + rPlayW - 20
    const armY = rPlayY + 15
    ctx.save()
    ctx.translate(armX, armY)
    
    // Pivot base
    ctx.fillStyle = '#64748b'
    ctx.beginPath(); ctx.ellipse(0, 0, 6, 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke()

    // Arm rod (Angle changes dynamically if playing vs paused)
    ctx.strokeStyle = '#cbd5e1'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    
    const armTargetRotation = isPlaying ? -0.38 : -0.85
    ctx.rotate(armTargetRotation)

    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(-44, 0) // Main arm shaft
    ctx.lineTo(-50, 8) // Stylus head bent inwards
    ctx.stroke()
    
    // Tiny stylus cartridge
    ctx.fillStyle = '#f43f5e'
    ctx.fillRect(-53, 5, 5, 5)
    ctx.restore()

    ctx.restore() // End Vinyl deck

    // 12. HIGH-POLISHED STUDYING ANIME CHARACTER (LOFI STUDENT)
    // Proportional vector shape sitting centered at design x = 490, y = 300 (desk line)
    const girlX = 490
    const girlY = tableY + 5 // y = 305

    // Interactive head-bob factor syncing with bass/mids or slow breathing when paused
    const bobVal = isPlaying ? (audioData.bass * 16 * headBobIntensity.value) : Math.sin(Date.now() * 0.0016) * 1.8
    // Soft diagonal sway breathing offset
    const breatheOffset = Math.sin(Date.now() * 0.002) * 1.0

    ctx.save()
    ctx.translate(girlX, girlY)

    // Sketch aesthetic stroke properties
    ctx.strokeStyle = palette.wallShadow
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Back of the room study chair silhouette
    ctx.fillStyle = '#1e1b29'
    ctx.beginPath()
    ctx.roundRect(85, -20, 10, 120, 4) // vertical chair post
    ctx.roundRect(50, 45, 45, 10, 2)   // seat pad
    ctx.fill()
    ctx.stroke()
    // Chair back rest cushion
    ctx.fillStyle = '#312a45'
    ctx.beginPath()
    ctx.roundRect(80, -35, 18, 40, 4)
    ctx.fill()
    ctx.stroke()

    // CHARACTER BACK TORSO (Sitting cozy, leaning forward)
    // Cozy oversized knitted hood sweater
    ctx.fillStyle = palette.sweater
    ctx.beginPath()
    ctx.moveTo(55, 110) // base hip
    ctx.bezierCurveTo(72, 85, 75, 20, 25, 0) // back arch up to shoulder
    ctx.bezierCurveTo(8, -8, -12, -4, -20, 10) // shoulder/collar base
    ctx.bezierCurveTo(-38, 40, -22, 90, -10, 110) // torso front curve
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // Sweater knit shading folds
    ctx.strokeStyle = palette.sweaterShadow
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(50, 60); ctx.quadraticCurveTo(62, 75, 55, 95)
    ctx.moveTo(35, 30); ctx.quadraticCurveTo(45, 50, 40, 80)
    ctx.stroke()
    ctx.strokeStyle = palette.wallShadow // Restore primary stroke thickness
    ctx.lineWidth = 4

    // Cute notebook lying on desk under the lamp spotlight
    const bookX = -135
    const bookY = 24
    const bookW = 88
    const bookH = 14

    ctx.save()
    // Bright warm illuminated book backdrop
    ctx.fillStyle = '#fff9e3'
    ctx.beginPath()
    ctx.roundRect(bookX, bookY, bookW, bookH, 2)
    ctx.fill()
    ctx.stroke()

    // Spine and pages divide line
    ctx.strokeStyle = 'rgba(0,0,0,0.18)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(bookX + bookW / 2, bookY)
    ctx.lineTo(bookX + bookW / 2, bookY + bookH)
    ctx.stroke()

    // Faint lines representing handwritten text on pages
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)'
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let l = 0; l < 4; l++) {
        const ly = bookY + 3 + l * 2.5
        ctx.moveTo(bookX + 6, ly)
        ctx.lineTo(bookX + bookW/2 - 6, ly)
        ctx.moveTo(bookX + bookW/2 + 6, ly)
        ctx.lineTo(bookX + bookW - 6, ly)
    }
    ctx.stroke()
    ctx.restore()

    // WRITING LEFT ARM & ELBOW (Leaning resting flat on tabletop)
    ctx.fillStyle = palette.sweater
    ctx.beginPath()
    ctx.moveTo(25, 0) // shoulder
    ctx.bezierCurveTo(-5, 10, -40, 15, -75, 25) // elbow resting forward
    ctx.bezierCurveTo(-105, 25, -112, 12, -100, 15) // writing forearm
    ctx.bezierCurveTo(-85, 20, -5, 20, 12, 18)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // Skin - Writing Hand clutching cozy black pencil
    ctx.fillStyle = '#ffe0cc'
    ctx.beginPath()
    ctx.arc(-105, 18, 4.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    // Pencil
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(-108, 22)
    ctx.lineTo(-101, 12)
    ctx.stroke()
    ctx.lineWidth = 4 // Restore primary

    // Sleek anime neck supporting head
    ctx.fillStyle = '#ffe0cc'
    ctx.beginPath()
    ctx.moveTo(6 + breatheOffset * 0.3, -5)
    ctx.lineTo(6 + bobVal * 0.15, -24)
    ctx.lineTo(20 + bobVal * 0.15, -20)
    ctx.lineTo(20 + breatheOffset * 0.3, -2)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // Dynamic bobbing head frame!
    ctx.save()
    // Apply head-bob translation (Head tilts and nods up/down)
    ctx.translate(bobVal * 0.18, -26 + bobVal * 0.5)

    // Long flowing brown hair backdrop
    ctx.fillStyle = palette.hair
    ctx.beginPath()
    ctx.arc(15, -16, 20, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    // Messy cute bun at top back of head
    ctx.beginPath()
    ctx.arc(28, -28, 9, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    // Anime Face profile (sleek chin/nose leaning left)
    ctx.fillStyle = '#ffe0cc'
    ctx.beginPath()
    ctx.moveTo(18, -1)
    ctx.lineTo(0, -5)   // jaw
    ctx.lineTo(-4, -14) // chin
    ctx.lineTo(-11, -16) // nose tip
    ctx.lineTo(-1, -26) // forehead
    ctx.lineTo(19, -21)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // Cheek blush and cozy closed eyelashes
    ctx.fillStyle = '#ffb3b3'
    ctx.beginPath()
    ctx.ellipse(3, -11, 4, 2.5, 0.1, 0, Math.PI * 2)
    ctx.fill()

    // Sleeping/Concentrating eyelash arc
    ctx.strokeStyle = '#4a2f20'
    ctx.lineWidth = 1.8
    ctx.beginPath()
    ctx.arc(-2, -15, 3.5, 0.1, Math.PI * 0.8, false)
    ctx.stroke()
    ctx.lineWidth = 4 // Restore

    // Fluffy hair bangs sweeping over face
    ctx.fillStyle = palette.hair
    ctx.beginPath()
    ctx.moveTo(-1, -26)
    ctx.quadraticCurveTo(-12, -22, -6, -15) // front bang
    ctx.quadraticCurveTo(-2, -22, 6, -24)
    ctx.quadraticCurveTo(4, -15, 12, -25)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // Cute fluffy retro headphones
    ctx.fillStyle = palette.fairyLight
    ctx.strokeStyle = palette.wallShadow
    ctx.lineWidth = 3

    // Headphone headband
    ctx.beginPath()
    ctx.arc(14, -16, 17, Math.PI * 1.1, Math.PI * 1.8)
    ctx.stroke()

    // Chunky ear cup pad resting on ear
    ctx.save()
    ctx.translate(11, -12)
    ctx.rotate(0.12)
    ctx.fillStyle = palette.fairyLight
    ctx.beginPath()
    ctx.roundRect(-6, -11, 12, 22, 4)
    ctx.fill()
    ctx.stroke()

    // Glowing neon indicator LED light blinking on headset!
    const ledPulse = 0.3 + Math.sin(Date.now() * 0.005) * 0.7
    ctx.fillStyle = isPlaying ? `rgba(57, 255, 106, ${ledPulse})` : 'rgba(255, 42, 109, 0.8)'
    ctx.shadowColor = isPlaying ? '#39ff6a' : '#ff2a6d'
    ctx.shadowBlur = 6
    ctx.beginPath()
    ctx.arc(-1, 3, 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.shadowBlur = 0
    ctx.restore()

    ctx.restore() // End Head Bobbing translation

    ctx.restore() // End Character translation

    // 13. RETRO ANGLED DESK LAMP PROJECTING SHINY SPOTLIGHT CONE
    // Lamp position coordinates: base at x = 580, y = 310
    const lampBaseX = 585
    const lampBaseY = 320

    ctx.save()
    // Wooden / Metal base of the lamp
    ctx.fillStyle = '#64748b'
    ctx.strokeStyle = palette.wallShadow
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.ellipse(lampBaseX, lampBaseY, 16, 6, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    // Pivoting brass dual-hinge arm
    const joint1X = lampBaseX + 8
    const joint1Y = lampBaseY - 80
    const joint2X = lampBaseX - 35
    const joint2Y = lampBaseY - 120

    ctx.strokeStyle = '#f59e0b' // Brass gold metal
    ctx.lineWidth = 4.5
    ctx.beginPath()
    ctx.moveTo(lampBaseX, lampBaseY - 4)
    ctx.lineTo(joint1X, joint1Y)
    ctx.lineTo(joint2X, joint2Y)
    ctx.stroke()

    // Joint hinge pins
    ctx.fillStyle = '#475569'
    ctx.beginPath()
    ctx.arc(joint1X, joint1Y, 4, 0, Math.PI * 2)
    ctx.arc(joint2X, joint2Y, 4, 0, Math.PI * 2)
    ctx.fill()

    // Retro lamp shade dome facing book
    ctx.save()
    ctx.translate(joint2X, joint2Y)
    ctx.rotate(-0.52) // Angled downwards towards book

    // Warm light core bulb source
    ctx.fillStyle = palette.lampCore
    ctx.beginPath()
    ctx.arc(-6, 8, 8, 0, Math.PI * 2)
    ctx.fill()

    // Metal shade cover dome
    ctx.fillStyle = '#1e293b'
    ctx.strokeStyle = palette.wallShadow
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(0, 0, 16, Math.PI, 0)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    ctx.restore()

    // GLORIOUS LIGHT CONE SPOTLIGHT (Drawn on top using Screen blend overlay!)
    // Spotlight origin is joint2X - 5, joint2Y + 8
    const sOriginX = joint2X - 10
    const sOriginY = joint2Y + 12
    
    // Outer glowing spotlight spotlight cone polygon
    ctx.save()
    ctx.globalCompositeOperation = 'screen'
    
    const spotGrad = ctx.createRadialGradient(sOriginX, sOriginY, 5, sOriginX + 50, sOriginY + 140, 200)
    const lampIntensity = Math.min(2.0, Math.max(0.1, lampGlowMultiplier.value))
    spotGrad.addColorStop(0, `rgba(255, 230, 160, ${0.45 * lampIntensity})`)
    spotGrad.addColorStop(0.4, `rgba(255, 190, 100, ${0.2 * lampIntensity})`)
    spotGrad.addColorStop(0.8, `rgba(255, 140, 50, ${0.03 * lampIntensity})`)
    spotGrad.addColorStop(1, 'rgba(0,0,0,0)')

    ctx.fillStyle = spotGrad
    ctx.beginPath()
    ctx.moveTo(sOriginX, sOriginY)
    ctx.lineTo(sOriginX - 165, sOriginY + 195) // Covers book and desk area
    ctx.lineTo(sOriginX + 65, sOriginY + 195)
    ctx.closePath()
    ctx.fill()
    ctx.restore()

    ctx.restore() // End Lamp stack

    // 14. STEAMING PORCELAIN MUG OF COFFEE (ON DESK)
    const mugCX = 345
    const mugCY = 328

    ctx.save()
    // Cute handle
    ctx.strokeStyle = palette.wallShadow
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.arc(mugCX - 10, mugCY + 8, 6, 0, Math.PI * 2)
    ctx.stroke()

    // Porcelain cylindrical body
    ctx.fillStyle = palette.mug
    ctx.beginPath()
    ctx.roundRect(mugCX - 8, mugCY, 16, 20, 2)
    ctx.fill()
    ctx.stroke()

    // Cute white heart print on the coffee mug
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.moveTo(mugCX, mugCY + 6)
    ctx.bezierCurveTo(mugCX - 2, mugCY + 3, mugCX - 4, mugCY + 5, mugCX, mugCY + 11)
    ctx.bezierCurveTo(mugCX + 4, mugCY + 5, mugCX + 2, mugCY + 3, mugCX, mugCY + 6)
    ctx.fill()

    // Rising fluid cozy steam animations!
    // Calculate steam lines based on date timestamps
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)'
    ctx.lineWidth = 1.8
    ctx.lineCap = 'round'
    const time = Date.now() * 0.0025
    
    for (let s = 0; s < 3; s++) {
        const sOffset = s * 6 - 6
        const steamX = mugCX + sOffset
        const steamY = mugCY - 4
        
        ctx.beginPath()
        ctx.moveTo(steamX, steamY)
        // Sinusoidal winding curve rising and dissolving
        ctx.bezierCurveTo(
            steamX + Math.sin(time + s) * 5, steamY - 8,
            steamX - Math.sin(time + s * 1.5) * 5, steamY - 18,
            steamX + Math.sin(time + s) * 3, steamY - 26
        )
        ctx.stroke()
    }
    ctx.restore()

    // 15. COZY WARM FAIRY STRING LIGHTS (DRAPED ACROSS CEILING)
    ctx.save()
    // Catenary draped support wire
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(110, 35)
    for (let i = 0; i < fairyLights.length; i++) {
        const light = fairyLights[i]
        ctx.lineTo(light.x, light.y)
    }
    ctx.stroke()

    // Bulb glow
    fairyLights.forEach((light, i) => {
        // Soft high-frequency reactive flicker
        const glowScale = 0.5 + Math.sin(Date.now() * 0.004 + light.phase) * 0.45
        const baseColor = (i % 2 === 0) ? palette.fairyLight : palette.fairyAlt
        
        // Core bulb glass bead
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.arc(light.x, light.y, 2.5, 0, Math.PI * 2)
        ctx.fill()

        // Outer warm pulsing radial bloom halo
        ctx.save()
        ctx.globalCompositeOperation = 'screen'
        const pulseRad = 6 + glowScale * 8 + audioData.high * 14
        const lightGlow = ctx.createRadialGradient(light.x, light.y, 1, light.x, light.y, pulseRad)
        lightGlow.addColorStop(0, baseColor)
        lightGlow.addColorStop(0.4, 'rgba(255,255,255,0.08)')
        lightGlow.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = lightGlow
        ctx.beginPath()
        ctx.arc(light.x, light.y, pulseRad, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
    })
    ctx.restore()

    // 16. SPARKS & COZY MUSIC DUST PARTICLES
    ctx.save()
    dustSparks.forEach(s => {
        ctx.globalAlpha = s.alpha
        ctx.fillStyle = currentPalette.value === 'sunset-cozy' ? '#ff9e7d' : '#8dd2ff'

        if (s.isNote) {
            // Draw a tiny cute musical eighth note ♫
            ctx.beginPath()
            ctx.arc(s.x, s.y, 2.5, 0, Math.PI * 2)
            ctx.fill()
            ctx.strokeStyle = currentPalette.value === 'sunset-cozy' ? '#ff9e7d' : '#8dd2ff'
            ctx.lineWidth = 1.2
            ctx.beginPath()
            ctx.moveTo(s.x + 2, s.y)
            ctx.lineTo(s.x + 2, s.y - 6)
            ctx.lineTo(s.x + 8, s.y - 4)
            ctx.stroke()
        } else {
            // Shimmering ambient warm dust spark
            ctx.fillStyle = '#fff4ca'
            ctx.beginPath()
            ctx.arc(s.x, s.y, s.size * 0.7, 0, Math.PI * 2)
            ctx.fill()
        }
    })
    ctx.restore()

    // Restore primary transformation frame
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
            initSkyElements()
        }
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    // Render tick loop
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

        const w = canvasRef.value.width
        const h = canvasRef.value.height

        updateEnvironment(dt, w, h)
        drawLofiScene(ctx, w, h)

        animationFrameId = requestAnimationFrame(render)
    }

    animationFrameId = requestAnimationFrame(render)

    // Bind Music state events
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
        
        audioData.bass += (tb - audioData.bass) * 0.18
        audioData.mid += (tm - audioData.mid) * 0.18
        audioData.high += (th - audioData.high) * 0.18
    }

    const updateTrack = (track) => {
        if (!track) return

        if (track.cover?.crop !== trackInfo.value?.cover?.crop) {
            isCoverLoaded.value = false
        }

        trackInfo.value = {
            title: track.title || 'Cozy Chills',
            artists: track.artists || (track.contributors?.primary?.map((a) => a.name).join(', ') || 'Lo-fi Beats'),
            cover: track.cover || null,
            duration: track.duration || 0,
            wave: track.wave && track.wave.length ? track.wave : []
        }
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
</script>

<style scoped>
.lofi-container {
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

.lofi-canvas {
    display: block;
    width: 100%;
    height: 100%;
    touch-action: none;
}

/* VIEWPORT ENGINE */
.lofi-viewport-wrapper {
    position: relative;
    flex-grow: 1;
    width: 100%;
    overflow: hidden;
    cursor: pointer;
}

/* WEATHER PILLS OVERLAY */
.cozy-overlay-toggles {
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 10;
    display: flex;
    gap: 8px;
}

.cozy-pill-btn {
    background: rgba(14, 15, 28, 0.72);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 99px;
    color: #ffffff;
    font-family: inherit;
    font-size: 11px;
    font-weight: 700;
    padding: 6px 14px;
    cursor: pointer;
    transition: all 0.15s ease-out;
}

.cozy-pill-btn:hover {
    background: rgba(14, 15, 28, 0.9);
    border-color: #ffaa66;
}

.cozy-pill-btn.is-active {
    background: #ffaa66;
    border-color: #ffaa66;
    color: #0d041c;
    box-shadow: 0 0 10px rgba(255, 170, 102, 0.5);
}

/* WATERCOLOR BUBBLE INFO */
.lofi-bubble-info {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 10;
    background: rgba(255, 117, 151, 0.18);
    border: 1px solid #ff7597;
    color: #ffb3c1;
    font-size: 12px;
    font-weight: 700;
    padding: 6px 12px;
    border-radius: 8px;
    backdrop-filter: blur(4px);
    animation: slide-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    pointer-events: none;
}

@keyframes slide-in {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

/* TOP TRACK PANEL */
.lofi-top-panel {
    width: 100%;
    height: 80px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    z-index: 10;
    padding: 0 20px;
    border-bottom: 2px solid rgba(255, 170, 102, 0.25);
    background: rgba(14, 11, 26, 0.96);
    flex-shrink: 0;
}

.lofi-track-card {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-grow: 1;
    min-width: 0;
}

.lofi-cover-wrapper {
    width: 52px;
    height: 52px;
    border-radius: 6px;
    overflow: hidden;
    background: #1c142e;
    border: 1px solid rgba(255, 117, 151, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.lofi-cover-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 0.25s;
}

.lofi-cover-img.is-loaded {
    opacity: 1;
}

.lofi-cover-placeholder {
    color: rgba(255, 117, 151, 0.5);
}

.lofi-track-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.lofi-track-title {
    font-size: 15px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 60vw;
    color: #ffffff;
}

.lofi-track-artist {
    font-size: 11px;
    opacity: 0.6;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 60vw;
    color: #ffaa66;
}

/* SYNTH RADIO CONSOLE DECK */
.lofi-console-deck {
    width: 100%;
    background: linear-gradient(180deg, #2d1e2f 0%, #170d18 100%);
    border-top: 3px solid #ffaa66;
    box-shadow: 0 -8px 24px rgba(255, 170, 102, 0.2);
    padding: 12px 16px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex-shrink: 0;
    z-index: 15;
}

/* ADJUSTMENTS & PRESETS */
.cozy-adjustments {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding-bottom: 12px;
    border-bottom: 1px dashed rgba(255, 170, 102, 0.2);
}

.cozy-slider-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.cozy-label {
    font-size: 10px;
    font-weight: 800;
    opacity: 0.6;
    letter-spacing: 1.5px;
    color: #ffaa66;
}

.slider-container {
    display: flex;
    align-items: center;
    gap: 12px;
}

.cozy-slider {
    flex-grow: 1;
    max-width: 320px;
    accent-color: #ffaa66;
    background: rgba(255, 255, 255, 0.08);
    border-radius: 4px;
    height: 6px;
    outline: none;
}

.slider-val {
    font-size: 11px;
    font-weight: 700;
    color: #ffffff;
    min-width: 35px;
}

/* PALETTE PRESET VIBES */
.cozy-quick-vibes {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 4px;
}

.vibe-preset-btn {
    padding: 5px 12px;
    border-radius: 6px;
    background: rgba(255, 170, 102, 0.05);
    border: 1px solid rgba(255, 170, 102, 0.2);
    color: rgba(255, 255, 255, 0.8);
    font-family: inherit;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s;
}

.vibe-preset-btn:hover {
    background: rgba(255, 170, 102, 0.12);
    border-color: #ffaa66;
}

.vibe-preset-btn.is-active {
    background: rgba(255, 170, 102, 0.2);
    border-color: #ffaa66;
    color: #ffaa66;
    box-shadow: 0 0 6px rgba(255, 170, 102, 0.4);
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
    background: rgba(255, 117, 151, 0.04);
    border: 1px solid rgba(255, 117, 151, 0.3);
    border-radius: 8px;
    color: #ff7597;
    cursor: pointer;
    padding: 0;
    transition: all 0.15s ease-out;
}


.media-deck-btn:active:not(:disabled) {
    transform: scale(0.93);
}

.media-deck-btn:disabled {
    opacity: 0.15;
    cursor: not-allowed;
}

.media-deck-btn.btn-like {
    color: #ff7597;
    border-color: rgba(255, 117, 151, 0.3);
}

.media-deck-btn.btn-like.is-liked {
    background: rgba(255, 117, 151, 0.25);
    border-color: #ff7597;
    color: #ff7597;
    box-shadow: 0 0 10px rgba(255, 117, 151, 0.6);
}

.media-deck-btn.btn-play-main {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border-color: #ffaa66;
    color: #ffaa66;
    background: rgba(255, 170, 102, 0.08);
    box-shadow: 0 0 6px rgba(255, 170, 102, 0.3);
}

.media-deck-btn.btn-play-main:hover:not(:disabled) {
    background: rgba(255, 170, 102, 0.2);
    border-color: #ffaa66;
    box-shadow: 0 0 12px rgba(255, 170, 102, 0.7);
}

.media-deck-btn.is-active {
    background: rgba(255, 117, 151, 0.2);
    border-color: #ff7597;
    box-shadow: 0 0 8px rgba(255, 117, 151, 0.5);
}
</style>