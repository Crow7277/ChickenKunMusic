/**
 * 详情组件相关逻辑
 */
import MusicList from '@/components/music-list/music-list.vue'
import storage from 'good-storage'
import { processSongs } from '@/service/song'
export default function createDetailComponent(name, key, fetch) {
    return {
        name,
        props: {
            data: Object
        },
        components: { MusicList },
        data() {
            return {
                songs: [],
                loading: true
            }
        },
        computed: {
            computedData() {
                let res = null
                const data = this.data
                if (data) {
                    // 如果有歌手信息则直接获取
                    res = data
                } else {
                    // 如果没有则通过缓存获取歌手信息
                    const cached = storage.session.get(key)
                    if (
                        cached &&
                        (cached.mid || cached.id + '') === this.$route.params.id
                    ) {
                        res = cached
                    }
                }
                // console.log(res)
                return res
            },
            pic() {
                const data = this.computedData
                return data && data.pic
            },
            title() {
                const data = this.computedData
                return data && (data.name || data.title)
            }
        },
        async created() {
            const data = this.computedData
            if (!data) {
                const path = this.$route.matched[0].path
                this.$router.push(path)
                return
            }
            const result = await fetch(data)
            this.songs = await processSongs(result.songs)
            this.loading = false
        }
    }
}
