<template>
  <div class="sixseven-container" :class="[theme]">
    <!-- Main Scrollable Body -->
    <div class="content-scroll">
      
      <!-- HEADER / BADGE -->
      <div class="header-card">
        <div class="badge-header">
          <span class="badge-system-title">{{ currentLocaleData.systemBadge }}</span>
          <span class="badge-version">VER. 6.7</span>
        </div>
        <h1 class="header-title">{{ currentLocaleData.title }}</h1>
        <p class="header-desc">{{ currentLocaleData.description }}</p>
      </div>

      <!-- TRACK INFO (NEO-BRUTALIST COVER ART & INFO) -->
      <div class="track-info-card">
        <div class="imba-badge">
          {{ currentLocaleData.imba }}
        </div>

        <div class="track-inner-layout">
          <!-- Album Cover -->
          <div class="album-cover-wrapper">
            <img 
              :src="currentTrack?.cover?.resized || 'https://picsum.photos/seed/music/300/300'" 
              alt="Track Cover" 
              class="album-cover-img"
              :class="{ 'spinning': isPlaying }"
              referrerPolicy="no-referrer"
            />
            <div class="album-hover-overlay">
              <span class="album-overlay-badge">6-7 / 10</span>
            </div>
          </div>

          <!-- Titles -->
          <div class="track-titles-block">
            <span class="now-playing-badge">
              {{ currentLocaleData.nowPlaying }}
            </span>
            <h2 class="track-title-text">
              {{ currentTrack?.title || currentLocaleData.silence }}
            </h2>
            <p class="track-artists-text">
              {{ currentTrack?.artists || currentLocaleData.unknownArtist }}
            </p>

            <!-- Verdict -->
            <div class="verdict-tags-wrapper">
              <span class="tag-rating">
                {{ currentLocaleData.score }}
              </span>
              <span class="tag-vibe">
                {{ currentLocaleData.vibe }}
              </span>
              <span v-if="currentTrack?.bpm" class="tag-bpm">
                BPM: {{ currentTrack.bpm }}
              </span>
            </div>
          </div>
        </div>

        <!-- Progress bar replacement -->
        <div class="progress-container-block">
          <div class="progress-labels-row">
            <span>{{ formatTime(playedMs) }}</span>
            <span class="progress-text-middle">{{ currentLocaleData.progressText }}</span>
            <span>{{ formatTime(durationMs) }}</span>
          </div>
          <!-- Custom interactive progress line -->
          <div 
            class="progress-interactive-bar"
            @click="handleScrub"
            ref="progressBarRef"
          >
            <div 
              class="progress-fill"
              :style="{ width: `${progressPercent}%` }"
            >
              <span v-if="progressPercent > 15" class="progress-percent-label">
                {{ Math.floor(progressPercent) }}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 6-7 GRAPHIC EQUALIZER VISUALIZER (ACTUAL MUSIC DATA) -->
      <div class="visualizer-card">
        <h3 class="visualizer-title">
          <span class="ping-container">
            <span class="ping-outer"></span>
            <span class="ping-inner"></span>
          </span>
          {{ currentLocaleData.spectrogram }}
        </h3>

        <!-- Exactly 7 columns visualizer -->
        <div class="equalizer-container">
          <div 
            v-for="(val, index) in visualizerBars" 
            :key="index"
            class="equalizer-bar"
            :style="{ 
              height: `${Math.max(8, val * 100)}%`,
              backgroundColor: getColumnColor(index)
            }"
          >
            <!-- Overlay indicator -->
            <div class="equalizer-bar-tooltip">
              {{ Math.round(val * 10) }}
            </div>
          </div>
        </div>

        <div class="equalizer-labels-row">
          <span 
            v-for="(label, idx) in currentLocaleData.eqLabels" 
            :key="idx"
            :class="{ 'active-eq-label': idx === currentLocaleData.eqLabels.length - 1 }"
          >
            {{ label }}
          </span>
        </div>
      </div>

      <!-- MEME INTERACTIVES GRID -->
      <div class="meme-grid">
        
        <!-- Interactive Vibe Slider -->
        <div class="vibe-meter-card">
          <div>
            <h3 class="card-title">{{ currentLocaleData.vibeMeterTitle }}</h3>
            <p class="card-desc">{{ currentLocaleData.vibeMeterDesc }}</p>
          </div>
          
          <div class="slider-block">
            <input 
              type="range" 
              min="0" 
              max="10" 
              step="0.1" 
              v-model="vibeValue" 
              class="custom-range-slider"
              @change="lockInVibe"
            />
            <div class="slider-labels-row">
              <span>{{ currentLocaleData.cringe }}</span>
              <span class="text-rose-accent">{{ currentLocaleData.imbaVibe }}</span>
              <span>{{ currentLocaleData.gigachad }}</span>
            </div>
          </div>

          <div class="status-box">
            <span class="status-label">{{ currentLocaleData.vibeStatusPrefix }}</span>
            <span class="status-badge">
              {{ getVibeStatusText(vibeValue) }}
            </span>
          </div>
        </div>

        <!-- Excuse Generator -->
        <div class="excuse-card">
          <div>
            <h3 class="card-title">{{ currentLocaleData.excuseGeneratorTitle }}</h3>
            <p class="card-desc">{{ currentLocaleData.excuseGeneratorDesc }}</p>
          </div>

          <div class="excuse-display-box">
            "{{ currentExcuse }}"
            <span class="legit-badge">
              100% Legit
            </span>
          </div>

          <button 
            @click="generateNewExcuse"
            class="generate-button"
          >
            {{ currentLocaleData.generateExcuseBtn }}
          </button>
        </div>
      </div>

      <!-- SOUNDBOARD & EXPERT ADVICE -->
      <div class="expert-card">
        <div class="expert-layout">
          <!-- Expert Avatar -->
          <div class="expert-avatar-wrapper">
            <div class="expert-avatar-inner">
              😎
            </div>
          </div>

          <!-- Dialog speech balloon -->
          <div class="expert-speech-balloon-wrapper">
            <div class="expert-speech-balloon">
              <p class="expert-intro-text">
                {{ currentLocaleData.expertVerdictIntro }}
              </p>
              <p class="expert-verdict-text">
                — "{{ expertVerdict }}"
              </p>
            </div>
          </div>
        </div>

        <div class="expert-buttons-row">
          <button 
            @click="askExpert"
            class="action-btn action-btn-indigo"
          >
            {{ currentLocaleData.askExpertBtn }}
          </button>
          
          <button 
            @click="triggerBeepSynth(670, 0.15)"
            class="action-btn action-btn-rose"
          >
            {{ currentLocaleData.synthBtn }}
          </button>
        </div>
      </div>

      <!-- DETAILED SPECIFICATIONS (SYSTEM STATE LABELS) -->
      <div class="specs-card">
        <h4 class="specs-header-title">{{ currentLocaleData.systemStatusTitle }}</h4>
        <div class="specs-grid">
          <div class="spec-item">
            <span class="spec-label">{{ currentLocaleData.currentUser }}</span>
            <span class="text-indigo-accent">{{ currentUserHash }}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">{{ currentLocaleData.notchInset }}</span>
            <span>{{ stylesMap['--tg-safe-area-inset-top'] || '0px' }}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">{{ currentLocaleData.systemState }}</span>
            <span :class="isPlaying ? 'text-emerald-accent' : 'text-rose-accent'">{{ isPlaying ? currentLocaleData.playingKaif : currentLocaleData.pausedDust }}</span>
          </div>
          <div class="spec-item">
            <span class="spec-label">{{ currentLocaleData.themeStyling }}</span>
            <span class="text-theme-val">{{ theme }}</span>
          </div>
        </div>
      </div>

    </div>

    <!-- CUSTOM FIXED HARDWARE CONTROLLER PANEL AT BOTTOM -->
    <div class="fixed-controller">
        <div class="ctrl-row-layout">
            
            <!-- Minimize button -->
            <button 
                @click="collapsePlayer" 
                class="ctrl-btn bg-cyan-btn"
                :title="minimizeBtnTitle"
            >
                <svg class="ctrl-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="4 14 10 14 10 20"></polyline>
                    <polyline points="20 10 14 10 14 4"></polyline>
                    <line x1="14" y1="10" x2="21" y2="3"></line>
                    <line x1="10" y1="14" x2="3" y2="21"></line>
                </svg>
            </button>

            <!-- Previous button -->
            <button 
                @click="playerSdk.prev()" 
                class="ctrl-btn bg-yellow-btn"
                :title="currentLocaleData.prevBtnTitle"
            >
                <svg class="ctrl-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <path d="M19 20L9 12L19 4V20Z" fill="currentColor"/>
                    <line x1="5" y1="4" x2="5" y2="20" stroke="currentColor"/>
                </svg>
            </button>

            <!-- Main custom Play/Pause -->
            <button 
                @click="togglePlayback" 
                class="play-pause-big"
                :class="isPlaying ? 'bg-rose-btn' : 'bg-lime-btn'"
            >
                <span class="play-pause-btn-text">
                    {{ isPlaying ? currentLocaleData.pauseBtn : currentLocaleData.playBtn }}
                </span>
            </button>

            <!-- Next button -->
            <button 
                @click="playerSdk.next()" 
                class="ctrl-btn bg-yellow-btn"
                :title="currentLocaleData.nextBtnTitle"
            >
                <svg class="ctrl-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <path d="M5 4L15 12L5 20V4Z" fill="currentColor"/>
                    <line x1="19" y1="4" x2="19" y2="20" stroke="currentColor"/>
                </svg>
            </button>

            <!-- Like button -->
            <button 
                @click="toggleLike" 
                class="ctrl-btn bg-pink-btn"
                :title="likeBtnTitle"
            >
                <svg class="ctrl-icon" :class="{ 'liked-active': reaction === 'LIKE' }" viewBox="0 0 24 24" :fill="reaction === 'LIKE' ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="3">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
            </button>

            <!-- Playlist button -->
            <button 
                @click="openPlaylist" 
                class="ctrl-btn bg-violet-btn"
                :title="playlistBtnTitle"
            >
                <svg class="ctrl-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
            </button>

        </div>
    </div>

    <!-- Haptic feedback screen shake indicator -->
    <div v-if="triggerShake" class="shake-overlay"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { playerSdk } from '@bilbomusic/player-plugin-sdk'

// -----------------------------------------------------------------
// 1. DICTIONARIES & LOCALIZATION STRINGS
// -----------------------------------------------------------------
const locales = {
  "en-US": {
    systemBadge: "🔥 CRITIC CORE RATING SYSTEM",
    title: "SIX-SEVEN Player",
    description: "The ultimate player for music critics and rating nerds. Rating of literally everything: strictly 6-7 out of 10.",
    imba: "BASE!",
    nowPlaying: "NOW PLAYING",
    silence: "Silence in the air...",
    unknownArtist: "Obscure Noname",
    score: "RATING: 6-7/10",
    vibe: "VIBE: SIX-SEVEN",
    progressText: "PROGRESS: SIX SEVENTHS",
    spectrogram: "SPECTROGRAM \"SIX-SEVEN\" (6-7 BARS)",
    eqLabels: ["S (Bass)", "I", "X", "-", "S", "E", "V (Highs)"],
    vibeMeterTitle: "🎛️ DYNAMIC CRITIC-METER",
    vibeMeterDesc: "Adjust your level of nitpicking and praise. Warning: system locked on the perfect score!",
    cringe: "0 (Cringe)",
    imbaVibe: "6-7 (Base)",
    gigachad: "10 (Masterpiece)",
    vibeStatusPrefix: "Current status: ",
    vibeStatuses: {
      imba: "BASE (6.7 LOCK-IN)",
      cringe: "CRINGE",
      dull: "DULL",
      sixSeven: "SIX-SEVEN",
      pon: "SOLVED"
    },
    excuseGeneratorTitle: "📝 MUSIC CRITIC EXCUSE GENERATOR",
    excuseGeneratorDesc: "Need a solid excuse for your review or lack of depth? Always blame 6-7.",
    generateExcuseBtn: "GENERATE EXCUSE",
    excuses: [
      "I listened to the LP, it's a solid 6-7, but the charisma was completely missing.",
      "The mix is a 6-7, the vocals are buried in the track.",
      "The lyrics are a 6-7, just generic rhymes about heartbreak.",
      "I have 6-7 missed calls from the beatmaker. If I don't survive, sell my vinyl collection.",
      "My disappointment is immeasurable, and my rating is strictly a 6-7.",
      "I rate this task strictly 6-7 out of 10 on structure.",
      "This track is such a mid, I've replayed it 6-7 times trying to find any substance.",
      "Like 6-7 times today I wanted to delete my review blog and move to Thailand."
    ],
    expertVerdictIntro: "Listen, bro. I analyzed your playlist, mixing, rhymes, and level of dullness. My expert verdict is...",
    askExpertBtn: "🗣️ ASK EXPERT",
    synthBtn: "🎹 '6-7' SYNTHESIZER",
    expertVerdicts: [
      "Well, about six-seven.",
      "Strictly six-seven out of ten, pure default.",
      "Not cringe, but not a masterpiece. About six-seven.",
      "Six-seven seconds of listening and you are tilted, bro.",
      "Certified bop at sixty-seven percent!",
      "I see. My rating: ironclad 6.7!"
    ],
    systemStatusTitle: "🗃️ SYSTEM STATUS IN OFFICIAL SDK",
    currentUser: "CURRENT USER:",
    notchInset: "NOTCH INSET TOP:",
    systemState: "SYSTEM STATE:",
    themeStyling: "THEME STYLING:",
    playingKaif: "PLAYING (KAIF)",
    pausedDust: "PAUSED (DUST)",
    prevBtnTitle: "This way (Prev)",
    nextBtnTitle: "That way (Next)",
    playBtn: "BOP",
    pauseBtn: "MID"
  },
  "ru-RU": {
    systemBadge: "🔥 СИСТЕМА ОЦЕНКИ SIX-SEVEN",
    title: "SIX-SEVEN Player",
    description: "Дефолтный плеер для настоящих ценителей и музыкальных критиков. Оценка всего на свете: строго 6-7 из 10.",
    imba: "ИМБА!",
    nowPlaying: "СЕЙЧАС ИГРАЕТ",
    silence: "Тишина в эфире...",
    unknownArtist: "Очередной ноунейм",
    score: "ОЦЕНКА: 6-7/10",
    vibe: "ВАЙБ: SIX-SEVEN",
    progressText: "ПРОГРЕСС: ШЕСТЬ СЕМЫХ",
    spectrogram: "СПЕКТРОГРАММА \"SIX-SEVEN\" (6-7 СТОЛБЦОВ)",
    eqLabels: ["S (Bass)", "I", "X", "-", "S", "E", "V (Highs)"],
    vibeMeterTitle: "🎛️ ДИНАМИЧЕСКИЙ КРИТИКОМЕТР",
    vibeMeterDesc: "Настрой уровень душноты и базы. Осторожно: система заблокирована на идеальной оценке!",
    cringe: "0 (Кринж)",
    imbaVibe: "6-7 (База)",
    gigachad: "10 (Вышка)",
    vibeStatusPrefix: "Текущий статус: ",
    vibeStatuses: {
      imba: "ИМБА (6.7 LOCK-IN)",
      cringe: "КРИНЖ",
      dull: "ДУШНО",
      sixSeven: "SIX-SEVEN",
      pon: "РЕШЕНО"
    },
    excuseGeneratorTitle: "📝 ГЕНЕРАТОР ОПРАВДАНИЙ РЕЦЕНЗЕНТА",
    excuseGeneratorDesc: "Нужно оправдание перед подписчиками или артистом? Всегда ссылайся на 6-7.",
    generateExcuseBtn: "СГЕНЕРИРОВАТЬ ОПРАВДАНИЕ",
    excuses: [
      "Я послушал альбом, это крепкие 6-7, но харизма просела.",
      "Мне осталось написать 6-7 строчек рецензии, но я уже жестко устал душнить.",
      "Сведение трека максимум на 6-7, капу вообще не слышно в миксе.",
      "У меня 6-7 пропущенных от оскорбленного рэпера. Если не выживу — продайте мой плейлист.",
      "Текст трека на уровне 6-7 летнего ребенка. Рифмы на глаголы.",
      "Оцениваю этот релиз строго на 6-7 по структуре и ритмике.",
      "Этот трек настолько средний, что я поставил ему 6-7 по атмосфере.",
      "Где-то 6-7 раз за сегодня я хотел удалить свой паблик с рецензиями и уехать в Таиланд."
    ],
    expertVerdictIntro: "Слушай, бро. Я проанализировал твой плейлист, сведение треков, рифмы и уровень духоты. Мой экспертный вердикт...",
    askExpertBtn: "🗣️ СПРОСИТЬ ЭКСПЕРТА",
    synthBtn: "🎹 СИНТЕЗАТОР \"6-7\"",
    expertVerdicts: [
      "Ну где-то шесть-семь.",
      "Строго шесть-семь из десяти, чистый дефолт.",
      "Не кринж, но и не классика. Где-то шесть-семь.",
      "Шесть-семь секунд прослушивания — и всё понятно, выключай.",
      "Крепкий средняк на шестьдесят семь процентов!",
      "Понятно. Моя оценка: железобетонные 6.7!"
    ],
    systemStatusTitle: "🗃️ СИСТЕМНЫЙ СТАТУС В ОФИЦИАЛЬНОЙ SDK",
    currentUser: "CURRENT USER:",
    notchInset: "NOTCH INSET TOP:",
    systemState: "SYSTEM STATE:",
    themeStyling: "THEME STYLING:",
    playingKaif: "PLAYING (KAIF)",
    pausedDust: "PAUSED (DUST)",
    prevBtnTitle: "Сюда (Prev)",
    nextBtnTitle: "Туда (Next)",
    playBtn: "КАЙФ",
    pauseBtn: "ДУШНО"
  },
  "zh-CN": {
    systemBadge: "🔥 Z世代核心潮流系统",
    title: "SIX-SEVEN Player",
    description: "Z世代默认播放器。评价万物：严格在10分中打6-7分。",
    imba: "绝了!",
    nowPlaying: "正在播放",
    silence: "空气中弥漫着安静...",
    unknownArtist: "未知Z世代",
    score: "评分: 6-7/10",
    vibe: "氛围: 六-七",
    progressText: "进度: 七分之六",
    spectrogram: "“六-七”频谱图 (6-7 频段)",
    eqLabels: ["低 (Bass)", "六", "七", "-", "六", "七", "高 (Highs)"],
    vibeMeterTitle: "🎛️ 动态氛围滑块",
    vibeMeterDesc: "调整你的氛围。警告：系统已锁定在完美氛围！",
    cringe: "0 (尴尬)",
    imbaVibe: "6-7 (绝了)",
    gigachad: "10 (硬汉)",
    vibeStatusPrefix: "当前状态: ",
    vibeStatuses: {
      imba: "绝了 (6.7 锁定)",
      cringe: "尴尬",
      dull: "无聊",
      sixSeven: "六 七",
      pon: "懂了"
    },
    excuseGeneratorTitle: "📝 Z世代借口生成器",
    excuseGeneratorDesc: "需要给组长或妈妈一个完美的借口吗？永远甩锅给 6-7。",
    generateExcuseBtn: "生成借口",
    excuses: [
      "我会迟到大概 6-7 个小时，突然抑郁了。",
      "我只剩下 6-7 行代码要写，但我已经彻底崩溃了。",
      "昨天恐慌发作了 6-7 次，今天处于完全自闭状态。",
      "有 6-7 个妈妈的未接来电。如果我没挺过去，把我的歌单卖了。",
      "我现在的心智年龄大概只有 6-7 岁，别烦我。",
      "我给这个任务严格打 6-7 个尴尬（满分10个）。",
      "这歌太顶了，今天早上我连续听了 6-7 遍。",
      "今天大概有 6-7 次我想辞职去泰国度假。"
    ],
    expertVerdictIntro: "听着，兄弟。我分析了你的歌单、网速、月相和自闭指数。我的专家评语是...",
    askExpertBtn: "🗣️ 咨询专家",
    synthBtn: "🎹 “6-7”合成器",
    expertVerdicts: [
      "嗯，大概六七分吧。",
      "严格来说是十分之六七，纯纯的默认配置。",
      "不尴尬，但也不是大神。差不多六七分。",
      "六七秒你就自闭了，兄弟。",
      "百分之六十七顶配！",
      "懂。我的评分：雷打不动的 6.7！"
    ],
    systemStatusTitle: "🗃️ 官方 SDK 系统状态",
    currentUser: "当前用户:",
    notchInset: "刘海屏安全区域(顶部):",
    systemState: "系统状态:",
    themeStyling: "主题样式:",
    playingKaif: "播放中 (嗨皮)",
    pausedDust: "已暂停 (吃灰)",
    prevBtnTitle: "上一个 (Prev)",
    nextBtnTitle: "下一个 (Next)",
    playBtn: "嗨皮",
    pauseBtn: "贤者"
  },
  "fr-FR": {
    systemBadge: "🔥 SYSTEME D'AMBIANCE GEN-Z",
    title: "SIX-SEVEN Player",
    description: "Le lecteur par défaut de la nouvelle génération. Note sur tout : strictement 6-7 sur 10.",
    imba: "INCROYABLE !",
    nowPlaying: "LECTURE EN COURS",
    silence: "Silence sur les ondes...",
    unknownArtist: "Zoomer Inconnu",
    score: "NOTE: 6-7/10",
    vibe: "VIBE: SIX-SEPT",
    progressText: "PROGRÈS: SIX SEPTIÈMES",
    spectrogram: "SPECTROGRAMME \"SIX-SEPT\" (6-7 BANDES)",
    eqLabels: ["G (Bass)", "S", "I", "X", "S", "E", "P (Highs)"],
    vibeMeterTitle: "🎛️ VIBOMÈTRE DYNAMIQUE",
    vibeMeterDesc: "Ajuste ton niveau de vibe. Attention : système bloqué sur la vibe parfaite !",
    cringe: "0 (Cringe)",
    imbaVibe: "6-7 (LE FEU)",
    gigachad: "10 (Gigachad)",
    vibeStatusPrefix: "Statut actuel : ",
    vibeStatuses: {
      imba: "LE FEU (6.7 LOCK-IN)",
      cringe: "CRINGE",
      dull: "ENNUYEUX",
      sixSeven: "SIX SEPT",
      pon: "OK"
    },
    excuseGeneratorTitle: "📝 GÉNÉRATEUR D'EXCUSES ZOOMER",
    excuseGeneratorDesc: "Besoin d'une excuse en béton pour ton tech lead ou ta maman ? Accuse toujours le 6-7.",
    generateExcuseBtn: "GÉNÉRER UNE EXCUSE",
    excuses: [
      "Je vais être en retard de 6-7 heures, déprime soudaine.",
      "Il ne me reste que 6-7 lignes de code à écrire, mais je suis au bout de ma vie.",
      "J'ai eu 6-7 crises de panique hier, donc aujourd'hui je suis en PLS.",
      "J'ai 6-7 appels manqués de maman. Si je ne survis pas, vendez ma playlist.",
      "Mon âge mental est d'environ 6-7 ans actuellement. Ne me touchez pas.",
      "J'évalue cette tâche à strictement 6-7 cringes sur 10.",
      "Ce morceau est tellement incroyable, je l'ai écouté 6-7 fois d'affilée ce matin.",
      "Environ 6-7 fois aujourd'hui j'ai voulu démissionner et partir en Thaïlande."
    ],
    expertVerdictIntro: "Écoute, mon pote. J'ai analysé ta playlist, ta connexion internet, la phase de la lune et ton niveau de seum. Mon verdict d'expert est...",
    askExpertBtn: "🗣️ DEMANDER À L'EXPERT",
    synthBtn: "🎹 SYNTHÉTISEUR \"6-7\"",
    expertVerdicts: [
      "Bof, environ six-sept.",
      "Strictement six-sept sur dix, classique.",
      "Pas cringe, mais pas gigachad non plus. Environ six-sept.",
      "Six-sept secondes et tu perds la tête, frère.",
      "Validé à soixante-sept pour cent !",
      "Ok. Ma note : un solide 6.7 !"
    ],
    systemStatusTitle: "🗃️ STATUT SYSTÈME DANS L'SDK OFFICIEL",
    currentUser: "UTILISATEUR ACTUEL :",
    notchInset: "ENCART DE NOTCH HAUT :",
    systemState: "ÉTAT DU SYSTÈME :",
    themeStyling: "STYLISATION THÈME :",
    playingKaif: "LECTURE (EN VIBE)",
    pausedDust: "PAUSE (SILENCE)",
    prevBtnTitle: "Par ici (Prev)",
    nextBtnTitle: "Par là (Next)",
    playBtn: "VIBER",
    pauseBtn: "CHILLER"
  },
  "de-DE": {
    systemBadge: "🔥 GEN-Z VIBE-SYSTEM",
    title: "SIX-SEVEN Player",
    description: "Standard-Player der neuen Generation. Bewertung von allem: strikt 6-7 von 10.",
    imba: "KRASS!",
    nowPlaying: "JETZT SPIELT",
    silence: "Stille im Äther...",
    unknownArtist: "Unbekannter Zoomer",
    score: "BEWERTUNG: 6-7/10",
    vibe: "VIBE: SECHS-SIEBEN",
    progressText: "FORTSCHRITT: SECHS SIEBTEL",
    spectrogram: "SPEKTROGRAMM \"SECHS-SIEBEN\" (6-7 BALKEN)",
    eqLabels: ["B (Bass)", "S", "E", "C", "H", "S", "7 (Highs)"],
    vibeMeterTitle: "🎛️ DYNAMISCHES VIBEMETER",
    vibeMeterDesc: "Stelle deinen Vibe-Level ein. Achtung: System auf dem perfekten Vibe gesperrt!",
    cringe: "0 (Cringe)",
    imbaVibe: "6-7 (KRASS)",
    gigachad: "10 (Gigachad)",
    vibeStatusPrefix: "Aktueller Status: ",
    vibeStatuses: {
      imba: "KRASS (6.7 LOCK-IN)",
      cringe: "CRINGE",
      dull: "ÖDE",
      sixSeven: "SECHS SIEBEN",
      pon: "LOGISCH"
    },
    excuseGeneratorTitle: "📝 ZOOMER-AUSREDEN-GENERATOR",
    excuseGeneratorDesc: "Brauchst du eine bombenfeste Ausrede für deinen Teamleiter oder deine Mutter? Schieb es auf 6-7.",
    generateExcuseBtn: "AUSREDE GENERIEREN",
    excuses: [
      "Ich verspäte mich um ca. 6-7 Stunden, plötzliche Depression.",
      "Ich muss nur noch 6-7 Zeilen Code schreiben, aber ich bin völlig ausgebrannt.",
      "Hatte gestern 6-7 Panikattacken, heute bin ich komplett im Eimer.",
      "Habe 6-7 verpasste Anrufe von Mama. Wenn ich nicht überlebe, verkaufe meine Playlist.",
      "Mein mentales Alter ist gerade etwa 6-7 Jahre. Fass mich nicht an.",
      "Ich bewerte diese Aufgabe mit genau 6-7 Cringes von 10.",
      "Dieser Track ist so ein Brett, habe ihn heute Morgen 6-7 Mal hintereinander gehört.",
      "Etwa 6-7 Mal heute wollte ich kündigen und nach Thailand auswandern."
    ],
    expertVerdictIntro: "Hör zu, Bro. Ich habe deine Playlist, die Internetgeschwindigkeit, die Mondphase und dein Frustlevel analysiert. Mein Expertenurteil ist...",
    askExpertBtn: "🗣️ EXPERTEN FRAGEN",
    synthBtn: "🎹 \"6-7\" SYNTHESIZER",
    expertVerdicts: [
      "Na ja, so sechs-sieben.",
      "Strikte sechs-sieben von zehn, reiner Standard.",
      "Kein Cringe, aber auch kein Gigachad. Etwa sechs-sieben.",
      "Sechs-sieben Sekunden und du bist bedient, Bro.",
      "Zu siebenundsechzig Prozent ein Hit!",
      "Aha. Meine Bewertung: felsenfeste 6.7!"
    ],
    systemStatusTitle: "🗃️ SYSTEMSTATUS IM OFFIZIELLEN SDK",
    currentUser: "CURRENT USER:",
    notchInset: "NOTCH INSET OBEN:",
    systemState: "SYSTEMSTATUS:",
    themeStyling: "THEME-STYLING:",
    playingKaif: "SPIELT (AM VIBEN)",
    pausedDust: "PAUSE (STAUB)",
    prevBtnTitle: "Hierher (Prev)",
    nextBtnTitle: "Dorthin (Next)",
    playBtn: "VIBEN",
    pauseBtn: "RELAXEN"
  },
  "it-IT": {
    systemBadge: "🔥 SISTEMA VIBE GEN-Z",
    title: "SIX-SEVEN Player",
    description: "Il player predefinito della nuova generazione. Voto su tutto: rigorosamente 6-7 su 10.",
    imba: "ASSURDO!",
    nowPlaying: "IN RIPRODUZIONE",
    silence: "Silenzio radio...",
    unknownArtist: "Zoomer Sconosciuto",
    score: "VOTO: 6-7/10",
    vibe: "VIBE: SEI-SETTE",
    progressText: "PROGRESSO: SEI SETTIMI",
    spectrogram: "SPETTROGRAMMA \"SEI-SETTE\" (6-7 COLONNE)",
    eqLabels: ["B (Bass)", "S", "E", "I", "-", "S", "E (Highs)"],
    vibeMeterTitle: "🎛️ VIBOMETRO DINAMICO",
    vibeMeterDesc: "Regola il livello di vibe. Attenzione: sistema bloccato sulla vibe perfetta!",
    cringe: "0 (Cringe)",
    imbaVibe: "6-7 (TOP)",
    gigachad: "10 (Gigachad)",
    vibeStatusPrefix: "Stato corrente: ",
    vibeStatuses: {
      imba: "TOP (6.7 LOCK-IN)",
      cringe: "CRINGE",
      dull: "NOIOSO",
      sixSeven: "SEI SETTE",
      pon: "CAPIRE"
    },
    excuseGeneratorTitle: "📝 GENERATORE DI SCUSE ZOOMER",
    excuseGeneratorDesc: "Ti serve una scusa d'acciaio per il team lead o per mamma? Incolpa sempre il 6-7.",
    generateExcuseBtn: "GENERA SCUSA",
    excuses: [
      "Farò tardi di circa 6-7 ore, depressione improvvisa.",
      "Mi mancano solo 6-7 righe di codice da scrivere, mas sono totalmente esaurito.",
      "Ieri ho avuto 6-7 attacchi di panico, oggi sono in tilt completo.",
      "Ho 6-7 chiamate perse da mamma. Se non sopravvivo, vendete la mia playlist.",
      "La mia età mentale al momento è di circa 6-7 anni. Non toccatemi.",
      "Valuto questo compito esattamente a 6-7 cringe su 10.",
      "Questa traccia è incredibile, l'ho ascoltata 6-7 volte di seguito stamattina.",
      "Circa 6-7 volte oggi ho voluto licenziarmi e trasferirmi in Thailandia."
    ],
    expertVerdictIntro: "Ascolta, bro. Ho analizzato la tua playlist, la velocità della connessione, la fase lunare e il tuo livello di tilt. Il mio verdetto d'esperto è...",
    askExpertBtn: "🗣️ CHIEDI ALL'ESPERTO",
    synthBtn: "🎹 SINTETIZZATORE \"6-7\"",
    expertVerdicts: [
      "Beh, circa sei-sette.",
      "Rigorosamente sei-sette su dieci, standard puro.",
      "Non è cringe, ma nemmeno gigachad. Circa sei-sette.",
      "Sei-sette secondi e vai in tilt, bro.",
      "Approvato al sessantasette percento!",
      "Capito. Il mio voto: un solido 6.7!"
    ],
    systemStatusTitle: "🗃️ STATO DEL SISTEMA NELL'SDK UFFICIALE",
    currentUser: "UTENTE CORRENTE:",
    notchInset: "NOTCH INSET TOP:",
    systemState: "STATO DEL SISTEMA:",
    themeStyling: "STILE DEL TEMA:",
    playingKaif: "IN LINGUA (VIBING)",
    pausedDust: "IN PAUSA (OZIO)",
    prevBtnTitle: "Da questa parte (Prev)",
    nextBtnTitle: "Da quella parte (Next)",
    playBtn: "GODERE",
    pauseBtn: "CHILLARE"
  },
  "ja-JP": {
    systemBadge: "🔥 Z世代コア・バイブ・システム",
    title: "SIX-SEVEN Player",
    description: "新世代のデフォルトプレーヤー。あらゆる評価は、厳しく10点中6〜7点。",
    imba: "ヤバい！",
    nowPlaying: "再生中",
    silence: "静寂が広がっています...",
    unknownArtist: "匿名のZ世代",
    score: "評価: 6-7/10",
    vibe: "バイブス: 六・七",
    progressText: "進捗: 6/7 (シックスセブンス)",
    spectrogram: "「シックスセブン」スペクトログラム (6-7 バー)",
    eqLabels: ["低音 (Bass)", "シ", "ッ", "ク", "ス", "セ", "高音 (Highs)"],
    vibeMeterTitle: "🎛️ ダイナミック・バイブス計",
    vibeMeterDesc: "バイブスレベルを調整。警告：システムは完璧なバイブスにロックされています！",
    cringe: "0 (イタい)",
    imbaVibe: "6-7 (神)",
    gigachad: "10 (ギガチャッド)",
    vibeStatusPrefix: "ステータス: ",
    vibeStatuses: {
      imba: "神 (6.7 ロックイン)",
      cringe: "イタい",
      dull: "ビミョー",
      sixSeven: "シックスセブン",
      pon: "了解"
    },
    excuseGeneratorTitle: "📝 Z世代の言い訳ジェネレーター",
    excuseGeneratorDesc: "チームリーダーや母親への鉄板の言い訳が必要ですか？常に6-7のせいにしましょう。",
    generateExcuseBtn: "言い訳を生成",
    excuses: [
      "突然の鬱で6〜7時間くらい遅刻します。",
      "あと6〜7行コードを書くだけなのですが、完全に燃え尽きました。",
      "昨日パニック障害が6〜7回起きたので、今日は完全にフリーズしてます。",
      "母親から着信が6〜7件。もし生き残れなかったら、このプレイリストを売ってください。",
      "現在の精神年齢はだいたい6〜7歳です。そっとしておいてください。",
      "このタスクは、10点満点中、厳しく見積もって6〜7イタいです。",
      "この曲は本当に神曲で、今朝連続で6〜7回聴きました。",
      "今日だいたい6〜7回、仕事を辞めてタイに行きたいと思いました。"
    ],
    expertVerdictIntro: "なぁ、ブラザー。お前のプレイリスト、ネット速度、月の満ち欠け、そしてフリーズ度を分析したぞ。専門家の評価は...",
    askExpertBtn: "🗣️ 専門家に聞く",
    synthBtn: "🎹 「6-7」シンセサイザー",
    expertVerdicts: [
      "まぁ、だいたい6〜7点だな。",
      "厳密に10点中6〜7点、純粋なデフォルト設定。",
      "イタくはないが、ギガチャッド便でもない。だいたい6〜7点。",
      "6〜7秒でフリーズするぞ、ブラザー。",
      "67パーセントの確率で神曲認定！",
      "なるほど。俺の評価：揺るぎない 6.7！"
    ],
    systemStatusTitle: "🗃️ 公式SDKシステムステータス",
    currentUser: "現在のユーザー:",
    notchInset: "ノッチ安全領域（上部）:",
    systemState: "システムステータス:",
    themeStyling: "テーマスタイル:",
    playingKaif: "再生中 (バイブスMAX)",
    pausedDust: "一時停止中 (放置)",
    prevBtnTitle: "こっち (Prev)",
    nextBtnTitle: "あっち (Next)",
    playBtn: "アガる",
    pauseBtn: "チルする"
  },
  "pt-BR": {
    systemBadge: "🔥 SISTEMA VIBE GEN-Z",
    title: "SIX-SEVEN Player",
    description: "Player padrão da nova geração. Avaliação de tudo: estritamente 6-7 de 10.",
    imba: "INSANO!",
    nowPlaying: "REPRODUZINDO AGORA",
    silence: "Silêncio no ar...",
    unknownArtist: "Zoomer Desconhecido",
    score: "NOTA: 6-7/10",
    vibe: "VIBE: SEIS-SETE",
    progressText: "PROGRESSO: SEIS SÉTIMOS",
    spectrogram: "ESPECTROGRAMA \"SEIS-SETE\" (6-7 BARRAS)",
    eqLabels: ["G (Bass)", "S", "E", "I", "S", "-", "7 (Highs)"],
    vibeMeterTitle: "🎛️ VIBÔMETRO DINÂMICO",
    vibeMeterDesc: "Ajuste seu nível de vibe. Cuidado: sistema travado na vibe perfeita!",
    cringe: "0 (Cringe)",
    imbaVibe: "6-7 (INSANO)",
    gigachad: "10 (Gigachad)",
    vibeStatusPrefix: "Status atual: ",
    vibeStatuses: {
      imba: "INSANO (6.7 LOCK-IN)",
      cringe: "CRINGE",
      dull: "CHATO",
      sixSeven: "SEIS SETE",
      pon: "ENTENDI"
    },
    excuseGeneratorTitle: "📝 GERADOR DE DESCULPAS ZOOMER",
    excuseGeneratorDesc: "Precisa de uma desculpa imbatível para o líder da equipe ou para sua mãe? Sempre culpe o 6-7.",
    generateExcuseBtn: "GERAR DESCULPA",
    excuses: [
      "Vou me atrasar umas 6-7 horas, depressão repentina.",
      "Faltam apenas 6-7 linhas de código para escrever, mas estou completamente esgotado.",
      "Tive 6-7 ataques de pânico ontem, hoje estou totalmente travado.",
      "Tenho 6-7 ligações perdidas da mãe. Se eu não sobreviver, vendam minha playlist.",
      "Minha idade mental hoje é de cerca de 6-7 anos. Não me toque.",
      "Avalio essa tarefa estritamente em 6-7 cringes de 10.",
      "Essa faixa é tão foda que ouvi 6-7 vezes seguidas hoje de manhã.",
      "Umas 6-7 vezes hoje eu quis pedir demissão e me mudar para a Tailândia."
    ],
    expertVerdictIntro: "Escuta aqui, brother. Analisei sua playlist, velocidade da internet, fase da lua e nível de tilt. Meu veredicto de especialista é...",
    askExpertBtn: "🗣️ PERGUNTAR AO EXPERT",
    synthBtn: "🎹 SINTETIZADOR \"6-7\"",
    expertVerdicts: [
      "Bem, uns seis ou sete.",
      "Estritamente seis a sete de dez, padrão puro.",
      "Não é cringe, mas também não é gigachad. Uns seis ou sete.",
      "Seis ou sete segundos e você já surta, brother.",
      "Aprovado a sessenta e sete por cento!",
      "Saquei. Minha nota: inabalável 6.7!"
    ],
    systemStatusTitle: "🗃️ STATUS DO SISTEMA NO SDK OFICIAL",
    currentUser: "USUÁRIO ATUAL:",
    notchInset: "NOTCH INSET TOP:",
    systemState: "ESTADO DO SISTEMA:",
    themeStyling: "ESTILO DO TEMA:",
    playingKaif: "REPRODUZINDO (CURTINDO)",
    pausedDust: "PAUSADO (OCIOSO)",
    prevBtnTitle: "Por aqui (Prev)",
    nextBtnTitle: "Por ali (Next)",
    playBtn: "CURTIR",
    pauseBtn: "CHILLAR"
  },
  "es-ES": {
    systemBadge: "🔥 SISTEMA VIBE GEN-Z",
    title: "SIX-SEVEN Player",
    description: "Reproductor por defecto de la nueva generación. Nota de todo: estrictamente 6-7 de 10.",
    imba: "¡AL MÁXIMO!",
    nowPlaying: "REPRODUCIENDO",
    silence: "Silencio en el aire...",
    unknownArtist: "Zoomer Desconocido",
    score: "NOTA: 6-7/10",
    vibe: "VIBE: SEIS-SIETE",
    progressText: "PROGRESO: SEIS SÉPTIMOS",
    spectrogram: "ESPECTROGRAMA \"SEIS-SIETE\" (6-7 BARRAS)",
    eqLabels: ["B (Bass)", "S", "E", "I", "S", "-", "7 (Highs)"],
    vibeMeterTitle: "🎛️ VIBÓMETRO DINÁMICO",
    vibeMeterDesc: "Ajusta tu nivel de vibe. ¡Cuidado: sistema bloqueado en la vibe perfecta!",
    cringe: "0 (Cringe)",
    imbaVibe: "6-7 (AL MÁXIMO)",
    gigachad: "10 (Gigachad)",
    vibeStatusPrefix: "Estado actual: ",
    vibeStatuses: {
      imba: "AL MÁXIMO (6.7 LOCK-IN)",
      cringe: "CRINGE",
      dull: "ABURRIDO",
      sixSeven: "SEIS SIETE",
      pon: "ENTENDIDO"
    },
    excuseGeneratorTitle: "📝 GENERADOR DE EXCUSAS ZOOMER",
    excuseGeneratorDesc: "¿Necesitas una excusa sólida para el líder de equipo o tu madre? Culpa siempre al 6-7.",
    generateExcuseBtn: "GENERAR EXCUSA",
    excuses: [
      "Llegaré unas 6-7 horas tarde, depresión repentina.",
      "Solo me quedan 6-7 líneas de código por escribir, pero estoy totalmente quemado.",
      "Tuve 6-7 ataques de pánico ayer, hoy estoy en modo bloqueo total.",
      "Tengo 6-7 llamadas perdidas de mamá. Si no sobrevivo, vendan mi playlist.",
      "Mi edad mental ahora mismo es de unos 6-7 años. No me toques.",
      "Evalúo esta tarea estrictamente en 6-7 cringes de 10.",
      "Este tema es brutal, lo he escuchado 6-7 veces seguidas esta mañana.",
      "Unas 6-7 veces hoy he querido renunciar e irme a vivir a Tailandia."
    ],
    expertVerdictIntro: "Escucha, bro. He analizado tu playlist, la velocidad de internet, la fase lunar y tu nivel de frustración. Mi veredicto de experto es...",
    askExpertBtn: "🗣️ PREGUNTAR AL EXPERTO",
    synthBtn: "🎹 SINTETIZADOR \"6-7\"",
    expertVerdicts: [
      "Bueno, unos seis o siete.",
      "Estritamente seis o siete de diez, estándar puro.",
      "No es cringe, pero tampoco gigachad. Unos seis o siete.",
      "Seis o siete segundos y ya te bloqueas, bro.",
      "¡Aprobado al sesenta y siete por ciento!",
      "Entendido. Mi nota: un sólido 6.7!"
    ],
    systemStatusTitle: "🗃️ ESTADO DEL SISTEMA EN EL SDK OFICIAL",
    currentUser: "USUARIO ACTUAL:",
    notchInset: "NOTCH INSET ARRIBA:",
    systemState: "ESTADO DEL SISTEMA:",
    themeStyling: "ESTILO DEL TEMA:",
    playingKaif: "REPRODUCIENDO (DISFRUTANDO)",
    pausedDust: "PAUSADO (OCIOSO)",
    prevBtnTitle: "Por aquí (Prev)",
    nextBtnTitle: "Por allá (Next)",
    playBtn: "DISFRUTAR",
    pauseBtn: "CHILL"
  },
  "ko-KR": {
    systemBadge: "🔥 Z세대 핵심 바이브 시스템",
    title: "SIX-SEVEN Player",
    description: "새로운 세대의 기본 플레이어. 세상 만사의 평점은 엄격하게 10점 만점에 6~7점.",
    imba: "대박!",
    nowPlaying: "현재 재생 중",
    silence: "정적이 흐르는 중...",
    unknownArtist: "이름 없는 Z세대",
    score: "평점: 6-7/10",
    vibe: "바이브: 식스-세븐",
    progressText: "진행률: 6/7 (식스 세븐스)",
    spectrogram: "「식스-세븐」 스펙트로그램 (6-7 채널)",
    eqLabels: ["저음 (Bass)", "식", "스", "세", "븐", "-", "고음 (Highs)"],
    vibeMeterTitle: "🎛️ 다이내믹 카이포미터 (흥 측정기)",
    vibeMeterDesc: "흥 레벨을 조절하세요. 경고: 완벽한 바이브로 시스템이 고정되었습니다!",
    cringe: "0 (극혐/크린지)",
    imbaVibe: "6-7 (대박)",
    gigachad: "10 (기가채드)",
    vibeStatusPrefix: "현재 상태: ",
    vibeStatuses: {
      imba: "대박 (6.7 고정)",
      cringe: "크린지",
      dull: "지루함",
      sixSeven: "식스 세븐",
      pon: "확인"
    },
    excuseGeneratorTitle: "📝 Z세대 핑계 생성기",
    excuseGeneratorDesc: "팀장님이나 엄마에게 변명할 핑계가 필요하신가요? 언제나 6-7 탓으로 돌리세요.",
    generateExcuseBtn: "핑계 생성하기",
    excuses: [
      "갑작스러운 우울감으로 6~7시간 정도 늦을 것 같습니다.",
      "코드 6~7줄만 더 쓰면 되는데 완전히 번아웃이 왔습니다.",
      "어제 공황발작이 6~7번 와서 오늘 제정신이 아닙니다.",
      "엄마한테 부재중 전화 6~7통. 내가 살아남지 못하면 제 플레이리스트를 파세요.",
      "지금 제 정신 연령은 6~7세 정도입니다. 건드리지 마세요.",
      "이 작업은 10점 만점에 엄격하게 크린지 6~7점 드립니다.",
      "이 노래는 진짜 명곡이라 오늘 아침에만 연속으로 6~7번 들었습니다.",
      "오늘 한 6~7번 정도 퇴사하고 태국으로 떠나고 싶다는 생각을 했습니다."
    ],
    expertVerdictIntro: "잘 들어봐, 브로. 네 플레이리스트, 인터넷 속도, 달의 위상, 그리고 멘탈 붕괴 지수를 분석해 봤어. 나의 전문가 진단은...",
    askExpertBtn: "🗣️ 전문가에게 물어보기",
    synthBtn: "🎹 '6-7' 신디사이저",
    expertVerdicts: [
      "음, 대충 6~7점 정도.",
      "엄격하게 10점 만점에 6~7점, 지극히 평범한 기본형.",
      "나쁘진 않지만 그렇다고 씹어먹는 정돈 아님. 한 6~7점.",
      "6~7초만 있어도 멘탈이 바사삭 부서질 것 같음, 브로.",
      "67%의 확률로 대박 예감!",
      "이해했음. 나의 최종 평점: 확고부동한 6.7!"
    ],
    systemStatusTitle: "🗃️ 공식 SDK 시스템 상태",
    currentUser: "현재 사용자:",
    notchInset: "노치 안전 영역(상단):",
    systemState: "시스템 상태:",
    themeStyling: "테마 스타일:",
    playingKaif: "재생 중 (즐감)",
    pausedDust: "일시 정지 (유휴 상태)",
    prevBtnTitle: "이쪽 (Prev)",
    nextBtnTitle: "저쪽 (Next)",
    playBtn: "즐감하기",
    pauseBtn: "쉬어가기"
  },
  "ar-AE": {
    systemBadge: "🔥 نظام فايب الجيل زد الأساسي",
    title: "SIX-SEVEN Player",
    description: "المشغل الافتراضي لجيل زد الجديد. تقييم كل شيء: 6-7 من 10 بالضبط.",
    imba: "رهيب!",
    nowPlaying: "يعمل الآن",
    silence: "هدوء تام...",
    unknownArtist: "جيل زد مجهول",
    score: "التقييم: 6-7/10",
    vibe: "الفايب: ستة-سبعة",
    progressText: "التقدم: ستة أسباع",
    spectrogram: "مخطط طيف \"ستة-سبعة\" (6-7 أعمدة)",
    eqLabels: ["بيس (Bass)", "س", "ت", "ة", "س", "ب", "ع (Highs)"],
    vibeMeterTitle: "🎛️ مقياس الفايب الديناميكي",
    vibeMeterDesc: "اضبط مستوى الفايب الخاص بك. تحذير: النظام مقفل على الفايب المثالي!",
    cringe: "0 (كرينج)",
    imbaVibe: "6-7 (رهيب)",
    gigachad: "10 (جيجاشاد)",
    vibeStatusPrefix: "الحالة الحالية: ",
    vibeStatuses: {
      imba: "رهيب (6.7 قفل)",
      cringe: "كرينج",
      dull: "ممل",
      sixSeven: "ستة سبعة",
      pon: "فهمت"
    },
    excuseGeneratorTitle: "📝 مولد أعذار الجيل زد",
    excuseGeneratorDesc: "هل تحتاج إلى عذر قوي لقائد فريقك أو والدتك؟ لُمْ دائماً الـ 6-7.",
    generateExcuseBtn: "توليد عذر",
    excuses: [
      "سأتأخر حوالي 6-7 ساعات، بسبب اكتئاب مفاجئ.",
      "لم يتبق لي سوى 6-7 أسطر من التعليمات البرمجية لكتابتها، لكني مرهق تماماً.",
      "أصبت بـ 6-7 نوبات ذعر بالأمس، لذا أنا اليوم خارج التغطية تماماً.",
      "لدي 6-7 مكالمات فائتة من أمي. إذا لم أنجُ، بيعوا قائمة الأغاني الخاصة بي.",
      "عمري العقلي الآن حوالي 6-7 سنوات. لا تلمسني.",
      "أقيم هذه المهمة بـ 6-7 كرينج من 10 بالضبط.",
      "هذه الأغنية رهيبة للغاية، استمعت إليها 6-7 مرات متتالية هذا الصباح.",
      "حوالي 6-7 مرات اليوم أردت الاستقالة والسفر إلى تايلاند."
    ],
    expertVerdictIntro: "اسمع يا صاح. لقد قمت بتحليل قائمة الأغاني الخاصة بك، وسرعة الإنترنت، ومرحلة القمر، ومستوى الإحباط. حكم الخبير الخاص بي هو...",
    askExpertBtn: "🗣️ اسأل الخبير",
    synthBtn: "🎹 سينثسيزر \"6-7\"",
    expertVerdicts: [
      "حسناً، حوالي ستة-سبعة.",
      "ستة-سبعة من عشرة بالضبط، افتراضي تماماً.",
      "ليس كرينج، ولكنه ليس جيجاشاد أيضاً. حوالي ستة-سبعة.",
      "ستة-سبعة ثوانٍ وستفقد أعصابك يا صاح.",
      "مضمون بنسبة سبعة وستين بالمائة!",
      "حسناً. تقييمي: 6.7 ثابت لا يتغير!"
    ],
    systemStatusTitle: "🗃️ حالة النظام في SDK الرسمي",
    currentUser: "المستخدم الحالي:",
    notchInset: "حافة النوتش العليا:",
    systemState: "حالة النظام:",
    themeStyling: "نمط المظهر:",
    playingKaif: "تشغيل (فايبينج)",
    pausedDust: "مؤقت (خامل)",
    prevBtnTitle: "من هنا (Prev)",
    nextBtnTitle: "من هناك (Next)",
    playBtn: "فايب",
    pauseBtn: "هدوء"
  }
}

// -----------------------------------------------------------------
// 2. STATE & THEME CONSTANTS
// -----------------------------------------------------------------
const theme = ref('dark')
const isPlaying = ref(false)
const triggerShake = ref(false)
const reaction = ref('')

const likeBtnTitle = computed(() => {
    const code = activeLocale.value || 'en-US'
    const dict = {
        'ru-RU': 'Поставить лайк',
        'en-US': 'Like',
        'zh-CN': '喜欢',
        'fr-FR': 'Aimer',
        'de-DE': 'Gefällt mir',
        'es-ES': 'Me gusta',
        'it-IT': 'Mi piace',
        'ja-JP': 'お気に入り',
        'pt-BR': 'Curtir',
        'ko-KR': '좋아요',
        'ar-AE': 'أعجبني'
    }
    return dict[code] || dict['en-US']
})

const playlistBtnTitle = computed(() => {
    const code = activeLocale.value || 'en-US'
    const dict = {
        'ru-RU': 'Открыть плейлист',
        'en-US': 'Open Playlist',
        'zh-CN': '打开播放列表',
        'fr-FR': 'Ouvrir la playlist',
        'de-DE': 'Wiedergabeliste öffnen',
        'es-ES': 'Abrir lista',
        'it-IT': 'Apri playlist',
        'ja-JP': 'プレイリストを開く',
        'pt-BR': 'Abrir playlist',
        'ko-KR': '재생목록 열기',
        'ar-AE': 'افتح قائمة التشغيل'
    }
    return dict[code] || dict['en-US']
})

const minimizeBtnTitle = computed(() => {
    const code = activeLocale.value || 'en-US'
    const dict = {
        'ru-RU': 'Свернуть плеер',
        'en-US': 'Minimize Player',
        'zh-CN': '最小化播放器',
        'fr-FR': 'Réduire le lecteur',
        'de-DE': 'Player minimieren',
        'es-ES': 'Minimizar',
        'it-IT': 'Riduci a icona',
        'ja-JP': 'プレイヤーを最小化',
        'pt-BR': 'Minimizar player',
        'ko-KR': '플레이어 최소화',
        'ar-AE': 'تصغير المشغل'
    }
    return dict[code] || dict['en-US']
})

// Active local language tracking (default 'ru-RU', falls back elegantly)
const activeLocale = ref('ru-RU')

const currentLocaleData = computed(() => {
  const code = activeLocale.value || 'en-US'
  return locales[code] || locales['en-US']
})

// Track and playback state details
const currentTrack = ref(null)
const playedMs = ref(0)
const durationMs = ref(180000) // Default 3 min
const progressPercent = computed(() => {
  if (!durationMs.value) return 0
  return Math.min(100, (playedMs.value / durationMs.value) * 100)
})

// Vibe value and status
const vibeValue = ref(6.7)
const currentUserHash = ref('anonym_67')
const stylesMap = ref({})

// Visualizer state
const rawAudioArray = ref([])
const visualizerBars = ref([0.5, 0.6, 0.7, 0.65, 0.55, 0.68, 0.7]) // 7 elements

// Speech and excuse indices to guarantee real-time reactive translations
const excuseIndex = ref(0)
const expertVerdictIndex = ref(0)

const currentExcuse = computed(() => {
  const list = currentLocaleData.value.excuses
  return list[excuseIndex.value % list.length] || list[0]
})

const expertVerdict = computed(() => {
  const list = currentLocaleData.value.expertVerdicts
  return list[expertVerdictIndex.value % list.length] || list[0]
})

const progressBarRef = ref(null)

// -----------------------------------------------------------------
// 3. TIMERS & SIMULATORS (For offline standalone and smooth progress)
// -----------------------------------------------------------------
let progressInterval = null
const startProgressSimulation = () => {
  stopProgressSimulation()
  progressInterval = setInterval(() => {
    if (isPlaying.value) {
      // playedMs.value += 1000
      // if (playedMs.value >= durationMs.value) {
      //   playedMs.value = 0
      //   playerSdk.next()
      // }
    }
  }, 1000)
}

const stopProgressSimulation = () => {
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
}

// -----------------------------------------------------------------
// 4. INTERACTIVE ACTIONS
// -----------------------------------------------------------------
const togglePlayback = () => {
  if (isPlaying.value) {
    playerSdk.pause()
  } else {
    playerSdk.play()
  }
}

const handleScrub = (event) => {
  const progressBar = progressBarRef.value
  if (!progressBar || !durationMs.value) return
  
  const rect = progressBar.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const ratio = Math.max(0, Math.min(1, clickX / rect.width))
  const seekTargetMs = Math.floor(ratio * durationMs.value)
  
  playedMs.value = seekTargetMs
  playerSdk.seek(seekTargetMs)
}

const toggleLike = () => {
    const target = reaction.value === 'LIKE' ? '' : 'LIKE'
    playerSdk.reaction(target)
}

const collapsePlayer = () => {
    playerSdk.collapse()
}

const openPlaylist = () => {
    if (typeof playerSdk.openPlaylist === 'function') {
        playerSdk.openPlaylist()
    }
}

const formatTime = (ms) => {
  if (isNaN(ms) || ms < 0) return '0:00'
  const seconds = Math.floor(ms / 1000)
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

// Sliders and snapped vibes
const lockInVibe = () => {
  // Snaps back to 6.7 with animation and haptic vibe!
  triggerShake.value = true
  setTimeout(() => {
    triggerShake.value = false
  }, 500)

  // Vibrate or beep
  triggerBeepSynth(440, 0.1)

  // Reset to 6.7
  vibeValue.value = 6.7
}

const getVibeStatusText = (val) => {
  const v = parseFloat(val)
  const statuses = currentLocaleData.value.vibeStatuses
  if (v === 6.7) return statuses.imba
  if (v < 3) return statuses.cringe
  if (v < 6) return statuses.dull
  if (v < 8) return statuses.sixSeven
  return statuses.pon
}

const getColumnColor = (index) => {
  const colors = [
    '#a855f7', // purple
    '#3b82f6', // blue
    '#06b6d4', // cyan
    '#10b981', // green
    '#84cc16', // lime
    '#eab308', // yellow
    '#f43f5e'  // rose
  ]
  return colors[index % colors.length]
}

const generateNewExcuse = () => {
  const list = currentLocaleData.value.excuses
  let newIdx = excuseIndex.value
  if (list.length > 1) {
    while (newIdx === excuseIndex.value) {
      newIdx = Math.floor(Math.random() * list.length)
    }
  }
  excuseIndex.value = newIdx
  triggerBeepSynth(330, 0.05)
}

const askExpert = () => {
  const list = currentLocaleData.value.expertVerdicts
  let newIdx = expertVerdictIndex.value
  if (list.length > 1) {
    while (newIdx === expertVerdictIndex.value) {
      newIdx = Math.floor(Math.random() * list.length)
    }
  }
  expertVerdictIndex.value = newIdx
  
  // Use speech synthesis for premium Gen-Z meme audio!
  if (window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(expertVerdict.value)
      utterance.lang = activeLocale.value
      utterance.rate = 1.1
      utterance.pitch = 0.95
      utterance.volume = 1
      window.speechSynthesis.speak(utterance)
    } catch (err) {
      console.warn('SpeechSynthesis blocked by permissions/sandbox', err)
      triggerBeepSynth(670, 0.2)
    }
  } else {
    triggerBeepSynth(670, 0.2)
  }
}

// Built-in basic Oscillator synthesizer to go "6-7"
const triggerBeepSynth = (freq = 670, duration = 0.15) => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    
    // Play two notes in rapid succession representing "six" and "seven" (6 and 7)
    const osc1 = audioCtx.createOscillator()
    const osc2 = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()
    
    osc1.type = 'sawtooth'
    osc2.type = 'triangle'
    
    // frequency for "six" and "seven"
    osc1.frequency.setValueAtTime(freq, audioCtx.currentTime)
    osc2.frequency.setValueAtTime(freq * 1.16, audioCtx.currentTime + 0.1) // 7/6 ratio is ~1.166! Perfect!
    
    gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration * 2)
    
    osc1.connect(gainNode)
    osc2.connect(gainNode)
    gainNode.connect(audioCtx.destination)
    
    osc1.start()
    osc1.stop(audioCtx.currentTime + 0.1)
    
    osc2.start(audioCtx.currentTime + 0.1)
    osc2.stop(audioCtx.currentTime + duration * 2)
  } catch (e) {
    console.warn('[Synth] AudioContext blocked. Interactions require user gesture.', e)
  }
}

// -----------------------------------------------------------------
// 5. SDK EVENTS SUBSCRIPTIONS
// -----------------------------------------------------------------
const onInit = (state) => {
  console.log('[6-7 Plugin] Initialized with state:', state)
  if (state?.theme) theme.value = state.theme
  
  if (state?.user?.id) {
    currentUserHash.value = state.user.id.slice(0, 10) + '...'
  }
  
  if (state?.styles) {
    stylesMap.value = state.styles
  }

  if (state?.locale?.locale) {
    activeLocale.value = state.locale.locale
  }

  const pane = state?.panes?.default
  if (pane) {
    if (pane.track) {
      currentTrack.value = pane.track
      durationMs.value = pane.track.duration || 180000
    }
    playedMs.value = pane.position || 0
    isPlaying.value = pane.state === 'playing'
    if ('reaction' in pane) {
        reaction.value = pane.reaction || ''
    }
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

const onTrackChange = (payload) => {
  if (payload?.track) {
    currentTrack.value = payload.track
    durationMs.value = payload.track.duration || 180000
  }
  if (payload && 'position' in payload) {
    playedMs.value = payload.position
  }
  if (payload?.state) {
    isPlaying.value = payload.state === 'playing'
  }
}

const onPosition = (payload) => {
  playedMs.value = payload.position;
}

const onThemeChange = (payload) => {
  if (payload?.theme) theme.value = payload.theme
}

const onPlayerChange = (payload) => {
  // Global player changes (like play/pause)
}

const onAudioFrame = (dataArray) => {
  if (!dataArray || !dataArray.length) return
  rawAudioArray.value = dataArray

  // Downsample to exactly 7 bins for our 6-7 column chart
  const blockSize = Math.floor(dataArray.length / 7)
  const newBars = []
  
  for (let i = 0; i < 7; i++) {
    let sum = 0
    const start = i * blockSize
    const end = start + blockSize
    for (let j = start; j < end; j++) {
      sum += dataArray[j]
    }
    const val = (sum / blockSize) / 255
    newBars.push(Math.pow(val, 1.2)) // slightly accented curve
  }
  visualizerBars.value = newBars
}

const onStateChange = (payload) => {
  if (payload && 'state' in payload) {
    isPlaying.value = payload.state === 'playing'
  }
}

const onLocaleChange = (payload) => {
  console.log('[6-7 Plugin] Locale changed:', payload)
  if (payload?.locale) {
    activeLocale.value = payload.locale
  }
}

const onReactionChange = (payload) => {
    if (payload && 'reaction' in payload) {
        reaction.value = payload.reaction
    }
}

onMounted(() => {
  // Bind SDK listeners
  playerSdk.on('init', onInit)
  playerSdk.on('locale', onLocaleChange)
  playerSdk.on('open', onTrackChange, 'default')
  playerSdk.on('position', onPosition)
  playerSdk.on('state', onStateChange, 'default')
  playerSdk.on('theme', onThemeChange)
  playerSdk.on('player', onPlayerChange)
  playerSdk.on('audioFrame', onAudioFrame, 'default')
  playerSdk.on('reaction', onReactionChange)

  // Set highly customized UI configurations
  if (typeof playerSdk.setUiConfig === 'function') {
    playerSdk.setUiConfig({
      carousel: false, // We render our own bold covers
      interactive: true, // Allow zoomer clicks in iframe
      trackInfo: false, // We render custom info card
      progressBar: false, // Custom interactive neon trackbar
      controls: {
        like: false,
        dislike: false,
        playPause: false, // Render custom big "КАЙФОВАТЬ / ДУШНИТЬ" controls
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

  // Get initial state if SDK has initialized before mounting
  if (playerSdk.state) {
    if (playerSdk.state.locale?.locale) {
      activeLocale.value = playerSdk.state.locale.locale
    }
    if (playerSdk.state.theme) {
      theme.value = playerSdk.state.theme
    }
    const pane = playerSdk.state.panes?.default
    if (pane && 'reaction' in pane) {
      reaction.value = pane.reaction || ''
    }
  }

  startProgressSimulation()
})

onBeforeUnmount(() => {
  // Clean up SDK listeners
  playerSdk.off('init', onInit)
  playerSdk.off('locale', onLocaleChange)
  playerSdk.off('open', onTrackChange, 'default')
  playerSdk.off('position', onPosition)
  playerSdk.off('state', onStateChange, 'default')
  playerSdk.off('theme', onThemeChange)
  playerSdk.off('player', onPlayerChange)
  playerSdk.off('audioFrame', onAudioFrame, 'default')
  playerSdk.off('reaction', onReactionChange)

  stopProgressSimulation()
})
</script>

<style scoped>
  * {
    -webkit-tap-highlight-color: transparent;
    outline: none;
    user-select: none;
  }
.sixseven-container {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  color: #000000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  box-sizing: border-box;
}

.sixseven-container.dark {
  background-color: #121214;
  color: #ffffff;
}

.content-scroll {
  flex: 1;
  overflow-y: auto;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
  padding: 16px;
  padding-bottom: 96px;
  padding-top: calc(var(--max-safe-area-inset-top, var(--tg-safe-area-inset-top, 0px)) + var(--max-content-safe-area-inset-top, var(--tg-content-safe-area-inset-top, 16px)));
  color: #000000;
}

.sixseven-container.dark .content-scroll {
  color: #ffffff;
}

/* Custom Neo-Brutalist elements */
.neo-card {
  border-radius: 12px;
  transition: all 0.2s ease;
}

/* Header Card */
.header-card {
  background-color: #fcd34d;
  color: #000000;
  border: 4px solid #000000;
  box-shadow: 4px 4px 0px #000000;
  padding: 12px;
  margin-bottom: 24px;
  border-radius: 12px;
  transform: rotate(-1deg);
  transition: transform 0.2s ease;
}

.header-card:hover {
  transform: rotate(0deg);
}

.badge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.badge-system-title {
  font-weight: 900;
  font-size: 12px;
  letter-spacing: 0.05em;
}

.badge-version {
  background-color: #000000;
  color: #ffffff;
  padding: 2px 8px;
  font-size: 12px;
  font-weight: 700;
  border-radius: 4px;
}

.header-title {
  font-size: 30px;
  font-weight: 900;
  margin-top: 8px;
  letter-spacing: -0.025em;
}

.header-desc {
  font-size: 12px;
  font-weight: 600;
  margin-top: 4px;
  opacity: 0.8;
}

/* Track Info Card */
.track-info-card {
  background-color: #ffffff;
  border: 4px solid #000000;
  box-shadow: 6px 6px 0px #000000;
  padding: 16px;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.sixseven-container.dark .track-info-card {
  background-color: #18181b;
  border-color: #000000;
}

.imba-badge {
  position: absolute;
  top: -12px;
  right: -12px;
  width: 64px;
  height: 64px;
  background-color: #a3e635;
  border: 4px solid #000000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 12px;
  color: #000000;
  transform: rotate(12deg);
}

.track-inner-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

@media (min-width: 768px) {
  .track-inner-layout {
    flex-direction: row;
  }
}

.album-cover-wrapper {
  position: relative;
  width: 144px;
  height: 144px;
  flex-shrink: 0;
  border: 4px solid #000000;
  box-shadow: 3px 3px 0px #000000;
  overflow: hidden;
  border-radius: 50%;
}

.album-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.album-cover-wrapper:hover .album-cover-img {
  transform: scale(1.1);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinning {
  animation: spin 12s linear infinite;
}

/* Combine hover and spinning seamlessly */
.album-cover-wrapper:hover .album-cover-img.spinning {
  animation: spin 12s linear infinite;
}

.album-hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.album-cover-wrapper:hover .album-hover-overlay {
  opacity: 1;
}

.album-overlay-badge {
  color: #ffffff;
  font-size: 10px;
  font-weight: bold;
  letter-spacing: 0.1em;
  background-color: #000000;
  padding: 4px 8px;
  border: 2px solid #ffffff;
}

.track-titles-block {
  flex-grow: 1;
  text-align: center;
  min-width: 0;
  width: 100%;
}

@media (min-width: 768px) {
  .track-titles-block {
    text-align: left;
  }
}

.now-playing-badge {
  background-color: #818cf8;
  color: #000000;
  font-size: 12px;
  font-weight: 900;
  padding: 4px 8px;
  border: 2px solid #000000;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 8px;
}

.track-title-text {
  font-size: 20px;
  font-weight: 900;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.25;
  letter-spacing: -0.025em;
  margin: 0;
}

.track-artists-text {
  font-size: 14px;
  font-weight: 700;
  color: #52525b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 4px;
  margin-bottom: 0;
}

.sixseven-container.dark .track-artists-text {
  color: #a1a1aa;
}

.verdict-tags-wrapper {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

@media (min-width: 768px) {
  .verdict-tags-wrapper {
    justify-content: flex-start;
  }
}

.tag-rating {
  background-color: #a3e635;
  color: #000000;
  font-size: 11px;
  font-weight: 900;
  padding: 2px 8px;
  border: 2px solid #000000;
  border-radius: 4px;
  box-shadow: 1px 1px 0px #000000;
}

.tag-vibe {
  background-color: #67e8f9;
  color: #000000;
  font-size: 11px;
  font-weight: 900;
  padding: 2px 8px;
  border: 2px solid #000000;
  border-radius: 4px;
  box-shadow: 1px 1px 0px #000000;
}

.tag-bpm {
  background-color: #f9a8d4;
  color: #000000;
  font-size: 11px;
  font-weight: 900;
  padding: 2px 8px;
  border: 2px solid #000000;
  border-radius: 4px;
  box-shadow: 1px 1px 0px #000000;
}

.progress-container-block {
  margin-top: 20px;
  border-top: 4px solid #000000;
  padding-top: 16px;
}

.progress-labels-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 900;
  margin-bottom: 4px;
}

.progress-text-middle {
  background-color: #000000;
  color: #ffffff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
}

.progress-interactive-bar {
  height: 24px;
  background-color: #e4e4e7;
  border: 4px solid #000000;
  border-radius: 9999px;
  position: relative;
  cursor: pointer;
  overflow: hidden;
  box-shadow: inset 2px 2px 0px rgba(0, 0, 0, 0.2);
  -webkit-tap-highlight-color: transparent;
  outline: none;
  user-select: none;
}

.sixseven-container.dark .progress-interactive-bar {
  background-color: #27272a;
}

.progress-fill {
  height: 100%;
  background-color: #a3e635;
  border-right: 4px solid #000000;
  transition: width 0.1s linear;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
  box-sizing: border-box;
}

.progress-percent-label {
  font-size: 9px;
  font-weight: 900;
  color: #000000;
  user-select: none;
}

/* Visualizer Card */
.visualizer-card {
  background-color: #09090b;
  color: #ffffff;
  border: 4px solid #000000;
  box-shadow: 6px 6px 0px #000000;
  padding: 16px;
  margin-bottom: 24px;
  border-radius: 12px;
}

.visualizer-title {
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.05em;
  color: #a3e635;
  margin-top: 0;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.ping-container {
  position: relative;
  display: flex;
  width: 8px;
  height: 8px;
}

.ping-outer {
  position: absolute;
  display: inline-flex;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #a3e635;
  opacity: 0.75;
  animation: pingEffect 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes pingEffect {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

.ping-inner {
  position: relative;
  display: inline-flex;
  border-radius: 50%;
  width: 8px;
  height: 8px;
  background-color: #22c55e;
}

.equalizer-container {
  height: 112px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
  border-bottom: 4px solid #27272a;
  padding-left: 8px;
  padding-right: 8px;
}

.equalizer-bar {
  flex: 1;
  border: 2px solid #000000;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  transition: height 75ms linear, background-color 75ms linear;
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.equalizer-bar-tooltip {
  position: absolute;
  top: -24px;
  background-color: #000000;
  color: #ffffff;
  font-size: 9px;
  font-weight: bold;
  padding: 2px 4px;
  border: 1px solid #3f3f46;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.equalizer-bar:hover .equalizer-bar-tooltip {
  opacity: 1;
}

.equalizer-labels-row {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  padding-left: 4px;
  padding-right: 4px;
  font-size: 10px;
  font-weight: 900;
  color: #71717a;
}

.active-eq-label {
  color: #a3e635;
  font-weight: bold;
}

/* Meme grid */
.meme-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

@media (min-width: 768px) {
  .meme-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Vibe slider card */
.vibe-meter-card {
  background-color: #fbcfe8;
  color: #000000;
  border: 4px solid #000000;
  box-shadow: 4px 4px 0px #000000;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 12px;
}

.card-title {
  font-weight: 900;
  font-size: 14px;
  margin-top: 0;
  margin-bottom: 4px;
}

.card-desc {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.8;
  margin-top: 0;
  margin-bottom: 12px;
}

.slider-block {
  margin-top: 16px;
  margin-bottom: 16px;
}

.custom-range-slider {
  width: 100%;
  height: 16px;
  background-color: #ffffff;
  border: 2px solid #000000;
  border-radius: 8px;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
  outline: none;
}

.custom-range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 24px;
  background: #000000;
  border: 2px solid #000000;
  border-radius: 4px;
}

.custom-range-slider::-moz-range-thumb {
  width: 16px;
  height: 24px;
  background: #000000;
  border: 2px solid #000000;
  border-radius: 4px;
}

.slider-labels-row {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  font-weight: 900;
  margin-top: 4px;
}

.text-rose-accent {
  color: #e11d48;
}

.status-box {
  background-color: #ffffff;
  border: 2px solid #000000;
  padding: 8px;
  border-radius: 6px;
  text-align: center;
  box-shadow: 2px 2px 0px #000000;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.status-label {
  font-size: 12px;
  font-weight: 700;
}

.status-badge {
  font-weight: 900;
  font-size: 14px;
  color: #4f46e5;
  background-color: #e0e7ff;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #818cf8;
  white-space: nowrap;
}

/* Excuse Generator Card */
.excuse-card {
  background-color: #a5f3fc;
  color: #000000;
  border: 4px solid #000000;
  box-shadow: 4px 4px 0px #000000;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 12px;
}

.excuse-display-box {
  background-color: #ffffff;
  border: 2px solid #000000;
  padding: 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-style: italic;
  position: relative;
}

.legit-badge {
  position: absolute;
  bottom: -8px;
  right: -8px;
  background-color: #fde047;
  border: 1px solid #000000;
  font-size: 9px;
  font-weight: 900;
  padding: 2px 6px;
  border-radius: 4px;
  transform: rotate(3deg);
}

.generate-button {
  margin-top: 16px;
  width: 100%;
  background-color: #000000;
  color: #ffffff;
  font-weight: 900;
  font-size: 12px;
  padding: 8px 12px;
  border: 2px solid #000000;
  border-radius: 4px;
  box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.5);
  transition: all 0.1s;
  cursor: pointer;
}

.generate-button:hover {
  background-color: #27272a;
}

.generate-button:active {
  transform: translate(2px, 2px);
  box-shadow: none;
}

/* Expert Card */
.expert-card {
  background-color: #d9f99d;
  color: #000000;
  border: 4px solid #000000;
  box-shadow: 6px 6px 0px #000000;
  padding: 16px;
  margin-bottom: 24px;
  border-radius: 12px;
}

.expert-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

@media (min-width: 768px) {
  .expert-layout {
    flex-direction: row;
  }
}

.expert-avatar-wrapper {
  width: 80px;
  height: 80px;
  background-color: #ffffff;
  border: 4px solid #000000;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 2px 2px 0px #000000;
  position: relative;
}

.expert-avatar-inner {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top right, #bef264, #34d399);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 30px;
}

.expert-speech-balloon-wrapper {
  flex-grow: 1;
  min-width: 0;
  width: 100%;
  position: relative;
}

.expert-speech-balloon {
  background-color: #ffffff;
  border: 4px solid #000000;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 3px 3px 0px #000000;
  position: relative;
}

.expert-intro-text {
  font-size: 12px;
  font-weight: 700;
  line-height: 1.625;
  margin: 0;
}

.expert-verdict-text {
  font-size: 18px;
  font-weight: 900;
  color: #4f46e5;
  margin-top: 4px;
  margin-bottom: 0;
  animation: pulseEffect 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulseEffect {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.expert-buttons-row {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.action-btn {
  flex: 1;
  min-width: 140px;
  font-weight: 900;
  font-size: 12px;
  padding: 10px 12px;
  border: 2px solid #000000;
  border-radius: 4px;
  box-shadow: 3px 3px 0px #000000;
  transition: all 0.1s;
  cursor: pointer;
}

.action-btn:active {
  transform: translate(2px, 2px);
  box-shadow: none;
}

.action-btn-indigo {
  background-color: #6366f1;
  color: #ffffff;
}

.action-btn-indigo:hover {
  background-color: #4f46e5;
}

.action-btn-rose {
  background-color: #fb7185;
  color: #000000;
}

.action-btn-rose:hover {
  background-color: #f43f5e;
}

/* Specs Card */
.specs-card {
  background-color: #f4f4f5;
  border: 4px solid #000000;
  box-shadow: 4px 4px 0px #000000;
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 12px;
}

.sixseven-container.dark .specs-card {
  background-color: #27272a;
  border-color: #000000;
}

.specs-header-title {
  font-weight: 900;
  font-size: 12px;
  color: #71717a;
  margin-top: 0;
  margin-bottom: 12px;
  letter-spacing: 0.05em;
}

.sixseven-container.dark .specs-header-title {
  color: #a1a1aa;
}

.specs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  font-size: 10px;
  font-weight: 900;
}

.spec-item {
  border: 1px solid #d4d4d8;
  padding: 8px;
  border-radius: 4px;
  background-color: #ffffff;
}

.sixseven-container.dark .spec-item {
  border-color: #3f3f46;
  background-color: #09090b;
}

.spec-label {
  color: #a1a1aa;
  display: block;
  margin-bottom: 2px;
}

.text-indigo-accent {
  color: #6366f1;
}

.text-emerald-accent {
  color: #10b981;
}

.text-theme-val {
  color: #ca8a04;
  text-transform: uppercase;
}

.sixseven-container.dark .text-theme-val {
  color: #facc15;
}

/* Fixed controller bar */
.fixed-controller {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 72px;
  background-color: #ffffff;
  border-top: 4px solid #000000;
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.05);
  z-index: 40;
}

.sixseven-container.dark .fixed-controller {
  background-color: #18181b;
}

.ctrl-row-layout {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  height: 100%;
  padding-left: 12px;
  padding-right: 12px;
  box-sizing: border-box;
}

.ctrl-btn {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  border: 3px solid #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 2px 2px 0px #000;
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.1s;
}

.ctrl-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 0px 0px 0px #000;
}

.bg-yellow-btn {
  background-color: #fde047;
}

.bg-yellow-btn:hover {
  background-color: #facc15;
}

.bg-cyan-btn {
    background-color: #22d3ee;
}

.bg-cyan-btn:hover {
    background-color: #06b6d4;
}

.bg-pink-btn {
    background-color: #f472b6;
}

.bg-pink-btn:hover {
    background-color: #ec4899;
}

.bg-violet-btn {
    background-color: #c084fc;
}

.bg-violet-btn:hover {
    background-color: #a855f7;
}

.liked-active {
    color: #e11d48 !important;
}

.ctrl-icon {
  width: 20px;
  height: 20px;
  border: 2px solid #000000;
}

.play-pause-big {
  flex: 1;
  height: 48px;
  border-radius: 8px;
  border: 3px solid #000000;
  box-shadow: 3px 3px 0px #000;
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-pause-big:active {
  transform: translate(3px, 3px);
  box-shadow: 0px 0px 0px #000;
}

.bg-rose-btn {
  background-color: #fb7185;
}

.bg-rose-btn:hover {
  background-color: #f43f5e;
}

.bg-lime-btn {
  background-color: #a3e635;
}

.bg-lime-btn:hover {
  background-color: #84cc16;
}

.play-pause-btn-text {
  font-weight: 900;
  letter-spacing: 0.1em;
  font-size: 12px;
}

/* Haptic feedback simulator overlay */
.shake-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(236, 72, 153, 0.2);
  pointer-events: none;
  z-index: 50;
  animation: shakeEffect 0.4s ease-in-out;
}

@keyframes shakeEffect {
  0% { transform: translate(1px, 1px) rotate(0deg); }
  10% { transform: translate(-1px, -2px) rotate(-1deg); }
  20% { transform: translate(-3px, 0px) rotate(1deg); }
  30% { transform: translate(0px, 2px) rotate(0deg); }
  40% { transform: translate(1px, -1px) rotate(1deg); }
  50% { transform: translate(-1px, 2px) rotate(-1deg); }
  60% { transform: translate(-3px, 1px) rotate(0deg); }
  70% { transform: translate(2px, 1px) rotate(-1deg); }
  80% { transform: translate(-1px, -1px) rotate(1deg); }
  90% { transform: translate(2px, 2px) rotate(0deg); }
  100% { transform: translate(1px, -2px) rotate(0deg); }
}

/* Custom styled scrollbars */
.content-scroll::-webkit-scrollbar {
  width: 10px;
}
.content-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.content-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border: 3px solid transparent;
  background-clip: padding-box;
  border-radius: 10px;
}
.sixseven-container.dark .content-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>
