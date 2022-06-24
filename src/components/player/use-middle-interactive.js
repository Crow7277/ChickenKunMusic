import { ref } from 'vue'
export default function useMiddleInteractive() {
    const currentShow = ref('cd')
    const middleLStyle = ref(null)
    const middleRStyle = ref(null)
    // 保存点击距离的变量
    const touch = {}
    // 当前视图
    let currentView = 'cd'

    function onMiddleTouchStart(e) {
        // 获取手指点击下去时候的坐标
        touch.startX = e.touches[0].pageX
        // 为了解决歌词上下滑动的时候左右拖动导致歌词斜着滚动的问题添加一个Y方向的作用
        touch.startY = e.touches[0].pageY
        // 方向锁
        touch.directionLock = ''
    }

    function onMiddleTouchMove(e) {
        // 手指往左划的偏移量,就是手指滑动的距离
        const deltaX = e.touches[0].pageX - touch.startX
        // 为了解决歌词上下滑动的时候左右拖动导致歌词斜着滚动的问题获取Y方向偏移量
        const deltaY = e.touches[0].pageY - touch.startY
        // 为了解决歌词上下滑动的时候左右拖动导致歌词斜着滚动的问题将偏移量取abs
        const absDeltaX = Math.abs(deltaX)
        const absDeltaY = Math.abs(deltaY)
        // 在第一次移动的时候就要利用方向锁来做限定了
        if (!touch.directionLock) {
            // 如果当前没有方向锁就对比当前在横坐标和纵坐标偏移的距离哪个比较大
            // 如果X方向的偏移量大于Y方向的那说明为横向滚动
            touch.directionLock = absDeltaX >= absDeltaY ? 'h' : 'v'
        }
        // 纵向偏移,直接返回,横向偏移的话在进行后面的操作
        if (touch.directionLock === 'v') return

        // 初始的位移
        // 如果初始为cd,那就是0,如果是歌词,那么就是 -屏幕宽度
        const left = currentView === 'cd' ? 0 : -window.innerWidth
        // 计算歌词偏移量
        // 根据滑动手指滑动距离和初始位移,计算歌词的偏移量,如果初始为cd,那么相当于歌词在0的位置
        // 那么往左划的偏移量就是歌词偏移的距离
        // 反之,如果当前页面为歌词,那么初始值就是负的屏幕宽度,此时往右划的偏移量就是歌词应该往右走的距离
        const offsetWidth = Math.min(
            0,
            Math.max(-window.innerWidth, left + deltaX)
        )
        // 计算偏移比例保存到touch对象中
        touch.percent = Math.abs(offsetWidth / window.innerWidth)
        // 如果当前窗口为cd,那么当我们偏移比例超过百分之20,就从cd切换到lyric
        if (currentView === 'cd') {
            if (touch.percent > 0.2) {
                currentShow.value = 'lyric'
            } else {
                currentShow.value = 'cd'
            }
        } else {
            // 如果当前窗口偏移比例小于百分之八十,相当于向右滑动了百分之20
            // 此时切换到cd页面
            if (touch.percent < 0.8) {
                currentShow.value = 'cd'
            } else {
                currentShow.value = 'lyric'
            }
        }
        // 修改样式
        middleLStyle.value = {
            opacity: 1 - touch.percent,
            transitionDuration: '0ms'
        }
        middleRStyle.value = {
            transform: `translate3d(${offsetWidth}px, 0, 0)`,
            transitionDuration: '0ms'
        }
    }

    // 手指离开
    function onMiddleTouchEnd() {
        // 偏移量
        let offsetWidth
        // 透明度
        let opacity
        // 根据currentShow的变化来判断是那个页面从而判断给什么样的样式
        if (currentShow.value === 'cd') {
            currentView = 'cd'
            offsetWidth = 0
            opacity = 1
        } else {
            currentView = 'lyric'
            offsetWidth = -window.innerWidth
            opacity = 0
        }

        const duration = 300
        middleLStyle.value = {
            opacity,
            transitionDuration: `${duration}ms`
        }
        middleRStyle.value = {
            transform: `translate3d(${offsetWidth}px, 0, 0)`,
            transitionDuration: `${duration}ms`
        }
    }
    return {
        currentShow,
        middleLStyle,
        middleRStyle,
        onMiddleTouchStart,
        onMiddleTouchMove,
        onMiddleTouchEnd
    }
}
