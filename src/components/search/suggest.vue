<template>
    <div
        ref="rootRef"
        class="suggest"
        v-loading:[loadingText]="loading"
        v-no-result:[noResultText]="noResult"
    >
        <ul class="suggest-list">
            <li
                class="suggest-item"
                v-if="singer"
                @click="selectSinger(singer)"
            >
                <div class="icon">
                    <i class="icon-mine"></i>
                </div>
                <div class="name">
                    <p class="text">{{ singer.name }}</p>
                </div>
            </li>
            <li
                class="suggest-item"
                v-for="song in songs"
                :key="song.id"
                @click="selectSong(song)"
            >
                <div class="icon">
                    <i class="icon-music"></i>
                </div>
                <div class="name">
                    <p class="text">{{ song.singer }}-{{ song.name }}</p>
                </div>
            </li>
            <div
                class="suggest-item"
                v-loading:[loadingText]="pullupLoading"
            ></div>
        </ul>
    </div>
</template>

<script>
import { computed, ref, watch, nextTick } from 'vue'
import { search } from '@/service/search'
import { processSongs } from '@/service/song'
import usePullUpLoad from './use-pull-up-load'

export default {
    name: 'suggest',
    props: {
        query: String,
        showSinger: {
            type: Boolean,
            default: true
        }
    },
    emits: ['select-song', 'select-singer'],
    setup(props, { emit }) {
        const singer = ref(null)
        const songs = ref([])
        const hasMore = ref(true)
        const page = ref(1)
        const loadingText = ref('')
        const noResultText = ref('抱歉，暂无搜索结果')
        // 记录是否进行数据不足时的请求
        const manualLoading = ref(false)

        const preventPullUpLoad = computed(() => {
            return loading.value || manualLoading.value
        })
        const { rootRef, isPullUpLoad, scroll } = usePullUpLoad(
            searchMore,
            preventPullUpLoad
        )

        const noResult = computed(() => {
            return !singer.value && !songs.value.length && !hasMore.value
        })
        const loading = computed(() => !singer.value && !songs.value.length)
        const pullupLoading = computed(
            () => isPullUpLoad.value && hasMore.value
        )

        // watch观察的值必须是响应式对象，如果不是可以使用getter函数来包裹
        watch(
            () => props.query,
            async (newQuery) => {
                if (!newQuery) {
                    return
                }
                // 开始搜索
                await searchFirst()
            }
        )

        // 搜索函数
        async function searchFirst() {
            if (!props.query) return
            // 每当修改query的时候就要重新搜索，所以这些搜索条件都需要初始化
            page.value = 1
            songs.value = []
            singer.value = null
            hasMore.value = true

            const result = await search(
                props.query,
                page.value,
                props.showSinger
            )
            // 由于搜索的到的歌曲也是不能拿到url的所有需要发送请求获取
            songs.value = await processSongs(result.songs)
            singer.value = result.singer
            hasMore.value = result.hasMore
            await nextTick()
            await makeItScrollable()
        }

        async function searchMore() {
            if (!hasMore.value || !props.query) return
            page.value++
            const result = await search(
                props.query,
                page.value,
                props.showSinger
            )
            songs.value = songs.value.concat(await processSongs(result.songs))
            hasMore.value = result.hasMore
            await nextTick()
            await makeItScrollable()
        }

        // 如果搜索的结果不满一屏幕就继续搜索
        async function makeItScrollable() {
            if (scroll.value.maxScrollY >= -1) {
                manualLoading.value = true
                await searchMore()
                manualLoading.value = false
            }
        }

        // 派发自定义事件，点击搜索出来的歌曲往播放列表添加一首歌
        function selectSong(song) {
            emit('select-song', song)
        }

        // 派发自定义事件，点击搜索出来的歌手
        function selectSinger(singer) {
            emit('select-singer', singer)
        }

        return {
            singer,
            songs,
            loadingText,
            noResultText,
            noResult,
            loading,
            pullupLoading,
            selectSong,
            selectSinger,
            // pullup
            rootRef,
            isPullUpLoad
        }
    }
}
</script>

<style lang="scss" scoped>
.suggest {
    height: 100%;
    overflow: hidden;
    .suggest-list {
        padding: 0 30px;
        .suggest-item {
            display: flex;
            align-items: center;
            padding-bottom: 20px;
            .icon {
                flex: 0 0 30px;
                width: 30px;
                [class^='icon-'] {
                    font-size: 14px;
                    color: $color-text-d;
                }
            }
            .name {
                flex: 1;
                font-size: $font-size-medium;
                color: $color-text-d;
                overflow: hidden;
                .text {
                    @include no-wrap();
                }
            }
        }
    }
}
</style>
