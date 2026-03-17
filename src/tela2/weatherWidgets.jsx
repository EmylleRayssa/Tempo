import { useEffect, useMemo, useState } from 'react'
import './weatherWidgets.css'
import Locales from '../data/locales.json'

const weatherImages = {
    "céu limpo": "/Images/Sun cloud mid rain.png",
    "nuvens dispersas": "/Images/Moon cloud fast wind.png",
    "algumas nuvens": "/Images/Moon cloud fast wind.png",
    "nuvens quebradas": "/Images/Moon cloud fast wind.png",
    "nublado": "/Images/Moon cloud fast wind.png",
    "chuva moderada": "/Images/Sun cloud mid rain.png",
    "chuva leve": "/Images/Sun cloud angled rain.png",
    "chuva forte": "/Images/Sun cloud mid rain.png",
    "garoa": "/Images/Sun cloud angled rain.png",
    "trovoada": "/Images/Moon cloud mid rain.png",
    "nevoeiro": "/Images/Moon cloud fast wind.png",
    "tornado": "/Images/Tornado.png",
};

function WeatherCard({ item, onCityFetched }) {
    const [weatherData, setWeatherData] = useState(null)
    const apiKey = import.meta.env.VITE_API_WEATHER_KEY
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${item.lat}&lon=${item.lon}&appid=${apiKey}&units=metric&lang=pt_br`

    useEffect(() => {
        if (!item.lat || !item.lon) return
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                if (data.cod === 200) {
                    setWeatherData(data)
                    const countryTag = data.sys.country;
                    const countryName = new Intl.DisplayNames(['pt-BR'], { type: 'region' }).of(countryTag);

                    if (onCityFetched) onCityFetched(`${data.name}, ${countryName}`);
                }
            })
            .catch(error => console.error('Erro na API:', error))
    }, [apiUrl]);

    if (!weatherData) return <div className='ww-card-loading' style={{ color: 'white', padding: '20px' }}>Carregando...</div>

    const description = weatherData.weather[0].description.toLowerCase();
    const customIcon = weatherImages[description] || "/Images/Sun cloud mid rain.png";
    const countryName = new Intl.DisplayNames(['pt-BR'], { type: 'region' }).of(weatherData.sys.country);

    return (
        <article className="ww-card">
            <div className="ww-card-left">
                <h2 className="ww-temp">{Math.round(weatherData.main.temp)}°</h2>
                <p className="ww-range">H:{Math.round(weatherData.main.temp_max)}°  L:{Math.round(weatherData.main.temp_min)}°</p>
                <p className="ww-city">{weatherData.name}, {countryName}</p>
            </div>
            <div className="ww-card-right">
                <img className="ww-icon" src={customIcon} alt={description} />
                <p className="ww-condition">{description}</p>
            </div>
        </article>
    )
}

function WeatherWidgets({ onBack }) {
    const [nameCity, setNameCity] = useState('')
    const [storedCities, setStoredCities] = useState({})
    const [now, setNow] = useState(new Date())

    const handleCityFound = (index, fullName) => {
        setStoredCities(prev => ({ ...prev, [index]: fullName }))
    }

    useEffect(() => {
        const tick = () => setNow(new Date())
        const interval = setInterval(tick, 1000)
        return () => clearInterval(interval)
    }, [])

    const currentTime = useMemo(() => {
        return now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false })
    }, [now])

    return (
        <main className="ww-page">
            <div className="ww-phone">
                <div className="ww-header-bar">
                    <div className="ww-status-bar">
                        <div className="ww-dynamic-island"></div>
                        <span className="ww-status-time">{currentTime}</span>
                        <div className="ww-status-icons">
                            <img className="ww-status-right-image" src="/Images/Right Side.png" alt="" />
                        </div>
                    </div>
                    <div className="ww-top">
                        <div className="ww-top-row">
                            <button type="button" className="ww-back" onClick={onBack}><span className="ww-back-icon"></span></button>
                            <h1 className="ww-title">Weather</h1>
                        </div>
                        <label className="ww-search-wrap">
                            <span className="ww-search-icon"></span>
                            <input
                                value={nameCity}
                                onChange={(e) => setNameCity(e.target.value)}
                                type="text"
                                className="ww-search"
                                placeholder="Search for a city or country"
                            />
                        </label>
                    </div>
                </div>

                <section className="ww-group">
                    {Locales.map((item, index) => {
                        const fullName = storedCities[index] || "";
                        const search = nameCity.toLowerCase();
                        const isVisible = fullName.toLowerCase().includes(search) || nameCity === "";

                        return (
                            <div key={index} style={{ display: isVisible ? 'block' : 'none' }}>
                                <WeatherCard
                                    item={item}
                                    onCityFetched={(fullName) => handleCityFound(index, fullName)}
                                />
                            </div>
                        );
                    })}
                </section>
            </div>
        </main>
    )
}

export default WeatherWidgets