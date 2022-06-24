import { useStore } from 'vuex'
import {
    computed,
    ref,
    onMounted,
    onUnmounted,
    watch,
    nextTick,
    onActivated,
    onDeactivated
} from 'vue'
import BScroll from '@better-scroll/core'
import Slide from '@better-scroll/slide'
BScroll.use(Slide)
export default function useMiniSlider() {
    const store = useStore()

    const fullScreen = computed(() => store.state.fullScreen)
    const playlist = computed(() => store.state.playlist)
    const currentIndex = computed(() => store.state.currentIndex)
    const sliderShow = computed(() => {
        return !fullScreen.value && !!playlist.value
    })
    const sliderWrapperRef = ref(null)
    const slider = ref(null)

    // 初始化
    onMounted(() => {
        // 利用BScroll的轮播图形式实现
        let sliderVal
        // 当mini播放器显示的时候再进行初始化
        // 也就是播放器不是全屏且有播放列表的时候进行初始化
        watch(sliderShow, async (newSliderShow) => {
            if (newSliderShow) {
                await nextTick()
                if (!sliderVal) {
                    // 只用初始化一次
                    sliderVal = slider.value = new BScroll(
                        sliderWrapperRef.value,
                        {
                            click: true,
                            scrollX: true,
                            scrollY: false,
                            momentum: false,
                            bounce: false,
                            probeType: 2,
                            slide: {
                                autoplay: false,
                                loop: true
                            }
                        }
                    )
                    // 监听scroll，如果滑动了就把滑动之后的的页码来切换播放信息
                    sliderVal.on('slidePageChanged', ({ pageX }) => {
                        store.commit('setCurrentIndex', pageX)
                    })
                } else {
                    sliderVal.refresh()
                }
                // 将currentIndex与播放列表一一对应goToPage为BScroll的api
                sliderVal.goToPage(currentIndex.value, 0, 0)
            }
        })

        // 切歌时同步更新
        watch(currentIndex, (newIndex) => {
            if (sliderVal && sliderShow.value) {
                sliderVal.goToPage(newIndex, 0, 0)
            }
        })

        watch(playlist, async (newList) => {
            if (sliderVal && sliderShow.value && newList.length) {
                await nextTick()
                sliderVal.refresh()
            }
        })
    })

    onUnmounted(() => {
        if (slider.value) {
            slider.value.destroy()
        }
    })

    onActivated(() => {
        slider.value.enable()
        slider.value.refresh()
    })

    onDeactivated(() => {
        slider.value.disable()
    })

    return { slider, sliderWrapperRef }
}
