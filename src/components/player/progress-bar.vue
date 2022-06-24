<template>
    <div class="progress-bar" @click="onClick">
        <div class="bar-inner">
            <div class="progress" :style="progressStyle" ref="progress"></div>
            <div
                class="progress-btn-wrapper"
                :style="btnStyle"
                @touchstart.prevent="onTouchStart"
                @touchmove.prevent="onTouchMove"
                @touchend.prevent="onTouchEnd"
            >
                <div class="progress-btn"></div>
            </div>
        </div>
    </div>
</template>

<script>
const progressBtnWidth = 16
export default {
    name: 'progress-bar',
    // 从父组件获取进度
    props: {
        progress: {
            type: Number,
            default: 0
        }
    },
    // 派发两个事件来保证歌曲会随着进度条移动也更改播放进度
    // progress-changing:在move的过程中手指没有离开,在onTouchMove中派发
    // progress-change:手指离开
    emits: ['progress-changing', 'progress-change'],
    data() {
        return {
            offset: 0
        }
    },
    watch: {
        progress(newProgress) {
            // 进度条的宽度
            // 整个进度条所在div的宽度 - 进度条上的按钮宽度 = 进度条的宽度
            const barWidth = this.$el.clientWidth - progressBtnWidth
            // 偏移量
            // 进度条宽度 * 进度 就可以得到进度条的进度偏移量
            // 这里的进度为0 ~ 1
            this.offset = barWidth * newProgress
        }
    },
    // 通过对偏移量的计算来给进度条与btn添加动态样式
    computed: {
        // 拖动进度条 位移就是偏移量
        progressStyle() {
            return `width:${this.offset}px`
        },
        // 进度条上的按钮样式
        btnStyle() {
            return `transform:translate3d(${this.offset}px,0,0)`
        }
    },
    created() {
        this.touch = {}
    },
    methods: {
        // 手指放上
        onTouchStart(e) {
            // 获取两个信息
            // 1.开始的位置,就是横坐标
            // 2.左侧进度条的宽度
            this.touch.x1 = e.touches[0].pageX
            // 初始宽度
            this.touch.beginWidth = this.$refs.progress.clientWidth
        },
        // 手指移动
        onTouchMove(e) {
            // 相当于初始位置偏移了多少
            // 也就是在移动中的横坐标 - 开始时横坐标
            const delta = e.touches[0].pageX - this.touch.x1
            // 位移过后的宽度
            const tempWidth = this.touch.beginWidth + delta
            // 整个进度条的宽度
            const barWidth = this.$el.clientWidth - progressBtnWidth
            // 拖动和的宽度：用位移过后的宽度 / 整个进度条的宽度就是实际拖动的宽度
            // 距离在 0 ~ 1之内
            const progress = Math.min(1, Math.max(tempWidth / barWidth, 0))
            // 将移动的值赋给offset，由于offset和模板映射所以就可以拖动了
            this.offset = barWidth * progress
            // 派发progress-changing事件，让父组件触发该事件来同步进度条和歌曲播放进度
            this.$emit('progress-changing', progress)
        },
        // 手指离开
        onTouchEnd(e) {
            // 进度条宽度
            const barWidth = this.$el.clientWidth - progressBtnWidth
            // 离开时的位置：当前进度条位置/ 总长度
            const progress = this.$refs.progress.clientWidth / barWidth
            this.$emit('progress-change', progress)
        },
        // 点击进度条
        onClick(e) {
            // 获取点击横坐标在页面中的横坐标,然后减去进度条开始的横坐标就可以得到进度条的距离了
            // 获取点击地点在屏幕中的横坐标
            const rect = this.$el.getBoundingClientRect()
            // 进度条偏移量
            const offsetWidth = e.pageX - rect.left
            // 进度条宽度
            const barWidth = this.$el.clientWidth - progressBtnWidth
            const progress = offsetWidth / barWidth
            this.$emit('progress-change', progress)
        },
        setOffset(progress) {
            const barWidth = this.$el.clientWidth - progressBtnWidth
            this.offset = barWidth * progress
        }
    }
}
</script>

<style lang="scss" scoped>
.progress-bar {
    height: 30px;
    .bar-inner {
        position: relative;
        top: 13px;
        height: 4px;
        background: rgba(0, 0, 0, 0.3);
        .progress {
            position: absolute;
            height: 100%;
            background: $color-theme;
        }
        .progress-btn-wrapper {
            position: absolute;
            left: -8px;
            top: -13px;
            width: 30px;
            height: 30px;
            .progress-btn {
                position: relative;
                top: 7px;
                left: 7px;
                box-sizing: border-box;
                width: 16px;
                height: 16px;
                border: 3px solid $color-text;
                border-radius: 50%;
                background: $color-theme;
            }
        }
    }
}
</style>
