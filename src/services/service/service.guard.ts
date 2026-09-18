import axios from 'axios'

const service = axios.create()

service.interceptors.request.use(
  (consfig : any) => {
    consfig.headers['access-token'] = localStorage.getItem('authToken')
    return consfig
  },
  (err: any) => {
    return Promise.reject(err)
  }
)

service.interceptors.response.use(
  (res: any) => {
    return res
  },
  (err: any) => {
    return Promise.reject(err)
  }
)

export default service
