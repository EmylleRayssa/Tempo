import { useState } from 'react'
import './App.css'
import LetsGo from './tela1/letsgo'
import WeatherWidgets from './tela2/weatherWidgets'

function App() {
  const [currentScreen, setCurrentScreen] = useState('tela1')

  return (
    <>
      {currentScreen === 'tela1' ? (
        <LetsGo onOpenWidgets={() => setCurrentScreen('tela2')} />
      ) : (
        <WeatherWidgets onBack={() => setCurrentScreen('tela1')} />
      )}
    </>
  )
}

export default App
