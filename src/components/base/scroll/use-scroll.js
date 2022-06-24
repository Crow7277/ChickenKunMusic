import BScroll from '@better-scroll/core'
import { onMounted, onUnmounted, onActivated, onDeactivated, ref } from 'vue'
import ObserveDOM from '@better-scroll/observe-dom'
// BScroll有一个问题,因为BScroll实在 new BScroll的时候才会调用
// 而这里在调用的时候,页面的数据还未加载,所以此时容器高度大于内容高度,因此不会进行滚动
// 而这个插件解决了这个问题,让BScroll去监听DOM的变化,一旦发生变化就重新new一下
BScroll.use(ObserveDOM)
/**
 * useScroll组件封装
 * @param {*} wrapperRef 传入dom组件
 */
export default function useScroll(wrapperRef, options, emit) {
    const scroll = ref(null)

    onMounted(() => {
        const scrollVal = (scroll.value = new BScroll(wrapperRef.value, {
            observeDOM: true,
            ...options
        }))

        if (options.probeType > 0) {
            scrollVal.on('scroll', (pos) => {
                emit('scroll', pos)
            })
        }
    })

    onUnmounted(() => {
        scroll.value.destroy()
    })

    onActivated(() => {
        scroll.value.enable()
        scroll.value.refresh()
    })

    onDeactivated(() => {
        scroll.value.disable()
    })

    return scroll
}
