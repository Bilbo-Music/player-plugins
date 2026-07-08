<template>
    <div class="winamp-desktop" id="winamp-desktop-root">
        <!-- RETRO DESKTOP ICONS -->
        <div class="desktop-icons" id="winamp-desktop-icons">
            <div class="desktop-icon" id="icon-mycomp">
                <div class="icon-pic">🖥️</div>
                <div class="icon-label">My Computer</div>
            </div>
            <div class="desktop-icon" id="icon-network">
                <div class="icon-pic">🌐</div>
                <div class="icon-label">Network Neighborhood</div>
            </div>
            <div class="desktop-icon" id="icon-trash">
                <div class="icon-pic">🗑️</div>
                <div class="icon-label">Recycle Bin</div>
            </div>
            <div class="desktop-icon active" id="icon-winamp">
                <div class="icon-pic">💾</div>
                <div class="icon-label">Winamp 2.8</div>
            </div>
        </div>

        <!-- WINAMP STACKED RACK CONTAINER -->
        <div class="winamp-rack" id="winamp-player-rack">
            <!-- 1. MAIN PLAYER DECK -->
            <div class="winamp-window winamp-main" id="winamp-main-deck">
                <!-- Window Title Bar -->
                <div class="winamp-title-bar" id="winamp-main-title">
                    <div class="title-logo">⚡</div>
                    <div class="title-text">WINAMP</div>
                    <div class="title-controls">
                        <button class="title-btn btn-min" title="Minimize" @click="playerSdk.collapse()" id="winamp-btn-min">_</button>
                        <button class="title-btn btn-max" title="Toggle Shade" id="winamp-btn-shade">▤</button>
                        <button class="title-btn btn-close" title="Close" @click="playerSdk.collapse()" id="winamp-btn-close">X</button>
                    </div>
                </div>

                <!-- LCD Display Area -->
                <div class="winamp-display" id="winamp-lcd-display">
                    <!-- Left Status/Info Info Column -->
                    <div class="display-status-col" id="winamp-lcd-status">
                        <div class="scrolling-marquee" id="winamp-marquee-container">
                            <span class="marquee-text" id="winamp-marquee-inner">
                                {{ marqueeText }}
                            </span>
                        </div>
                        
                        <div class="audio-metrics" id="winamp-audio-metrics">
                            <span class="kbps">{{ kbpsText }}</span>
                            <span class="khz">{{ khzText }}</span>
                        </div>

                        <!-- Stereo/Mono Indicator LEDs -->
                        <div class="led-indicators" id="winamp-led-indicators">
                            <span class="led-text" :class="{ active: playerState === 'playing' }">ST</span>
                            <span class="led-text" :class="{ active: playerState !== 'playing' }">MO</span>
                        </div>
                    </div>

                    <!-- Time & Visualizer Column -->
                    <div class="display-main-col" id="winamp-lcd-main">
                        <!-- Digital Segment Time Display -->
                        <div class="time-display" @click="toggleTimeDisplay" title="Click to toggle elapsed/remaining" id="winamp-time-display">
                            <span class="time-digit font-digital">{{ displayTime }}</span>
                        </div>

                        <!-- Canvas Frequency / Oscilloscope Visualizer -->
                        <div class="visualizer-wrapper" @click="toggleVisualizerMode" title="Click to toggle Spectrum / Oscilloscope" id="winamp-vis-wrapper">
                            <canvas ref="canvasRef" class="visualizer-canvas" id="winamp-vis-canvas"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Controls Console (Volume, Balance, Equalizer presets) -->
                <div class="winamp-sliders" id="winamp-sliders-deck">
                    <div class="slider-row" id="winamp-slider-volume-row">
                        <div class="slider-label">VOL:</div>
                        <div class="slider-track" id="winamp-vol-track">
                            <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                v-model="volumeLevel" 
                                @input="handleVolumeChange"
                                class="winamp-range" 
                                id="winamp-vol-slider"
                            />
                            <div class="slider-fill vol-fill" :style="{ width: volumeLevel + '%' }"></div>
                        </div>
                        <div class="slider-value-text">{{ volumeLevel }}%</div>
                    </div>

                    <div class="slider-row" id="winamp-slider-balance-row">
                        <div class="slider-label">BAL:</div>
                        <div class="slider-track" id="winamp-bal-track">
                            <input 
                                type="range" 
                                min="-50" 
                                max="50" 
                                v-model="balanceLevel" 
                                class="winamp-range" 
                                id="winamp-bal-slider"
                            />
                            <div class="slider-fill bal-fill" :style="{ left: 'calc(50% + ' + (balanceLevel * 0.9) + 'px)' }"></div>
                        </div>
                        <div class="slider-value-text">{{ balanceLabel }}</div>
                    </div>
                </div>

                <!-- Timeline / Progress Scrub bar -->
                <div class="winamp-timeline-panel" id="winamp-timeline-panel">
                    <div class="timeline-container" id="winamp-timeline-container">
                        <input 
                            type="range" 
                            min="0" 
                            :max="trackInfo.duration || 1000" 
                            v-model.number="playbackPosition" 
                            @change="handleSeek"
                            @input="isSeeking = true"
                            class="winamp-timeline-range" 
                            id="winamp-timeline-slider"
                        />
                        <div class="timeline-progress-bar" :style="{ width: timelinePercentage + '%' }"></div>
                    </div>
                </div>

                <!-- Core Media Controls Grid -->
                <div class="winamp-controls" id="winamp-controls-grid">
                    <button class="ctrl-btn btn-prev" @click="playerSdk.prev()" title="Previous" id="winamp-btn-prev">
                        <span>⏮</span>
                    </button>
                    <button class="ctrl-btn btn-play" :class="{ active: playerState === 'playing' }" @click="playerSdk.play()" title="Play" id="winamp-btn-play">
                        <span>▶</span>
                    </button>
                    <button class="ctrl-btn btn-pause" :class="{ active: playerState === 'paused' }" @click="playerSdk.pause()" title="Pause" id="winamp-btn-pause">
                        <span>⏸</span>
                    </button>
                    <button class="ctrl-btn btn-stop" @click="handleStop" title="Stop" id="winamp-btn-stop">
                        <span>■</span>
                    </button>
                    <button class="ctrl-btn btn-next" @click="playerSdk.next()" title="Next" id="winamp-btn-next">
                        <span>⏭</span>
                    </button>
                    <button class="ctrl-btn btn-eject" @click="triggerEject" title="Eject (Mock Upload)" id="winamp-btn-eject">
                        <span>⏏</span>
                    </button>
                </div>

                <!-- Extra Shuf/Rep Indicators -->
                <div class="extra-controls" id="winamp-extra-controls">
                    <button class="extra-btn" :class="{ active: shuffleActive }" @click="toggleShuffle" title="Toggle Shuffle (Aesthetic)" id="winamp-btn-shuffle">SHUF</button>
                    <button class="extra-btn" :class="{ active: repeat !== 'none' }" @click="handleRepeatToggle" title="Toggle Repeat Mode" id="winamp-btn-repeat">REP</button>
                    <span class="clutter-brand">WINAMP v2.82</span>
                </div>
            </div>

            <!-- 2. GRAPHIC EQUALIZER DECK -->
           <!--  <div class="winamp-window winamp-eq" id="winamp-eq-deck">
                <div class="winamp-title-bar" id="winamp-eq-title">
                    <div class="title-logo">🎚️</div>
                    <div class="title-text">WINAMP EQUALIZER</div>
                </div>

                <div class="eq-controls" id="winamp-eq-sliders-container">
                    <div class="eq-header-buttons">
                        <button class="eq-preset-btn" @click="resetEq" id="winamp-eq-btn-reset">FLAT</button>
                        <button class="eq-preset-btn" @click="presetEq('rock')" id="winamp-eq-btn-rock">ROCK</button>
                        <button class="eq-preset-btn" @click="presetEq('techno')" id="winamp-eq-btn-techno">TECHNO</button>
                    </div>

                    <div class="eq-sliders-grid">
                        <div class="eq-slider-col" v-for="(slider, index) in eqSliders" :key="index">
                            <span class="eq-val">{{ slider.value > 0 ? '+' : '' }}{{ slider.value }}</span>
                            <div class="eq-slider-track">
                                <input 
                                    type="range" 
                                    min="-12" 
                                    max="12" 
                                    v-model.number="slider.value" 
                                    class="eq-range-input" 
                                />
                            </div>
                            <span class="eq-label">{{ slider.freq }}</span>
                        </div>
                    </div>
                </div>
            </div> -->

            <!-- 3. PLAYLIST EDITOR WINDOW -->
            <div class="winamp-window winamp-playlist" id="winamp-playlist-deck">
                <!-- Title Bar -->
                <div class="winamp-title-bar" id="winamp-playlist-title">
                    <div class="title-logo">📋</div>
                    <div class="title-text">{{ playlistTitle }}</div>
                    <div class="playlist-count-badge" id="winamp-playlist-badge">
                        {{ tracksToShow.length }} tracks
                    </div>
                </div>

                <!-- Playlist Search and Filter bar -->
                <div class="playlist-search-bar" id="winamp-playlist-search-row">
                    <span class="search-icon">🔍</span>
                    <input 
                        type="text" 
                        v-model="searchQuery" 
                        placeholder="Search playlist tracks..." 
                        class="playlist-search-input" 
                        id="winamp-playlist-search-input"
                    />
                    <button v-if="searchQuery" class="clear-search-btn" @click="searchQuery = ''">X</button>
                </div>

                <!-- Tracks list area -->
                <div class="playlist-tracks-container" id="winamp-playlist-tracks-list">
                    <div 
                        v-for="(track, index) in filteredTracks" 
                        :key="index"
                        class="playlist-track-row"
                        :class="{ active: isCurrentPlaying(track, index) }"
                        @click="playPlaylistTrack(index)"
                        id="winamp-track-row"
                    >
                        <div class="track-index-num">
                            <span v-if="isCurrentPlaying(track, index)" class="playing-bullet">▶</span>
                            <span v-else>{{ (index + 1).toString().padStart(2, '0') }}.</span>
                        </div>
                        <div class="track-main-info">
                            <span class="track-row-title">{{ track.title }}</span>
                            <span class="track-row-divider">-</span>
                            <span class="track-row-artist">{{ track.artists }}</span>
                        </div>
                        <div class="track-row-duration">
                            {{ formatTime(track.duration) }}
                        </div>
                    </div>

                    <div v-if="filteredTracks.length === 0" class="empty-playlist-msg">
                        No matching tracks found.
                    </div>
                </div>

                <!-- Playlist footer buttons -->
                <div class="playlist-footer-panel" id="winamp-playlist-footer">
                    <div class="footer-buttons-left">
                        <button class="footer-action-btn" @click="triggerEject" title="Add files to playlist" id="winamp-pl-btn-add">+ ADD</button>
                        <button class="footer-action-btn" @click="clearPlaylistMock" title="Clear playlist list" id="winamp-pl-btn-rem">- REM</button>
                        <button class="footer-action-btn" @click="searchQuery = ''" title="Reset filters" id="winamp-pl-btn-sel">RESET</button>
                    </div>
                    <div class="playlist-duration-summary" id="winamp-pl-summary">
                        {{ totalPlaylistDuration }}
                    </div>
                </div>
            </div>
        </div>

        <!-- MOCK NOTIFICATION OVERLAY -->
        <div v-if="toastMessage" class="winamp-toast" id="winamp-toast-msg">
            <div class="toast-header">WINAMP WARNING</div>
            <div class="toast-body">{{ toastMessage }}</div>
            <button class="toast-btn" @click="toastMessage = ''">OK</button>
        </div>

        <!-- WIN95 STYLE TASKBAR -->
        <div class="win95-taskbar" id="win95-taskbar-panel">
            <button class="win95-start-btn" @click="toggleCollapse" id="win95-start-btn">
                <span class="start-logo">💾</span> Start
            </button>
            <div class="taskbar-tabs">
                <div class="taskbar-tab" :class="{ active: isExpanded }" @click="toggleCollapse" style="cursor: pointer;">
                    <span class="tab-icon">⚡</span> Winamp v2.82
                </div>
            </div>
            <div class="taskbar-tray">
                <span class="tray-icon">🔊</span>
                <span class="tray-clock">{{ trayClockTime }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { playerSdk } from '@bilbomusic/player-plugin-sdk'

// Base reactive elements
const theme = ref('dark')
const isExpanded = ref(true)
const playerState = ref('paused')
const reaction = ref('')
const repeat = ref('none')
const isCoverLoaded = ref(false)

const nextDisabled = ref(false)
const prevDisabled = ref(true)
const hasQueue = ref(false)

const volumeLevel = ref(85)
const balanceLevel = ref(0)
const shuffleActive = ref(false)
const toastMessage = ref('')
const searchQuery = ref('')
const selectedTrackIndex = ref(-1)

// Time and position
const playbackPosition = ref(0)
const isSeeking = ref(false)
const showRemainingTime = ref(false)

const trackInfo = ref({
    title: 'Winamp Chills',
    artists: 'Justin Frankel',
    cover: null,
    duration: 184000,
    wave: []
})

// Playlist and tracks from Bilbo Music SDK
const playlistTracks = ref([])
const playlistTitle = ref('Winamp Playlist')

// Visualizer Canvas Configuration
const canvasRef = ref(null)
let animationFrameId = null
const visualizerMode = ref('spectrum') // 'spectrum' | 'oscilloscope'
const frequencies = ref(new Array(32).fill(0))
const peaks = ref(new Array(32).fill(0))

// Graphics Equalizer Sliders
const eqSliders = ref([
    { freq: '60Hz', value: 3 },
    { freq: '170Hz', value: 5 },
    { freq: '310Hz', value: 2 },
    { freq: '600Hz', value: -1 },
    { freq: '1kHz', value: -3 },
    { freq: '3kHz', value: 1 },
    { freq: '6kHz', value: 4 },
    { freq: '12kHz', value: 6 },
    { freq: '14kHz', value: 5 },
    { freq: '16kHz', value: 3 }
])

// Local clock time for the taskbar tray
const trayClockTime = ref('12:00 PM')
let clockInterval = null

// Computed Values
const marqueeText = computed(() => {
    const currentNum = '1'
    const title = trackInfo.value.title || 'Unknown Title'
    const artist = trackInfo.value.artists || 'Unknown Artist'
    const duration = formatTime(trackInfo.value.duration)
    return `*** ${currentNum}. ${artist} - ${title} (${duration}) - Winamp Classic ***  `
})

const kbpsText = computed(() => {
    if (playerState.value === 'playing') {
        const bpm = trackInfo.value.bpm ? `${trackInfo.value.bpm} BPM` : '192 kbps'
        return bpm
    }
    return '0 kbps'
})

const khzText = computed(() => {
    if (playerState.value === 'playing') {
        return '44 khz'
    }
    return '0 khz'
})

const balanceLabel = computed(() => {
    if (balanceLevel.value === 0) return 'C'
    if (balanceLevel.value < 0) return 'L' + Math.abs(balanceLevel.value)
    return 'R' + balanceLevel.value
})

const timelinePercentage = computed(() => {
    const duration = trackInfo.value.duration || 1000
    return Math.min(100, Math.max(0, (playbackPosition.value / duration) * 100))
})

const displayTime = computed(() => {
    if (showRemainingTime.value) {
        const remaining = Math.max(0, (trackInfo.value.duration || 0) - playbackPosition.value)
        return `-${formatTime(remaining)}`
    } else {
        return formatTime(playbackPosition.value)
    }
})

// Fallback logic to show at least current song if the queue is empty
const tracksToShow = computed(() => {
    if (playlistTracks.value && playlistTracks.value.length > 0) {
        return playlistTracks.value
    } else if (trackInfo.value && trackInfo.value.title !== 'Waiting for track...') {
        return [trackInfo.value]
    }
    return []
})

// Search query filtering for playlist
const filteredTracks = computed(() => {
    const query = searchQuery.value.toLowerCase().trim()
    if (!query) return tracksToShow.value
    return tracksToShow.value.filter(t => 
        t.title.toLowerCase().includes(query) || 
        t.artists.toLowerCase().includes(query)
    )
})

// Sum up total playlist duration
const totalPlaylistDuration = computed(() => {
    const totalMs = tracksToShow.value.reduce((sum, track) => sum + (track.duration || 0), 0)
    const totalSeconds = Math.floor(totalMs / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

// Helper methods
const formatTime = (ms) => {
    if (!ms || isNaN(ms)) return '00:00'
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

const toggleTimeDisplay = () => {
    showRemainingTime.value = !showRemainingTime.value
}

const toggleVisualizerMode = () => {
    visualizerMode.value = visualizerMode.value === 'spectrum' ? 'oscilloscope' : 'spectrum'
}

const toggleShuffle = () => {
    shuffleActive.value = !shuffleActive.value
    showToast('Shuffle Mode: Shuffling algorithm loaded into Winamp Engine.')
}

const handleRepeatToggle = () => {
    const nextRepeat = repeat.value === 'none' ? 'track' : 'none'
    playerSdk.repeat(nextRepeat)
}

const handleSeek = () => {
    isSeeking.value = false
    playerSdk.seek(playbackPosition.value)
}

const handleVolumeChange = () => {
    // Winamp aesthetics: volume level changed!
}

const handleStop = () => {
    playerSdk.pause()
    playerSdk.seek(0)
    playbackPosition.value = 0
}

const triggerEject = () => {
    showToast('Winamp Eject: Drop an .mp3, .wav, or .mod file onto the deck to mount or queue!')
}

const clearPlaylistMock = () => {
    showToast('Queue Cleared: Winamp queue editor refreshed.')
}

const showToast = (msg) => {
    toastMessage.value = msg
    setTimeout(() => {
        if (toastMessage.value === msg) {
            toastMessage.value = ''
        }
    }, 5000)
}

const resetEq = () => {
    eqSliders.value.forEach(s => s.value = 0)
}

const presetEq = (genre) => {
    if (genre === 'rock') {
        const rockVals = [4, 5, 3, -1, -2, -1, 1, 3, 5, 4]
        eqSliders.value.forEach((s, idx) => s.value = rockVals[idx])
    } else if (genre === 'techno') {
        const techVals = [6, 5, 2, 0, -2, 3, 5, 6, 5, 4]
        eqSliders.value.forEach((s, idx) => s.value = techVals[idx])
    }
}

// Check if a specific track is currently playing
const isCurrentPlaying = (track, index) => {
    // If we have items in our playlistTracks, check title matches
    if (playlistTracks.value && playlistTracks.value.length > 0) {
        return track.title === trackInfo.value.title && track.artists === trackInfo.value.artists
    }
    // Otherwise, fallback is just showing the active song
    return true
}

// play song by playlist index click
const playPlaylistTrack = (index) => {
    if (playlistTracks.value && playlistTracks.value.length > 0) {
        playerSdk.playQueueIndex(index)
    } else {
        // only 1 song available
        playerSdk.play()
    }
}

const toggleCollapse = () => {
    if (isExpanded.value) {
        playerSdk.collapse()
        isExpanded.value = false
    } else {
        playerSdk.expand()
        isExpanded.value = true
    }
}

// Update local time
const updateClock = () => {
    const now = new Date()
    let hours = now.getHours()
    const minutes = now.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    hours = hours ? hours : 12 // the hour '0' should be '12'
    const minStr = minutes.toString().padStart(2, '0')
    trayClockTime.value = `${hours}:${minStr} ${ampm}`
}

// Winamp Rendering Engine for Visualizer
const drawVisualizer = (ctx, w, h) => {
    ctx.clearRect(0, 0, w, h)
    
    // Grid pattern backdrop
    ctx.strokeStyle = 'rgba(0, 30, 0, 0.15)'
    ctx.lineWidth = 1
    const gridSpacing = 4
    for (let x = 0; x < w; x += gridSpacing) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, h)
        ctx.stroke()
    }
    for (let y = 0; y < h; y += gridSpacing) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
    }

    const isPlaying = playerState.value === 'playing'

    if (visualizerMode.value === 'spectrum') {
        // 1. CLASSIC LED SPECTRUM ANALYZER
        const barCount = 18
        const gap = 2
        const barW = Math.floor(w / barCount) - gap
        
        for (let i = 0; i < barCount; i++) {
            // Map bar index to frequency array (we have 32 bins)
            const freqIdx = Math.floor((i / barCount) * frequencies.value.length)
            let val = frequencies.value[freqIdx] || 0
            
            // Add slight jitter for aesthetic excitement when playing
            if (isPlaying) {
                val = Math.max(val, (val * 0.7) + Math.random() * 40)
            } else {
                // slow decay
                val = Math.max(0, val - 4)
            }

            // Calculate heights
            const maxH = h - 2
            const barH = Math.min(maxH, (val / 255) * maxH)
            
            // Peak indicator handling
            if (barH >= peaks.value[i]) {
                peaks.value[i] = barH
            } else {
                peaks.value[i] = Math.max(0, peaks.value[i] - 0.4) // fall speed
            }

            const x = i * (barW + gap) + 2

            // Draw LED Segments
            const numSegments = 10
            const segmentH = Math.floor(maxH / numSegments)
            
            for (let s = 0; s < numSegments; s++) {
                const segY = h - (s * segmentH) - segmentH
                const currentSegH = s * segmentH
                
                if (currentSegH <= barH) {
                    // Color coding: green -> yellow -> red
                    if (s > 7) {
                        ctx.fillStyle = '#ff2222' // Red peak
                    } else if (s > 5) {
                        ctx.fillStyle = '#ffaa00' // Orange mid
                    } else {
                        ctx.fillStyle = '#00ff33' // Green bass/lows
                    }
                    ctx.fillRect(x, segY + 1, barW, segmentH - 1)
                }
            }

            // Draw floating peak indicator line
            if (peaks.value[i] > 0) {
                const peakY = Math.floor(h - peaks.value[i])
                ctx.fillStyle = '#ffffff'
                ctx.fillRect(x, peakY, barW, 1)
            }
        }
    } else {
        // 2. RETRO HORIZONTAL OSCILLOSCOPE
        ctx.beginPath()
        ctx.strokeStyle = '#00ff44'
        ctx.shadowColor = '#00ff44'
        ctx.shadowBlur = 3
        ctx.lineWidth = 1.5

        for (let i = 0; i < w; i++) {
            const freqIdx = Math.floor((i / w) * frequencies.value.length)
            const val = frequencies.value[freqIdx] || 0
            
            // Oscilloscope formula: synthesize sine wave modulated by actual volume
            const scale = isPlaying ? (val / 255) : 0.08
            const wave = Math.sin(i * 0.16 + Date.now() * 0.04) * (h / 2.5) * scale
            const y = (h / 2) + wave

            if (i === 0) ctx.moveTo(i, y)
            else ctx.lineTo(i, y)
        }
        ctx.stroke()
        ctx.shadowBlur = 0 // Reset
    }
}

onMounted(() => {
    // Optimize player settings so iframe functions correctly
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

    // 1. Initialize clock interval
    updateClock()
    clockInterval = setInterval(updateClock, 1000)

    // 2. Setup canvas drawing loop
    const canvas = canvasRef.value
    if (canvas) {
        canvas.width = 175
        canvas.height = 36
    }

    const render = () => {
        if (!isExpanded.value) return
        const ctx = canvasRef.value?.getContext('2d')
        if (ctx && canvasRef.value) {
            drawVisualizer(ctx, canvasRef.value.width, canvasRef.value.height)
        }
        // Slowly decay frequencies in background if paused
        if (playerState.value !== 'playing') {
            frequencies.value = frequencies.value.map(f => f * 0.94)
        }
        animationFrameId = requestAnimationFrame(render)
    }
    render()

    // 3. Audio reaction handler
    const onAudioFrame = (dataArray) => {
        if (dataArray && dataArray.length && playerState.value === 'playing') {
            // Downsample array to 32 elements to match Winamp visualizer bins
            const downsampled = []
            const step = Math.floor(dataArray.length / 32) || 1
            for (let i = 0; i < 32; i++) {
                const val = dataArray[i * step] || 0
                downsampled.push(val)
            }
            frequencies.value = downsampled
        }
    }

    // 4. Set up SDK connection & state synchronization
    const updateTrack = (track) => {
        if (!track) return
        isCoverLoaded.value = false
        trackInfo.value = {
            title: track.title || 'Winamp Jam',
            artists: track.artists || (track.contributors?.primary?.map((a) => a.name).join(', ') || 'Chiptune Artist'),
            cover: track.cover || null,
            duration: track.duration || 180000,
            bpm: track.bpm || null,
            wave: track.wave && track.wave.length ? track.wave : []
        }
        
        // Highlight track in playlist
        if (playlistTracks.value && playlistTracks.value.length > 0) {
            const idx = playlistTracks.value.findIndex(t => t.title === track.title)
            if (idx !== -1) {
                selectedTrackIndex.value = idx
            }
        }
    }

    const updateQueue = (queue) => {
        if (queue && queue.items) {
            playlistTracks.value = queue.items
            if (queue.playlist) {
                playlistTitle.value = queue.playlist.name || 'Winamp Playlist'
            } else if (queue.release) {
                playlistTitle.value = queue.release.title || 'Winamp Playlist'
            } else {
                playlistTitle.value = 'Winamp Active Queue'
            }
        }
    }

    const onInit = (state) => {
        if (state?.theme) theme.value = state.theme
        if (state?.player?.expanded !== undefined) {
            isExpanded.value = state.player.expanded
        }
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
        if (state?.panes?.default?.queue) {
            updateQueue(state.panes.default.queue)
        }
        if (state?.panes?.default?.position !== undefined) {
            playbackPosition.value = state.panes.default.position
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

    const onQueue = (payload) => {
        if (payload) {
            updateQueue(payload)
        }
    }

    const onPosition = (payload) => {
        if (payload?.position !== undefined && !isSeeking.value) {
            playbackPosition.value = payload.position
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

    const onPlayer = (payload) => {
        if (payload?.expanded !== undefined) {
            const wasExpanded = isExpanded.value
            isExpanded.value = payload.expanded
            if (isExpanded.value && !wasExpanded) {
                cancelAnimationFrame(animationFrameId)
                animationFrameId = requestAnimationFrame(render)
            }
        }
    }

    const onChange = ({ pane, type, payload }) => {
        if (pane !== 'default') return
        if (type === 'track') updateTrack(payload?.track)
        if (type === 'state') playerState.value = payload?.state
        if (type === 'queue') updateQueue(payload)
        if (type === 'position' && !isSeeking.value) playbackPosition.value = payload?.position
        if (type === 'prevDisabled') prevDisabled.value = payload?.value
        if (type === 'nextDisabled') nextDisabled.value = payload?.value
        if (type === 'hasQueue') hasQueue.value = payload?.value
    }

    // Subscribing to all SDK event variations for complete safety
    playerSdk.on('init', onInit)
    playerSdk.on('open', onOpen)
    playerSdk.on('state', onState)
    playerSdk.on('queue', onQueue)
    playerSdk.on('position', onPosition)
    playerSdk.on('theme', onTheme)
    playerSdk.on('reaction', onReaction)
    playerSdk.on('repeat', onRepeat)
    playerSdk.on('player', onPlayer)
    playerSdk.on('change', onChange)
    playerSdk.on('audioFrame', onAudioFrame)

    // Clean up observers
    onBeforeUnmount(() => {
        clearInterval(clockInterval)
        cancelAnimationFrame(animationFrameId)

        playerSdk.off('init', onInit)
        playerSdk.off('open', onOpen)
        playerSdk.off('state', onState)
        playerSdk.off('queue', onQueue)
        playerSdk.off('position', onPosition)
        playerSdk.off('theme', onTheme)
        playerSdk.off('reaction', onReaction)
        playerSdk.off('repeat', onRepeat)
        playerSdk.off('player', onPlayer)
        playerSdk.off('change', onChange)
        playerSdk.off('audioFrame', onAudioFrame)
    })
})
</script>

<style scoped>
/* 95 DESKTOP BACKDROP */
.winamp-desktop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: #008080; /* Windows 95 Teal */
    background-image: radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 0);
    background-size: 16px 16px;
    overflow: hidden;
    font-family: 'Courier New', Courier, monospace;
    image-rendering: pixelated;
    user-select: none;
    z-index: 10;
}

/* DESKTOP RETRO ICONS */
.desktop-icons {
    position: absolute;
    top: 24px;
    left: 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    z-index: 11;
}

.desktop-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 80px;
    text-align: center;
    cursor: pointer;
    color: #ffffff;
}

.desktop-icon .icon-pic {
    font-size: 28px;
    margin-bottom: 4px;
    filter: drop-shadow(1px 2px 0px rgba(0,0,0,0.4));
}

.desktop-icon .icon-label {
    font-size: 10px;
    background: transparent;
    padding: 2px 4px;
    border-radius: 2px;
    text-shadow: 1px 1px 1px #000;
    white-space: normal;
    word-break: break-word;
}

.desktop-icon.active .icon-label {
    background-color: #000080; /* Win95 Active blue */
    outline: 1px dotted #ffea00;
}

/* WINAMP RACK CONTAINER */
.winamp-rack {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    gap: 12px;
    z-index: 20;
    width: 290px;
    max-width: 95vw;
}

/* UNIVERSAL RETRO WINAMP WINDOW STYLE */
.winamp-window {
    background: linear-gradient(135deg, #2a2a2d 0%, #171719 100%);
    border: 3px solid #3d3d42;
    border-top-color: #616167;
    border-left-color: #616167;
    border-bottom-color: #111112;
    border-right-color: #111112;
    box-shadow: 2px 4px 10px rgba(0, 0, 0, 0.7);
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    padding: 4px;
}

/* WINAMP LCD DIGITAL DISPLAY */
.winamp-display {
    background-color: #0c0d0a;
    border: 2px inset #222225;
    border-radius: 3px;
    padding: 6px;
    display: flex;
    gap: 8px;
    height: 60px;
    margin-bottom: 6px;
}

/* LED STATUS PANELS */
.display-status-col {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-width: 0;
}

.scrolling-marquee {
    background-color: #051405;
    border: 1px solid #112811;
    height: 16px;
    overflow: hidden;
    position: relative;
    border-radius: 2px;
}

.marquee-text {
    position: absolute;
    white-space: nowrap;
    font-size: 9px;
    color: #39ff14; /* Green Neon */
    text-shadow: 0 0 2px rgba(57, 255, 20, 0.5);
    font-family: monospace;
    font-weight: bold;
    animation: scroll-left 15s linear infinite;
}

@keyframes scroll-left {
    0% { transform: translateX(100%); }
    100% { transform: translateX(-100%); }
}

.audio-metrics {
    display: flex;
    gap: 4px;
    font-size: 8px;
    color: #ffaa00; /* Amber Neon */
    font-weight: bold;
}

.led-indicators {
    display: flex;
    gap: 6px;
}

.led-text {
    font-size: 8px;
    color: #313d31;
    font-weight: 800;
    transition: color 0.15s ease;
}

.led-text.active {
    color: #39ff14;
    text-shadow: 0 0 4px rgba(57, 255, 20, 0.7);
}

/* TIME & CANVAS AREA */
.display-main-col {
    width: 175px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.time-display {
    text-align: right;
    height: 20px;
    cursor: pointer;
    display: flex;
    justify-content: flex-end;
    align-items: center;
}

.time-digit {
    font-size: 18px;
    color: #39ff14;
    text-shadow: 0 0 4px rgba(57, 255, 20, 0.6);
    font-weight: bold;
    letter-spacing: 1px;
}

/* VISUALIZER DOCK */
.visualizer-wrapper {
    background-color: #050a05;
    border: 1px solid #1c2e1c;
    height: 28px;
    overflow: hidden;
    cursor: pointer;
    border-radius: 1px;
}

.visualizer-canvas {
    width: 100%;
    height: 100%;
    display: block;
}

/* WINAMP RANGE SLIDERS */
.winamp-sliders {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 6px;
}

.slider-row {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 8px;
    font-weight: bold;
    color: #8b8b92;
}

.slider-label {
    width: 24px;
}

.slider-track {
    flex-grow: 1;
    height: 8px;
    background-color: #0b0c0e;
    border: 1px inset #2a2c32;
    position: relative;
    border-radius: 2px;
    display: flex;
    align-items: center;
}

.winamp-range {
    -webkit-appearance: none;
    width: 100%;
    height: 100%;
    background: transparent;
    outline: none;
    position: absolute;
    z-index: 5;
    cursor: pointer;
    margin: 0;
}

.winamp-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 14px;
    height: 8px;
    background-color: #8a1414; /* Red classic handle */
    border: 1px solid #ff4444;
    border-radius: 1px;
    box-shadow: 0 1px 1px #000;
}

.slider-fill {
    height: 100%;
    background: linear-gradient(to right, #00ff33, #ffaa00, #ff2222);
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    border-radius: 2px;
}

.slider-value-text {
    width: 32px;
    text-align: right;
    color: #39ff14;
}

/* WINAMP TIMELINE / SCRUBBER */
.winamp-timeline-panel {
    margin-bottom: 8px;
}

.timeline-container {
    height: 10px;
    background-color: #08090b;
    border: 1px inset #24262b;
    position: relative;
    border-radius: 1px;
    display: flex;
    align-items: center;
}

.winamp-timeline-range {
    -webkit-appearance: none;
    width: 100%;
    height: 100%;
    background: transparent;
    outline: none;
    position: absolute;
    z-index: 5;
    cursor: pointer;
    margin: 0;
}

.winamp-timeline-range::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px;
    height: 8px;
    background-color: #cbd5e1;
    border: 1px solid #475569;
    border-radius: 1px;
    box-shadow: 0 1px 1px #000;
}

.timeline-progress-bar {
    height: 100%;
    background-color: #3b82f6;
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
}

/* RETRO BUTTON CONTROLS */
.winamp-controls {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 4px;
    margin-bottom: 6px;
}

.ctrl-btn {
    background: linear-gradient(to bottom, #4c4c52 0%, #2b2b2f 100%);
    border: 2px solid #5d5d64;
    border-bottom-color: #1a1a1c;
    border-right-color: #1a1a1c;
    color: #ffffff;
    font-size: 11px;
    height: 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
}

.ctrl-btn:active, .ctrl-btn.active {
    background: #111112;
    border-color: #111112;
    border-top-color: #050505;
    border-left-color: #050505;
    color: #39ff14;
}

/* EXTRA SHUFFLE/REPEAT PANEL */
.extra-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 8px;
    font-weight: bold;
    color: #72727a;
    border-top: 1px solid #2e2e32;
    padding-top: 4px;
}

.extra-btn {
    background: #111112;
    border: 1px solid #2e2e32;
    color: #55555c;
    font-size: 8px;
    font-weight: bold;
    padding: 1px 4px;
    cursor: pointer;
    border-radius: 1px;
}

.extra-btn.active {
    color: #ffaa00;
    border-color: #ffaa00;
    text-shadow: 0 0 3px rgba(255,170,0,0.5);
}

.clutter-brand {
    letter-spacing: 0.5px;
}

/* WINDOWS TITLE BAR (GENERIC CLASSIC) */
.winamp-title-bar {
    background: linear-gradient(to right, #000080, #1084d0); /* Classic Windows Blue Gradient */
    color: #ffffff;
    font-size: 9px;
    font-weight: bold;
    height: 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 4px;
    margin-bottom: 4px;
    border: 1px solid rgba(255,255,255,0.15);
}

.title-logo {
    font-size: 8px;
}

.title-text {
    flex-grow: 1;
    padding-left: 6px;
    letter-spacing: 1px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.title-controls {
    display: flex;
    gap: 2px;
}

.title-btn {
    background-color: #9c9c9c;
    border: 1px solid #dfdfdf;
    border-bottom-color: #404040;
    border-right-color: #404040;
    font-size: 7px;
    width: 10px;
    height: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    font-weight: bold;
}

/* GRAPHIC EQUALIZER CONTROLS */
.eq-controls {
    padding: 4px 2px;
}

.eq-header-buttons {
    display: flex;
    gap: 6px;
    margin-bottom: 6px;
}

.eq-preset-btn {
    background: linear-gradient(to bottom, #444 0%, #222 100%);
    border: 1px solid #555;
    border-bottom-color: #000;
    border-right-color: #000;
    color: #ccc;
    font-size: 8px;
    padding: 2px 6px;
    cursor: pointer;
    font-weight: bold;
}

.eq-preset-btn:active {
    background: #111;
    border-color: #111;
}

.eq-sliders-grid {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    gap: 2px;
    height: 75px;
}

.eq-slider-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    font-size: 7px;
}

.eq-val {
    color: #ffaa00;
    font-weight: bold;
}

.eq-slider-track {
    height: 48px;
    background-color: #0c0d0a;
    position: relative;
    width: 4px;
    border-radius: 2px;
}

.eq-range-input {
    -webkit-appearance: none;
    transform: rotate(-90deg);
    width: 48px;
    height: 4px;
    background: transparent;
    outline: none;
    position: absolute;
    top: 22px;
    left: -22px;
    cursor: pointer;
}

.eq-range-input::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 8px;
    height: 8px;
    background-color: #39ff14;
    border-radius: 50%;
    border: 1px solid #ffffff;
}

.eq-label {
    color: #8b8b92;
    font-size: 6px;
    transform: scale(0.9);
}

/* PLAYLIST WINDOW SPECIAL STYLE */
.playlist-count-badge {
    font-size: 8px;
    background-color: #1e1e1e;
    padding: 1px 4px;
    border-radius: 2px;
    color: #ffaa00;
    border: 1px solid #333;
}

.playlist-search-bar {
    display: flex;
    align-items: center;
    gap: 4px;
    background-color: #0b0c0e;
    border: 1.5px inset #2a2c32;
    padding: 2px 6px;
    margin-bottom: 6px;
}

.playlist-search-input {
    background: transparent;
    border: none;
    outline: none;
    color: #ffaa00;
    font-size: 9px;
    flex-grow: 1;
}

.clear-search-btn {
    background: transparent;
    border: none;
    color: #555;
    cursor: pointer;
    font-size: 8px;
    font-weight: bold;
}

.clear-search-btn:hover {
    color: #fff;
}

.playlist-tracks-container {
    background-color: #090a0c;
    border: 2px inset #1e1f24;
    height: 50vh;
    overflow-y: auto;
    overflow-x: hidden;
    box-sizing: border-box;
}

/* Playlist Scrollbar Styling */
.playlist-tracks-container::-webkit-scrollbar {
    width: 6px;
}

.playlist-tracks-container::-webkit-scrollbar-track {
    background: #090a0c;
}

.playlist-tracks-container::-webkit-scrollbar-thumb {
    background: #3a3b40;
    border-radius: 1px;
}

.playlist-track-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 6px;
    font-size: 9px;
    color: #00ff33; /* Classic Green playlist text */
    cursor: pointer;
    min-height: 18px;
    gap: 2px;
    border-bottom: 1px solid #14161a;
}
/*
.playlist-track-row:hover {
    background-color: #181d18;
}*/

.playlist-track-row.active {
    background-color: #042404; /* Dark highlighted active row */
    color: #ffffff;
}

.track-index-num {
    width: 20px;
    color: #ffaa00;
    font-weight: bold;
    flex-shrink: 0;
}

.playing-bullet {
    color: #ffffff;
    animation: pulse-active 1s infinite alternate;
}

@keyframes pulse-active {
    0% { opacity: 0.2; }
    100% { opacity: 1; }
}

.track-main-info {
    flex-grow: 1;
    display: flex;
    gap: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-right: 6px;
}

.track-row-title {
    font-weight: bold;
}

.track-row-divider {
    color: #ffaa00;
}

.track-row-artist {
    opacity: 0.85;
}

.track-row-duration {
    color: #ffaa00;
    font-size: 8px;
}

.empty-playlist-msg {
    padding: 12px;
    text-align: center;
    font-size: 8px;
    color: #55555c;
}

/* Playlist Footer toolbar */
.playlist-footer-panel {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 4px;
    border-top: 1px solid #2e2e32;
    font-size: 8px;
}

.footer-buttons-left {
    display: flex;
    gap: 4px;
}

.footer-action-btn {
    background: #111112;
    border: 1px solid #2e2e32;
    color: #8b8b92;
    font-size: 8px;
    font-weight: bold;
    padding: 2px 6px;
    cursor: pointer;
}

.footer-action-btn:active {
    background: #ffaa00;
    color: #000;
}

.playlist-duration-summary {
    color: #ffaa00;
    font-weight: bold;
}

/* TOAST OVERLAY WARNING */
.winamp-toast {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 99;
    background-color: #cbd5e1;
    border: 2px solid #ffffff;
    border-bottom-color: #1e293b;
    border-right-color: #1e293b;
    box-shadow: 4px 6px 12px rgba(0,0,0,0.6);
    width: 220px;
    color: #000000;
    font-family: monospace;
}

.toast-header {
    background-color: #000080;
    color: #ffffff;
    font-weight: bold;
    font-size: 9px;
    padding: 2px 6px;
}

.toast-body {
    font-size: 9px;
    padding: 12px;
    text-align: center;
}

.toast-btn {
    background-color: #cbd5e1;
    border: 1px solid #ffffff;
    border-bottom-color: #1e293b;
    border-right-color: #1e293b;
    width: 50px;
    height: 20px;
    display: block;
    margin: 0 auto 10px auto;
    cursor: pointer;
    font-weight: bold;
    font-size: 9px;
}

/* WINDOWS 95 STYLE TASKBAR */
.win95-taskbar {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100vw;
    height: 28px;
    background-color: #cbd5e1;
    border-top: 2px solid #ffffff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2px 6px;
    box-sizing: border-box;
    z-index: 30;
}

.win95-start-btn {
    background-color: #cbd5e1;
    border: 2px solid #ffffff;
    border-bottom-color: #475569;
    border-right-color: #475569;
    font-weight: bold;
    font-size: 11px;
    padding: 2px 8px;
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
}

.win95-start-btn:active {
    border-top-color: #475569;
    border-left-color: #475569;
    border-bottom-color: #ffffff;
    border-right-color: #ffffff;
}

.taskbar-tabs {
    flex-grow: 1;
    padding-left: 12px;
    display: flex;
}

.taskbar-tab {
    background-color: #cbd5e1;
    border: 2px solid #ffffff;
    border-bottom-color: #475569;
    border-right-color: #475569;
    font-size: 10px;
    padding: 2px 8px;
    display: flex;
    align-items: center;
    gap: 4px;
}

.taskbar-tab.active {
    background-color: #b1bdce;
    border-top-color: #475569;
    border-left-color: #475569;
    border-bottom-color: #ffffff;
    border-right-color: #ffffff;
    font-weight: bold;
}

.taskbar-tray {
    background-color: #b1bdce;
    border: 2.5px inset #cbd5e1;
    padding: 2px 8px;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 10px;
}

.tray-clock {
    font-weight: bold;
}
</style>