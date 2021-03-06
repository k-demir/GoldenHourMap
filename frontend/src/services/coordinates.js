import axios from 'axios'

const baseUrl = 'http://localhost:8000/api/coordinates'

export const toWGS84 = async (x, y) => {
  const res = await axios.get(`${baseUrl}/towgs84/${x}/${y}`)
  return res.data
}

export const fromWGS84 = async (lon, lat) => {
    const res = await axios.get(`${baseUrl}/fromwgs84/${lon}/${lat}`)
    return res.data
  }
