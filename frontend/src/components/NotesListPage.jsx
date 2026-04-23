import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';

function NotesListPage({ showMessage }) {
    const [allNotes, setAllNotes] = useState([]);
    const [filteredNotes, setFilteredNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [importantOnly, setImportantOnly] = useState(false);
    const [sort, setSort] = useState('-created_at');
    const [colorFilter, setColorFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [categories, setCategories] = useState([]);

    const loadNotes = useCallback(async () => {
        setLoading(true);
        try {
            const response = await API.get('notes/');
            setAllNotes(response.data);
            setFilteredNotes(response.data);
        } catch (error) {
            console.error('Ошибка загрузки заметок:', error);
            showMessage('Ошибка загрузки заметок', 'error');
        } finally {
            setLoading(false);
        }
    }, [showMessage]);

    const fetchUser = useCallback(async () => {
        try {
            await API.get('check-auth/');
        } catch (error) {
            console.error('Ошибка загрузки пользователя:', error);
        }
    }, []);

    const loadCategories = useCallback(async () => {
        try {
            const response = await API.get('categories/');
            setCategories(response.data);
        } catch (error) {
            console.error('Ошибка загрузки категорий:', error);
        }
    }, []);

    const applyFilters = useCallback(() => {
        let result = [...allNotes];
        
        if (search.trim() !== '') {
            const searchLower = search.toLowerCase().trim();
            result = result.filter(note => {
                const titleMatch = note.title.toLowerCase().includes(searchLower);
                const contentMatch = note.content.toLowerCase().includes(searchLower);
                return titleMatch || contentMatch;
            });
        }
        
        if (importantOnly) {
            result = result.filter(note => note.is_important === true);
        }

        if (colorFilter) {
            result = result.filter(note => note.color === colorFilter);
        }
        
        if (categoryFilter) {
            result = result.filter(note => note.category === parseInt(categoryFilter));
        }
        
        result.sort((a, b) => {
            if (sort === 'created_at') {
                return new Date(a.created_at) - new Date(b.created_at);
            } else if (sort === '-created_at') {
                return new Date(b.created_at) - new Date(a.created_at);
            } else if (sort === 'title') {
                return a.title.localeCompare(b.title, 'ru', { sensitivity: 'base' });
            } else if (sort === '-title') {
                return b.title.localeCompare(a.title, 'ru', { sensitivity: 'base' });
            }
            return 0;
        });
        
        setFilteredNotes(result);
    }, [allNotes, search, importantOnly, sort, colorFilter, categoryFilter]);

    useEffect(() => {
        loadNotes();
        fetchUser();
        loadCategories();
    }, [loadNotes, fetchUser, loadCategories]);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    if (loading) return <div className="loading">Загрузка...</div>;

    return (
        <div>
            <div className="notes-header">
                <h1>Мои заметки <span className="badge">{filteredNotes.length}</span></h1>
            </div>
            
            <div className="notes-toolbar">
                <div className="search-form">
                    <input
                        type="text"
                        placeholder="🔍 Поиск по заголовку или содержанию..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        autoFocus
                    />
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            checked={importantOnly}
                            onChange={(e) => setImportantOnly(e.target.checked)}
                        />
                        ⭐ Только важные
                    </label>
                    <select value={colorFilter} onChange={(e) => setColorFilter(e.target.value)}>
                        <option value="">🎨 Все цвета</option>
                        <option value="white">⚪ Белый</option>
                        <option value="yellow">🟡 Жёлтый</option>
                        <option value="green">🟢 Зелёный</option>
                        <option value="blue">🔵 Синий</option>
                        <option value="pink">🌸 Розовый</option>
                    </select>
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                        <option value="">📁 Все категории</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>📁 {cat.name}</option>
                        ))}
                    </select>
                    <select value={sort} onChange={(e) => setSort(e.target.value)}>
                        <option value="-created_at">📅 Сначала новые</option>
                        <option value="created_at">📅 Сначала старые</option>
                        <option value="title">🔤 По алфавиту (А-Я)</option>
                        <option value="-title">🔤 По алфавиту (Я-А)</option>
                    </select>
                    <Link to="/notes/new" className="btn btn-success">➕ Новая заметка</Link>
                </div>
            </div>

            {filteredNotes.length === 0 ? (
                <div className="empty-state">
                    {search ? (
                        <p>📭 Ничего не найдено по запросу "{search}"</p>
                    ) : importantOnly && !colorFilter && !categoryFilter ? (
                        <p>⭐ У вас нет важных заметок</p>
                    ) : colorFilter && !importantOnly && !categoryFilter ? (
                        <p>🎨 Нет заметок выбранного цвета</p>
                    ) : categoryFilter && !importantOnly && !colorFilter ? (
                        <p>📁 Нет заметок в выбранной категории</p>
                    ) : (
                        <p>📭 У вас пока нет заметок</p>
                    )}
                    <p>Попробуйте изменить условия поиска или <Link to="/notes/new">создайте новую заметку</Link></p>
                </div>
            ) : (
                <div className="notes-grid">
                    {filteredNotes.map(note => (
                        <div key={note.id} className={`note-card note-${note.color}`}>
                            <div className="note-card-header">
                                <h3 title={note.title}>
                                    <Link to={`/notes/${note.id}`}>
                                        {note.is_important && '⭐'}
                                        {note.title.length > 40 ? note.title.substring(0, 40) + '...' : note.title}
                                    </Link>
                                </h3>
                                <div className="note-actions">
                                    <Link to={`/notes/${note.id}/edit`} className="btn-icon" title="Редактировать">✏️</Link>
                                    <Link to={`/notes/${note.id}/delete`} className="btn-icon" title="Удалить">🗑️</Link>
                                </div>
                            </div>
                            <div className="note-card-body">
                                <p>{note.content.length > 100 ? note.content.substring(0, 100) + '...' : note.content}</p>
                            </div>
                            <div className="note-card-footer">
                                {note.category_name && (
                                    <span className="note-category">📁 {note.category_name}</span>
                                )}
                                <small>📅 {new Date(note.created_at).toLocaleString()}</small>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default NotesListPage;


