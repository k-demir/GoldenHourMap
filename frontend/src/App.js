import React, { useEffect, useState, useRef } from 'react'
import './App.css'
import { toWGS84, fromWGS84 } from './services/coordinates'
import Map from './components/Map/Map'
import Sidebar from './components/Sidebar/Sidebar'


let App = () => {
  let [ lat, setLat ] = useState('60.451292')
  let [ lon, setLon ] = useState('22.267118')
  let [ x, setX ] = useState(null)
  let [ y, setY ] = useState(null)
  let [ locked, setLocked ] = useState(false)

  let drawShadowsRef = useRef()

  useEffect(() => {
    fetchXYCoordinates()
  }, [])
  
  const fetchXYCoordinates = async() => {
    let coordinates = await fromWGS84(lon, lat)
    setX(Math.round(coordinates.x))
    setY(Math.round(coordinates.y))
  }

  return (
    <div className='App'>
      <Map x={x} y={y} locked={locked} ref={drawShadowsRef} />
      <Sidebar lon={lon} lat={lat} drawShadowsRef={drawShadowsRef} setLocked={setLocked} />
      <div id='license'>
          Map data is provided by the National Land Survey of Finland (01/2021) under <a href='https://creativecommons.org/licenses/by/4.0/'>CC BY 4.0 license</a>.
      </div>
    </div>
  );
}

export default App;