/**
 * 选择播放
 */
import { PLAY_MODE } from '@/assets/js/constant'
import { shuffle } from '@/assets/js/util'

export function selectPlay({ commit }, { list, index }) {
    commit('setPlayMode', PLAY_MODE.sequence)
    commit('setSequenceList', list)
    commit('setPlayingState', true)
    commit('setFullScreen', true)
    commit('setPlaylist', list)
    commit('setCurrentIndex', index)
}
export function randomPlay({ commit }, list) {
    commit('setPlayMode', PLAY_MODE.random)
    commit('setSequenceList', list)
    commit('setPlayingState', true)
    commit('setFullScreen', true)
    commit('setPlaylist', shuffle(list))
    commit('setCurrentIndex', 0)
}

export function changeMode({ commit, state, getters }, mode) {
    // 在随机模式的时候由于播放列表会被打乱所以会自动切歌，因此我们需要去修复这个问题
    const currentId = getters.currentSong.id
    // 随机模式
    if (mode === PLAY_MODE.random) {
        commit('setPlaylist', shuffle(state.sequenceList))
    } else {
        commit('setPlaylist', state.sequenceList)
    }
    // 根据切换前的到的歌曲id去更新后的列表找利用id找到这首歌的索引
    const index = state.playlist.findIndex((song) => song.id === currentId)
    commit('setCurrentIndex', index)
    commit('setPlayMode', mode)
}

// 删除歌曲
export function removeSong({ commit, state }, song) {
    const sequenceList = state.sequenceList.slice()
    const playlist = state.playlist.slice()

    const sequenceIndex = findIndex(sequenceList, song)
    const playIndex = findIndex(playlist, song)

    // 防止快速点击删除
    if (sequenceIndex < 0 || playIndex < 0) return

    // 删除
    sequenceList.splice(sequenceIndex, 1)
    playlist.splice(playIndex, 1)
    // 如果删除的歌曲在当前播放歌曲之前删除歌曲的话会让当前删播放歌曲错错位
    // 因此我们需要将当前播放歌曲的位置减一保证其不会错位
    // 并且如果删除的是最后一首歌，如果不做处理的话，当前索引会越界
    let currentIndex = state.currentIndex
    if (playIndex < currentIndex || currentIndex === playlist.playIndex) {
        currentIndex--
    }

    commit('setSequenceList', sequenceList)
    commit('setPlaylist', playlist)
    commit('setCurrentIndex', currentIndex)
    if (!playlist.length) {
        commit('setPlayingState', false)
    }
}

function findIndex(list, song) {
    return list.findIndex((item) => item.id === song.id)
}

// 清空列表
export function clearSongList({ commit }) {
    commit('setSequenceList', [])
    commit('setPlaylist', [])
    commit('setCurrentIndex', 0)
    commit('setPlayingState', false)
}

// 往歌单添加一首歌
export function addSong({ commit, state }, song) {
    const playlist = state.playlist.slice()
    const sequenceList = state.sequenceList.slice()
    let currentIndex = state.currentIndex
    const playIndex = findIndex(playlist, song)

    // 如果当前添加歌曲在列表中存在,直接将currentIndex改为当前要添加的歌曲
    if (playIndex > -1) {
        currentIndex = playIndex
    } else {
        // 如果不在播放列表，添加到播放列表,并将currentIndex改为列表后最后一首歌（刚添加的歌）
        playlist.push(song)
        currentIndex = playlist.length - 1
    }

    const sequenceIndex = findIndex(sequenceList, song)
    if (sequenceIndex === -1) {
        // 当前歌曲不在sequenceList中
        sequenceList.push(song)
    }

    commit('setSequenceList', sequenceList)
    commit('setPlaylist', playlist)
    commit('setCurrentIndex', currentIndex)
    commit('setPlayingState', true)
    commit('setFullScreen', true)
}
