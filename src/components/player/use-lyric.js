import { useStore } from 'vuex'
import { computed, watch, ref } from 'vue'
import { getLyric } from '@/service/song'
import Lyric from 'lyric-parser'

export default function useLyric({ songReady, currentTime }) {
    const currentLyric = ref(null)
    // 当前歌词行
    const currentLineNum = ref(0)
    const lyricScrollRef = ref(null)
    const lyricListRef = ref(null)
    // 纯音乐无歌词情况
    const pureMusicLyric = ref('')
    // 当前正在播放歌词
    const playingLyric = ref('')

    const store = useStore()
    // 获取当前歌曲
    const currentSong = computed(() => store.getters.currentSong)

    // 检测当前播放歌曲
    watch(currentSong, async (newSong) => {
        // 如果当前歌曲不合法直接return
        if (!newSong.url || !newSong.id) return

        stopLyric()
        currentLyric.value = null
        currentLineNum.value = null
        pureMusicLyric.value = ''
        playingLyric.value = ''

        const lyric = await getLyric(newSong)
        // 在获取到当前歌曲歌词后本地化存储于当前播放歌曲对应这样就对同一首歌重复请求做出了优化
        store.commit('addSongLyric', { song: newSong, lyric })

        // 在获取歌词的过程中更改歌曲此时lyric与currentSong的lyric是不同的
        // 在这种情况下,我们什么都不做
        if (currentSong.value.lyric !== lyric) return

        currentLyric.value = new Lyric(lyric, handleLyric)

        const hasLyric = currentLyric.value.lines.length
        if (hasLyric) {
            if (songReady.value) {
                playLyric()
            }
        } else {
            playingLyric.value = pureMusicLyric.value = lyric.replace(
                /\[(\d{2}):(\d{2}):(\d{2})\]/g,
                ''
            )
        }
    })

    // 播放歌词
    function playLyric() {
        const currentLyricVal = currentLyric.value
        if (currentLyricVal) {
            currentLyricVal.seek(currentTime.value * 1000)
        }
    }

    // 停止播放歌词
    function stopLyric() {
        const currentLyricVal = currentLyric.value
        if (currentLyricVal) {
            currentLyricVal.stop()
        }
    }

    function handleLyric({ lineNum, txt }) {
        // 获取当前行号
        currentLineNum.value = lineNum
        playingLyric.value = txt
        const scrollComp = lyricScrollRef.value
        const listEl = lyricListRef.value
        if (!listEl) return
        // 列表滚动
        // 前五行的话不动,之后保持在屏幕中间
        if (lineNum > 5) {
            const lineEl = listEl.children[lineNum - 5]
            scrollComp.scroll.scrollToElement(lineEl, 1000)
        } else {
            scrollComp.scroll.scrollTo(0, 0, 1000)
        }
    }

    return {
        currentLyric,
        currentLineNum,
        lyricScrollRef,
        lyricListRef,
        pureMusicLyric,
        playingLyric,
        playLyric,
        stopLyric
    }
}
