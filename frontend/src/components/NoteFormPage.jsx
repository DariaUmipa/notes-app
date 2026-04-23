import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

function NoteFormPage({ showMessage }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [color, setColor] = useState('white');
    const [isImportant, setIsImportant] = useState(false);
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(id ? true : false);
    const [error, setError] = useState('');
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [categoryError, setCategoryError] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

    const loadCategories = async () => {
        try {
            const response = await API.get('categories/');
            setCategories(response.data);
        } catch (error) {
            console.error('Ошибка загрузки категорий:', error);
        }
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        if (!newCategoryName.trim()) {
            setCategoryError('Введите название категории');
            return;
        }

        try {
            const response = await API.post('categories/create/', {
                name: newCategoryName.trim()
            });
            setCategories([...categories, response.data]);
            setNewCategoryName('');
            setCategoryError('');
            setShowCategoryModal(false);
            showMessage('Категория создана!', 'success');
        } catch (err) {
            setCategoryError(err.response?.data?.error || 'Ошибка создания категории');
        }
    };

    const handleDeleteCategory = async () => {
        if (!categoryToDelete) return;
        
        try {
            await API.delete(`categories/${categoryToDelete.id}/delete/`);
            setCategories(categories.filter(cat => cat.id !== categoryToDelete.id));
            if (category === categoryToDelete.id) setCategory('');
            showMessage('Категория удалена!', 'success');
            setShowDeleteConfirm(false);
            setCategoryToDelete(null);
        } catch (error) {
            console.error('Ошибка удаления:', error);
            showMessage('Ошибка удаления категории', 'error');
        }
    };

    const openDeleteConfirm = (cat) => {
        setCategoryToDelete(cat);
        setShowDeleteConfirm(true);
    };

    useEffect(() => {
        loadCategories();
        if (id) {
            const fetchNote = async () => {
                try {
                    const response = await API.get(`notes/${id}/`);
                    setTitle(response.data.title);
                    setContent(response.data.content);
                    setColor(response.data.color);
                    setIsImportant(response.data.is_important);
                    setCategory(response.data.category || '');
                } catch (error) {
                    console.error('Ошибка загрузки заметки:', error);
                    setError('Не удалось загрузить заметку');
                } finally {
                    setLoading(false);
                }
            };
            fetchNote();
        }
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const noteData = { 
            title, 
            content, 
            color, 
            is_important: isImportant,
            category: category || null
        };
        
        try {
            let response;
            if (id) {
                response = await API.put(`notes/${id}/update/`, noteData);
                if (response.status === 200) {
                    showMessage('Заметка успешно обновлена!', 'success');
                    navigate('/notes');
                }
            } else {
                response = await API.post('notes/create/', noteData);
                if (response.status === 201) {
                    showMessage('Заметка успешно создана!', 'success');
                    navigate('/notes');
                }
            }
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            setError(error.response?.data?.error || 'Ошибка при сохранении заметки');
        }
    };

    if (loading) return <div className="loading">Загрузка...</div>;

    return (
        <div className="form-container">
            <h1>{id ? 'Редактирование заметки' : 'Создание заметки'}</h1>
            {error && <div className="error" style={{marginBottom: '20px'}}>{error}</div>}
            <form method="post" className="note-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Заголовок</label>
                    <input
                        data-testid="title-input"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label>Содержание</label>
                    <textarea
                        data-testid="content-input"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows="10"
                        required
                    />
                </div>
                
                <div className="form-group">
                    <label>Цвет заметки</label>
                    <select value={color} onChange={(e) => setColor(e.target.value)}>
                        <option value="white">⚪ Белый</option>
                        <option value="yellow">🟡 Жёлтый</option>
                        <option value="green">🟢 Зелёный</option>
                        <option value="blue">🔵 Синий</option>
                        <option value="pink">🌸 Розовый</option>
                    </select>
                </div>
                
                <div className="form-group">
                    <label>Категория</label>
                    <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{flex: 1}}>
                            <option value="">📁 Без категории</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>📁 {cat.name}</option>
                            ))}
                        </select>
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCategoryModal(true)}>
                            ✏️
                        </button>
                    </div>
                </div>
                
                <div className="form-group checkbox-wrapper">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={isImportant}
                            onChange={(e) => setIsImportant(e.target.checked)}
                        />
                        <span> Важная заметка</span>
                    </label>
                </div>
                
                <div className="form-actions">
                    <button type="submit" className="btn btn-success">Сохранить</button>
                    <Link to="/notes" className="btn btn-secondary">Отмена</Link>
                </div>
            </form>

            {/* Модальное окно управления категориями */}
            {showCategoryModal && (
                <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Управление категориями</h3>
                            <button className="modal-close" onClick={() => setShowCategoryModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            {categoryError && <div className="alert alert-error">{categoryError}</div>}
                            
                            <form onSubmit={handleCreateCategory} className="category-form">
                                <input
                                    type="text"
                                    placeholder="Название новой категории"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                />
                                <button type="submit" className="btn btn-success">+ Добавить</button>
                            </form>
                            
                            <div className="categories-list">
                                <h4>Мои категории</h4>
                                {categories.length === 0 ? (
                                    <p className="empty-text">У вас пока нет категорий</p>
                                ) : (
                                    categories.map(cat => (
                                        <div key={cat.id} className="category-item">
                                            <span className="category-name">📁 {cat.name}</span>
                                            <button 
                                                className="btn-icon delete-btn"
                                                onClick={() => openDeleteConfirm(cat)}
                                                title="Удалить категорию"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно подтверждения удаления категории */}
            {showDeleteConfirm && categoryToDelete && (
                <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Удаление категории</h3>
                            <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p>Вы уверены, что хотите удалить категорию <strong>"{categoryToDelete.name}"</strong>?</p>
                            <p className="warning">Заметки в этой категории останутся без категории.</p>
                            <div className="form-actions" style={{justifyContent: 'center', marginTop: '20px'}}>
                                <button onClick={handleDeleteCategory} className="btn btn-danger">Да, удалить</button>
                                <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary">Отмена</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default NoteFormPage;