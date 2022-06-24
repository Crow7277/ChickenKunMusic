/**
 * 歌曲收藏功能
 */
import { useStore } from 'vuex'
import { computed } from 'vue'
import { save, remove } from '@/assets/js/array-store'
import { FAVORITE_KEY } from '@/assets/js/constant'
export default function useFavorite() {
    // 从vuex中获取数据
    const store = useStore()
    const favoriteList = computed(() => store.state.favoriteList)
    const maxLen = 100

    // 通过收藏列表来计算喜欢按钮的样式
    function getFavoriteIcon(song) {
        return isFavorite(song) ? 'icon-favorite' : 'icon-not-favorite'
    }

    // 点击按钮的逻辑
    // 如果歌曲在收藏列表就移除,不在就添加进去
    function toggleFavorite(song) {
        let list
        if (isFavorite(song)) {
            // remove
            list = remove(FAVORITE_KEY, compare)
        } else {
            // save
            // 我们保存歌曲设置maxLen首为上限,超过就将最开始的删除
            list = save(song, FAVORITE_KEY, compare, maxLen)
        }
        store.commit('setFavoriteList', list)

        function compare(item) {
            return item.id === song.id
        }
    }

    // 查看歌曲是否在收藏列表中
    function isFavorite(song) {
        return favoriteList.value.findIndex((item) => item.id === song.id) > -1
    }

    return { getFavoriteIcon, toggleFavorite }
}
