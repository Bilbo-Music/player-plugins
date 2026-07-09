<template>
    <div class="jbl-plugin-container" :class="[theme]">
        <canvas ref="canvasRef" class="jbl-canvas"></canvas>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { playerSdk } from '@bilbomusic/player-plugin-sdk'

// -----------------------------------------------------------------
// 1. STATE & CONSTANTS
// -----------------------------------------------------------------
const canvasRef = ref(null)
const theme = ref('dark') 
const isExpanded = ref(true)
const trackBpm = ref(90) 

let animationFrameId = null
let particles = []
const PARTICLE_COUNT = 10

let audioData = {
    bass: 0,
    mid: 0,
    high: 0
}

const colorsDark = [
    { r: 255, g: 0, b: 128 }, 
    { r: 0, g: 240, b: 255 }, 
    { r: 255, g: 100, b: 0 }, 
    { r: 150, g: 0, b: 255 }, 
    { r: 0, g: 255, b: 100 } 
]

const colorsLight = [
    { r: 255, g: 60, b: 110 }, 
    { r: 20, g: 130, b: 240 }, 
    { r: 255, g: 130, b: 0 }, 
    { r: 150, g: 50, b: 230 }, 
    { r: 0, g: 180, b: 110 } 
]

// -----------------------------------------------------------------
// 2. INITIALIZATION & LIFECYCLE
// -----------------------------------------------------------------
let handleCanvasResize = null;
const initCanvas = () => {
    const canvas = canvasRef.value
    if (!canvas) return
    
    handleCanvasResize = () => {
        canvas.width = canvas.parentElement.clientWidth
        canvas.height = canvas.parentElement.clientHeight
    }
    handleCanvasResize()
    window.addEventListener('resize', handleCanvasResize)
}

const setupParticles = () => {
    particles = []
    const palette = theme.value === 'light' ? colorsLight : colorsDark
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const color = palette[i % palette.length]
        particles.push({
            x: Math.random(),
            y: Math.random() * 0.6 + 0.4,
            radius: Math.random() * 80 + 80,
            baseRadius: Math.random() * 80 + 80,
            color: color,
            speedY: Math.random() * 0.0004 + 0.0002, 
            speedX: Math.random() * 0.001 - 0.0005,
            phase: Math.random() * Math.PI * 2
        })
    }
}

onMounted(() => {
    if (typeof playerSdk.setUiConfig === 'function') {
        playerSdk.setUiConfig({
            carousel: true,
            interactive: false,
            trackInfo: true,
            progressBar: true,
            controls: {
                like: true,
                dislike: true,
                playPause: true,
                next: true,
                prev: true
            },
            actions: {
                repeat: true,
                playlist: true
            },
            minimize: true 
        })
    }
    initCanvas()
    setupParticles()
    startAnimationLoop()
})

onBeforeUnmount(() => {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
    }

    playerSdk.off('init', onInit)
    playerSdk.off('open', onOpen)
    playerSdk.off('theme', onTheme)
    playerSdk.off('audioFrame', onAudioFrame, 'default')
    playerSdk.off('player', onPlayer)

    if (handleCanvasResize) {
        window.removeEventListener('resize', handleCanvasResize)
    }
})

// -----------------------------------------------------------------
// 3. SDK EVENT SUBSCRIPTIONS
// -----------------------------------------------------------------
const onInit = (state) => {
    console.log('[JBL Plugin] Initial state received:', state)
    if (state?.player) isExpanded.value = state.player.expanded !== false
    if (state?.theme) {
        theme.value = state.theme
        setupParticles() 
    }
    if (state?.panes?.default?.track) {
        trackBpm.value = state.panes.default.track.bpm || 90
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
        trackBpm.value = payload.track.bpm || 90
    }
}

const onTheme = (payload) => {
    if (payload && payload.theme) {
        theme.value = payload.theme
        setupParticles() 
    }
}

const onAudioFrame = (dataArray) => {
    if (!dataArray || !dataArray.length) return
    
    let bassSum = 0
    let midSum = 0
    let highSum = 0
    
    const bassEnd = Math.floor(dataArray.length * 0.15)
    const midEnd = Math.floor(dataArray.length * 0.6)
    
    for (let i = 0; i < dataArray.length; i++) {
        if (i < bassEnd) bassSum += dataArray[i]
        else if (i < midEnd) midSum += dataArray[i]
        else highSum += dataArray[i]
    }
    
    audioData.bass = Math.pow((bassSum / bassEnd) / 255, 1.5)
    audioData.mid = (midSum / (midEnd - bassEnd)) / 255
    audioData.high = (highSum / (dataArray.length - midEnd)) / 255
}

const onPlayer = (payload) => {
    if (payload && 'expanded' in payload) {
        const wasExpanded = isExpanded.value
        isExpanded.value = !!payload.expanded
        if (isExpanded.value && !wasExpanded) {
            cancelAnimationFrame(animationFrameId)
            startAnimationLoop()
        }
    }
}

playerSdk.on('init', onInit)
playerSdk.on('open', onOpen)
playerSdk.on('theme', onTheme)
playerSdk.on('audioFrame', onAudioFrame, 'default')
playerSdk.on('player', onPlayer)

// -----------------------------------------------------------------
// 4. ANIMATION LOOP & RENDERER
// -----------------------------------------------------------------
const startAnimationLoop = () => {
    const render = () => {
        if (!isExpanded.value) return
        const canvas = canvasRef.value
        if (!canvas) {
            animationFrameId = requestAnimationFrame(render)
            return
        }
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        
        const w = canvas.width
        const h = canvas.height
        
        if (theme.value === 'light') {
            ctx.fillStyle = '#f4f4f5' 
            ctx.fillRect(0, 0, w, h)
            ctx.globalCompositeOperation = 'multiply'
        } else {
            ctx.fillStyle = '#09090b' 
            ctx.fillRect(0, 0, w, h)
            ctx.globalCompositeOperation = 'screen'
        }
        
        const bpmMultiplier = trackBpm.value / 120
        
        particles.forEach((p) => {
            p.phase += 0.01 * bpmMultiplier
            
            const targetRadius = p.baseRadius + (audioData.bass * 180) + (audioData.high * 30)
            p.radius += (targetRadius - p.radius) * 0.2
            
            const currentSpeedY = (p.speedY + (audioData.mid * 0.003)) * bpmMultiplier
            p.y -= currentSpeedY
            p.x += (Math.sin(p.phase) * 0.0008 + p.speedX) * bpmMultiplier
            
            if (p.y < -0.3) {
                p.y = 1.3
                p.x = Math.random()
            }
            if (p.x < -0.1 || p.x > 1.1) p.speedX *= -1
            
            const pixelX = p.x * w
            const pixelY = p.y * h
            
            const gradient = ctx.createRadialGradient(
                pixelX, pixelY, 0,
                pixelX, pixelY, p.radius
            )
            
            const baseAlpha = theme.value === 'light' ? 0.65 : 0.6
            const dynamicAlpha = Math.min(baseAlpha + (audioData.bass * 0.35), 1.0)
            
            if (theme.value === 'light') {
                gradient.addColorStop(0, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${dynamicAlpha})`)
                gradient.addColorStop(0.3, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${dynamicAlpha * 0.5})`)
                gradient.addColorStop(0.7, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${dynamicAlpha * 0.15})`)
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
            } else {
                gradient.addColorStop(0, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${dynamicAlpha})`)
                gradient.addColorStop(0.4, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${dynamicAlpha * 0.4})`)
                gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
            }
            
            ctx.fillStyle = gradient
            ctx.beginPath()
            ctx.arc(pixelX, pixelY, p.radius, 0, Math.PI * 2)
            ctx.fill()
        })
        
        ctx.globalCompositeOperation = 'source-over'
        animationFrameId = requestAnimationFrame(render)
    }
    render()
}
</script>

<style scoped>
.jbl-plugin-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: -1; 
    overflow: hidden;
    transition: background-color 0.4s ease; 
    
    &.dark {
        background: #09090b;
    }
    
    &.light {
        background: #f4f4f5;
    }
}

.jbl-canvas {
    display: block;
    width: 100%;
    height: 100%;
    filter: blur(55px); 
    transform: scale(1.12); 
}
</style>
