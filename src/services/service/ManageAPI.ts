
import { post_service } from './service'
import { ADD_ORDER, LOGIN, VIEW_ORDERS } from '@/util/url'
export async function Login(body: any) {
  const { errorStatus, message, data } = await post_service(LOGIN, body)
  if (errorStatus == '1') {
    console.error(message)
    console.error(data)
  } else {
    return data
  }
}
export async function addOrder(body: any) {
  const { errorStatus, message, data } = await post_service(ADD_ORDER, body)
  if (errorStatus == '1') {
    console.error(message)
    console.error(data)
  } else {
    return data
  }
}
export async function viewOrders(body: any) {
  const { errorStatus, message, data } = await post_service(VIEW_ORDERS, body)
  if (errorStatus == '1') {
    console.error(message)
    console.error(data)
  } else {
    return data
  }
}
