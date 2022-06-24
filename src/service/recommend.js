/**
 * 推荐页相关请求
 */
import { get } from './base'

// 轮播图
export function getRecommend() {
    return get('/api/getRecommend')
}

// 推荐歌单
export function getAlbum(album) {
    return get('/api/getAlbum', { id: album.id })
}
