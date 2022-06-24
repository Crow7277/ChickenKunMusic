import axios from 'axios'

// 指定全路径
const baseURL = process.env.NODE_ENV === 'production' ? '/music-next/' : '/'

axios.defaults.baseURL = baseURL

export function get(url, params) {
    return axios
        .get(url, {
            params
        })
        .then((res) => {
            const serverData = res.data
            if (serverData.code === 0) {
                return serverData.result
            }
        })
        .catch((e) => {
            console.log(e)
        })
}
