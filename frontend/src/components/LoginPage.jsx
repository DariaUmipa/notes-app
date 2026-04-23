import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

function LoginPage({ onLogin, showMessage }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await API.post('login/', { username, password });
            if (response.data.success) {
                showMessage('Вы успешно вошли в систему!', 'success');
                onLogin();
            }
        } catch {
            setError('Неверное имя пользователя или пароль');
        }
    };

    return (
        <div className="auth-container">
            <h1>Вход в систему</h1>
            <form method="post" className="auth-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Имя пользователя</label>
                    <input
                        data-testid="username-input"
                        type="text"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Пароль</label>
                    <div className="password-wrapper">
                        <input
                            data-testid="password-input"
                            type="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                </div>
                {error && <div className="error">{error}</div>}
                <button type="submit" className="btn btn-success">Войти</button>
            </form>
            <p className="auth-link">
                Нет аккаунта? <Link to="/register">Зарегистрируйтесь</Link>
            </p>
        </div>
    );
}

export default LoginPage;