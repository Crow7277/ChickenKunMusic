/**
 * search相关请求
 */
import { get } from './base'
export function getHotKeys() {
    return get('/api/getHotKeys')
}

// 搜索请求
export function search(query, page, showSinger) {
    return get('/api/search', {
        query,
        page,
        showSinger
    })
}
