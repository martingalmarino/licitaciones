import { Link, useLocation } from 'react-router-dom'

export default function Header() {
  const loc = useLocation()
  return (
    <header className="cofarsur-header">
      <div className="header-container">
        <Link to="/" className="logo-section">
          <div className="logo-icon">C</div>
          <div className="logo-text">
            <span className="logo-main">DROGUERÍA COFARSUR</span>
            <span className="logo-subtitle">Radar de Licitaciones</span>
          </div>
        </Link>
        <nav className="header-nav">
          <Link to="/" className={loc.pathname === '/' ? 'nav-link active' : 'nav-link'}>
            Radar
          </Link>
          <Link to="/performance" className={loc.pathname === '/performance' ? 'nav-link active' : 'nav-link'}>
            Performance
          </Link>
          <Link to="/risk-simulator" className={loc.pathname.startsWith('/risk-simulator') ? 'nav-link active' : 'nav-link'}>
            Simulador de Riesgo
          </Link>
        </nav>
      </div>
    </header>
  )
}
