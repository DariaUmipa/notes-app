import { Link } from 'react-router-dom';

function HomePage({ isAuthenticated }) {
    return (
        <>
            <div className="hero">
                <h1>Добро пожаловать в приложение для заметок</h1>
                <p className="hero-subtitle">
                    Простой и удобный способ хранить свои мысли и идеи
                </p>
                
                {!isAuthenticated ? (
                    <div className="hero-buttons">
                        <Link to="/register" className="btn btn-primary">Начать работу</Link>
                        <Link to="/login" className="btn btn-secondary">Войти</Link>
                    </div>
                ) : (
                    <div className="hero-buttons">
                        <Link to="/notes" className="btn btn-primary">Перейти к заметкам</Link>
                    </div>
                )}
            </div>
            
            <div className="features">
                <h2>Возможности приложения</h2>
                <div className="feature-grid">
                    <div className="feature-card">
                        <div className="feature-icon">📝</div>
                        <h3>Создание заметок</h3>
                        <p>Легко создавайте и редактируйте ваши заметки</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🎨</div>
                        <h3>Цветовая маркировка</h3>
                        <p>Раскрашивайте заметки для лучшей организации</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">⭐</div>
                        <h3>Важные заметки</h3>
                        <p>Отмечайте важные заметки, чтобы не забыть о главном</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🔍</div>
                        <h3>Поиск и фильтры</h3>
                        <p>Быстрый поиск по всем вашим заметкам</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📊</div>
                        <h3>Статистика</h3>
                        <p>Статистика по общему количеству заметок, важным заметкам и цветам</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🔐</div>
                        <h3>Безопасность</h3>
                        <p>Ваши заметки доступны только вам</p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default HomePage;