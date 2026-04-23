import { useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

function RegisterPage({ onLogin, showMessage }) {
    const [formData, setFormData] = useState({
        username: '',
        password1: '',
        password2: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e, fieldName) => {
        setFormData({ ...formData, [fieldName]: e.target.value });
        if (errors[fieldName]) {
            setErrors(prev => ({ ...prev, [fieldName]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const newErrors = {};
        
        // Проверка username
        if (!formData.username) {
            newErrors.username = 'Имя пользователя обязательно';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Имя пользователя должно содержать минимум 3 символа';
        } else if (formData.username.length > 30) {
            newErrors.username = 'Имя пользователя не должно превышать 30 символов';
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            newErrors.username = 'Только буквы, цифры и символ подчёркивания (_)';
        } else {
            try {
                const checkResponse = await API.get(`check-username/?username=${formData.username}`);
                if (checkResponse.data.exists) {
                    newErrors.username = 'Пользователь с таким именем уже существует';
                }
            } catch (error) {
                console.error('Ошибка проверки username:', error);
            }
        }
        
        // Проверка пароля
        if (!formData.password1) {
            newErrors.password1 = 'Пароль обязателен';
        } else {
            if (formData.password1.length < 8) {
                newErrors.password1 = 'Пароль должен содержать минимум 8 символов';
            }
            if (!/^[A-Za-z0-9!@#$%^&*()_+\-=[\]{};:"\\|,.<>/?]+$/.test(formData.password1)) {
                newErrors.password1 = 'Пароль может содержать только английские буквы, цифры и спецсимволы';
            }
            if (formData.username && formData.password1.toLowerCase().includes(formData.username.toLowerCase())) {
                newErrors.password1 = 'Пароль не должен содержать имя пользователя';
            }
        }
        
        // Проверка подтверждения пароля
        if (!formData.password2) {
            newErrors.password2 = 'Подтверждение пароля обязательно';
        } else if (formData.password1 !== formData.password2) {
            newErrors.password2 = 'Пароли не совпадают';
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        setIsLoading(true);
        
        try {
            const response = await API.post('register/', {
                username: formData.username,
                password: formData.password1
            });
            
            if (response.data.success) {
                showMessage('Регистрация прошла успешно!', 'success');
                onLogin();
            }
        } catch (err) {
            if (err.response?.data?.error) {
                const errorMsg = err.response.data.error;
                
                if (errorMsg.includes('уже существует') || errorMsg.includes('имя')) {
                    setErrors({ username: errorMsg });
                } else if (errorMsg.includes('пароль')) {
                    setErrors({ password1: errorMsg });
                } else {
                    setErrors({ general: errorMsg });
                }
            } else {
                setErrors({ general: 'Ошибка регистрации. Попробуйте позже.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <h1>Регистрация</h1>
            
            {errors.general && (
                <div className="alert alert-error">{errors.general}</div>
            )}
            
            <form className="auth-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Имя пользователя </label>
                    <input
                        data-testid="username-input"
                        type="text"
                        value={formData.username}
                        onChange={(e) => handleChange(e, 'username')}
                        className={errors.username ? 'error-input' : ''}
                        required
                    />
                    {errors.username && <div className="field-error">{errors.username}</div>}
                    <small className="help-text">Только буквы, цифры и _. От 3 до 30 символов.</small>
                </div>
                
                <div className="form-group">
                    <label>Пароль </label>
                    <div className="password-wrapper">
                        <input
                            data-testid="password1-input"
                            type="password"
                            value={formData.password1}
                            onChange={(e) => handleChange(e, 'password1')}
                            className={errors.password1 ? 'error-input' : ''}
                            required
                        />
                    </div>
                    {errors.password1 && <div className="field-error">{errors.password1}</div>}
                    <div className="password-help">
                        <small className="help-text">✓ Минимум 8 символов</small>
                        <small className="help-text">✓ Только английские буквы, цифры и спецсимволы</small>
                    </div>
                </div>
                
                <div className="form-group">
                    <label>Подтверждение пароля </label>
                    <div className="password-wrapper">
                        <input
                            data-testid="password2-input"
                            type="password"
                            value={formData.password2}
                            onChange={(e) => handleChange(e, 'password2')}
                            className={errors.password2 ? 'error-input' : ''}
                            required
                        />
                    </div>
                    {errors.password2 && <div className="field-error">{errors.password2}</div>}
                    <small className="help-text">Введите тот же пароль, что и выше</small>
                </div>
                
                <button type="submit" className="btn btn-success" disabled={isLoading}>
                    {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                </button>
            </form>
            <p className="auth-link">
                Уже есть аккаунт? <Link to="/login">Войдите</Link>
            </p>
        </div>
    );
}

export default RegisterPage;