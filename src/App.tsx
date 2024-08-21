/*
 * @Description: 
 * @Author: wzt
 * @Date: 2024-08-21 10:07:19
 * @LastEditors: wzt
 * @LastEditTime: 2024-08-21 10:12:15
 */
import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </>
  )
}

export default App
