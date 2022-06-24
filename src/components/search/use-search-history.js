import { save, remove, clear } from '@/assets/js/array-store'
import { SEARCH_KEY } from '@/assets/js/constant'
import { useStore } from 'vuex'
export default function useSearchHistory() {
    // 保留关键字最大个数
    const maxLen = 200

    const store = useStore()

    function saveSearch(query) {
        // 将搜索数组存储到本次存储中
        const searches = save(
            query,
            SEARCH_KEY,
            (item) => {
                return item === query
            },
            maxLen
        )
        // 存储的本地信息存储到vuex中
        store.commit('setSearchHistory', searches)
    }

    function deleteSearch(query) {
        const searches = remove(SEARCH_KEY, (item) => {
            return item === query
        })
        // 存储的本地信息存储到vuex中
        store.commit('setSearchHistory', searches)
    }

    function clearSearch() {
        const searches = clear(SEARCH_KEY)
        store.commit('setSearchHistory', searches)
    }

    return { saveSearch, deleteSearch, clearSearch }
}
