// 时间戳转换为年月日时分秒
export function transformTime (timestamp:number) {
  let date = new Date(timestamp) // 时间戳为10位需*1000，时间戳为13位的话不需乘1000
  let Y = date.getFullYear() + '-'
  let M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
  let D = date.getDate() + ' '
  D = D < 10 ? ('0' + D) : D
  let h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':'
  let m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':'
  let s = date.getSeconds()
  s = s < 10 ? ('0' + s) : s
  return Y + M + D + h + m + s
}

// 经纬度转化
export function latLonTransform (latLon:number, flag:string) {
  let newLatLon
  if (Number(localStorage.getItem('latLon')) === 0) { // 换算为度
    newLatLon = `${Math.abs(latLon).toFixed(5)}°`
  } else if (Number(localStorage.getItem('latLon')) === 1) { // 换算为度分
    newLatLon = changeToDF(Math.abs(latLon))
  } else if (Number(localStorage.getItem('latLon')) === 2) { // 换算为度分秒
    newLatLon = changeToDFM(Math.abs(latLon))
  } else {
    newLatLon = changeToDFM(Math.abs(latLon))
  }
  if (flag === 'lat') { // 纬度转换
    if (latLon > 0) {
      newLatLon = `N${newLatLon}`
    } else {
      newLatLon = `S${newLatLon}`
    }
  } else { // 经度转换
    if (latLon > 0) {
      newLatLon = `E${newLatLon}`
    } else {
      newLatLon = `W${newLatLon}`
    }
  }
  return newLatLon
}

// 经纬度转化为度分秒
export function changeToDFM (value:number|string) {
  if (String(value).includes('.')) {
    let str1 = String(value).split(".")
    let du1 = str1[0]
    let tp = "0." + str1[1]
    tp = String((tp * 60).toFixed(3))	//这里进行了强制类型转换
    let str2 = tp.split(".")
    let fen = str2[0]
    tp = "0." + str2[1]
    tp = tp * 60
    let miao = tp.toFixed(3)
    return `${du1}°${fen}'${miao}"`
  } else {
    let du1 = value
    let fen = 0
    let miao = 0
    return `${du1}°${fen}'${miao}"`
  }
}
// 经纬度转换成为度分
export function changeToDF (value:number|string) {
  if (String(value).includes('.')) {
    let str = String(value).split(".")
    let du = str[0]
    let tp = "0." + str[1]
    let fen = (tp * 60).toFixed(5)
    return `${du}°${fen}'`
  } else {
    let du = value
    let fen = 0
    return `${du}°${fen}'`
  }
}