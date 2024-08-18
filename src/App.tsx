import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Content from './Content.tsx'
import NavigationBar from './NavigationBar.tsx'
function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <NavigationBar />
      <div className="grid-cols-1 sm:grid md:grid-cols-3">
        <Content />
        <Content />
        <Content />
        <Content />
        <Content />
        <Content />
      </div>
    </div>
  )
}

export default App
