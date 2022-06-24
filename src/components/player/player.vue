<template>
    <div class="player" v-show="playlist.length">
        <transition
            name="normal"
            @enter="enter"
            @after-enter="afterEnter"
            @leave="leave"
            @after-leave="afterLeave"
        >
            <div class="normal-player" v-show="fullScreen">
                <div class="background">
                    <img :src="currentSong.pic" />
                </div>
                <div class="top">
                    <div class="back" @click="goBack">
                        <i class="icon-back"></i>
                    </div>
                    <h1 class="title">{{ currentSong.name }}</h1>
                    <h2 class="subtitle">{{ currentSong.singer }}</h2>
                </div>
                <div
                    class="middle"
                    @touchstart.prevent="onMiddleTouchStart"
                    @touchmove.prevent="onMiddleTouchMove"
                    @touchend.prevent="onMiddleTouchEnd"
                >
                    <div class="middle-l" :style="middleLStyle">
                        <div ref="cdWrapperRef" class="cd-wrapper">
                            <div class="cd" ref="cdRef">
                                <img
                                    ref="cdImageRef"
                                    class="image"
                                    :class="cdCls"
                                    :src="currentSong.pic"
                                />
                            </div>
                        </div>
                        <div class="playing-lyric-wrapper">
                            <div class="playing-lyric">
                                {{ playingLyric }}
                            </div>
                        </div>
                    </div>
                    <scroll
                        class="middle-r"
                        ref="lyricScrollRef"
                        :style="middleRStyle"
                    >
                        <div class="lyric-wrapper">
                            <div v-if="currentLyric" ref="lyricListRef">
                                1
                                <p
                                    class="text"
                                    v-for="(line, index) in currentLyric.lines"
                                    :class="{
                                        current: currentLineNum === index
                                    }"
                                    :key="line.num"
                                >
                                    {{ line.txt }}
                                </p>
                            </div>
                            <div class="pure-music" v-show="pureMusicLyric">
                                <p>{{ pureMusicLyric }}</p>
                            </div>
                        </div>
                    </scroll>
                </div>
                <div class="bottom">
                    <div class="dot-wrapper">
                        <span
                            class="dot"
                            :class="{ active: currentShow == 'cd' }"
                        ></span>
                        <span
                            class="dot"
                            :class="{ active: currentShow == 'lyric' }"
                        ></span>
                    </div>
                    <div class="progress-wrapper">
                        <span class="time time-l">
                            {{ formatTime(currentTime) }}
                        </span>
                        <div class="progress-bar-wrapper">
                            <progress-bar
                                ref="barRef"
                                :progress="progress"
                                @progress-changing="onProgressChanging"
                                @progress-change="onProgressChange"
                            ></progress-bar>
                        </div>
                        <span class="time time-r">
                            {{ formatTime(currentSong.duration) }}
                        </span>
                    </div>
                    <div class="operators">
                        <div class="icon i-left">
                            <i @click="changeMode" :class="modeIcon"></i>
                        </div>
                        <div class="icon i-left" :class="disableClass">
                            <i @click="prev" class="icon-prev"></i>
                        </div>
                        <div class="icon i-center" :class="disableClass">
                            <i @click="togglePlay" :class="playIcon"></i>
                        </div>
                        <div class="icon i-right" :class="disableClass">
                            <i @click="next" class="icon-next"></i>
                        </div>
                        <div class="icon i-right">
                            <i
                                @click="toggleFavorite(currentSong)"
                                :class="getFavoriteIcon(currentSong)"
                            ></i>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
        <mini-player
            :progress="progress"
            :togglePlay="togglePlay"
        ></mini-player>
        <audio
            ref="audioRef"
            @pause="pause"
            @canplay="ready"
            @error="error"
            @timeupdate="updateTime"
            @ended="end"
        ></audio>
    </div>
</template>

<script>
import ProgressBar from './progress-bar.vue'
import miniPlayer from './mini-player.vue'
import usePlayHistory from './use-play-history'
import { useStore } from 'vuex'
import { computed, watch, ref, nextTick } from 'vue'
import useMode from './use-mode'
import useFavorite from './use-favorite'
import useCd from './use-cd'
import useLyric from './use-lyric'
import useAnimation from './use-animation'
import useMiddleInteractive from './use-middle-interactive'
import Scroll from '@/components/base/scroll/scroll'
import { formatTime } from '@/assets/js/util'
import { PLAY_MODE } from '@/assets/js/constant'
export default {
    name: 'player',
    components: { ProgressBar, Scroll, miniPlayer },
    setup() {
        // data
        const audioRef = ref(null)
        // 判断歌曲是否准备好进行播放,缓存的内容是否足以播放
        const songReady = ref(false)
        // 当前歌曲播放的时长
        const currentTime = ref(0)
        const barRef = ref(null)
        let progressChanging = false

        // vuex
        // 相当于$store
        const store = useStore()
        const fullScreen = computed(() => store.state.fullScreen)
        const currentSong = computed(() => store.getters.currentSong)
        // 获取播放歌曲索引
        const currentIndex = computed(() => store.state.currentIndex)
        // 播放模式
        const playMode = computed(() => store.state.playMode)

        // hooks
        // 播放模式切换钩子函数
        const { modeIcon, changeMode } = useMode()
        const { getFavoriteIcon, toggleFavorite } = useFavorite()
        const { cdCls, cdRef, cdImageRef } = useCd()
        const {
            currentLyric,
            currentLineNum,
            lyricScrollRef,
            lyricListRef,
            pureMusicLyric,
            playingLyric,
            playLyric,
            stopLyric
        } = useLyric({
            songReady,
            currentTime
        })
        const {
            currentShow,
            middleLStyle,
            middleRStyle,
            onMiddleTouchStart,
            onMiddleTouchMove,
            onMiddleTouchEnd
        } = useMiddleInteractive()
        const { savePlay } = usePlayHistory()

        // cd飞入动画逻辑
        const { cdWrapperRef, enter, afterEnter, leave, afterLeave } =
            useAnimation()
        // computed
        // 获取当前播放列表
        const playlist = computed(() => store.state.playlist)
        // 根据播放状态来动态获取播放按钮
        const playing = computed(() => store.state.playing)
        const playIcon = computed(() =>
            playing.value ? 'icon-pause' : 'icon-play'
        )
        const disableClass = computed(() => {
            return songReady.value ? '' : 'disable'
        })
        // 播放进度
        const progress = computed(() => {
            // 播放的时长/总时长的到播放进度
            return currentTime.value / currentSong.value.duration
        })
        // watch
        watch(currentSong, (newSong) => {
            if (!newSong.id || !newSong.url) {
                return
            }
            // 歌曲切换时播放时间归零
            currentTime.value = 0
            // 每次歌曲发生变化的时候songReady重新加载
            songReady.value = false
            const audioEl = audioRef.value
            audioEl.src = newSong.url
            audioEl.play()
            store.commit('setPlayingState', true)
        })

        // 通过监听playing来控制歌曲的播放和暂停
        watch(playing, (newPlaying) => {
            if (!songReady.value) return
            const audioEl = audioRef.value
            if (newPlaying) {
                audioEl.play()
                playLyric()
            } else {
                audioEl.pause()
                stopLyric()
            }
        })

        watch(fullScreen, async (newFullScreen) => {
            if (newFullScreen) {
                await nextTick()
                barRef.value.setOffset(progress.value)
            }
        })

        // methods
        function goBack() {
            store.commit('setFullScreen', false)
        }
        // 修改播放状态
        function togglePlay() {
            if (!songReady.value) return
            store.commit('setPlayingState', !playing.value)
        }

        // 防止电脑突然关闭导致的数据错乱
        function pause() {
            store.commit('setPlayingState', false)
        }
        // 上一首
        function prev() {
            // 利用currentIndex
            // 获取当前播放的索引
            const list = playlist.value
            if (!songReady.value || !list.length) return
            // 列表只有一首歌的话循环播放
            if (list.length === 1) {
                loop()
            } else {
                let index = currentIndex.value - 1
                // 到第一首歌回到末尾
                if (index === -1) {
                    index = list.length - 1
                }
                store.commit('setCurrentIndex', index)
            }
        }
        // 下一首
        function next() {
            // 利用currentIndex
            // 获取当前播放的索引
            const list = playlist.value
            if (!songReady.value || !list.length) return
            // 列表只有一首歌的话循环播放
            if (list.length === 1) {
                loop()
            } else {
                let index = currentIndex.value + 1
                // 到末尾回退到第一首歌
                if (index === list.length - 1) {
                    index = 0
                }
                store.commit('setCurrentIndex', index)
            }
        }
        // 循环播放当前歌曲
        function loop() {
            const audioEl = audioRef.value
            audioEl.currentTime = 0
            audioEl.play()
            store.commit('setPlayingState', true)
        }
        function ready() {
            if (songReady.value) return
            songReady.value = true
            playLyric()
            // 保存到播放历史
            savePlay(currentSong.value)
        }
        function error() {
            songReady.value = true
        }
        // 歌曲播放时间
        function updateTime(e) {
            // 进度条改变的优先级高
            // 因此在进度条发送拖动的时候，不需要修改播放时间，松开之后再修改
            if (!progressChanging) currentTime.value = e.target.currentTime
        }

        function onProgressChanging(progress) {
            progressChanging = true
            // 修改currentTime的值
            currentTime.value = currentSong.value.duration * progress
            // 同步进度条和歌词
            playLyric()
            stopLyric()
        }
        function onProgressChange(progress) {
            progressChanging = false
            // 拖动过程正常播放,松开的时候修改歌曲播放
            audioRef.value.currentTime = currentTime.value =
                currentSong.value.duration * progress
            // 如果是暂停状态,拖动到进度条对应的位置让其播放
            if (!playing.value) {
                store.commit('setPlayingState', true)
            }
            playLyric()
        }

        // 播放结束
        function end() {
            currentTime.value = 0
            // 单曲循环
            if (playMode.value === PLAY_MODE.loop) {
                loop()
            } else {
                next()
            }
        }
        return {
            fullScreen,
            currentSong,
            audioRef,
            progress,
            currentTime,
            currentIndex,
            playIcon,
            songReady,
            disableClass,
            playlist,
            barRef,
            goBack,
            togglePlay,
            pause,
            prev,
            next,
            ready,
            error,
            updateTime,
            formatTime,
            onProgressChanging,
            onProgressChange,
            end,
            // use-mode
            modeIcon,
            changeMode,
            // use-favorite
            getFavoriteIcon,
            toggleFavorite,
            // use-cd
            cdCls,
            cdRef,
            cdImageRef,
            // use-lyric
            currentLyric,
            currentLineNum,
            lyricScrollRef,
            lyricListRef,
            pureMusicLyric,
            playingLyric,
            // middleInteractive
            currentShow,
            middleLStyle,
            middleRStyle,
            onMiddleTouchStart,
            onMiddleTouchMove,
            onMiddleTouchEnd,
            // animation
            cdWrapperRef,
            enter,
            afterEnter,
            leave,
            afterLeave
        }
    }
}
</script>

<style lang="scss" scoped>
.player {
    .normal-player {
        position: fixed;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        z-index: 150;
        background: $color-background;
        .background {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            opacity: 0.6;
            filter: blur(20px);

            img {
                width: 100%;
                height: 100%;
            }
        }
        .top {
            position: relative;
            margin-bottom: 25px;
            .back {
                position: absolute;
                top: 0;
                left: 6px;
                z-index: 50;
            }
            .icon-back {
                display: block;
                padding: 9px;
                font-size: $font-size-large-x;
                color: $color-theme;
                transform: rotate(-90deg);
            }
            .title {
                width: 70%;
                margin: 0 auto;
                line-height: 40px;
                text-align: center;
                @include no-wrap();
                font-size: $font-size-large;
                color: $color-text;
            }
            .subtitle {
                line-height: 20px;
                text-align: center;
                font-size: $font-size-medium;
                color: $color-text;
            }
        }
        .middle {
            position: fixed;
            width: 100%;
            top: 80px;
            bottom: 170px;
            white-space: nowrap;
            font-size: 0;
            .middle-l {
                display: inline-block;
                vertical-align: top;
                position: relative;
                width: 100%;
                height: 0;
                padding-top: 80%;
                .cd-wrapper {
                    position: absolute;
                    left: 10%;
                    top: 0;
                    width: 80%;
                    box-sizing: border-box;
                    height: 100%;
                    .cd {
                        width: 100%;
                        height: 100%;
                        border-radius: 50%;
                        img {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            height: 100%;
                            box-sizing: border-box;
                            border-radius: 50%;
                            border: 10px solid rgba(255, 255, 255, 0.1);
                        }
                        .playing {
                            animation: rotate 20s linear infinite;
                        }
                    }
                }
                .playing-lyric-wrapper {
                    width: 80%;
                    margin: 30px auto 0 auto;
                    overflow: hidden;
                    text-align: center;
                    .playing-lyric {
                        height: 20px;
                        line-height: 20px;
                        font-size: $font-size-medium;
                        color: $color-text-l;
                    }
                }
            }
            .middle-r {
                display: inline-block;
                vertical-align: top;
                width: 100%;
                height: 100%;
                overflow: hidden;
                .lyric-wrapper {
                    width: 80%;
                    margin: 0 auto;
                    overflow: hidden;
                    text-align: center;
                    .text {
                        line-height: 32px;
                        color: $color-text-l;
                        font-size: $font-size-medium;
                        &.current {
                            color: $color-text;
                        }
                    }
                    .pure-music {
                        padding-top: 50%;
                        line-height: 32px;
                        color: $color-text-l;
                        font-size: $font-size-medium;
                    }
                }
            }
        }
        .bottom {
            position: absolute;
            bottom: 50px;
            width: 100%;
            .dot-wrapper {
                text-align: center;
                font-size: 0;
                .dot {
                    display: inline-block;
                    vertical-align: middle;
                    margin: 0 4px;
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: $color-text-l;
                    &.active {
                        width: 20px;
                        border-radius: 5px;
                        background: $color-text-ll;
                    }
                }
            }
            .progress-wrapper {
                display: flex;
                align-items: center;
                width: 80%;
                margin: 0px auto;
                padding: 10px 0;
                .time {
                    color: $color-text;
                    font-size: $font-size-small;
                    flex: 0 0 40px;
                    line-height: 30px;
                    width: 40px;
                    &.time-l {
                        text-align: left;
                    }
                    &.time-r {
                        text-align: right;
                    }
                }
                .progress-bar-wrapper {
                    flex: 1;
                }
            }
            .operators {
                display: flex;
                align-items: center;
                .icon {
                    flex: 1;
                    color: $color-theme;
                    &.disable {
                        color: $color-theme-d;
                    }
                    i {
                        font-size: 30px;
                    }
                }
                .i-left {
                    text-align: right;
                }
                .i-center {
                    padding: 0 20px;
                    text-align: center;
                    i {
                        font-size: 40px;
                    }
                }
                .i-right {
                    text-align: left;
                }
                .icon-favorite {
                    color: $color-sub-theme;
                }
            }
        }
        &.normal-enter-active,
        &.normal-leave-active {
            transition: all 0.6s;
            .top,
            .bottom {
                transition: all 0.6s cubic-bezier(0.45, 0, 0.55, 1);
            }
        }
        &.normal-enter-from,
        &.normal-leave-to {
            opacity: 0;
            .top {
                transform: translate3d(0, -100px, 0);
            }
            .bottom {
                transform: translate3d(0, 100px, 0);
            }
        }
    }
}
</style>
