import axios from 'axios'

const baseUrl = 'http://localhost:8000/api/sun'

export const getSunAngles = async (lon, lat, date=undefined, time=undefined) => {
  let res
  if (date === undefined || time === undefined) {
    res = await axios.get(`${baseUrl}/${lon}/${lat}`)
  } else {
    res = await axios.get(`${baseUrl}/${lon}/${lat}/${date}_${time}_${getTimezoneOffset()}`)
  }
  return res.data
}

const getTimezoneOffset = () => {
  let offset = new Date().getTimezoneOffset() / 60
  let offsetInHours = (Math.abs(offset) < 10 ? '0'+Math.abs(offset)+'00' : ''+Math.abs(offset)+'00')
  offsetInHours = (offset < 0 ? '+'+offsetInHours : '-'+offsetInHours)
  return offsetInHours
}