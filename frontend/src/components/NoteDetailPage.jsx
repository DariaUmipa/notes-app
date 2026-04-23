import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';

function NoteDetailPage() {
    const { id } = useParams();
    const [note, setNote] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchNote = async () => {
            try {
                const response = await API.get(`notes/${id}/`);
                setNote(response.data);
            } catch {
                setError('Не удалось загрузить заметку');
            }
        };
        fetchNote();
    }, [id]);

    if (error) return <div className="error" style={{textAlign: 'center', margin: '50px'}}>{error}</div>;
    if (!note) return <div className="loading">Загрузка...</div>;

    return (
        <div className={`note-detail note-${note.color}`}>
            <div className="note-detail-header">
                <h1>
                    {note.is_important && '⭐'}
                    {note.title}
                </h1>
                <div className="note-detail-actions">
                    <Link to={`/notes/${id}/edit`} className="btn btn-primary">✏️ Редактировать</Link>
                    <Link to={`/notes/${id}/delete`} className="btn btn-danger">🗑️ Удалить</Link>
                    <Link to="/notes" className="btn btn-secondary">← Назад</Link>
                </div>
            </div>
            <div className="note-meta">
                <p><strong>Создано:</strong> {new Date(note.created_at).toLocaleString()}</p>
                {note.updated_at !== note.created_at && (
                    <p><strong>Обновлено:</strong> {new Date(note.updated_at).toLocaleString()}</p>
                )}
                <p><strong>Цвет:</strong> {
                    note.color === 'white' ? 'Белый' : 
                    note.color === 'yellow' ? 'Жёлтый' : 
                    note.color === 'green' ? 'Зелёный' : 
                    note.color === 'blue' ? 'Синий' : 'Розовый'
                }</p>
                <p><strong>Категория:</strong> {note.category_name || 'Без категории'}</p>
            </div>
            <div className="note-content">
                {note.content.split('\n').map((line, i) => (
                    <p key={i}>{line || <br />}</p>
                ))}
            </div>
        </div>
    );
}

export default NoteDetailPage;