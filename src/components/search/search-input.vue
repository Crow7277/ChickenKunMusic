<template>
    <div class="search-input">
        <i class="icon-search"></i>
        <input class="input-inner" v-model="query" :placeholder="placeholder" />
        <i v-show="query" class="icon-dismiss" @click="clear"></i>
    </div>
</template>

<script>
import { debounce } from 'throttle-debounce'
export default {
    name: 'search-input',
    props: {
        modelValue: String,
        placeholder: {
            type: String,
            default: '搜索歌曲、歌手'
        }
    },
    data() {
        return {
            query: this.modelValue
        }
    },
    created() {
        // 短时间内多次输入会重复发送请求,使用debounce让其300ms发送一次请求即可
        this.$watch(
            'query',
            debounce(300, (newQuery) => {
                this.$emit('update:modelValue', newQuery.trim())
            })
        )
        // 真正实现说项绑定，当我们点击热门搜索自动填充的时候
        // 需要watch外面传入的modelValue的变化一旦发现变化就给query赋值
        this.$watch('modelValue', (newVal) => {
            this.query = newVal
        })
    },
    methods: {
        clear() {
            this.query = ''
        }
    }
}
</script>

<style lang="scss" scoped>
.search-input {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    padding: 0 6px;
    height: 32px;
    background: $color-highlight-background;
    border-radius: 6px;
    .icon-search {
        font-size: 24px;
        color: $color-text-d;
    }
    .input-inner {
        flex: 1;
        margin: 0 5px;
        line-height: 18px;
        background: $color-highlight-background;
        color: $color-text;
        font-size: $font-size-medium;
        outline: 0;
        &::placeholder {
            color: $color-text-d;
        }
    }
    .icon-dismiss {
        font-size: 16px;
        color: $color-text-d;
    }
}
</style>
