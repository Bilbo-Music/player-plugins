<template>
    <div class="vultisig-wrapper" id="vultisig-workspace-root">
        <!-- BACKGROUND SYSTEM SPACE GLOWS -->
        <div class="workspace-bg-space"></div>
        <div class="ambient-nebula nebula-cyan"></div>
        <div class="ambient-nebula nebula-blue"></div>

        <!-- HIGH-FIDELITY DASHBOARD APPN CONTAINER -->
        <div class="vault-app-container" id="vultisig-dashboard-app">
            
            <!-- MAIN COMPACT HEADER WITH NAVIGATION SEGMENTS -->
            <header ref="topPanelRef" class="vault-app-header" id="vultisig-header-panel">
                <div class="header-content">
                    
                    <!-- Branding Block -->
                    <div class="brand-block">
                        <!-- Custom high-fidelity inline Vultisig SVG Logo -->
                        <div class="brand-logo-frame">
                            <svg width="26" height="25" viewBox="0 0 43 41" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20.8139 23.9718L3.5382 33.9713L1 31.4332L16.1446 21.2569L20.8139 23.9718Z" fill="url(#header-vult-grad)"/>
                                <path d="M21.2044 24.6481L3.9067 34.6096L4.83572 38.0768L21.2209 30.0494L21.2044 24.6481Z" fill="url(#header-vult-grad)"/>
                                <path d="M21.8912 24.6481L39.1889 34.6096L38.2599 38.0768L21.8747 30.0494L21.8912 24.6481Z" fill="url(#header-vult-grad)"/>
                                <path d="M22.2817 23.9718L39.5574 33.9713L42.0956 31.4331L26.951 21.2569L22.2817 23.9718Z" fill="url(#header-vult-grad)"/>
                                <path d="M21.8912 23.2328L21.8692 3.27183L25.3364 2.34277L26.5771 20.5465L21.8912 23.2328Z" fill="url(#header-vult-grad)"/>
                                <path d="M21.1102 23.2328L21.1322 3.27183L17.665 2.34277L16.4243 20.5465L21.1102 23.2328Z" fill="url(#header-vult-grad)"/>
                                <defs>
                                    <linearGradient id="header-vult-grad" x1="21.5478" y1="2.34277" x2="21.5478" y2="38.0768" gradientUnits="userSpaceOnUse">
                                        <stop stop-color="#33E6BF"/>
                                        <stop offset="1" stop-color="#0439C7"/>
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        <div class="brand-text-block">
                            <div class="brand-title-group">
                                <span class="brand-name">Vultisig</span>
                                <span class="vault-pill">Active Vault</span>
                            </div>
                            <span class="vault-id">TSS SECURE MULTI-CHAIN PORTAL</span>
                        </div>
                    </div>
                </div>
            </header>

            <!-- MAIN INTERFACE VIEWPORT -->
            <main class="app-main-content" id="vultisig-main-viewport">
                
                <!-- TAB 1: MEDITATIVE FLIGHT VIEWPORT -->
                <div v-show="activeTab === 'flight'" class="tab-view-container flight-view" id="view-flight">
                    
                    <!-- Cinematic Flight Stage Canvas -->
                    <div class="flight-stage-container">
                        
                        <!-- Overlay Ambient Flight Data HUD -->
                        <div class="flight-hud-panel">
                            <div class="status-node-badge">
                                <span class="pulse-dot" :class="{ 'warning-dot': shieldIntegrity < 40 }"></span>
                                <span class="hud-game-stats">
                                    SHIELD: <span :class="{ 'threat-text': shieldIntegrity < 40 }">{{ Math.floor(shieldIntegrity) }}%</span> | SCORE: {{ gameScore }} XP
                                </span>
                            </div>
                            <div class="hud-right">
                                <span class="hud-mono-label gray">PROPULSION SPEED</span>
                                <span class="hud-value" :class="{ 'pulse-active': isPlaying }">
                                    {{ isPlaying ? (60 + Math.floor(audioData.low * 120)) : 0 }} KM/S
                                </span>
                            </div>
                        </div>

                        <!-- Main Flight Loop Canvas -->
                        <canvas 
                            ref="flightCanvasRef" 
                            class="flight-visual-canvas"
                            @mousedown="handleCanvasPointer"
                            @mousemove="handleCanvasPointerMove"
                            @touchstart="handleCanvasTouch"
                            @touchmove="handleCanvasTouchMove"
                        ></canvas>

                        <!-- Interactive Steering Tip Overlay -->
                        <div class="flight-steering-overlay-tip">
                            <span>🎮 Drag / Tap or use Arrow/WASD keys to steer</span>
                        </div>
                    </div>

                    <!-- INTEGRATED DETAILED BROADCASTING CONTROLS -->
                    <div class="broadcast-control-card">
                        
                        <!-- GLOBAL CONSOLE ALERTS AND TOASTS (FULL-WIDTH JUST ABOVE CARD) -->
                        <transition name="fade-toast">
                            <div v-if="toastMessage" class="vultisig-console-toast" id="vultisig-alert">
                                <div class="toast-content-wrapper">
                                    <span class="toast-indicator-dot"></span>
                                    <span class="toast-body-text">{{ toastMessage }}</span>
                                </div>
                            </div>
                        </transition>

                        <!-- Track meta & secure indicator -->
                        <div class="track-meta-row">
                            <div class="track-title-info">
                                <div class="secure-indicator-line">
                                    <span class="pulse-dot"></span>
                                    <span class="secure-tag-text">CO-SIGNING BROADCAST</span>
                                </div>
                                <h3 class="track-info-title">{{ trackInfo.title }}</h3>
                                <p class="track-info-artists">{{ trackInfo.artists }}</p>
                            </div>

                            <!-- Fast Love/Vault Toggle -->
                            <button 
                                class="like-action-btn"
                                :class="{ 'liked': isLiked }"
                                @click="toggleLike"
                                title="Add to Secure Vault Favorites"
                                id="btn-like-toggle"
                            >
                                <svg viewBox="0 0 24 24" :fill="isLiked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                </svg>
                            </button>
                        </div>

                        <!-- Compact Seek Timeline Slider -->
                        <div class="seek-timeline-wrap">
                            <div class="timeline-slider-holder">
                                <input 
                                    type="range" 
                                    min="0" 
                                    :max="trackInfo.duration || 1000" 
                                    v-model.number="playbackPosition" 
                                    @change="handleSeek"
                                    @input="isSeeking = true"
                                    class="timeline-slider-input"
                                />
                                <div class="timeline-slider-bar">
                                    <div class="timeline-fill-bar" :style="{ width: timelinePercentage + '%' }"></div>
                                </div>
                                <div class="timeline-slider-thumb" :style="{ left: timelinePercentage + '%' }"></div>
                            </div>
                            <div class="timeline-time-info">
                                <span>{{ formatTime(playbackPosition) }}</span>
                                <span>{{ formatTime(trackInfo.duration) }}</span>
                            </div>
                        </div>

                        <!-- Core tactile player media actions -->
                        <div class="player-actions-row">
                            
                            <!-- Loop toggle -->
                            <button 
                                class="media-deck-btn"
                                :class="{ 'active': repeat !== 'none' }"
                                @click="handleRepeatToggle"
                                title="Loop sequence"
                                id="btn-repeat-toggle"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="23 4 23 10 17 10"></polyline>
                                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
                                    <text v-if="repeat === 'track'" x="9" y="16" font-size="8" font-weight="bold" fill="currentColor" stroke="none">1</text>
                                    <text v-else-if="repeat === 'queue'" x="8" y="16" font-size="8" font-weight="bold" fill="currentColor" stroke="none">A</text>
                                </svg>
                            </button>

                            <!-- Prev -->
                            <button class="media-deck-btn" @click="handlePrev" title="Previous Track">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6L18 6v12z"/></svg>
                            </button>

                            <!-- Primary Play/Pause with interactive MPC ceremony triggers -->
                            <button 
                                class="primary-play-btn"
                                :class="{ 'playing': isPlaying }"
                                @click="handlePlayPress"
                                id="btn-play-trigger"
                            >
                                <svg v-if="isPlaying" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <rect x="6" y="4" width="4" height="16"></rect>
                                    <rect x="14" y="4" width="4" height="16"></rect>
                                </svg>
                                <svg v-else-if="mpcState === 'signing'" viewBox="0 0 24 24" class="spinning-loader" fill="none" stroke="currentColor" stroke-width="3">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.25"></circle>
                                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor"></path>
                                </svg>
                                <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <polygon points="5 3 19 12 5 21"></polygon>
                                </svg>
                            </button>

                            <!-- Next -->
                            <button class="media-deck-btn" @click="handleNext" title="Next Track">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18V6l8.5 6zm10-12h2v12h-2z"/></svg>
                            </button>

                            <!-- Minimize on the right -->
                            <button class="media-deck-btn" @click="handleCollapse" title="Minimize Vault" id="btn-playback-minimize">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="4 14 10 14 10 20"></polyline>
                                    <polyline points="20 10 14 10 14 4"></polyline>
                                    <line x1="14" y1="10" x2="21" y2="3"></line>
                                    <line x1="10" y1="14" x2="3" y2="21"></line>
                                </svg>
                            </button>
                        </div>
                    </div>

                    </div>

                <!-- TAB 2: SIMULATED CO-SIGN MULTI-CHAIN WALLET (VULTISIG LOOK) -->
                <div v-show="activeTab === 'vault'" class="tab-view-container vault-view" id="view-vault">
                    <div class="vault-grid">
                        
                        <!-- Left Panel (Balance & Actions) -->
                        <div class="vault-left-panel">
                            <!-- Total Secured Balance Display -->
                            <div class="secured-vault-card">
                                <span class="balance-card-label">SECURED MULTI-CHAIN VALUE</span>
                                <div class="balance-card-value">
                                    ${{ formatCurrency(computedTotalBalance) }}
                                </div>
                                <div class="balance-trend-row">
                                    <span class="green-dot"></span>
                                    <span>+$1,842.50 TODAY (+1.45%)</span>
                                </div>
                            </div>

                            <!-- Quick Wallet Action Grid -->
                            <div class="wallet-action-grid">
                                <button class="wallet-action-btn" @click="showToast('Initiating Send Multi-Party share broadcast...')">
                                    <div class="action-btn-circle">🚀</div>
                                    <span class="action-btn-label">Send</span>
                                </button>
                                <button class="wallet-action-btn" @click="showToast('Scanning decentralized airgap QR code...')">
                                    <div class="action-btn-circle">📥</div>
                                    <span class="action-btn-label">Receive</span>
                                </button>
                                <button class="wallet-action-btn" @click="showToast('Handshaking cross-chain THORChain pool...')">
                                    <div class="action-btn-circle">🔄</div>
                                    <span class="action-btn-label">Swap</span>
                                </button>
                                <button class="wallet-action-btn" @click="runReshareCeremony">
                                    <div class="action-btn-circle green-accent">🔑</div>
                                    <span class="action-btn-label keygen-label">Keygen</span>
                                </button>
                            </div>

                            <!-- Ambient reaction simulated booster claim -->
                            <button 
                                class="claim-booster-btn"
                                @click="claimAmbientGifts"
                            >
                                🎁 CLAIM VAULT REACTION AIRDROP
                            </button>
                        </div>

                        <!-- Right Panel (Assets list) -->
                        <div class="vault-right-panel">
                            <span class="section-title">MULTI-CHAIN ASSETS</span>
                            
                            <!-- VULTISIG ($VULT) Tile -->
                            <div class="crypto-asset-tile">
                                <div class="asset-details-left">
                                    <div class="asset-logo-box vult-bg" :style="coinPulseStyle">
                                        <svg width="18" height="18" viewBox="0 0 43 41" fill="none">
                                            <path d="M20.8139 23.9718L3.5382 33.9713L1 31.4332L16.1446 21.2569L20.8139 23.9718Z" fill="url(#asset-vult-grad)"/>
                                            <path d="M21.2044 24.6481L3.9067 34.6096L4.83572 38.0768L21.2209 30.0494L21.2044 24.6481Z" fill="url(#asset-vult-grad)"/>
                                            <path d="M21.8912 24.6481L39.1889 34.6096L38.2599 38.0768L21.8747 30.0494L21.8912 24.6481Z" fill="url(#asset-vult-grad)"/>
                                            <path d="M22.2817 23.9718L39.5574 33.9713L42.0956 31.4331L26.951 21.2569L22.2817 23.9718Z" fill="url(#asset-vult-grad)"/>
                                            <path d="M21.8912 23.2328L21.8692 3.27183L25.3364 2.34277L26.5771 20.5465L21.8912 23.2328Z" fill="url(#asset-vult-grad)"/>
                                            <path d="M21.1102 23.2328L21.1322 3.27183L17.665 2.34277L16.4243 20.5465L21.1102 23.2328Z" fill="url(#asset-vult-grad)"/>
                                            <defs>
                                                <linearGradient id="asset-vult-grad" x1="21.5478" y1="2.34277" x2="21.5478" y2="38.0768" gradientUnits="userSpaceOnUse">
                                                    <stop stop-color="#33E6BF"/>
                                                    <stop offset="1" stop-color="#0439C7"/>
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </div>
                                    <div class="asset-names">
                                        <span class="asset-name-text">Vultisig</span>
                                        <span class="asset-network-text text-green">VULT NETWORK</span>
                                    </div>
                                </div>
                                <div class="asset-values">
                                    <span class="asset-amount-text">18,500 VULT</span>
                                    <span class="asset-fiat-text">${{ formatCurrency(18500 * vultPrice) }}</span>
                                </div>
                            </div>

                            <!-- THORChain ($RUNE) Tile -->
                            <div class="crypto-asset-tile">
                                <div class="asset-details-left">
                                    <div class="asset-logo-box rune-bg" :style="coinPulseStyle">
                                        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="18" viewBox="0 0 253.3 290.5" xml:space="preserve">
                                            <linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="-321.7246" y1="644.2814" x2="-320.7246" y2="644.2814" gradientTransform="matrix(253.26 0 0 -290.5 81479.9766 187309)">
                                                <stop offset="0" style="stop-color:#00CCFF"/>
                                                <stop offset="1" style="stop-color:#33FF99"/>
                                            </linearGradient>
                                            <path class="st0" d="M0,290.5l202.8-85.4L138.6,140L0,290.5z M74.5,75l64.2,65L253.3,0L74.5,75z" fill="#33E6BF"/>
                                        </svg>
                                    </div>
                                    <div class="asset-names">
                                        <span class="asset-name-text">THORChain</span>
                                        <span class="asset-network-text">RUNE VAULT</span>
                                    </div>
                                </div>
                                <div class="asset-values">
                                    <span class="asset-amount-text">1,420 RUNE</span>
                                    <span class="asset-fiat-text">${{ formatCurrency(1420 * runePrice) }}</span>
                                </div>
                            </div>

                            <!-- Rujira ($RUJI) Tile -->
                            <div class="crypto-asset-tile">
                                <div class="asset-details-left">
                                    <div class="asset-logo-box ruji-bg" :style="coinPulseStyle">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" viewBox="0 0 1024 1024">
                                          <defs>
                                            <linearGradient id="g" x1="0%" y1="100%" x2="100%" y2="0%">
                                              <stop offset="0%" stop-color="#7c3cff"/>
                                              <stop offset="50%" stop-color="#b52cff"/>
                                              <stop offset="100%" stop-color="#ff00d4"/>
                                            </linearGradient>
                                          </defs>

                                          <!-- outer ring -->
                                          <circle cx="512" cy="512" r="480" fill="url(#g)"/>

                                          <!-- inner circle -->
                                          <circle cx="512" cy="512" r="425" fill="#1d1b22"/>

                                          <g fill="url(#g)">
                                            <!-- R -->
                                            <path d="
                                              M250 290
                                              H470
                                              V430
                                              H395
                                              L465 500
                                              H360
                                              L305 445
                                              H250
                                              V580
                                              H185
                                              V290
                                              Z

                                              M315 350
                                              V390
                                              H405
                                              V350
                                              Z"/>

                                            <!-- U -->
                                            <path d="
                                              M540 290
                                              H610
                                              V470
                                              L650 510
                                              H790
                                              V290
                                              H860
                                              V580
                                              H630
                                              L540 490
                                              Z"/>

                                            <!-- D -->
                                            <path d="
                                              M250 650
                                              H315
                                              V820
                                              H470
                                              V590
                                              H540
                                              V845
                                              L465 920
                                              H250
                                              Z"/>

                                            <!-- I -->
                                            <path d="
                                              M585 590
                                              H860
                                              V650
                                              H755
                                              V860
                                              H860
                                              V920
                                              H585
                                              V860
                                              H690
                                              V650
                                              H585
                                              Z"/>
                                          </g>
                                        </svg>
                                    </div>
                                    <div class="asset-names">
                                        <span class="asset-name-text">RUJI</span>
                                        <span class="asset-network-text">RUJI NETWORK</span>
                                    </div>
                                </div>
                                <div class="asset-values">
                                    <span class="asset-amount-text">42,000 RUJI</span>
                                    <span class="asset-fiat-text">${{ formatCurrency(42000 * rujiPrice) }}</span>
                                </div>
                            </div>

                            <!-- BTC Tile -->
                            <div class="crypto-asset-tile">
                                <div class="asset-details-left">
                                    <div class="asset-logo-box btc-bg" :style="coinPulseStyle">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" fill="#F7931A" opacity="0.15"/>
                                            <path d="M16.5 10.3c.2-.9-.4-1.4-1.2-1.7l.6-2.4-1.5-.4-.6 2.4c-.4-.1-.8-.2-1.2-.3l.6-2.4-1.5-.4-.6 2.4c-.3-.1-.6-.2-.9-.2l-2.1-.5-.4 1.7s1.1.3 1.1.3c.6.2.7.5.7.8l-.7 2.9c0 0-.1.2-.2.2-.1 0-1.1-.3-1.1-.3l-.8 1.8 2 .5c.4.1.7.2 1.1.3l-.6 2.5 1.5.4.6-2.4c.4.1.8.2 1.2.3l-.6 2.4 1.5.4.6-2.4c1.3.2 2.3.1 2.7-.8.3-.7.1-1.3-.4-1.7.4-.3.7-.7.6-1.5zm-2.4 4.1c-.2 1-1.9.5-2.4.3l-.5-2c.5.1 2.2.3 2.9.8.7.3.3.7.1.9zm.2-4.1c-.2.9-1.6.4-2 .3l-.5-1.9c.4.1 1.6.3 2.2.7.6.2.5.7.3.9z" fill="#F7931A" />
                                        </svg>
                                    </div>
                                    <div class="asset-names">
                                        <span class="asset-name-text">Bitcoin</span>
                                        <span class="asset-network-text">BTC MAINNET</span>
                                    </div>
                                </div>
                                <div class="asset-values">
                                    <span class="asset-amount-text">0.4500 BTC</span>
                                    <span class="asset-fiat-text">${{ formatCurrency(0.45 * 94250) }}</span>
                                </div>
                            </div>

                            <!-- ETH Tile -->
                            <div class="crypto-asset-tile">
                                <div class="asset-details-left">
                                    <div class="asset-logo-box eth-bg" :style="coinPulseStyle">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" fill="#627EEA" opacity="0.15"/>
                                            <path d="M12 3L11.8 3.5v11.7l.2.2 5.4-3.2L12 3z" fill="#343434" />
                                            <path d="M12 3L6.6 12.2l5.4 3.2V3z" fill="#8C8C8C" />
                                            <path d="M12 16.5l-.1.1V21l.1.3 5.4-7.6-5.4 2.8z" fill="#3C3C3C" />
                                            <path d="M12 21.3V16.6L6.6 13.8l5.4 7.5z" fill="#8C8C8C" />
                                            <path d="M12 15.4l5.4-3.2-5.4-2.4v5.6z" fill="#141414" />
                                            <path d="M12 9.8L6.6 12.2l5.4 3.2V9.8z" fill="#343434" />
                                        </svg>
                                    </div>
                                    <div class="asset-names">
                                        <span class="asset-name-text">Ethereum</span>
                                        <span class="asset-network-text">ERC-20 SIGNING</span>
                                    </div>
                                </div>
                                <div class="asset-values">
                                    <span class="asset-amount-text">3.2450 ETH</span>
                                    <span class="asset-fiat-text">${{ formatCurrency(3.245 * 3420) }}</span>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>

                <!-- TAB 3: CRYPTOGRAPHIC CO-SIGNING CEREMONY -->
                <div v-show="activeTab === 'mpc'" class="tab-view-container mpc-view" id="view-mpc">
                    <div class="mpc-grid">
                        
                        <!-- Left Panel (TSS Map & Description) -->
                        <div class="mpc-left-panel">
                            <div class="mpc-title-block">
                                <span class="mpc-tag-label">THRESHOLD MULTI-PARTY COMPUTATION</span>
                                <h3 class="mpc-title-text">TSS CO-SIGNING MESH</h3>
                                <p class="mpc-desc-text">
                                    Real-time dynamic network visualizing secure 2-of-3 key sharing schema. Broadcast stream acts as decentralized entropy pool.
                                </p>
                            </div>

                            <!-- MPC Live Network Nodes Map Canvas -->
                            <div class="visualizer-container">
                                <div class="live-node-badge">
                                    <span class="ping-dot"></span>
                                    <span>P2P SHARING COMPONENT LINK</span>
                                </div>
                                <canvas ref="mpcCanvasRef" class="mpc-graphics-canvas"></canvas>
                            </div>

                            <!-- Fast reshare trigger -->
                            <button 
                                class="re-reshare-btn"
                                @click="runReshareCeremony"
                            >
                                🔄 INITIATE DECENTRALIZED RE-RESHARE
                            </button>
                        </div>

                        <!-- Right Panel (Connected Parties & Logs) -->
                        <div class="mpc-right-panel">
                            <div class="connected-nodes">
                                <span class="section-title">ACTIVE CEREMONY PARTIES</span>
                                
                                <!-- Node 1 (Alpha Mobile) -->
                                <div class="node-status-tile" :class="{ 'node-linked': isPlaying || mpcState !== 'idle' }">
                                    <div class="node-left-details">
                                        <div class="node-indicator-dot"></div>
                                        <div class="node-text-block">
                                            <span class="node-name">Device Alpha (Mobile App)</span>
                                            <span class="node-desc">TSS KEYSHARE SHARE_1</span>
                                        </div>
                                    </div>
                                    <span class="node-status-text" :class="{ 'node-active-text': isPlaying || mpcState !== 'idle' }">
                                        {{ isPlaying || mpcState !== 'idle' ? 'CONNECTED' : 'STANDBY' }}
                                    </span>
                                </div>

                                <!-- Node 2 (Beta Tablet) -->
                                <div class="node-status-tile" :class="{ 'node-linked': isPlaying || mpcState !== 'idle' }">
                                    <div class="node-left-details">
                                        <div class="node-indicator-dot"></div>
                                        <div class="node-text-block">
                                            <span class="node-name">Device Beta (Tablet Wallet)</span>
                                            <span class="node-desc">TSS KEYSHARE SHARE_2</span>
                                        </div>
                                    </div>
                                    <span class="node-status-text" :class="{ 'node-active-text': isPlaying || mpcState !== 'idle' }">
                                        {{ isPlaying || mpcState !== 'idle' ? 'CONNECTED' : 'STANDBY' }}
                                    </span>
                                </div>

                                <!-- Node 3 (Cold Key Backup) -->
                                <div class="node-status-tile offline">
                                    <div class="node-left-details">
                                        <div class="node-indicator-dot"></div>
                                        <div class="node-text-block">
                                            <span class="node-name">Hardware Cold Backup</span>
                                            <span class="node-desc">TSS KEYSHARE SHARE_3</span>
                                        </div>
                                    </div>
                                    <span class="node-status-text">OFFLINE</span>
                                </div>
                            </div>

                            <!-- Cryptographic Signed Logs -->
                            <div class="recent-signs-log">
                                <span class="section-title">RECENT SIGNED TRANSACTIONS</span>
                                <div class="signed-tx-history">
                                    <div v-for="(log, idx) in ledgerHistory" :key="idx" class="tx-history-row">
                                        <span class="tx-log-time">{{ log.time }}</span>
                                        <span class="tx-log-hash">{{ log.tx }}</span>
                                        <span class="tx-log-action">{{ log.action }}</span>
                                        <span class="tx-log-status">{{ log.cost }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </main>

            <!-- BOTTOM TAB NAVIGATION MENU BAR -->
            <div class="bottom-tab-menu-bar" id="vultisig-bottom-menu" style="display: none;">
                <div class="bottom-tab-content">
                    <button 
                        @click="switchTab('flight')"
                        class="bottom-tab-btn"
                        :class="activeTab === 'flight' ? 'active' : 'inactive'"
                        id="bottom-tab-btn-deck"
                    >
                        <svg class="tab-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polygon points="12 2 2 22 12 17 22 22 12 2"></polygon>
                        </svg>
                        <span>FLIGHT</span>
                    </button>
                    <button 
                        @click="switchTab('vault')"
                        class="bottom-tab-btn"
                        :class="activeTab === 'vault' ? 'active' : 'inactive'"
                        id="bottom-tab-btn-wallet"
                    >
                        <svg class="tab-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        <span>VAULT</span>
                    </button>
                    <button 
                        @click="switchTab('mpc')"
                        class="bottom-tab-btn"
                        :class="activeTab === 'mpc' ? 'active' : 'inactive'"
                        id="bottom-tab-btn-mpc"
                    >
                        <svg class="tab-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <span>CO-SIGN</span>
                    </button>
                </div>
            </div>

        </div>

        <!-- TSS MULTI-PARTY CEREMONY OVERLAY PROGRESS MODAL -->
        <div v-if="mpcState === 'keygen'" class="mpc-ceremony-overlay" id="vultisig-mpc-overlay">
            <div class="mpc-ceremony-modal">
                <div class="modal-header">
                    <div class="modal-header-left">
                        <span class="modal-title">TSS KEYGEN CEREMONY</span>
                        <span class="modal-subtitle">Decentralized Generation</span>
                    </div>
                    <span class="ping-dot"></span>
                </div>

                <!-- Live Keygen Logs terminal -->
                <div class="modal-terminal-logs">
                    <div v-for="(log, i) in keygenLogs" :key="i" class="log-row">
                        {{ log }}
                    </div>
                </div>

                <!-- Linear Progress Bar -->
                <div class="modal-progressbar">
                    <div class="modal-progressfill" :style="{ width: keygenProgress + '%' }"></div>
                </div>

                <div class="modal-footer-row">
                    <span>PARTIES CONFIRMED: 2/3</span>
                    <span class="modal-footer-percentage">{{ keygenProgress }}%</span>
                </div>
            </div>
        </div>



    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from 'vue'
import { playerSdk } from '@bilbomusic/player-plugin-sdk'

const topPanelRef = ref(null)
const TOP_UI_HEIGHT = ref(80)

const updateTopUiHeight = () => {
    if (topPanelRef.value) {
        TOP_UI_HEIGHT.value = topPanelRef.value.offsetHeight || 80
        document.documentElement.style.setProperty('--top-ui-height', `${TOP_UI_HEIGHT.value}px`)
    }
}

// 1. Core States
const activeTab = ref('flight') // 'flight' | 'vault' | 'mpc'
const isPlaying = ref(false)
const playerState = ref('paused')
const playbackPosition = ref(0)
const isSeeking = ref(false)
const repeat = ref('none')
const volumeLevel = ref(85)
const isLiked = ref(false)
const currentTxId = ref('33f8aa14')

// Track State
const trackInfo = ref({
    title: 'Loading Secure Beat...',
    artists: 'Vultisig MPC Broadcaster',
    cover: null,
    duration: 180000
})

// Audio reactivity
const audioData = ref({
    low: 0.15,
    mid: 0.15,
    high: 0.15
})

// Authentic static coin prices (Bitcoin, Ethereum, Vultisig, Thorchain, Kujira)
const vultPrice = ref(0.125)
const runePrice = ref(4.85)
const rujiPrice = ref(0.082)

// Local Time simulation
const localTimeStr = ref('02:45')
let timeIntervalId = null

// Ceremony simulation States
const mpcState = ref('idle') // 'idle' | 'keygen' | 'signing'
const keygenLogs = ref([])
const keygenProgress = ref(0)
const toastMessage = ref('')

// Static ledger details
const ledgerHistory = ref([
    { time: '02:40:11', tx: 'Tx_vult_f1a2...38ff', action: 'TSS_CO_SIGN', cost: 'Success' },
    { time: '02:35:02', tx: 'Tx_rune_3d98...8baa', action: 'ECDSA_SWAP', cost: 'Success' },
    { time: '02:22:15', tx: 'Tx_ruji_9a2b...12ea', action: 'RESHARE_SHARE', cost: 'Success' },
])

// References to Canvases
const flightCanvasRef = ref(null)
const mpcCanvasRef = ref(null)

let animationId = null
let rateIntervalId = null

// Computed total balance that responds live to asset prices
const computedTotalBalance = computed(() => {
    const btcVal = 0.45 * 94250
    const ethVal = 3.245 * 3420
    const vultVal = 18500 * vultPrice.value
    const runeVal = 1420 * runePrice.value
    const rujiVal = 42000 * rujiPrice.value
    return btcVal + ethVal + vultVal + runeVal + rujiVal
})

const coinPulseStyle = computed(() => {
    if (!isPlaying.value) return {}
    // low ranges from 0.05 to ~0.75. Scale the logo box element scaling from 1.0 to 1.18.
    const scale = 1.0 + (audioData.value.low * 0.18)
    return {
        transform: `scale(${scale})`,
        transition: 'transform 0.05s ease-out'
    }
})

const formattedLocalTime = computed(() => localTimeStr.value)

const timelinePercentage = computed(() => {
    const dur = trackInfo.value.duration || 1000
    return Math.min(100, Math.max(0, (playbackPosition.value / dur) * 100))
})

// Helpers
const formatTime = (ms) => {
    if (!ms || isNaN(ms)) return '00:00'
    const totalSecs = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSecs / 60)
    const seconds = totalSecs % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

const formatPrice = (val) => {
    return val.toFixed(3)
}

const formatCurrency = (val) => {
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const switchTab = (tabName) => {
    activeTab.value = tabName
}

const handleSeek = () => {
    isSeeking.value = false
    if (playerSdk && typeof playerSdk.seek === 'function') {
        playerSdk.seek(playbackPosition.value)
    }
}

const handleRepeatToggle = () => {
    if (playerSdk && typeof playerSdk.repeat === 'function') {
        if (repeat.value === 'none') {
            playerSdk.repeat('track')
        } else if (repeat.value === 'track') {
            playerSdk.repeat('queue')
        } else {
            playerSdk.repeat('none')
        }
    }
}

const toggleLike = () => {
    const target = isLiked.value ? '' : 'LIKE'
    playerSdk.reaction(target);
    
    isLiked.value = !isLiked.value


    if (isLiked.value) {
        showToast('♥ Co-signed & saved track locally inside MPC secure bookmarks!')
    } else {
        showToast('Track removed from vault bookmarks.')
    }
}

const handleCollapse = () => {
    playerSdk.collapse()
}

const handlePrev = () => {
    if (playerSdk && typeof playerSdk.prev === 'function') {
        playerSdk.prev()
    }
}

const handleNext = () => {
    if (playerSdk && typeof playerSdk.next === 'function') {
        playerSdk.next()
    }
}

// Interactive Spaceship steering & mechanics
const targetX = ref(150)
const targetY = ref(250)
const gameScore = ref(0)
const shieldIntegrity = ref(100)

const isDraggingPointer = ref(false)

const handleCanvasPointer = (e) => {
    isDraggingPointer.value = true
    updateTargetFromEvent(e)
    interactivePropulsionTimer = 40
    audioData.value.low = Math.min(1.0, audioData.value.low + 0.3)
}

const handleCanvasPointerMove = (e) => {
    if (isDraggingPointer.value) {
        updateTargetFromEvent(e)
    }
}

const handleCanvasTouch = (e) => {
    isDraggingPointer.value = true
    updateTargetFromTouchEvent(e)
    interactivePropulsionTimer = 40
    audioData.value.low = Math.min(1.0, audioData.value.low + 0.3)
}

const handleCanvasTouchMove = (e) => {
    if (isDraggingPointer.value) {
        updateTargetFromTouchEvent(e)
    }
}

const handlePointerUp = () => {
    isDraggingPointer.value = false
}

const updateTargetFromEvent = (e) => {
    const canvas = flightCanvasRef.value
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height
    targetX.value = Math.max(20, Math.min(canvas.width - 20, x))
    targetY.value = Math.max(30, Math.min(canvas.height - 30, y))
}

const updateTargetFromTouchEvent = (e) => {
    const canvas = flightCanvasRef.value
    if (!canvas || e.touches.length === 0) return
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    const x = ((touch.clientX - rect.left) / rect.width) * canvas.width
    const y = ((touch.clientY - rect.top) / rect.height) * canvas.height
    targetX.value = Math.max(20, Math.min(canvas.width - 20, x))
    targetY.value = Math.max(30, Math.min(canvas.height - 30, y))
}

const handleKeyDown = (e) => {
    if (activeTab.value !== 'flight') return
    const step = 15
    const canvas = flightCanvasRef.value
    const w = canvas ? canvas.width : 300
    const h = canvas ? canvas.height : 380
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault()
        targetX.value = Math.max(20, targetX.value - step)
    } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault()
        targetX.value = Math.min(w - 20, targetX.value + step)
    } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault()
        targetY.value = Math.max(30, targetY.value - step)
    } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault()
        targetY.value = Math.min(h - 30, targetY.value + step)
    }
}

// Tap space flight stage to gain interactive propulsion acceleration
let interactivePropulsionTimer = 0
const handleStageInteraction = () => {
    interactivePropulsionTimer = 40 // boost lasts for 40 frames
    showToast('🚀 WARP PROPULSION BOOST ENERGIZED!')
    // Spark sound or physical thump response
    audioData.value.low = 1.0
}

const claimAmbientGifts = () => {
    showToast('🎁 SECURE CO-SIGNING GIFTS VERIFIED: Multi-chain gas rewards synchronized.')
    audioData.value = { low: 1.0, mid: 1.0, high: 1.0 }
}

const handlePlayPress = () => {
    if (isPlaying.value) {
        if (playerSdk && typeof playerSdk.pause === 'function') {
            playerSdk.pause()
        }
    } else {
        // Handshake signing ceremony before playing
        mpcState.value = 'signing'
        showToast('TSS Ceremony: Starting threshold handshakes to co-sign active broadcast stream...')
        
        setTimeout(() => {
            if (playerSdk && typeof playerSdk.play === 'function') {
                playerSdk.play()
            }
            mpcState.value = 'idle'
            currentTxId.value = Math.random().toString(16).substring(2, 10)
            
            const now = new Date()
            const timeStr = now.toTimeString().split(' ')[0]
            ledgerHistory.value.unshift({
                time: timeStr,
                tx: `Tx_cosign_${currentTxId.value.substring(0, 4)}...${currentTxId.value.substring(4, 8)}`,
                action: 'BROADCAST_SIG',
                cost: 'Success'
            })
            if (ledgerHistory.value.length > 5) ledgerHistory.value.pop()
        }, 1100)
    }
}

const runReshareCeremony = () => {
    mpcState.value = 'keygen'
    keygenProgress.value = 0
    keygenLogs.value = [
        '[TSS] Resetting active shares matrix...',
        '[TSS] Opening P2P cryptographic bridge...'
    ]

    const steps = [
        { progress: 20, log: '[TSS] Handshaked Peer Mobile Alpha and Tablet Beta.' },
        { progress: 45, log: '[TSS] Initiating secret GG20 ECDSA threshold generation...' },
        { progress: 70, log: '[TSS] Computing Lagrange polynomial intercepts securely...' },
        { progress: 90, log: '[TSS] Distributing shares over local airgap encryptions...' },
        { progress: 100, log: '[TSS] Ceremony complete! Shares reshared and locked in vault.' }
    ]

    let idx = 0
    const interval = setInterval(() => {
        if (idx < steps.length) {
            keygenProgress.value = steps[idx].progress
            keygenLogs.value.push(steps[idx].log)
            idx++
        } else {
            clearInterval(interval)
            setTimeout(() => {
                mpcState.value = 'idle'
                showToast('🔑 Multi-chain keys successfully reshared across devices!')
            }, 600)
        }
    }, 450)
}

const showToast = (msg) => {
    toastMessage.value = msg
    setTimeout(() => {
        if (toastMessage.value === msg) {
            toastMessage.value = ''
        }
    }, 4000)
}

// Canvas Visualizers Loops
const initVisualizers = () => {
    const flightCanvas = flightCanvasRef.value
    const mpcCanvas = mpcCanvasRef.value

    let rocketX = 150
    let rocketY = 320

    // Parallax stars
    const stars = []
    for (let i = 0; i < 50; i++) {
        stars.push({
            x: Math.random() * 400,
            y: Math.random() * 500,
            speed: 0.2 + Math.random() * 1.5,
            size: 0.5 + Math.random() * 1.5,
            alpha: 0.1 + Math.random() * 0.9
        })
    }

    // Drifting Coins (VULT, RUNE, RUJI)
    const coins = []
    const spawnCoin = (w) => {
        const types = ['VULT', 'RUNE', 'RUJI']
        coins.push({
            x: Math.random() * w,
            y: -20,
            speed: 1.0 + Math.random() * 1.5,
            size: 8 + Math.random() * 6,
            type: types[Math.floor(Math.random() * types.length)],
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.05,
            glowing: Math.random() > 0.4
        })
    }

    // Rogue Threats (Malicious Nodes / Anomalies)
    const threats = []
    const spawnThreat = (w) => {
        threats.push({
            x: Math.random() * w,
            y: -20,
            speed: 1.5 + Math.random() * 2.0,
            size: 10 + Math.random() * 8,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.08,
            type: Math.random() > 0.5 ? 'malware' : 'leak'
        })
    }

    // Security Gateways (Green rings)
    const gateways = []
    const spawnGateway = (w) => {
        gateways.push({
            x: Math.random() * w,
            y: -20,
            speed: 0.8 + Math.random() * 1.0,
            size: 14 + Math.random() * 6,
            pulse: 0
        })
    }

    // Flame engine spark particles
    const sparks = []

    const renderLoop = () => {
        if (!isPlaying.value) {
            audioData.value.low += (0.05 - audioData.value.low) * 0.15
            audioData.value.mid += (0.05 - audioData.value.mid) * 0.15
            audioData.value.high += (0.05 - audioData.value.high) * 0.15
        }

        // A. Cinematic Meditative Flight Canvas
        if (flightCanvas && activeTab.value === 'flight') {
            const ctx = flightCanvas.getContext('2d')
            if (ctx) {
                const w = flightCanvas.width = flightCanvas.offsetWidth || 300
                const h = flightCanvas.height = flightCanvas.offsetHeight || 380

                // 1. Cosmic outer-space background
                const bgGrad = ctx.createLinearGradient(0, 0, 0, h)
                bgGrad.addColorStop(0, '#020306')
                bgGrad.addColorStop(0.5, '#04060c')
                bgGrad.addColorStop(1, '#080a14')
                ctx.fillStyle = bgGrad
                ctx.fillRect(0, 0, w, h)

                // 2. Parallax starry flight field
                ctx.fillStyle = '#ffffff'
                const isBoosting = interactivePropulsionTimer > 0
                if (isBoosting) interactivePropulsionTimer--

                stars.forEach(star => {
                    // Boost multiplies falling speed
                    const currentSpeed = star.speed * (isBoosting ? 6.0 : (isPlaying.value ? 1.0 : 0.15))
                    star.y += currentSpeed
                    if (star.y > h) {
                        star.y = 0
                        star.x = Math.random() * w
                    }
                    ctx.save()
                    ctx.globalAlpha = star.alpha
                    ctx.beginPath()
                    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
                    ctx.fill()
                    ctx.restore()
                })

                // 3. Falling crypto coins
                if (Math.random() < 0.015 && coins.length < 15) {
                    spawnCoin(w)
                }

                coins.forEach((coin, cIdx) => {
                    const coinSpeed = coin.speed * (isBoosting ? 5.0 : (isPlaying.value ? 1.1 : 0.2))
                    coin.y += coinSpeed
                    coin.rotation += coin.rotSpeed

                    // Collision detection with rocket
                    const distToRocket = Math.hypot(coin.x - rocketX, coin.y - rocketY)
                    if (distToRocket < (coin.size + 18)) {
                        // Collect coin!
                        gameScore.value += 10
                        showToast(`🪙 Secure multi-chain share collected! +10 XP`)
                        
                        // Spawn explosion/collection particles!
                        for (let p = 0; p < 8; p++) {
                            sparks.push({
                                x: coin.x,
                                y: coin.y,
                                vx: (Math.random() - 0.5) * 5,
                                vy: (Math.random() - 0.5) * 5,
                                size: 2 + Math.random() * 3,
                                alpha: 1.0,
                                color: coin.type === 'VULT' ? '#33E6BF' : (coin.type === 'RUNE' ? '#f59e0b' : '#c084fc')
                            })
                        }
                        
                        // Remove coin
                        coins.splice(cIdx, 1)
                        return
                    }

                    // Draw Coin
                    ctx.save()
                    ctx.translate(coin.x, coin.y)
                    ctx.rotate(coin.rotation)

                    // Coin outer glow
                    if (coin.glowing) {
                        ctx.shadowBlur = 10
                        if (coin.type === 'VULT') ctx.shadowColor = '#33E6BF'
                        else if (coin.type === 'RUNE') ctx.shadowColor = '#f59e0b'
                        else ctx.shadowColor = '#c084fc'
                    }

                    // Music-reactive pulse scale
                    const musicPulse = 1.0 + (isPlaying.value ? audioData.value.low * 0.35 : 0)
                    const pulseSize = coin.size * musicPulse

                    // Coin base
                    ctx.beginPath()
                    ctx.arc(0, 0, pulseSize, 0, Math.PI * 2)
                    if (coin.type === 'VULT') {
                        ctx.fillStyle = '#08252d'
                        ctx.strokeStyle = '#33E6BF'
                    } else if (coin.type === 'RUNE') {
                        ctx.fillStyle = '#2d1b08'
                        ctx.strokeStyle = '#f59e0b'
                    } else {
                        ctx.fillStyle = '#1d082d'
                        ctx.strokeStyle = '#c084fc'
                    }
                    ctx.lineWidth = 1.5
                    ctx.fill()
                    ctx.stroke()

                    // Central symbol
                    ctx.fillStyle = '#ffffff'
                    ctx.font = `bold ${pulseSize * 0.9}px "Courier New", monospace`
                    ctx.textAlign = 'center'
                    ctx.textBaseline = 'middle'
                    let symbol = 'V'
                    if (coin.type === 'RUNE') symbol = 'R'
                    if (coin.type === 'RUJI') symbol = 'Rj'
                    ctx.fillText(symbol, 0, 0)

                    ctx.restore()

                    // Delete coins below viewport
                    if (coin.y > h + 20) {
                        coins.splice(cIdx, 1)
                    }
                })

                // 3.1 Spawn and update threats (Red anomalous hacker asteroids)
                if (Math.random() < 0.012 && threats.length < 5) {
                    spawnThreat(w)
                }

                threats.forEach((threat, tIdx) => {
                    const threatSpeed = threat.speed * (isPlaying.value ? 1.2 : 0.3)
                    threat.y += threatSpeed
                    threat.rotation += threat.rotSpeed

                    // Collision detection with rocket
                    const distToRocket = Math.hypot(threat.x - rocketX, threat.y - rocketY)
                    if (distToRocket < (threat.size + 14)) {
                        // Impact! Lose shield
                        shieldIntegrity.value = Math.max(0, shieldIntegrity.value - 15)
                        showToast(`⚠️ Node anomalous attack blocked! Airgap shields: ${Math.floor(shieldIntegrity.value)}%`)
                        
                        // Spawn impact red particles!
                        for (let p = 0; p < 12; p++) {
                            sparks.push({
                                x: threat.x,
                                y: threat.y,
                                vx: (Math.random() - 0.5) * 6,
                                vy: (Math.random() - 0.5) * 6,
                                size: 2 + Math.random() * 4,
                                alpha: 1.0,
                                color: '#ef4444' // Red warning sparks
                            })
                        }

                        threats.splice(tIdx, 1)
                        return
                    }

                    // Render threat
                    ctx.save()
                    ctx.translate(threat.x, threat.y)
                    ctx.rotate(threat.rotation)

                    // Draw a red triangular hazard icon
                    ctx.shadowBlur = 8
                    ctx.shadowColor = '#ef4444'
                    ctx.fillStyle = '#1e0c0c'
                    ctx.strokeStyle = '#ef4444'
                    ctx.lineWidth = 1.5

                    ctx.beginPath()
                    ctx.moveTo(0, -threat.size)
                    ctx.lineTo(threat.size, threat.size)
                    ctx.lineTo(-threat.size, threat.size)
                    ctx.closePath()
                    ctx.fill()
                    ctx.stroke()

                    // Central exclamation/hazard mark
                    ctx.fillStyle = '#ffffff'
                    ctx.font = `bold ${threat.size * 0.8}px monospace`
                    ctx.textAlign = 'center'
                    ctx.textBaseline = 'middle'
                    ctx.fillText('!', 0, threat.size * 0.1)

                    ctx.restore()

                    // Delete threat below viewport
                    if (threat.y > h + 20) {
                        threats.splice(tIdx, 1)
                    }
                })

                // 3.2 Spawn and update gateways (Green rings)
                if (Math.random() < 0.007 && gateways.length < 2) {
                    spawnGateway(w)
                }

                gateways.forEach((gate, gIdx) => {
                    const gateSpeed = gate.speed * (isPlaying.value ? 1.0 : 0.2)
                    gate.y += gateSpeed
                    gate.pulse += 0.05

                    // Collision detection with rocket
                    const distToRocket = Math.hypot(gate.x - rocketX, gate.y - rocketY)
                    if (distToRocket < (gate.size + 12)) {
                        // Pass through gateway!
                        gameScore.value += 25
                        shieldIntegrity.value = Math.min(100, shieldIntegrity.value + 20)
                        showToast(`🛡️ Node Gateway validated! Shields recharged, +25 XP`)

                        // Spawn nice green gateway particles!
                        for (let p = 0; p < 15; p++) {
                            sparks.push({
                                x: gate.x,
                                y: gate.y,
                                vx: Math.cos(p * (Math.PI * 2 / 15)) * 4,
                                vy: Math.sin(p * (Math.PI * 2 / 15)) * 4,
                                size: 2.5 + Math.random() * 2,
                                alpha: 1.0,
                                color: '#10b981'
                            })
                        }

                        gateways.splice(gIdx, 1)
                        return
                    }

                    // Render gateway (glowing dashed green circle/ring)
                    ctx.save()
                    ctx.shadowBlur = 12
                    ctx.shadowColor = '#10b981'
                    ctx.strokeStyle = '#10b981'
                    ctx.lineWidth = 2 + Math.sin(gate.pulse) * 0.5
                    ctx.setLineDash([6, 4])
                    
                    ctx.beginPath()
                    ctx.arc(gate.x, gate.y, gate.size + Math.sin(gate.pulse) * 2, 0, Math.PI * 2)
                    ctx.stroke()
                    ctx.restore()

                    // Delete gateway below viewport
                    if (gate.y > h + 30) {
                        gateways.splice(gIdx, 1)
                    }
                })

                // 3.3 Regenerate Shield Slowly over time
                if (shieldIntegrity.value < 100) {
                    shieldIntegrity.value = Math.min(100, shieldIntegrity.value + 0.03)
                }

                // 4. Smooth ease of rocket position to targetX/targetY refs
                const ease = 0.08
                if (targetX.value === 150 && targetY.value === 250) {
                    targetX.value = w / 2
                    targetY.value = h - 60
                    rocketX = w / 2
                    rocketY = h - 60
                }
                rocketX += (targetX.value - rocketX) * ease
                rocketY += (targetY.value - rocketY) * ease

                // Keep rocket in bounds
                rocketX = Math.max(20, Math.min(w - 20, rocketX))
                rocketY = Math.max(50, Math.min(h - 40, rocketY))

                // Thrusters sparks spawn logic
                const spawnCount = isBoosting ? 12 : (isPlaying.value ? Math.floor(1 + audioData.value.low * 6) : 0)
                for (let s = 0; s < spawnCount; s++) {
                    sparks.push({
                        x: rocketX + (Math.random() - 0.5) * 12,
                        y: rocketY + 35,
                        vx: (Math.random() - 0.5) * 3,
                        vy: 4 + Math.random() * 6 * (isBoosting ? 3 : 1),
                        size: 1.5 + Math.random() * 3,
                        alpha: 1.0,
                        color: Math.random() > 0.4 ? '#33E6BF' : '#0077FF'
                    })
                }

                // Render thruster sparks
                sparks.forEach((spark, sIdx) => {
                    spark.x += spark.vx
                    spark.y += spark.vy
                    spark.alpha -= 0.025
                    if (spark.alpha <= 0) {
                        sparks.splice(sIdx, 1)
                    } else {
                        ctx.save()
                        ctx.globalAlpha = spark.alpha
                        ctx.fillStyle = spark.color
                        ctx.shadowBlur = 6
                        ctx.shadowColor = spark.color
                        ctx.beginPath()
                        ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2)
                        ctx.fill()
                        ctx.restore()
                    }
                })

                // 5. Draw Rocket Engine Flame
                if (isPlaying.value || isBoosting) {
                    ctx.save()
                    const flameHeight = (isBoosting ? 70 : 35 + audioData.value.low * 40)
                    const flameGrad = ctx.createLinearGradient(rocketX, rocketY + 38, rocketX, rocketY + 38 + flameHeight)
                    flameGrad.addColorStop(0, '#ffffff')
                    flameGrad.addColorStop(0.2, '#33E6BF')
                    flameGrad.addColorStop(0.6, 'rgba(0, 119, 255, 0.45)')
                    flameGrad.addColorStop(1, 'rgba(4, 6, 12, 0)')

                    ctx.shadowBlur = 15 + audioData.value.low * 15
                    ctx.shadowColor = '#33E6BF'

                    ctx.beginPath()
                    ctx.moveTo(rocketX - 10, rocketY + 35)
                    ctx.quadraticCurveTo(rocketX, rocketY + 42 + flameHeight, rocketX + 10, rocketY + 35)
                    ctx.closePath()
                    ctx.fillStyle = flameGrad
                    ctx.fill()
                    ctx.restore()
                }

                // 6. Draw Rocket body
                ctx.save()
                
                // Wing profiles (left and right)
                ctx.fillStyle = '#0a2240'
                ctx.strokeStyle = '#33E6BF'
                ctx.lineWidth = 1.5
                ctx.shadowBlur = 4
                ctx.shadowColor = '#33E6BF'

                // Left Wing
                ctx.beginPath()
                ctx.moveTo(rocketX - 8, rocketY + 5)
                ctx.lineTo(rocketX - 22, rocketY + 28)
                ctx.lineTo(rocketX - 8, rocketY + 28)
                ctx.closePath()
                ctx.fill()
                ctx.stroke()

                // Right Wing
                ctx.beginPath()
                ctx.moveTo(rocketX + 8, rocketY + 5)
                ctx.lineTo(rocketX + 22, rocketY + 28)
                ctx.lineTo(rocketX + 8, rocketY + 28)
                ctx.closePath()
                ctx.fill()
                ctx.stroke()

                // Main Capsule metallic hull
                const capsuleGrad = ctx.createLinearGradient(rocketX - 12, rocketY, rocketX + 12, rocketY)
                capsuleGrad.addColorStop(0, '#04152d')
                capsuleGrad.addColorStop(0.5, '#0c2e5c')
                capsuleGrad.addColorStop(1, '#04152d')
                ctx.fillStyle = capsuleGrad
                ctx.beginPath()
                ctx.moveTo(rocketX, rocketY - 45) // Nose tip
                ctx.bezierCurveTo(rocketX - 12, rocketY - 25, rocketX - 12, rocketY + 25, rocketX - 12, rocketY + 35) // left side
                ctx.lineTo(rocketX + 12, rocketY + 35) // bottom flat
                ctx.bezierCurveTo(rocketX + 12, rocketY + 25, rocketX + 12, rocketY - 25, rocketX, rocketY - 45) // right side
                ctx.closePath()
                ctx.fill()
                ctx.stroke()

                // Engine nozzles at bottom
                ctx.fillStyle = '#0f172a'
                ctx.strokeStyle = '#64748b'
                ctx.lineWidth = 1
                ctx.fillRect(rocketX - 7, rocketY + 35, 14, 4)

                // Nose cone neon highlight
                ctx.strokeStyle = '#33E6BF'
                ctx.lineWidth = 1.5
                ctx.beginPath()
                ctx.moveTo(rocketX, rocketY - 45)
                ctx.lineTo(rocketX - 3, rocketY - 35)
                ctx.stroke()

                // Glowing circular Window with circular Vultisig Logo inside!
                const windowRadius = 11
                ctx.beginPath()
                ctx.arc(rocketX, rocketY - 4, windowRadius, 0, Math.PI * 2)
                ctx.fillStyle = '#050c18'
                ctx.strokeStyle = '#33E6BF'
                ctx.lineWidth = 2
                ctx.shadowBlur = 10
                ctx.shadowColor = '#33E6BF'
                ctx.fill()
                ctx.stroke()

                // Draw miniature Vultisig geometric shape inside the window
                ctx.shadowBlur = 0
                ctx.strokeStyle = '#ffffff'
                ctx.lineWidth = 1.2
                const cx_window = rocketX
                const cy_window = rocketY - 4
                ctx.beginPath()
                // Top vertical leg
                ctx.moveTo(cx_window, cy_window + 3)
                ctx.lineTo(cx_window, cy_window - 7)
                // Left leg
                ctx.moveTo(cx_window, cy_window + 3)
                ctx.lineTo(cx_window - 6, cy_window + 6)
                // Right leg
                ctx.moveTo(cx_window, cy_window + 3)
                ctx.lineTo(cx_window + 6, cy_window + 6)
                ctx.stroke()

                ctx.restore()

                // 7. Dynamic Audio reactive overlay spectrum around rocket base
                if (isPlaying.value) {
                    ctx.save()
                    ctx.strokeStyle = 'rgba(51, 230, 191, 0.12)'
                    ctx.lineWidth = 2
                    ctx.beginPath()
                    ctx.arc(rocketX, rocketY + 12, 50 + audioData.value.mid * 20, 0, Math.PI * 2)
                    ctx.stroke()
                    ctx.restore()
                }

            }
        }

        // B. TSS Ceremony Tab 3 Connected nodes map
        if (mpcCanvas && activeTab.value === 'mpc') {
            const ctx = mpcCanvas.getContext('2d')
            if (ctx) {
                const w = mpcCanvas.width = mpcCanvas.offsetWidth || 280
                const h = mpcCanvas.height = mpcCanvas.offsetHeight || 180

                ctx.clearRect(0, 0, w, h)

                // Dynamic security mesh grid
                ctx.strokeStyle = 'rgba(51, 248, 255, 0.03)'
                ctx.lineWidth = 1
                for (let i = 0; i < w; i += 20) {
                    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke()
                }
                for (let j = 0; j < h; j += 20) {
                    ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(w, j); ctx.stroke()
                }

                const cx = w / 2
                const cy = h / 2

                // Interactive peers coordinates
                const nodes = [
                    { x: cx - 65, y: cy + 25, color: '#33E6BF', active: isPlaying.value || mpcState.value !== 'idle', label: 'Alpha' },
                    { x: cx + 65, y: cy + 25, color: '#33E6BF', active: isPlaying.value || mpcState.value !== 'idle', label: 'Beta' },
                    { x: cx, y: cy - 40, color: 'rgba(255, 255, 255, 0.2)', active: false, label: 'Cold Backup' }
                ]

                // Connect nodes to center secure TSS Hub
                nodes.forEach(node => {
                    ctx.beginPath()
                    ctx.moveTo(node.x, node.y)
                    ctx.lineTo(cx, cy)
                    if (node.active) {
                        ctx.strokeStyle = 'rgba(51, 230, 191, 0.35)'
                        ctx.lineWidth = 1.5 + Math.sin(Date.now() * 0.005) * 0.8
                    } else {
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
                        ctx.lineWidth = 1
                    }
                    ctx.stroke()
                })

                // Draw central vault key hub
                const hubSize = 12 + audioData.value.low * 12
                const hubGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, hubSize)
                hubGrad.addColorStop(0, '#33E6BF')
                hubGrad.addColorStop(1, 'rgba(4, 57, 199, 0.1)')
                ctx.fillStyle = hubGrad
                ctx.beginPath()
                ctx.arc(cx, cy, hubSize, 0, Math.PI * 2)
                ctx.fill()

                ctx.fillStyle = '#06080c'
                ctx.beginPath()
                ctx.arc(cx, cy, 6, 0, Math.PI * 2)
                ctx.fill()

                // Draw Nodes outer circles
                nodes.forEach(node => {
                    if (node.active) {
                        ctx.save()
                        ctx.strokeStyle = node.color
                        ctx.lineWidth = 1.5
                        ctx.shadowBlur = 8
                        ctx.shadowColor = node.color
                        ctx.beginPath()
                        ctx.arc(node.x, node.y, 8 + Math.sin(Date.now() * 0.006) * 2, 0, Math.PI * 2)
                        ctx.stroke()
                        ctx.restore()
                    }

                    // Solid node dot
                    ctx.fillStyle = node.active ? node.color : '#475569'
                    ctx.beginPath()
                    ctx.arc(node.x, node.y, 5, 0, Math.PI * 2)
                    ctx.fill()

                    // Text tag
                    ctx.fillStyle = '#94a3b8'
                    ctx.font = '8px monospace'
                    ctx.textAlign = 'center'
                    ctx.fillText(node.label, node.x, node.y + 16)
                })

            }
        }

        animationId = requestAnimationFrame(renderLoop)
    }

    renderLoop()
}

// 2. Initial Setup and Lifecycle hooks
onMounted(() => {
    updateTopUiHeight()
    window.addEventListener('resize', updateTopUiHeight)
    window.addEventListener('mouseup', handlePointerUp)
    window.addEventListener('touchend', handlePointerUp)
    window.addEventListener('keydown', handleKeyDown)

    // Override the native layout and player components
    if (playerSdk && typeof playerSdk.setUiConfig === 'function') {
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

    initVisualizers()

    // Gentle rates simulation ticker (keeping realistic price trends)
    rateIntervalId = setInterval(() => {
        vultPrice.value = parseFloat(Math.max(0.10, vultPrice.value + (Math.random() - 0.5) * 0.003).toFixed(3))
        runePrice.value = parseFloat(Math.max(4.00, runePrice.value + (Math.random() - 0.5) * 0.05).toFixed(2))
        rujiPrice.value = parseFloat(Math.max(0.05, rujiPrice.value + (Math.random() - 0.5) * 0.001).toFixed(3))
    }, 4500)

    // Local time ticker
    const updateTime = () => {
        const d = new Date()
        const hh = d.getHours().toString().padStart(2, '0')
        const mm = d.getMinutes().toString().padStart(2, '0')
        localTimeStr.value = `${hh}:${mm}`
    }
    updateTime()
    timeIntervalId = setInterval(updateTime, 1000)

    // SDK Event connections
    const onAudioFrame = (dataArray) => {
        if (dataArray && dataArray.length && isPlaying.value) {
            let l = 0, m = 0, h = 0
            const chunk = Math.floor(dataArray.length / 4)
            for (let i = 0; i < chunk; i++) l += dataArray[i]
            for (let i = chunk; i < chunk * 2; i++) m += dataArray[i]
            for (let i = chunk * 2; i < dataArray.length; i++) h += dataArray[i]

            audioData.value = {
                low: Math.min(1.0, l / (chunk * 255)),
                mid: Math.min(1.0, m / (chunk * 255)),
                high: Math.min(1.0, h / (chunk * 2 * 255))
            }
        }
    }

    const updateTrack = (track) => {
        if (!track) return
        trackInfo.value = {
            title: track.title || 'Dynamic Crypto Beat',
            artists: track.artists || (track.contributors?.primary?.map(a => a.name).join(', ') || 'Vultisig Resident'),
            cover: track.cover || null,
            duration: track.duration || 180000
        }
    }

    const onInit = (state) => {
        repeat.value = state.panes?.default?.repeat || 'none'
        if (state?.panes?.default?.track) {
            updateTrack(state.panes.default.track)
        }
        if (state?.panes?.default?.state) {
            playerState.value = state.panes.default.state
            isPlaying.value = (playerState.value === 'playing')
        }
        if (state?.panes?.default?.position !== undefined) {
            playbackPosition.value = state.panes.default.position
        }

        if (state?.styles) {
            const root = document.documentElement;

            Object.entries(state.styles).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    root.style.setProperty(key, value);
                }
            });
        }

        nextTick(() => {
            updateTopUiHeight()
        })
    }

    const onOpen = (payload) => {
        if (payload?.track) updateTrack(payload.track)
    }

    const onState = (payload) => {
        if (payload?.state) {
            playerState.value = payload.state
            isPlaying.value = (payload.state === 'playing')
        }
    }

    const onPosition = (payload) => {
        if (payload?.position !== undefined && !isSeeking.value) {
            playbackPosition.value = payload.position
        }
    }

    const onRepeat = (payload) => {
        if (payload?.value) {
            repeat.value = payload.value
        }
    }

    const onChange = ({ pane, type, payload }) => {
        if (pane !== 'default') return
        if (type === 'track') updateTrack(payload?.track)
        if (type === 'state') {
            playerState.value = payload?.state
            isPlaying.value = (payload?.state === 'playing')
        }
        if (type === 'position' && !isSeeking.value) playbackPosition.value = payload?.position
        if (type === 'repeat') repeat.value = payload?.value
    }

    if (playerSdk && typeof playerSdk.on === 'function') {
        playerSdk.on('init', onInit)
        playerSdk.on('open', onOpen)
        playerSdk.on('state', onState)
        playerSdk.on('position', onPosition)
        playerSdk.on('repeat', onRepeat)
        playerSdk.on('change', onChange)
        playerSdk.on('audioFrame', onAudioFrame)
    }

    onBeforeUnmount(() => {
        cancelAnimationFrame(animationId)
        clearInterval(rateIntervalId)
        clearInterval(timeIntervalId)
        window.removeEventListener('resize', updateTopUiHeight)
        window.removeEventListener('mouseup', handlePointerUp)
        window.removeEventListener('touchend', handlePointerUp)
        window.removeEventListener('keydown', handleKeyDown)

        if (playerSdk && typeof playerSdk.off === 'function') {
            playerSdk.off('init', onInit)
            playerSdk.off('open', onOpen)
            playerSdk.off('state', onState)
            playerSdk.off('position', onPosition)
            playerSdk.off('repeat', onRepeat)
            playerSdk.off('change', onChange)
            playerSdk.off('audioFrame', onAudioFrame)
        }
    })
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

/* Main System Backdrop Wrapper */
.vultisig-wrapper {
    position: fixed;
    inset: 0;
    background-color: #010204;
    color: #E2E8F0;
    overflow: hidden;
    z-index: 10;
    font-family: 'Outfit', sans-serif;
    user-select: none;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
}
@media (min-width: 640px) {
    .vultisig-wrapper {
        padding: 24px;
    }
}
@media (min-width: 768px) {
    .vultisig-wrapper {
        padding: 32px;
    }
}

/* Cosmic space dark background pattern */
.workspace-bg-space {
    position: absolute;
    inset: 0;
    background-size: 40px 40px;
    background-image: 
        radial-gradient(circle, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
    pointer-events: none;
    z-index: 1;
}

/* Immersive neon colored gas blurs */
.ambient-nebula {
    position: absolute;
    border-radius: 50%;
    filter: blur(150px);
    opacity: 0.07;
    pointer-events: none;
    z-index: 2;
}
.nebula-cyan {
    top: -20%;
    left: 10%;
    width: 420px;
    height: 420px;
    background-color: #33E6BF;
}
.nebula-blue {
    bottom: -20%;
    right: 10%;
    width: 480px;
    height: 480px;
    background-color: #0439C7;
}

/* HIGH-FIDELITY WEB/DASHBOARD CONTAINER (No phone emulation, fully responsive) */
.vault-app-container {
    position: relative;
    z-index: 10;
    width: 100%;
    max-width: 1120px; /* Gorgeous desktop landscape width */
    height: 85vh;
    min-height: 600px;
    max-height: 840px;
    background-color: #030407;
    border: 1px solid rgba(51, 230, 191, 0.16);
    border-radius: 16px;
    box-shadow: 
        0 25px 65px -15px rgba(0, 0, 0, 0.98),
        0 0 40px rgba(51, 230, 191, 0.03);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

/* BRAND HEADER PANEL */
.vault-app-header {
    background-color: #040509;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    display: flex;
    flex-direction: column;
    padding: 14px 20px;
    z-index: 30;
    position: relative;
    padding-top: calc(var(--max-safe-area-inset-top, var(--tg-safe-area-inset-top, 0px)) + var(--max-content-safe-area-inset-top, var(--tg-content-safe-area-inset-top, 0px)) + 14px);
}

.header-content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 16px;
}
@media (min-width: 768px) {
    .header-content {
        flex-direction: row;
        align-items: center;
    }
}

.brand-block {
    display: flex;
    align-items: center;
    gap: 10px;
}

.brand-logo-frame {
    display: flex;
    align-items: center;
    justify-content: center;
}

.brand-text-block {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.brand-title-group {
    display: flex;
    align-items: center;
    gap: 6px;
}

.brand-name {
    font-family: 'Outfit', sans-serif;
    color: #ffffff;
    letter-spacing: 0.05em;
    font-size: 14px;
    font-weight: 700;
    line-height: 1;
}

.vault-pill {
    font-family: 'JetBrains Mono', monospace;
    font-size: 8px;
    color: #33E6BF;
    padding: 2px 6px;
    border-radius: 2px;
    background-color: rgba(51, 230, 191, 0.1);
    border: 1px solid rgba(51, 230, 191, 0.2);
}

.vault-id {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: #94a3b8;
}

/* TAB SEGMENT CONTROL */
.tab-control-bar {
    display: flex;
    align-items: center;
    gap: 4px;
    background-color: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    padding: 4px;
    border-radius: 12px;
    margin-left: auto;
    margin-right: auto;
}
@media (min-width: 768px) {
    .tab-control-bar {
        margin-left: 0;
        margin-right: 0;
    }
}

.tab-btn {
    padding: 6px 16px;
    border-radius: 8px;
    font-family: 'Outfit', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    transition: all 0.2s ease;
    cursor: pointer;
    background: transparent;
    border: none;
}
.tab-btn.active {
    background-color: #33E6BF;
    color: #000000;
    box-shadow: 0 10px 15px -3px rgba(51, 230, 191, 0.2);
}
.tab-btn.inactive {
    color: #94a3b8;
}
.tab-btn.inactive:hover {
    color: #ffffff;
}

/* HEADER ACTION BADGES */
.header-action-panel {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}
@media (min-width: 768px) {
    .header-action-panel {
        justify-content: flex-end;
    }
}

.status-node-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 8px;
    background-color: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.2);
    color: #33E6BF;
    font-family: 'JetBrains Mono', monospace;
    font-size: 8px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
}

.pulse-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #33E6BF;
    animation: simple-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
@keyframes simple-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: .5; }
}

/* MINIMIZE AND CONTROL BADGES */
.minimize-icon-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 8px;
    background-color: rgba(255, 255, 255, 0.02);
    color: #94a3b8;
    border: 1px solid rgba(255, 255, 255, 0.05);
    transition: all 0.2s ease;
    cursor: pointer;
}
.minimize-icon-btn:hover {
    background-color: rgba(255, 255, 255, 0.08);
    color: #ffffff;
}
.minimize-icon-btn span {
    font-family: 'Outfit', sans-serif;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
}
.minimize-icon-btn svg {
    width: 14px;
    height: 14px;
}

/* MAIN APP PORTS VIEWPORT */
.app-main-content {
    flex-grow: 1;
    position: relative;
    overflow: hidden;
    background-color: #030406;
}

.tab-view-container {
    animation: tab-transition 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes tab-transition {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
}

/* TAB 1: FLIGHT VIEWPORT styles */
.flight-view {
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
}
@media (min-width: 1024px) {
    .flight-view {
        flex-direction: row;
    }
}

/* INTERACTIVE ROCKET FLIGHT CANVASES */
.flight-stage-container {
    flex-grow: 1;
    height: 320px;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    outline: none;
    user-select: none;
}
@media (min-width: 1024px) {
    .flight-stage-container {
        height: 100%;
    }
}

.flight-visual-canvas {
    width: 100%;
    height: 100%;
    display: block;
    image-rendering: auto;
    -webkit-tap-highlight-color: transparent;
    outline: none;
    user-select: none;
}

.flight-hud-panel {
    position: absolute;
    top: 16px;
    left: 16px;
    right: 16px;
    display: flex;
    justify-content: space-between;
    pointer-events: none;
    z-index: 10;
}
.hud-left, .hud-right {
    display: flex;
    flex-direction: column;
    gap: 2px;
}
.hud-right {
    align-items: flex-end;
}

.hud-mono-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 8px;
    color: #33E6BF;
    letter-spacing: 0.15em;
    text-transform: uppercase;
}
.hud-mono-label.gray {
    color: #94a3b8;
}
.hud-title {
    font-family: 'Outfit', sans-serif;
    color: #ffffff;
    font-size: 14px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 240px;
}
.hud-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: #33E6BF;
    font-weight: 700;
}
.hud-value.pulse-active {
    animation: simple-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.tutorial-badge {
    position: absolute;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: #94a3b8;
    background-color: rgba(0, 0, 0, 0.6);
    padding: 4px 12px;
    border-radius: 9999px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    pointer-events: none;
    text-align: center;
}

/* DETAILED BROADCASTING CONTROLS CARD */
.broadcast-control-card {
    background-color: rgba(5, 6, 10, 0.98);
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    padding: 24px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 16px;
    position: relative;
    z-index: 20;
    width: 100%;
    box-sizing: border-box;
}
@media (min-width: 1024px) {
    .broadcast-control-card {
        border-top: none;
        border-left: 1px solid rgba(255, 255, 255, 0.06);
        width: 420px;
        flex-shrink: 0;
    }
}

.track-meta-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
}

.track-title-info {
    min-width: 0;
    flex-grow: 1;
}

.secure-indicator-line {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
}

.secure-tag-text {
    font-family: 'JetBrains Mono', monospace;
    font-size: 8px;
    color: #33E6BF;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.15em;
}

.track-info-title {
    font-family: 'Outfit', sans-serif;
    color: #ffffff;
    font-weight: 700;
    font-size: 16px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.25;
    margin: 0;
}
.track-info-artists {
    font-family: 'Outfit', sans-serif;
    color: #94a3b8;
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin: 2px 0 0 0;
}

.like-action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.06);
    background-color: rgba(255, 255, 255, 0.01);
    color: #64748b;
    transition: all 0.2s ease;
    cursor: pointer;
}
.like-action-btn:hover {
    color: #ffffff;
}
.like-action-btn.liked {
    border-color: rgba(236, 72, 153, 0.3);
    background-color: rgba(236, 72, 153, 0.1);
    color: #f472b6;
}
.like-action-btn svg {
    width: 18px;
    height: 18px;
}

/* TIMELINE AND SEEK CONTROL */
.seek-timeline-wrap {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.timeline-slider-holder {
    position: relative;
    height: 12px;
    display: flex;
    align-items: center;
}

.timeline-slider-input {
    width: 100%;
    height: 100%;
    position: absolute;
    opacity: 0;
    z-index: 10;
    cursor: pointer;
    margin: 0;
}

.timeline-slider-bar {
    width: 100%;
    height: 4px;
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 9999px;
    overflow: hidden;
    position: relative;
}

.timeline-fill-bar {
    height: 100%;
    background: linear-gradient(to right, #2563eb, #33E6BF);
}

.timeline-slider-thumb {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #ffffff;
    border: 1px solid #33E6BF;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    transition: transform 0.15s ease, background-color 0.15s ease;
}

.timeline-time-info {
    display: flex;
    justify-content: space-between;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #64748b;
}

/* MEDIA DECK CONTROLS */
.player-actions-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 32px;
    margin-top: 8px;
}

.media-deck-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #cbd5e1;
}
.media-deck-btn:hover {
    color: #ffffff;
    transform: scale(1.08);
}
.media-deck-btn.active {
    color: #33E6BF;
}

.primary-play-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    border: none;
    background-color: #33E6BF;
    color: #07080b;
    box-shadow: 0 4px 12px rgba(51, 230, 191, 0.15);
}
.primary-play-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 10px 15px -3px rgba(51, 230, 191, 0.2);
}
.primary-play-btn.playing {
    background-color: #ffffff;
    color: #000000;
}

.spinning-loader {
    width: 24px;
    height: 24px;
    color: currentColor;
    animation: rotate-spin 1s linear infinite;
}
@keyframes rotate-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

/* TAB 2: SECURED VAULT WALLET */
.vault-view {
    height: 100%;
    overflow-y: auto;
    padding: 24px;
    box-sizing: border-box;
}

.vault-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
    align-items: start;
}
@media (min-width: 1024px) {
    .vault-grid {
        grid-template-columns: repeat(12, minmax(0, 1fr));
    }
}

.vault-left-panel {
    display: flex;
    flex-direction: column;
    gap: 20px;
}
@media (min-width: 1024px) {
    .vault-left-panel {
        grid-column: span 5 / span 5;
    }
}

.secured-vault-card {
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.01));
    border: 1px solid rgba(255, 255, 255, 0.06);
    padding: 24px;
    border-radius: 12px;
    text-align: center;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
}

.balance-card-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: #94a3b8;
    letter-spacing: 0.15em;
    text-transform: uppercase;
}
.balance-card-value {
    font-family: 'Outfit', sans-serif;
    color: #ffffff;
    font-size: 30px;
    font-weight: 800;
    margin-top: 6px;
    letter-spacing: -0.025em;
    line-height: 1;
}
.balance-trend-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin-top: 12px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #34d399;
    font-weight: 700;
}
.green-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #34d399;
}

.wallet-action-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
}

/* WALLET ACTIONS CIRCLES BUTTONS */
.wallet-action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: none;
    cursor: pointer;
}

.action-btn-circle {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    transition: all 0.2s ease;
}
.wallet-action-btn:hover .action-btn-circle {
    background-color: rgba(51, 230, 191, 0.06);
    border-color: rgba(51, 230, 191, 0.25);
    transform: translateY(-1.5px);
}
.action-btn-circle.green-accent {
    background-color: rgba(16, 185, 129, 0.1);
    border-color: rgba(16, 185, 129, 0.3);
    color: #33E6BF;
}

.action-btn-label {
    font-size: 9px;
    color: #94a3b8;
}
.action-btn-label.keygen-label {
    font-weight: 700;
    color: #33E6BF;
}

.claim-booster-btn {
    width: 100%;
    margin-top: 8px;
    padding: 12px 0;
    border-radius: 12px;
    font-family: 'Outfit', sans-serif;
    font-size: 11px;
    font-weight: 700;
    color: #33E6BF;
    border: 1px solid rgba(51, 230, 191, 0.25);
    background-color: rgba(51, 230, 191, 0.02);
    transition: all 0.2s ease;
    text-align: center;
    cursor: pointer;
}
.claim-booster-btn:hover {
    background-color: rgba(51, 230, 191, 0.1);
    border-color: #33E6BF;
}

.vault-right-panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
}
@media (min-width: 1024px) {
    .vault-right-panel {
        grid-column: span 7 / span 7;
    }
}

.section-title {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    padding-left: 4px;
}

/* MULTI-CHAIN VAULT BALANCE CARDS */
.crypto-asset-tile {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #090b10;
    border: 1px solid rgba(255, 255, 255, 0.03);
    padding: 10px 14px;
    border-radius: 12px;
    transition: all 0.25s ease;
}
.crypto-asset-tile:hover {
    background-color: #0d1017;
    border-color: rgba(51, 230, 191, 0.12);
    transform: translateY(-0.5px);
}

.asset-details-left {
    display: flex;
    align-items: center;
    gap: 12px;
}

.asset-logo-box {
    width: 26px;
    height: 26px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
}
.asset-logo-box.vult-bg {
    background-color: rgba(51, 230, 191, 0.1);
}
.asset-logo-box.rune-bg {
    background-color: rgba(245, 158, 11, 0.1);
}
.asset-logo-box.ruji-bg {
    background-color: rgba(99, 102, 241, 0.1);
}
.asset-logo-box.btc-bg {
    background-color: rgba(249, 115, 22, 0.1);
}
.asset-logo-box.eth-bg {
    background-color: rgba(99, 102, 241, 0.1);
}

.asset-names {
    display: flex;
    flex-direction: column;
}

.asset-name-text {
    font-family: 'Outfit', sans-serif;
    color: #ffffff;
    font-size: 14px;
    font-weight: 600;
}
.asset-network-text {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: #94a3b8;
}
.asset-network-text.text-green {
    color: #33E6BF;
}

.asset-values {
    text-align: right;
    display: flex;
    flex-direction: column;
}

.asset-amount-text {
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    font-weight: 600;
    color: #ffffff;
}
.asset-fiat-text {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    color: #33E6BF;
    font-weight: 600;
}

/* TAB 3: MPC CO-SIGNING CO-SIGN CEREMONY */
.mpc-view {
    height: 100%;
    overflow-y: auto;
    padding: 24px;
    box-sizing: border-box;
}

.mpc-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 24px;
    align-items: start;
}
@media (min-width: 1024px) {
    .mpc-grid {
        grid-template-columns: repeat(12, minmax(0, 1fr));
    }
}

.mpc-left-panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
}
@media (min-width: 1024px) {
    .mpc-left-panel {
        grid-column: span 5 / span 5;
    }
}

.mpc-title-block {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.mpc-tag-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 8px;
    color: #33E6BF;
    text-transform: uppercase;
    letter-spacing: 0.15em;
}
.mpc-title-text {
    font-family: 'Outfit', sans-serif;
    color: #ffffff;
    font-size: 16px;
    font-weight: 700;
    line-height: 1;
    margin: 0;
}
.mpc-desc-text {
    font-family: 'Outfit', sans-serif;
    color: #94a3b8;
    font-size: 12px;
    margin: 4px 0 0 0;
    line-height: 1.5;
}

.visualizer-container {
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    background-color: #030406;
    overflow: hidden;
    position: relative;
    height: 220px;
}

.live-node-badge {
    position: absolute;
    top: 8px;
    left: 12px;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 8px;
    color: #33E6BF;
}

.ping-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #22d3ee;
    animation: simple-ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}
@keyframes simple-ping {
    75%, 100% {
        transform: scale(2);
        opacity: 0;
    }
}

.mpc-graphics-canvas {
    width: 100%;
    height: 100%;
    display: block;
}

.re-reshare-btn {
    width: 100%;
    padding: 12px 0;
    border-radius: 12px;
    font-family: 'Outfit', sans-serif;
    font-size: 11px;
    font-weight: 700;
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.1);
    background-color: rgba(239, 68, 68, 0.05);
    transition: all 0.2s ease;
    text-align: center;
    cursor: pointer;
}
.re-reshare-btn:hover {
    background-color: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.3);
}

.mpc-right-panel {
    display: flex;
    flex-direction: column;
    gap: 16px;
}
@media (min-width: 1024px) {
    .mpc-right-panel {
        grid-column: span 7 / span 7;
    }
}

.connected-nodes {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

/* PEER STATUS LIST ON CEREMONY */
.node-status-tile {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #080a0e;
    border: 1px solid rgba(255, 255, 255, 0.03);
    padding: 8px 12px;
    border-radius: 10px;
    transition: all 0.3s ease;
}

.node-left-details {
    display: flex;
    align-items: center;
    gap: 10px;
}

.node-indicator-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #475569;
    transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.node-linked {
    border-color: rgba(51, 230, 191, 0.15);
    background-color: rgba(51, 230, 191, 0.01);
}
.node-linked .node-indicator-dot {
    background-color: #10B981;
    box-shadow: 0 0 6px #10B981;
}

.node-status-tile.offline {
    opacity: 0.45;
}

.node-text-block {
    display: flex;
    flex-direction: column;
}

.node-name {
    font-family: 'Outfit', sans-serif;
    color: #ffffff;
    font-size: 12px;
    font-weight: 600;
}
.node-desc {
    font-family: 'JetBrains Mono', monospace;
    font-size: 8px;
    color: #64748b;
}

.node-status-text {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    color: #64748b;
}
.node-status-text.node-active-text {
    color: #34d399;
    animation: simple-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.recent-signs-log {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 4px;
}

.signed-tx-history {
    overflow-y: auto;
    max-height: 140px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding-right: 6px;
}

/* SIGNED TRANSACTIONS HISTORY LOG */
.tx-history-row {
    display: grid;
    grid-template-columns: 1.1fr 2fr 1.3fr 0.9fr;
    font-size: 8px;
    padding: 5px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.02);
    align-items: center;
}
.tx-history-row:last-child {
    border-bottom: none;
}

.tx-log-time {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: #64748b;
}
.tx-log-hash {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9.5px;
    color: #cbd5e1;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.tx-log-action {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: #33E6BF;
    font-weight: 700;
    text-align: center;
}
.tx-log-status {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: #34d399;
    font-weight: 700;
    text-align: right;
}

/* TSS KEYGEN CEREMONY OVERLAYS */
.mpc-ceremony-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(2, 3, 5, 0.93);
    backdrop-filter: blur(10px);
    z-index: 100;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 16px;
}

.mpc-ceremony-modal {
    background-color: #06080c;
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 20px;
    border-radius: 16px;
    max-width: 320px;
    width: 100%;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    z-index: 50;
    box-sizing: border-box;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    padding-bottom: 12px;
    margin-bottom: 12px;
}

.modal-header-left {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.modal-title {
    color: #33E6BF;
    font-weight: 800;
    font-size: 10px;
    letter-spacing: 0.15em;
    font-family: 'JetBrains Mono', monospace;
}
.modal-subtitle {
    color: #64748b;
    font-size: 8px;
    font-family: 'JetBrains Mono', monospace;
    text-transform: uppercase;
}

.modal-terminal-logs {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: rgba(51, 230, 191, 0.9);
    padding: 12px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.04);
    background-color: #020305;
    height: 128px;
    overflow-y: auto;
    margin-bottom: 12px;
    line-height: 1.625;
    display: flex;
    flex-direction: column;
    gap: 4px;
    box-sizing: border-box;
}

.modal-progressbar {
    background-color: rgba(255, 255, 255, 0.03);
    height: 6px;
    border-radius: 9999px;
    overflow: hidden;
    margin-bottom: 6px;
    position: relative;
}
.modal-progressfill {
    background: linear-gradient(to right, #2563eb, #33E6BF);
    height: 100%;
    transition: width 0.3s ease;
}

.modal-footer-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9px;
    color: #94a3b8;
}
.modal-footer-percentage {
    color: #33E6BF;
    font-weight: 700;
}

/* CONSOLE TOAST ALERTS (FULL-WIDTH FLOATING STYLE) */
.vultisig-console-toast {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    transform: translateY(-100%);
    z-index: 50;
    display: flex;
    justify-content: center;
    pointer-events: none;
    box-sizing: border-box;
    padding: 0;
}

.toast-content-wrapper {
    background: rgba(3, 4, 7, 0.98);
    border-top: 1px solid rgba(51, 230, 191, 0.4);
    border-bottom: 1px solid rgba(51, 230, 191, 0.4);
    color: #33E6BF;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9.5px;
    font-weight: 500;
    padding: 6px 16px;
    width: 100%;
    backdrop-filter: blur(8px);
    box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.5);
    text-align: left;
    display: flex;
    align-items: center;
    gap: 8px;
    pointer-events: auto;
    box-sizing: border-box;
    animation: slide-up 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-indicator-dot {
    width: 5px;
    height: 5px;
    background-color: #33E6BF;
    border-radius: 50%;
    box-shadow: 0 0 6px #33E6BF;
    flex-shrink: 0;
    animation: indicator-flash 1s infinite alternate;
}

.toast-body-text {
    font-family: 'JetBrains Mono', monospace;
    letter-spacing: 0.02em;
    text-transform: uppercase;
}

@keyframes slide-up {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes indicator-flash {
    from { opacity: 0.4; }
    to { opacity: 1; }
}

.fade-toast-enter-active, .fade-toast-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-toast-enter-from, .fade-toast-leave-to {
    opacity: 0;
    transform: translateY(-90%) scaleY(0.9);
}

/* HELPER GAME AND HUD INTERACTIVE OVERLAY STYLE RULES */
.flight-steering-overlay-tip {
    position: absolute;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    font-family: 'JetBrains Mono', monospace;
    font-size: 8px;
    color: #64748b;
    background-color: rgba(3, 4, 8, 0.85);
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid rgba(51, 230, 191, 0.15);
    pointer-events: none;
    text-align: center;
    white-space: nowrap;
    z-index: 10;
}

.hud-game-stats {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    color: #cbd5e1;
    letter-spacing: 0.02em;
}

.threat-text {
    color: #ef4444;
    animation: simple-pulse 1s infinite alternate;
}

.warning-dot {
    background-color: #ef4444 !important;
    box-shadow: 0 0 8px #ef4444 !important;
}

/* MOBILE AND TABLET RESPONSIVE ADAPTATION */
@media (max-width: 1024px) {
    .vault-app-container {
        max-width: 100vw;
        max-height: 100vh;
        height: 100vh;
        border-radius: 0;
        border: none;
        box-shadow: none;
    }
}

/* BOTTOM TAB NAVIGATION BAR STYLE RULES */
.bottom-tab-menu-bar {
    background-color: #040509;
    border-top: 1px solid rgba(255, 255, 255, 0.04);
    padding: 10px 20px;
    z-index: 30;
    position: relative;
    width: 100%;
    box-sizing: border-box;
}

.bottom-tab-content {
    display: flex;
    justify-content: space-around;
    align-items: center;
    max-width: 480px;
    margin: 0 auto;
    gap: 12px;
}

.bottom-tab-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 8px 16px;
    border-radius: 10px;
    font-family: 'Outfit', sans-serif;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.05em;
    transition: all 0.2s ease;
    cursor: pointer;
    background: transparent;
    border: none;
    flex: 1;
    min-width: 70px;
}

.bottom-tab-btn.active {
    background-color: rgba(51, 230, 191, 0.1);
    color: #33E6BF;
    border: 1px solid rgba(51, 230, 191, 0.2);
}

.bottom-tab-btn.inactive {
    color: #94a3b8;
    border: 1px solid transparent;
}

.bottom-tab-btn.inactive:hover {
    color: #ffffff;
    background-color: rgba(255, 255, 255, 0.02);
}

.tab-icon {
    transition: transform 0.2s ease;
}

.bottom-tab-btn:hover .tab-icon {
    transform: translateY(-1px);
}
</style>
