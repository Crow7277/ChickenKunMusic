/**
 * 工具函数
 */
// 洗牌算法
export function shuffle(source) {
    const arr = source.slice()
    for (let i = 0; i < arr.length; i++) {
        const j = getRandomInt(i)
        swap(arr, i, j)
    }
    return arr
}

function getRandomInt(max) {
    return Math.floor(Math.random() * (max + 1))
}
function swap(arr, i, j) {
    const temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp
}

export function formatTime(interval) {
    // 由于是歌曲所以不用考虑小时
    // 向下取整
    interval = interval | 0
    // padStart(2, '0')表示不足两位填充0
    const minute = (((interval / 60) | 0) + '').padStart(2, '0')
    const second = ((interval % 60) + '').padStart(2, '0')
    return `${minute}:${second}`
}
