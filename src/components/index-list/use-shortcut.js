import { ref, computed } from 'vue'
export default function useShort(props, groupRef) {
    const ANCHOR_HEIGHT = 18
    const scrollRef = ref(null)
    const touch = {}

    const shortcutList = computed(() => {
        return props.data.map((group) => {
            return group.title
        })
    })

    // 点击跳转
    function onShortcutTouchStart(e) {
        const anchorIndex = parseInt(e.target.dataset.index)
        touch.y1 = e.touches[0].pageY
        touch.anchorIndex = anchorIndex
        scrollTo(anchorIndex)
    }

    // 滑动跳转
    function onShortcutTouchMove(e) {
        touch.y2 = e.touches[0].pageY
        // 这里的 | 0相当于向下取整
        const delta = ((touch.y2 - touch.y1) / ANCHOR_HEIGHT) | 0
        const anchorIndex = touch.anchorIndex + delta
        scrollTo(anchorIndex)
    }

    // 根据索引做滚动
    function scrollTo(index) {
        if (isNaN(index)) return
        index = Math.max(0, Math.min(shortcutList.value.length - 1, index))
        const targetEl = groupRef.value.children[index]
        const scroll = scrollRef.value.scroll
        scroll.scrollToElement(targetEl, 0)
    }

    return {
        shortcutList,
        scrollRef,
        onShortcutTouchStart,
        onShortcutTouchMove
    }
}
