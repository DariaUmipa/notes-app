import { useState, useEffect } from 'react';
import API from '../services/api';

function StatisticsPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await API.get('statistics/');
                setStats(response.data);
            } catch {
                setError('Не удалось загрузить статистику');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div className="loading">Загрузка...</div>;
    if (error) return <div className="error" style={{textAlign: 'center', margin: '50px'}}>{error}</div>;

    return (
        <div className="statistics">
            <h1>Моя статистика</h1>
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">{stats.total_notes}</div>
                    <div className="stat-label">Всего заметок</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{stats.important_notes}</div>
                    <div className="stat-label">Важных заметок</div>
                </div>
            </div>
            
            {stats.colors && Object.keys(stats.colors).length > 0 && (
                <div className="stats-section">
                    <h2>По цветам</h2>
                    <div className="colors-list">
                        {Object.entries(stats.colors).map(([color, count]) => (
                            <div key={color} className="color-stat">
                                <span className={`color-badge color-${color}`}>{color}</span>
                                <span className="color-count">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default StatisticsPage;