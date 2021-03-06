import React, { useCallback, useEffect, useState } from 'react'
import './Sliders.css'


let AltitudeSlider = ({altitude, setAltitude, updateChanges}) => {
  const SIZE = 100;

  let [ mouseDownPos, setMouseDownPos ] = useState({x: null, y: null})
  let [ dragging, setDragging ] = useState(false)
  let [ indicatorPos, setIndicatorPos ] = useState({left: -10, top: 0})

  useEffect(() => {
    computeIndicatorPos()
  }, [altitude])

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleDragging)
      window.addEventListener('mouseup', handleMouseUp)
    } else {
      window.removeEventListener('mousemove', handleDragging)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragging])

  const handleClick = useCallback((e) => {
    e.stopPropagation()
    setMouseDownPos({x: e.clientX, y: e.clientY})
    setDragging(true)
  }, [])
  
  const handleDragging = useCallback(({clientX, clientY}) => {
    computeAltitude(clientY)
  }, [mouseDownPos])

  const handleMouseUp = useCallback(() => {
    setDragging(false)
    updateChanges()
  }, [])

  const computeIndicatorPos = () => {
    let top = SIZE/2-altitude*SIZE/180-10
    setIndicatorPos(indicatorPos => ({...indicatorPos, top: top}))
  }

  const computeAltitude = (y) => {
    let sliderRect = document.getElementById('AltitudeSlider').getBoundingClientRect()
    let centerY = sliderRect.y + sliderRect.height/2
    let newAltitude = Math.min(Math.max(centerY-y, -SIZE), SIZE)
    newAltitude *= 180/SIZE
    newAltitude = Math.round(Math.min(Math.max(newAltitude, -90), 90))
    setAltitude(newAltitude)
  }

  return (
    <div id='AltitudeSlider'>
      <span id='AltitudeDeg'>
        {altitude}&deg;
      </span>
      <span id='AltitudeZero'></span>
      <span className='Indicator' onMouseDown={handleClick} style={indicatorPos} />
    </div>
  )
}

export default AltitudeSlider