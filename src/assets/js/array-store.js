/**
 * 本地化存储模块
 */
import storage from 'good-storage'

// 判断元素是否存在于本地存储中
function inertArray(arr, val, compare, maxLen) {
    // 由于是通用函数,所以查找的逻辑可以让用户自己去定义
    const index = arr.findIndex(compare)
    if (index === 0) {
        return
    }
    // 如果存在，就将其添加到队首
    // 就行先删除在unshift就可以了
    if (index > 0) {
        arr.splice(index, 1)
    }
    arr.unshift(val)
    // 如果超过保存后超过最大长度,则将最初保存的弹出
    if (maxLen && arr.length > maxLen) {
        arr.pop()
    }
}

function deleteFromArray(arr, compare) {
    const index = arr.findIndex(compare)
    if (index > -1) arr.splice(index, 1)
}

// 保存歌曲
export function save(item, key, compare, maxLen) {
    const items = storage.get(key, [])
    inertArray(items, item, compare, maxLen)
    storage.set(key, items)
    return items
}

// 移除歌曲
export function remove(key, compare) {
    const items = storage.get(key, [])
    deleteFromArray(items, compare)
    storage.set(key, items)
    return items
}

export function load(key) {
    return storage.get(key, [])
}

// 清空key下的数据
export function clear(key) {
    storage.remove(key)
    return []
}

export function saveAll(items, key) {
    storage.set(key, items)
}
