import { useState, useRef, useEffect, useCallback, useMemo } from 'react'

const LetsGo = ({ onOpenWidgets }) => {
    const [weatherData, setWeatherData] = useState(null)
    const [hourlyData, setHourlyData] = useState([])
    const [weeklyData, setWeeklyData] = useState([])

    const lat = -9.6658;
    const lon = -35.7350;

    const apiKey = "119dde4319f2e8d94757fb82841d6c91"
    const urlApi = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${apiKey}`

    const urlForecast = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${apiKey}`

    useEffect(() => {
        fetch(urlApi)
            .then(response => response.json())
            .then(data => {
                if (data.cod === 200) {
                    setWeatherData(data);
                    // Log detalhado
                    console.log('Cidade:', data.name);
                    console.log('Temperatura:', data.main?.temp);
                    console.log('Descrição:', data.weather?.[0]?.description);
                    console.log('Ícone:', data.weather?.[0]?.icon);
                } else {
                    console.error('Erro na resposta da API:', data.message);
                }
            })
            .catch(error => {
                console.error('Erro ao obter dados do clima:', error);
            });

        fetch(urlForecast)
            .then(response => response.json())
            .then(data => {
                if (data.cod == 200) {
                    setHourlyData(data.list.slice(0, 8));
                    const dailyData = data.list.filter(item => item.dt_txt.includes('12:00:00'));
                    setWeeklyData(dailyData);
                    // Log detalhado
                    console.log('Previsão horária:');
                    data.list.slice(0, 8).forEach((item, idx) => {
                        console.log(`Hora ${idx}:`, {
                            temp: item.main.temp,
                            descricao: item.weather[0].description,
                            icone: item.weather[0].icon,
                            dt_txt: item.dt_txt
                        });
                    });
                }
            })
            .catch(error => {
                console.error('Erro ao obter dados horários do clima:', error);
            });
    }, [urlApi, urlForecast]);


    const collapseAmount = 347
    const [sheetOffset, setSheetOffset] = useState(collapseAmount)
    const [isDragging, setIsDragging] = useState(false)
    const [activeTab, setActiveTab] = useState('hourly')
    const [selectedCard, setSelectedCard] = useState(null)
    const [now, setNow] = useState(new Date())
    const dragging = useRef(false)
    const startY = useRef(0)
    const startOffset = useRef(0)
    const currentOffset = useRef(collapseAmount)

    const forecastData = activeTab === 'hourly' ? hourlyData : weeklyData

    const handleMove = useCallback((clientY) => {
        if (!dragging.current) return
        const delta = clientY - startY.current
        const newOffset = Math.min(collapseAmount, Math.max(0, startOffset.current + delta))
        currentOffset.current = newOffset
        setSheetOffset(newOffset)
    }, [])

    const handleEnd = useCallback(() => {
        if (!dragging.current) return
        dragging.current = false
        setIsDragging(false)
        const snapTo = currentOffset.current > collapseAmount / 2 ? collapseAmount : 0
        setSheetOffset(snapTo)
        currentOffset.current = snapTo
    }, [])

    useEffect(() => {
        const onMouseMove = (e) => handleMove(e.clientY)
        const onMouseUp = () => handleEnd()
        const onTouchMove = (e) => handleMove(e.touches[0].clientY)
        const onTouchEnd = () => handleEnd()

        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup', onMouseUp)
        window.addEventListener('touchmove', onTouchMove, { passive: true })
        window.addEventListener('touchend', onTouchEnd)

        return () => {
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseup', onMouseUp)
            window.removeEventListener('touchmove', onTouchMove)
            window.removeEventListener('touchend', onTouchEnd)
        }
    }, [handleMove, handleEnd])

    useEffect(() => {
        const tick = () => setNow(new Date())
        tick()
        const interval = setInterval(tick, 1000)

        return () => clearInterval(interval)
    }, [])

    const currentTime = useMemo(() => {
        return now.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        })
    }, [now])

    const handleStart = (clientY) => {
        dragging.current = true
        setIsDragging(true)
        startY.current = clientY
        startOffset.current = currentOffset.current
    }

    const handleCardClick = (i) => {
        setSelectedCard(selectedCard === i ? null : i)
    }

    const expandProgress = 1 - sheetOffset / collapseAmount
    const houseUp = expandProgress * 130
    const weatherOpacity = Math.max(0, (sheetOffset / collapseAmount))
    const weatherScale = 0.85 + (sheetOffset / collapseAmount) * 0.15
    const weatherBlur = (1 - sheetOffset / collapseAmount) * 8
    const houseScale = 1 - expandProgress * 0.05

    return (
        <>
            <div className="container notranslate" translate='no'>
                <img className="mobile" src="/Images/Image.png" alt="" />

                <div className="t1-top-shell">
                    <div className="t1-status-bar" aria-label="Barra de status">
                        <span className="t1-status-time">{currentTime}</span>
                        <img className="t1-status-right" src="/Images/Right%20Side.png" alt="" />
                    </div>
                </div>

                <div
                    className="house-container"
                    style={{
                        transform: `translateY(-${houseUp}px) scale(${houseScale})`,
                    }}
                >
                    <img
                        className="house-floating-anim"
                        src="/Images/House.png"
                        alt="Casa"
                    />
                </div>
                <div
                    className="weather"
                    style={{

                        transform: `scale(${weatherScale}) translateY(${weatherOpacity * 70}px)`,
                    }}
                >
                    <div className="local">{weatherData?.name || 'Carregando...'}</div>
                    <div className="temp">{weatherData?.main?.temp?.toFixed(0) || 'Carregando...'}°</div>
                    <div className="info">
                        <div className="clima">{weatherData?.weather?.[0]?.description}</div>
                        <div className="umidade"><div>H:{weatherData?.main?.humidity}%</div><div>L:{weatherData?.main?.temp_min?.toFixed(0)}°</div></div>
                    </div>
                </div>

                <div
                    className={`bottom-sheet ${isDragging ? '' : 'smooth'}`}
                    style={{ transform: `translateX(-50%) translateY(${sheetOffset}px)` }}
                    onTouchStart={(e) => handleStart(e.touches[0].clientY)}
                    onMouseDown={(e) => handleStart(e.clientY)}
                >
                    <div className="sheet-handle"></div>

                    <div className="sheet-tabs">
                        <span
                            className={`sheet-tab ${activeTab === 'hourly' ? 'active' : ''}`}
                            onClick={() => setActiveTab('hourly')}
                        >
                            Hourly Forecast
                        </span>
                        <span
                            className={`sheet-tab ${activeTab === 'weekly' ? 'active' : ''}`}
                            onClick={() => setActiveTab('weekly')}
                        >
                            Weekly Forecast
                        </span>
                    </div>

                    <div className="sheet-divider"></div>

                    <div className="forecast-row">
                        {forecastData.map((item, i) => {
                            const temperatura = Math.round(item.main.temp) + '°';
                            const tempMax = Math.round(item.main.temp_max) + '°';
                            const tempMin = Math.round(item.main.temp_min) + '°';
                            const chanceChuva = item.pop > 0 ? Math.round(item.pop * 100) + '%' : null;
                            const date = new Date(item.dt_txt);
                            const displayTime = activeTab === 'hourly'
                                ? date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) // Mostra 14:00
                                : date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''); // Mostra Seg

                            return (
                                <div
                                    key={`${activeTab}-${i}`}
                                    className={`forecast-card ${selectedCard === i ? 'selected' : ''} fade-in`}
                                    style={{ animationDelay: `${i * 0.07}s` }}
                                    onClick={() => handleCardClick(i)}
                                >
                                    <span className="fc-time">{displayTime}</span>

                                    <div className="fc-icon-wrap">
                                        <img className='w-[60%]'
                                            src={`http://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                                            alt="clima"
                                        />
                                        {chanceChuva && <span className="fc-chance">{chanceChuva}</span>}
                                    </div>

                                    <span className="fc-temp">{temperatura}</span>
                                    <div className='text-white' style={{ fontSize: '10px', opacity: 0.6, display: 'flex', gap: '4px' }}>
                                        <span>H:{tempMax}</span>
                                        <span>L:{tempMin}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="sheet-bottom-nav">
                        <img className='w-[100%] h-[80%] absolute top-5' src="/Images/Rectangle%20364.png" alt="" />
                        <img src="/Images/Front.png" alt="" className="sheet-bottom-nav-bg" />

                        <button
                            type="button"
                            className="nav-plus"
                            disabled
                            aria-label="Alternar painel"
                        ></button>

                        <div className="nav-items">
                            <button
                                type="button"
                                className={`nav-icon ${activeTab === 'hourly' ? 'active' : ''}`}
                                disabled
                                aria-label="Mostrar previsão por hora"
                            >
                                <img src="/Images/Map.png" alt="Hourly" className="nav-img" />
                            </button>

                            <div className="nav-space"></div>

                            <button
                                type="button"
                                className={`nav-icon nav-icon-list ${activeTab === 'weekly' ? 'active' : ''}`}
                                onClick={onOpenWidgets}
                                aria-label="Mostrar previsão semanal"
                            >
                                <img src="/Images/List.png" alt="Weekly" className="nav-img nav-img-list" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default LetsGo