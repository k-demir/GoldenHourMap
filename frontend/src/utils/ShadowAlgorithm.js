const constructHeightmap = (tiles, tilesize) => {
  let xMin = Infinity
  let yMin = Infinity
  let xMax = -Infinity
  let yMax = -Infinity
  for (let tile of tiles) {
    tile.x = tile.x/2
    tile.y = tile.y/2
    if (tile.x < xMin)
      xMin = tile.x
    if (tile.y < yMin)
      yMin = tile.y
    if (tile.x > xMax)
      xMax = tile.x
    if (tile.y > yMax)
      yMax = tile.y
  }
  const width = (xMax-xMin+tilesize)
  const height = (yMax-yMin+tilesize)
  let res = new Array((width*height))
  for (let tile of tiles) {
    for (let y=0; y<tilesize; y++) {
      for (let x=0; x<tilesize; x++) {
        res[width*(yMax-tile.y+y) + tile.x-xMin+x] = tile.heightmap[y][x]
      }
    }
  }
  return {data: res, width: width, height: height}
}

export default constructHeightmap