<template>
    <div class="plugin-page-container">
        <component :is="activeComponent" v-if="activeComponent" />
    </div>
</template>

<script setup>
    import { computed, defineAsyncComponent } from 'vue'

    const props = defineProps({
        code: {
            type: String,
            required: true
        }
    });

    const pluginRegistry = {
        'jbl-pulse': defineAsyncComponent(() => import('@/plugins/jbl-pulse/JBLPulse.vue')),
        'sonic-rhythm-dash': defineAsyncComponent(() => import('@/plugins/sonic-rhythm-dash/SonicRhythmDash.vue')),
        'yandex-gravity': defineAsyncComponent(() => import('@/plugins/yandex-gravity/YandexGravity.vue')),
        'might-and-music': defineAsyncComponent(() => import('@/plugins/heroes-might-and-music/HeroesMightAndMusic.vue')),
        'gravity-synthwave': defineAsyncComponent(() => import('@/plugins/gravity-synthwave/GravitySynthwave.vue')),
        'nebula-ride': defineAsyncComponent(() => import('@/plugins/nebula-ride/NebulaRide.vue')),
        'audio-bounce': defineAsyncComponent(() => import('@/plugins/audio-bounce/AudioBounce.vue')),
        'lofi-cozy': defineAsyncComponent(() => import('@/plugins/lofi-cozy/LofiCozy.vue')),
        'winamp-retro': defineAsyncComponent(() => import('@/plugins/winamp-retro/WinampRetro.vue')),
        'vultisig-vault': defineAsyncComponent(() => import('@/plugins/vultisig-vault/VultisigVault.vue'))
    }

    const activeComponent = computed(() => {
        return pluginRegistry[props.code] || null
    })
</script>

<style scoped>
    .plugin-page-container {
        width: 100%;
        height: 100%;
    }
    .error-state {
        padding: 20px;
        text-align: center;
        color: #666;
    }
</style>
