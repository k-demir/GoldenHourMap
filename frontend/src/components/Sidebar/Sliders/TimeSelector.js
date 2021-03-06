import React, { useCallback, useEffect, useState } from 'react'
import './Sliders.css'


let TimeSelector = ({fetchSunAngles}) => {
  let [ date, setDate ] = useState('')
  let [ time, setTime ] = useState('')

  useEffect(() => {
    let d = new Date()
    let dateStr = `${d.getFullYear()}-${('0'+(d.getMonth()+1)).substr(-2)}-${('0'+d.getDate()).substr(-2)}`
    let timeStr = `${('0'+d.getHours()).substr(-2)}:${('0'+d.getMinutes()).substr(-2)}`
    setDate(dateStr)
    setTime(timeStr)
  }, [])

  const handleDateUpdate = (event) => {
    setDate(event.target.value)
  }

  const handleTimeUpdate = (event) => {
    setTime(event.target.value)
  }

  const handleLoadShadows = (event) => {
    event.preventDefault()
    fetchSunAngles(date, time)
  }

  return (
    <div id='TimeSelector'>
      <input type='date' value={date} onChange={handleDateUpdate} /><br />
      <input type='time' value={time} onChange={handleTimeUpdate} /><br />
      <button onClick={handleLoadShadows}>Load shadows</button>
    </div>
  )
}

export default TimeSelector