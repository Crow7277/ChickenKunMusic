import { createApp } from 'vue'
import { addClass, removeClass } from '@/assets/js/dom'

const relativeCls = 'g-relative'

export function createLoadingLikeDirective(Comp) {
    return {
        mounted(el, binding) {
            // 创建一个新的vue实例对象app
            const app = createApp(Comp)
            // 拿到这个app的实例
            // 并将这个app实例挂载到一个动态创建div对象上
            // 因此我们的loading组件对应的dom对象在instance上
            const instance = app.mount(document.createElement('div'))
            const name = Comp.name
            if (!el[name]) {
                el[name] = {}
            }
            el[name].instance = instance

            // 动态参数
            const title = binding.arg
            if (typeof title !== 'undefined') {
                instance.setTitle(title)
            }

            if (binding.value) {
                append(el)
            }
        },
        updated(el, binding) {
            const name = Comp.name

            // 动态参数
            const title = binding.arg
            if (typeof title !== 'undefined') {
                el[name].instance.setTitle(title)
            }
            if (binding.value !== binding.oldValue) {
                binding.value ? append(el) : remove(el)
            }
        }
    }
    // 挂载操作
    function append(el) {
        const name = Comp.name
        const style = getComputedStyle(el)
        if (['absolute', 'fixed', 'relative'].indexOf(style.position) === -1) {
            addClass(el, relativeCls)
        }
        // $el: 组件根实例使用的根DOM元素
        el.appendChild(el[name].instance.$el)
    }

    // 移除操作
    function remove(el) {
        const name = Comp.name
        removeClass(el, relativeCls)
        el.removeChild(el[name].instance.$el)
    }
}
