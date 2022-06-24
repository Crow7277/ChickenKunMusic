import { ref, watch, nextTick, computed } from 'vue'
export default function useFixed(props) {
    const TITLE_HEIGHT = 30
    // 利用compositionAPI获取ul这个DOM对象
    const groupRef = ref(null)
    // 记录每个区间的高度
    const listHeights = ref([])
    // 纵向位置
    const scrollY = ref(0)
    // 当前渲染组的索引
    const currentIndex = ref(0)
    // 当前组的下一个组距离容器顶部的距离
    const distance = ref(0)

    // 当前渲染组的title
    const fixedTitle = computed(() => {
        if (scrollY.value < 0) {
            return ''
        }
        const currentGroup = props.data[currentIndex.value]
        return currentGroup ? currentGroup.title : ''
    })

    const fixedStyle = computed(() => {
        const distanceVal = distance.value
        const diff =
            distanceVal > 0 && distanceVal < TITLE_HEIGHT
                ? distanceVal - TITLE_HEIGHT
                : 0
        return {
            transform: `translate3d(0,${diff}px,0)`
        }
    })

    watch(
        () => props.data,
        async () => {
            await nextTick()
            calculate()
        }
    )

    watch(scrollY, (newY) => {
        const listHeightsVal = listHeights.value

        for (let i = 0; i < listHeightsVal.length - 1; i++) {
            // 获取区间顶部
            const heightTop = listHeightsVal[i]
            // 获取区间底部
            const heightBottom = listHeightsVal[i + 1]
            // 判断当前滚动的y值是否落在区间内
            if (newY >= heightTop && newY <= heightBottom) {
                // 求得当前展示组的索引
                currentIndex.value = i
                distance.value = heightBottom - newY
            }
        }
    })

    // 求解列表的高度
    function calculate() {
        // 获取每一组的ul的dom
        const list = groupRef.value.children
        const listHeightsVal = listHeights.value
        let height = 0
        // 初始化操作
        listHeightsVal.length = 0
        listHeightsVal.push(height)

        // 遍历list dom树
        for (let i = 0; i < list.length; i++) {
            height += list[i].clientHeight
            listHeightsVal.push(height)
        }
    }

    function onScroll(pos) {
        scrollY.value = -pos.y
    }

    return {
        onScroll,
        groupRef,
        currentIndex,
        fixedTitle,
        fixedStyle
    }
}
