import axios from 'axios'

const baseUrl = 'http://localhost:8000/api'

export const getMapTile = async (x, y) => {
  const res = await axios.get(`${baseUrl}/map/${x}/${y}`, {responseType: 'blob'})
  return res.data
}

export const getHeightmapTile = async (x, y) => {
    const res = await axios.get(`${baseUrl}/heightmap/${x}/${y}`, {responseType: 'json', responseEncoding: 'gzip'})
    return res.data
  }