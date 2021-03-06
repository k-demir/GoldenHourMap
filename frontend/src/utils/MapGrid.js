
class MapGrid {

  constructor() {
    this.data = {}
  }

  addNode = (x, y, information) => {
    this.data[`${x}x${y}`] = information
  }

  getNode = (x, y) => {
    return this.data[`${x}x${y}`]
  }

}

export default MapGrid