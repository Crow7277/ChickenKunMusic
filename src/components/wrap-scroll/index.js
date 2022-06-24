import {
    h,
    mergeProps,
    renderSlot,
    withCtx,
    ref,
    computed,
    watch,
    nextTick
} from 'vue'
import { useStore } from 'vuex'
import Scroll from '@/components/base/scroll/scroll'
export default {
    name: 'warp-scroll',
    props: Scroll.props,
    emits: Scroll.emits,
    // 利用render函数实现基础的Scroll组件逻辑
    // 相当于vueBFC文件的模板内容
    render(ctx) {
        /**
         * 下面的h函数是渲染函数这里相当于在scroll标签里面绑定了$props，以及一个scroll事件，事件为emit('scroll',e)
         * 同时在标签中还包含了一个slot插槽
         * 模板代码如下
         * <scroll ref="scrollRef" v-bind="$props" @scroll="$emit('scroll', e)">
         *      <slot></slot>
         * </scroll>
         */
        return h(
            Scroll,
            // ref属性可以如下面这样添加
            mergeProps({ ref: 'scrollRef' }, ctx.$props, {
                onScroll: (e) => {
                    ctx.$emit('scroll', e)
                }
            }),
            {
                default: withCtx(() => {
                    return [renderSlot(ctx.$slots, 'default')]
                })
            }
        )
    },
    // 生成业务逻辑
    setup() {
        const scrollRef = ref(null)
        const scroll = computed(() => scrollRef.value.scroll)

        const store = useStore()
        const playlist = computed(() => store.state.playlist)

        watch(playlist, async () => {
            await nextTick()
            scroll.value.refresh()
        })
        return {
            scrollRef,
            scroll
        }
    }
}
