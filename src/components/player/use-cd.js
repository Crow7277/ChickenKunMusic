/**
 * cd相关逻辑
 */
import { useStore } from 'vuex'
import { computed, ref, watch } from 'vue'

export default function useCd() {
    const store = useStore()
    const playing = computed(() => store.state.playing)
    const cdRef = ref(null)
    const cdImageRef = ref(null)

    const cdCls = computed(() => {
        return playing.value ? 'playing' : ''
    })

    watch(playing, (newPlaying) => {
        if (!newPlaying) {
            syncTransform(cdRef.value, cdImageRef.value)
        }
    })

    function syncTransform(wrapper, inner) {
        const wrapperTranForm = getComputedStyle(wrapper).transform
        const innerTransFrom = getComputedStyle(inner).transform
        wrapper.style.transform =
            wrapperTranForm === 'none'
                ? innerTransFrom
                : innerTransFrom.concat(' ', wrapperTranForm)
    }

    return { cdCls, cdRef, cdImageRef }
}
