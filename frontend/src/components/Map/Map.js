import React, { useEffect, useState, useRef, useCallback, useImperativeHandle } from 'react'
import { getMapTile, getHeightmapTile } from '../../services/map'
import './Map.css'
import MapGrid from '../../utils/MapGrid'
import constructHeightmap from '../../utils/ShadowAlgorithm'
import Shadows from '/public/Shadows.js'
import ShadowsWASM from '/public/Shadows.wasm'

let Map = React.forwardRef(({x, y, locked}, ref) => {
  const TILESIZE = 200
  const OVERFLOW = 1
  const WIDTH = Math.ceil(window.innerWidth)/TILESIZE + 2*OVERFLOW
  const HEIGHT = Math.ceil(window.innerHeight)/TILESIZE + 2*OVERFLOW

  let [ camCoords, setCamCoords ] = useState({x: null, y: null})
  let [ mapGrid ] = useState(new MapGrid())
  let [ heightmapGrid ] = useState(new MapGrid())
  let [ dragging, setDragging ] = useState(false)
  let [ mouseDownPos, setMouseDownPos ] = useState({x: null, y: null})
  let [ mouseDownCamCoords, setMouseDownCamCoords] = useState({x: null, y: null})

  const canvasRef = useRef(null)
  const wasm = useRef(null)

  useEffect(() => {
    wasm.current = Shadows({
      locateFile: () => {
          return ShadowsWASM
      }
    })
  }, [])

  useEffect(() => {
    if (x !== null && y !== null) {
      let coords = mapToScreenCoords(x, y)
      setCamCoords({x: coords.x-window.innerWidth/2, y: -coords.y+window.innerHeight/2})
    }
  }, [x, y])

  useEffect(() => {
    if (camCoords.x !== null && camCoords.y !== null) {
      drawMap()
    }
  }, [camCoords])

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleDragging)
      window.addEventListener('mouseup', handleMouseUp)
    } else {
      window.removeEventListener('mousemove', handleDragging)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragging])

  useImperativeHandle(ref, () => {
      return { drawShadows }
  })

  const mapToScreenCoords = (x, y) => (
    {x: x/2 - camCoords.x, y: camCoords.y - y/2}
  )

  const screenToMapCoords = (x, y) => (
    {x: 2*(camCoords.x + x), y: 2*(camCoords.y - y)}
  )

  const getTileCoords = (x, y) => (
    {x: Math.floor(x / 400) * 400, y: Math.ceil(y / 400) * 400}
  )

  const getCurrentTiles = () => {
    let tiles = []
    for (let i=-OVERFLOW; i<HEIGHT; i++) {
      for (let j=-OVERFLOW; j<WIDTH; j++) {
        let mapCoords = screenToMapCoords(j*TILESIZE, i*TILESIZE)
        let tileCoords = getTileCoords(mapCoords.x, mapCoords.y)
        tiles = tiles.concat(tileCoords)
      }
    }
    return tiles
  }

  const drawMap = async () => {
    const context = canvasRef.current.getContext('2d')
    let tiles = getCurrentTiles()
    tiles = tiles.map(tile => ({...tile, img: mapGrid.getNode(tile.x, tile.y)}))
    tiles.map(async t => {
      if (t.img === undefined) {
        let tileCanvas = new window.OffscreenCanvas(TILESIZE, TILESIZE)
        mapGrid.addNode(t.x, t.y, tileCanvas)
        let tileCanvasContext = tileCanvas.getContext('2d')
        tileCanvasContext.fillStyle = 'aliceblue'
        tileCanvasContext.fillRect(0, 0, TILESIZE, TILESIZE)
        let tileImg = await fetchImage(t.y, t.x)
        let img = new window.Image(TILESIZE, TILESIZE)
        img.addEventListener('load', () => {
          tileCanvasContext.drawImage(img, 0, 0, TILESIZE, TILESIZE)
          let tilePos = mapToScreenCoords(t.x, t.y)
          context.drawImage(tileCanvas, tilePos.x, tilePos.y)
          setCamCoords(camCoords => ({...camCoords}))
        })
        img.src = tileImg
        let heightmap = await fetchHeightmap(t.y, t.x)
        heightmapGrid.addNode(t.x, t.y, heightmap)
      } else {
        let tilePos = mapToScreenCoords(t.x, t.y)
        context.drawImage(t.img, tilePos.x, tilePos.y)
      }
    }) 
  }

  const drawShadows = async (azimuth, altitude) => {
    if (camCoords.x === null || camCoords.y === null) {
      return
    }
    drawMap()
    let tiles = getCurrentTiles()
    tiles = tiles.map(tile => ({...tile, heightmap: heightmapGrid.getNode(tile.x, tile.y)}))
    let hmap = constructHeightmap(tiles, TILESIZE)
    wasm.current.then(module => {
      const context = canvasRef.current.getContext('2d')
      let getShadows = module.cwrap("getShadows", null, ["number", "number"])
      let inputArray = new Int32Array(hmap.data)
      let length = inputArray.length
      let bytesPerElement = inputArray.BYTES_PER_ELEMENT
      let inputPtr = module._malloc(length * bytesPerElement)
      let outputPtr = module._malloc(length * bytesPerElement)
      let res
      try {
        module.HEAP32.set(inputArray, inputPtr/bytesPerElement)
        getShadows(inputPtr, outputPtr, hmap.width, hmap.height, length, altitude, azimuth)
        res = new Int32Array(module.HEAP32.buffer, outputPtr, length)
      } finally {
        module._free(inputPtr)
        module._free(outputPtr)
      }
      let imgData = context.getImageData(0, 0, window.innerWidth, window.innerHeight)
      let mapCoords = screenToMapCoords(0, 0)
      let tileCoords = getTileCoords(mapCoords.x, mapCoords.y)
      let coords = mapToScreenCoords(tileCoords.x, tileCoords.y)
      coords.x -= OVERFLOW*TILESIZE
      coords.y -= OVERFLOW*TILESIZE
      res = res.filter((_, i) => Math.floor(i/hmap.width) >= -coords.y && i%hmap.width >= -coords.x && i%hmap.width < window.innerWidth-coords.x)
      let colors = getColors(altitude)
      for (let i=0; i<res.length; i++) {
        imgData.data[4*i] -= (res[i] === 1 ? colors.shadowR : colors.lightR)
        imgData.data[4*i+1] -= (res[i] === 1 ? colors.shadowG : colors.lightG)
        imgData.data[4*i+2] -= (res[i] === 1 ? colors.shadowB : colors.lightB)
      }
      context.putImageData(imgData, 0, 0)
    })
  }

  const getColors = (angle) => {
    if (angle > 5)
      return {shadowR: 120, shadowG: 120, shadowB: 120, lightR: 0, lightG: 0, lightB: 10}
    else if (angle > -4)
      return {shadowR: 50, shadowG: 80, shadowB: 130, lightR: 0, lightG: 15, lightB: 50}
    else if (angle > -7)
      return {shadowR: 140, shadowG: 140, shadowB: 30, lightR: 140, lightG: 140, lightB: 30}
    else if (angle > -12)
      return {shadowR: 140, shadowG: 140, shadowB: 90, lightR: 140, lightG: 140, lightB: 90}
    else
      return {shadowR: 170, shadowG: 170, shadowB: 130, lightR: 150, lightG: 150, lightB: 150}
  }

  const fetchImage = async (y, x) => {
    let tile = await getMapTile(y, x)
    let img = new Blob([tile], {type: 'image/png'})
    return window.URL.createObjectURL(img)
  }

  const fetchHeightmap = async (y, x) => {
    let tile = await getHeightmapTile(y, x)
    return tile
  }

  const handleMouseDown = useCallback(({clientX, clientY}) => {
    if (!locked) {
      setDragging(true)
      setMouseDownPos({x: clientX, y: clientY})
      setMouseDownCamCoords(camCoords)
    }
  }, [camCoords, locked])

  const handleDragging = useCallback(({clientX, clientY}) => {
    if (!locked) {
      setCamCoords({
        x: mouseDownCamCoords.x+(mouseDownPos.x-clientX), 
        y: mouseDownCamCoords.y+(-mouseDownPos.y+clientY)
      })
    }
  }, [mouseDownPos, mouseDownCamCoords, locked])

  const handleMouseUp = useCallback(() => {
    setDragging(false)
  }, [])

  return (
    <div className='Map' onMouseDown={handleMouseDown}>
      <div style={(locked ? {border: '5px solid red', height: 'calc(100vh - 10px)',
        width: 'calc(100vw - 10px)', position: 'absolute', zIndex: 99} : {})}
      />
      <canvas ref={canvasRef} width={WIDTH*TILESIZE} height={HEIGHT*TILESIZE} />
    </div>
  )
})

export default Map