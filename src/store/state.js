/**
 * state 定义全局基本数据
 */
import {
    PLAY_MODE,
    FAVORITE_KEY,
    SEARCH_KEY,
    PLAY_KEY
} from '@/assets/js/constant'
import { load } from '@/assets/js/array-store'
const state = {
    // 歌曲顺序列表
    sequenceList: [],
    // 播放列表
    playlist: [],
    // 是否正在播放
    playing: false,
    // 播放模式
    // sequence: 顺序播放
    // loop: 循环播放
    // random: 随机播放
    playMode: PLAY_MODE.sequence,
    // 当前播放音乐
    currentIndex: 0,
    // 播放器状态:全屏，收缩
    fullScreen: false,
    // 收藏列表
    favoriteList: [],
    // 搜索历史
    searchHistory: load(SEARCH_KEY),
    // 播放历史
    playHistory: []
}

export default state
