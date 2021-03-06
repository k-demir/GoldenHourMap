import React, { useCallback, useEffect, useState } from 'react'
import './Sliders.css'


let AzimuthSlider = ({azimuth, setAzimuth, updateChanges}) => {
  const SIZE = 50;

  let [ mouseDownPos, setMouseDownPos ] = useState({x: null, y: null})
  let [ dragging, setDragging ] = useState(false)
  let [ indicatorPos, setIndicatorPos ] = useState({left: 0, top: 0})

  useEffect(() => {
    computeIndicatorPos()
  }, [azimuth])

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
    computeAngle(clientX, clientY)
  }, [])

  const handleMouseUp = useCallback(() => {
    setDragging(false)
    updateChanges()
  }, [])

  const computeIndicatorPos = () => {
    let radians = (90-azimuth)*Math.PI/180
    let left = SIZE + SIZE*Math.cos(radians) - 10
    let top = SIZE - SIZE*Math.sin(radians) - 10
    setIndicatorPos({left: left, top: top})
  }

  const computeAngle = (x, y) => {
    let sliderRect = document.getElementById('AzimuthSlider').getBoundingClientRect()
    let centerX = sliderRect.x + sliderRect.width/2
    let centerY = sliderRect.y + sliderRect.height/2
    let newAngle
    if (y <= centerY)
      newAngle = -Math.round(Math.atan((x-centerX)/(y-centerY))*180/Math.PI)
    else
      newAngle = 180 - Math.round(Math.atan((x-centerX)/(y-centerY))*180/Math.PI)
    newAngle = (newAngle < 0 ? newAngle + 360 : newAngle)
    setAzimuth(newAngle)
  }

  return (
    <div id='AzimuthSlider'>
      <span id='AzimuthDeg'>
        {azimuth}&deg;
      </span>
      <span className='Indicator' onMouseDown={handleClick} style={indicatorPos} />
    </div>
  )
}

export default AzimuthSlider