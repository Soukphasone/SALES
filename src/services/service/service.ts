import service from './service.guard'
import {} from '@/util/url'

const server = import.meta.env.VITE_APP_SERVER
export function get_service(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    service
      .get(server + url)
      .then((res: any) => {
        resolve({ errorStatus: '0', message: 'SUCCESS', data: res.data })
        console.log('Connect success')
      })
      .catch((err: any) => {
        resolve({ errorStatus: '1', message: err.message, data: err })
      })
  })
}

export function post_service(url: string, body: any): Promise<any> {
  return new Promise((resolve, reject) => {
    service
      .post(server + url, body)
      .then((res: any) => {
        resolve({ errorStatus: '0', message: 'SUCCESS', data: res.data })
      })
      .catch((err: any) => {
        resolve({ errorStatus: '1', message: err.message, data: err })
      })
  })
}
