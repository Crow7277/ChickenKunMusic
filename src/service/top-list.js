/**
 * 排行榜相关页面请求
 */
import { get } from './base'
export function getTopList() {
    return get('/api/getTopList')
}

export function getTopDetail(top) {
    return get('/api/getTopDetail', {
        id: top.id,
        period: top.period
    })
}
