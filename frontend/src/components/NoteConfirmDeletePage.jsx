import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../services/api';

function NoteConfirmDeletePage({ showMessage }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchNote = async () => {
            try {
                const response = await API.get(`notes/${id}/`);
                setNote(response.data);
            } catch {
                setError('Не удалось загрузить заметку');
            } finally {
                setLoading(false);
            }
        };
        fetchNote();
    }, [id]);

    const handleDelete = async () => {
        try {
            await API.delete(`notes/${id}/delete/`);
            showMessage('Заметка успешно удалена!', 'success');
            navigate('/notes');
        } catch {
            showMessage('Ошибка при удалении заметки', 'error');
        }
    };

    if (loading) return <div className="loading">Загрузка...</div>;
    if (error) return <div className="error" style={{textAlign: 'center', margin: '50px'}}>{error}</div>;
    if (!note) return <div className="loading">Заметка не найдена</div>;

    return (
        <div className="delete-confirm">
            <h1>Удаление заметки</h1>
            <p>Вы уверены, что хотите удалить заметку <strong>"{note.title}"</strong>?</p>
            <p className="warning">Это действие нельзя отменить.</p>
            <form method="post" onSubmit={(e) => { e.preventDefault(); handleDelete(); }}>
                <button type="submit" className="btn btn-danger">Да, удалить</button>
                <Link to={`/notes/${id}`} className="btn btn-secondary">Отмена</Link>
            </form>
        </div>
    );
}

export default NoteConfirmDeletePage;