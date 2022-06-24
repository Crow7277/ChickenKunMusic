import { ref } from 'vue'
import animations from 'create-keyframe-animation'
export default function useAnimation() {
    const cdWrapperRef = ref(null)
    let entering = false
    let leaving = false
    // 进入过渡效果，小cd过渡到大cd
    function enter(el, done) {
        if (leaving) afterLeave()
        entering = true
        const { x, y, scale } = getPosAndScale()
        const animation = {
            0: {
                transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
            },
            100: {
                transform: 'translate3d(0,0,0) scale(1)'
            }
        }
        // 注册一个animations
        animations.registerAnimation({
            name: 'move',
            animation,
            presets: {
                duration: 600,
                easing: 'cubic-bezier(0.45, 0, 0.55, 1)'
            }
        })
        animations.runAnimation(cdWrapperRef.value, 'move', done)
    }
    function afterEnter() {
        entering = false
        // 清理动画
        animations.unregisterAnimation('move')
        cdWrapperRef.value.animation = ''
    }

    // 离开时，大cd过渡到小cd
    function leave(e, done) {
        if (entering) afterEnter()
        leaving = true
        const { x, y, scale } = getPosAndScale()
        const cdWrapperEl = cdWrapperRef.value

        cdWrapperEl.style.transition = 'all .6s cubic-bezier(0.45, 0, 0.55, 1'
        cdWrapperEl.style.transform = `translate3d(${x}px,${y}px,0) scale(${scale})`
        cdWrapperEl.addEventListener('transitionend', next)
        function next() {
            cdWrapperEl.removeEventListener('transitionend', next)
            done()
        }
    }
    function afterLeave() {
        leaving = false
        const cdWrapperEl = cdWrapperRef.value
        cdWrapperEl.style.transition = ''
        cdWrapperEl.style.transform = ''
    }

    /**
     * 计算cd偏移量与缩放比例
     * 首先获取大cd和小cd的初始位置
     * 之后求出X轴偏移量与Y轴偏移量
     * X轴偏移量：1/2屏幕宽度 - 小cd圆心到屏幕左半边距离
     * Y轴偏移量：屏幕高度 - 大cd圆心到顶部的位置 - 小cd圆心到底部的距离
     * 此时计算的是小cd到大cd
     */
    function getPosAndScale() {
        // 目标位置,小cd宽度
        const targetWidth = 40
        // 小cd距离屏幕左半边的距离
        const paddingLeft = 40
        // 小cd距离屏幕底边的距离
        const paddingBottom = 30
        // 小大cd距离屏幕顶部的距离
        const paddingTop = 80
        // 大CD宽度
        const width = window.innerWidth * 0.8
        // X轴偏移量(往左所以为负值)
        const x = -(window.innerWidth / 2 - paddingLeft)
        // Y轴偏移量
        const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
        // 缩放
        const scale = targetWidth / width
        return { x, y, scale }
    }
    return {
        cdWrapperRef,
        enter,
        afterEnter,
        leave,
        afterLeave
    }
}
