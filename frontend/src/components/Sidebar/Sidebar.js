import React, { useEffect, useRef, useState } from 'react'
import './Sidebar.css'
import AltitudeSlider from './Sliders/AltitudeSlider'
import AzimuthSlider from './Sliders/AzimuthSlider'
import TimeSelector from './Sliders/TimeSelector'
import { getSunAngles } from '../../services/sun'

let Sidebar = ({lon, lat, drawShadowsRef, setLocked}) => {
  let [ minimized, setMinimized ] = useState(true)
  let [ altitude, setAltitude ] = useState(0)
  let [ azimuth, setAzimuth ] = useState(0)
  let [ redraw, setRedraw ] = useState(false)

  let altRef = useRef()
  let aziRef = useRef()

  useEffect(() => {
    altRef.current = altitude
  }, [altitude])

  useEffect(() => {
    aziRef.current = azimuth
  }, [azimuth])

  useEffect(() => {
    drawShadowsRef.current.drawShadows(aziRef.current, altRef.current)
  }, [redraw])

  useEffect(() => {
    fetchSunAngles()
  }, [])

  const handleClick = () => {
    setMinimized(minimized => !minimized)
    setLocked(locked => !locked)
  }

  const fetchSunAngles = async (date=undefined, time=undefined) => {
    let sunAngles = await getSunAngles(lon, lat, date, time)
    setAltitude(Math.round(sunAngles.altitude))
    setAzimuth(Math.round(sunAngles.azimuth))
    drawShadows()
  }
  
  const drawShadows = () => {
    setRedraw(redraw => !redraw)
  }

  const minVersion = () => (
    <div className='Sidebar' onClick={handleClick} style={{height: '30px'}}>
      Shadows
    </div>
  )

  const fullVersion = () => (
    <div className='Sidebar'  style={{height: '90vh'}}>
      <div style={{height: '30px'}} onClick={handleClick}>
        Shadows
      </div>
      <hr style={{marginBlockStart: '0'}}/>
      <h3>Sun position</h3>
      <AzimuthSlider azimuth={azimuth} setAzimuth={setAzimuth} updateChanges={drawShadows} />
      <h3>Sun altitude</h3>
      <AltitudeSlider altitude={altitude} setAltitude={setAltitude} updateChanges={drawShadows} />
      <h3>Select by date and time</h3>
      <TimeSelector fetchSunAngles={fetchSunAngles} />
    </div>
  )

  return (
    <div>
      {minimized ? minVersion() : fullVersion()}
    </div>
  )
}

export default Sidebar