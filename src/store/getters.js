/**
 * 对数据进行计算处理
 */
export const currentSong = (state) => {
    // 通过播放列表和播放索引计算出当前播放的歌曲
    return state.playlist[state.currentIndex] || {}
}
