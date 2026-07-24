# Bilbo Player Plugins & Emulator Sandbox 🎶

Welcome to the official monorepo of playback plugins for **Bilbo** ([bilbomusic.com](https://bilbomusic.com)).

This project is an ecosystem of interactive, gamified, and visually stunning skins (plugins) designed for the Bilbo music player. Alongside a collection of pre-built custom plugins, the repository includes an **interactive emulator sandbox**. This allows third-party developers to test and debug their own plugins in an isolated environment without needing a live connection to the production backend.

---

## 📦 Project Configuration (`package.json`)

The project is built on the lightning-fast **Vite** bundler using **Vue 3** and **Vue Router**.

```json
{
    "name": "bilbo-player-plugin",
    "private": true,
    "version": "1.0.0",
    "type": "module",
    "scripts": {
        "dev": "vite",
        "build": "vite build"
    },
    "dependencies": {
        "@bilbomusic/player-plugin-sdk": "^1.0.0",
        "vue": "^3.4.0",
        "vue-router": "^4.6.4"
    },
    "devDependencies": {
        "@vitejs/plugin-vue": "^5.0.0",
        "vite": "^5.0.0"
    }
}
```

---

## 🚀 Key Ecosystem Features

### 1. Interactive Sandbox Emulator
The emulator mimics the behavior of the main Bilbo host application. It serves as an ideal testbed for plugin developers:
* **Player State Emulation**: Manually trigger play, pause, seek, and track transitions to verify app states.
* **Audio Reactivity Synthesizer**: Generates simulated frequency bands (Low, Mid, and High spectrums) to test equalizers, custom shaders, and visual effects responding to the beat of the music.
* **SDK Event Monitor**: Real-time logging of incoming and outgoing events between the plugin and the host for quick debugging.

### 2. Built-in Documentation & Explanations
An integrated documentation panel that details the SDK specifications, API reference, and design guidelines to help developers hit the ground running when building adaptive player skins.

---

## 🎨 Featured Plugins Collection

The repository contains 10 highly interactive and uniquely styled plugins, each offering its own atmosphere, gameplay, or visualization mechanics:

| Plugin Name | Directory | Description & Features |
| :--- | :--- | :--- |
| **Space Nebula Ride** 🌌 | `nebula-ride` | A cosmic, meditative space flight experience. Galactic stars and deep nebula clouds warp and pulsate in response to the high and low frequencies of the audio stream. |
| **Vultisig MPC Vault** 🔑 | `vultisig-vault` | An interactive cyberpunk vaults dashboard with Multi-Party Computation (MPC) simulation. Signing tracks triggers cryptographic terminal animations, and user-initiated transactions spark visual block consensus sequences. |
| **Winamp Retro Player** 📼 | `winamp-retro` | A nostalgic tribute to the legendary 90s player. Features classic pixel equalizers, spinning cassette reels, custom skin styling, and authentic vintage control buttons. |
| **Lofi Cozy Lounge** ☕ | `lofi-cozy` | A warm, animated ambient room featuring a crackling fireplace, raindrops sliding down the window, and a steaming cup of tea. Perfect for focus sessions and background chillout. |
| **JBL Pulse Visualizer** 🔊 | `jbl-pulse` | A realistic 3D cylinder speaker utilizing circular LED equalizer rings. Color schemes and wave patterns dynamically shift depending on the active track's genre. |
| **Gravity Defied Rider** 🏍️ | `gravity-defied` | A legendary trial bike physics game inspired by the J2ME phone era. The rider accelerates, brakes, and performs flips over procedurally generated hills fueled by the song's BPM. |
| **Heroes of Might & Music** ⚔️ | `heroes-might-and-music` | A pixel-art tactical turn-based battle arena paying homage to Heroes of Might and Magic III. Heroes fight and cast spells in sync with the track's tempo and rhythm. |
| **Sonic Rhythm Dash** 🦔 | `sonic-rhytm-dash` | A stylized infinite runner game. The blue hedgehog collects golden rings and jumps over spiked obstacles, with spawn rates and game speed matching the track's active tempo. |
| **Audio Bounce Game** 🎮 | `audio-bounce` | A retro physics-based brick-breaker/pong game. The ball and paddles bounce off of frequency barriers generated live from the audio visualizer spectrum. |
| **Yandex Gravity Simulator** 🛸 | `yandex-gravity` | An interactive physics canvas with zero gravity. Album covers, control cards, and badges float freely, colliding and responding to user drag-and-throw gestures. |
| **Six-Seven Player** 🎛️ | `six-seven` | A bold, brutalist hardware-inspired hardware player layout. Features a rotating vinyl-style circular album cover, interactive neon multi-frequency progress bar, haptic screen-shaking feedback, full localized multi-language control translations, and a sticky responsive controller bar for play/pause, liking tracks, and track navigation. |
| **Roblox Blox Party** 🧱 | `roblox-blox-party` | An immersive 3D Roblox disco stage with real-time audio rhythm sync! Features a customizable 3D Roblox character (Classic Noob, Bacon Hair, Dominus Lord, Sparkle Fedora, Korblox Ice) performing 9 realistic dance styles (Hip-Hop, Disco, Shuffle, Floss, Windmill Spin, Robot Wave, Orange Justice, Hype Bounce, Carlton Swing). Advanced beat-matching locks dance movements to track position and drum kick transients, paired with 4 dynamic 3D Roblox world themes (Neon Cyber, Classic Spawn, Space Station, Sunset Metropolis), floating Obby platforms, Robux coins, overhead disco ball & scanning lasers, 3D floor stud equalizer columns, multi-language localization (RU, EN, TR, ES, DE), and interactive Web Audio SFX. |
| **Audius Parody Player** 🟣 | `audius-troll` | A satirical Web3 crypto-music skin parodying the Audius streaming platform. Features signature purple neon aesthetics, live $AUDIO token wallet balance, free $AUDIO Airdrop claimer with floating coin particles, VIP Staked Bagholder tier badge switcher, Solana Node #420 latency status, $AUDIO tipping sfx, fake Solana NFT minting engine modal, on-chain DAO governance voting proposal, 32-band audio spectrum visualizer, and 5-language localization (RU, EN, TR, ES, DE). |
| **Gunwest Brainrot Chat** 👑 | `gunwest-chat` | A real-time Firebase-powered chat plugin themed around Russian rapper Gunwest's viral brainrot meme slang ("пэпэ", "шнейне", "фа", "втфа", "кхе-кхе"). Features unique deterministic Gunwest avatar generation, real-time message streaming via Firebase Firestore, track attachment (cover, title, artist, ID), synth Web Audio SFX, and bottom player media controls. |
---

## 🛠️ Under the Hood: SDK Integration (`@bilbomusic/player-plugin-sdk`)

Every plugin communicates with the parent app using our unified SDK. Plugins subscribe to player updates and emit control actions back to the host.

### 🔌 Main Plugin Lifecycle Template (Vue 3 Script)

```vue
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { playerSdk } from '@bilbomusic/player-plugin-sdk'

// Reactive state variables for synchronization
const isPlaying = ref(false)
const trackTitle = ref('')
const trackArtist = ref('')
const playbackPosition = ref(0)
const audioSpectrum = ref({ low: 0, mid: 0, high: 0 })

// Connect SDK event listeners on mount
onMounted(() => {
    // 1. Handle metadata updates when a new track starts
    const onTrackChange = (payload) => {
        if (payload?.track) {
            trackTitle.value = payload.track.title
            trackArtist.value = payload.track.artists
        }
    }

    // 2. Handle play/pause changes
    const onStateChange = (payload) => {
        if (payload?.state) {
            isPlaying.value = (payload.state === 'playing')
        }
    }

    // 3. Handle playback progress updates
    const onPositionUpdate = (payload) => {
        if (payload?.position !== undefined) {
            playbackPosition.value = payload.position
        }
    }

    // 4. Handle live audio frequency data for visualization
    const onAudioFrame = (dataArray) => {
        if (dataArray && dataArray.length && isPlaying.value) {
            // Group the frequency spectrum into low, mid, and high bands
            let low = 0, mid = 0, high = 0
            const chunk = Math.floor(dataArray.length / 3)
            for (let i = 0; i < chunk; i++) low += dataArray[i]
            for (let i = chunk; i < chunk * 2; i++) mid += dataArray[i]
            for (let i = chunk * 2; i < dataArray.length; i++) high += dataArray[i]
            
            // Normalize values between 0 and 1
            audioSpectrum.value = {
                low: low / chunk / 255,
                mid: mid / chunk / 255,
                high: high / (dataArray.length - chunk * 2) / 255
            }
        }
    }

    // Subscribe to SDK events
    playerSdk.on('track', onTrackChange)
    playerSdk.on('state', onStateChange)
    playerSdk.on('position', onPositionUpdate)
    playerSdk.on('audioFrame', onAudioFrame)

    // Set custom UI configuration (e.g., hide the host default overlay and set main theme)
    if (typeof playerSdk.setUiConfig === 'function') {
        playerSdk.setUiConfig({
            hideDefaultPlayer: true,
            themeColor: '#33E6BF'
        })
    }
})

// Clean up event listeners on unmount to prevent memory leaks
onBeforeUnmount(() => {
    playerSdk.off('track')
    playerSdk.off('state')
    playerSdk.off('position')
    playerSdk.off('audioFrame')
})

// UI control methods proxying actions to the host player
const togglePlay = () => {
    if (isPlaying.value) {
        playerSdk.pause()
    } else {
        playerSdk.play()
    }
}

const nextTrack = () => playerSdk.next()
const prevTrack = () => playerSdk.prev()
const seekTo = (seconds) => playerSdk.seek(seconds)
</script>
```

---

## 🏗️ Developer Guide: How to Create a New Plugin

If you want to design a custom visualizer or game skin for Bilbo, follow this process:

1. **Create your plugin folder** under `src/components/plugins/your-plugin-name/`.
2. **Build your main entry file**, name it `YourPlugin.vue`.
3. **Import `@bilbomusic/player-plugin-sdk`** and subscribe to lifecycle states (as shown in the template).
4. **Make it responsive**: Plugins are loaded within an `iframe` container on both mobile apps and web dashboards. Design fluid elements that adapt gracefully to viewport shifts.
5. **Add audio interactivity**: Harness the live frequency bands from `onAudioFrame` to animate canvas drawings, CSS properties, or game physics.
6. **Launch the sandbox emulator**, select your plugin from the developer dropdown menu, and play some test tracks to verify the behavior.

---

## ⚡ Local Setup & Execution

Run the emulator sandbox and plugins on your local machine with these simple steps:

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Local Dev Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser. This spins up the interactive developer dashboard where you can pick any of the 10 custom plugins and test them live.

### 3. Production Compilation
To bundle and optimize the plugins before hosting them on Bilbo's servers:
```bash
npm run build
```
The optimized client-ready bundle will be outputted to the `dist/` directory, ready to be mounted inside the Bilbo Music production environment.

---

## 🔗 Useful Links & Support

* **Main Portal**: [bilbomusic.com](https://bilbomusic.com)
* **Developer Portal**: [docs.bilbomusic.com](https://bilbomusic.com/docs)
* **Get in Touch**: [dev@bilbomusic.com](mailto:dev@bilbomusic.com)

---

*Crafted with ❤️ by the Bilbo Music Team for high-fidelity interactive playback experiences.*
