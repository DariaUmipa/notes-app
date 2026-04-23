import pytest
import json
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from .models import Note, Category



@pytest.fixture
def client():
    """Клиент для API-запросов"""
    return APIClient()


@pytest.fixture
def user(db):
    """Создание тестового пользователя"""
    return User.objects.create_user(username='testuser', password='Test123!')


@pytest.fixture
def auth_client(client, user):
    """Авторизованный клиент (через login)"""
    # Выполняем реальный вход через API
    client.post('/api/login/', {
        'username': 'testuser',
        'password': 'Test123!'
    }, format='json')
    return client


@pytest.fixture
def category(auth_client, user):
    """Создание тестовой категории"""
    return Category.objects.create(name='Работа', author=user)


@pytest.fixture
def note(user):
    """Создание тестовой заметки"""
    return Note.objects.create(
        title='Тестовая заметка',
        content='Содержание заметки',
        author=user,
        color='white'
    )


def get_json(response):
    """Вспомогательная функция для получения JSON из ответа"""
    return response.json() if hasattr(response, 'json') else json.loads(response.content)


# ==================== ТЕСТЫ АУТЕНТИФИКАЦИИ ====================

@pytest.mark.django_db
class TestAuth:
    """Тесты регистрации и аутентификации"""
    
    def test_register_success(self, client):
        """Успешная регистрация нового пользователя"""
        response = client.post('/api/register/', {
            'username': 'newuser',
            'password': 'Test123!'
        }, format='json')
        
        assert response.status_code == 200
        data = get_json(response)
        assert data['success'] is True
        assert User.objects.filter(username='newuser').exists()
    
    def test_register_username_too_short(self, client):
        """Регистрация с именем короче 3 символов"""
        response = client.post('/api/register/', {
            'username': 'te',
            'password': 'Test123!'
        }, format='json')
        
        assert response.status_code == 400
        data = get_json(response)
        assert 'минимум 3 символа' in data['error']
    
    def test_register_username_too_long(self, client):
        """Регистрация с именем длиннее 30 символов"""
        response = client.post('/api/register/', {
            'username': 'a' * 31,
            'password': 'Test123!'
        }, format='json')
        
        assert response.status_code == 400
        data = get_json(response)
        assert 'не должно превышать' in data['error']
    
    def test_register_username_invalid_chars(self, client):
        """Регистрация с недопустимыми символами"""
        response = client.post('/api/register/', {
            'username': 'test@user',
            'password': 'Test123!'
        }, format='json')
        
        assert response.status_code == 400
        data = get_json(response)
        assert 'только буквы, цифры и символ подчёркивания' in data['error'].lower()
    
    def test_register_username_exists(self, client, user):
        """Регистрация с уже существующим именем"""
        response = client.post('/api/register/', {
            'username': 'testuser',
            'password': 'Test123!'
        }, format='json')
        
        assert response.status_code == 400
        data = get_json(response)
        assert 'уже существует' in data['error']
    
    def test_register_password_too_short(self, client):
        """Регистрация с паролем короче 8 символов"""
        response = client.post('/api/register/', {
            'username': 'testuser',
            'password': '1234567'
        }, format='json')
        
        assert response.status_code == 400
        data = get_json(response)
        assert 'минимум 8 символов' in data['error']
    
    def test_register_password_contains_username(self, client):
        """Пароль содержит имя пользователя"""
        response = client.post('/api/register/', {
            'username': 'testuser',
            'password': 'testuser123'
        }, format='json')
        
        assert response.status_code == 400
        data = get_json(response)
        assert 'не должен содержать имя пользователя' in data['error']
    
    def test_login_success(self, client, user):
        """Успешный вход в систему"""
        response = client.post('/api/login/', {
            'username': 'testuser',
            'password': 'Test123!'
        }, format='json')
        
        assert response.status_code == 200
        data = get_json(response)
        assert data['success'] is True
    
    def test_login_wrong_password(self, client, user):
        """Вход с неверным паролем"""
        response = client.post('/api/login/', {
            'username': 'testuser',
            'password': 'wrongpassword'
        }, format='json')
        
        assert response.status_code == 400
        data = get_json(response)
        assert 'Неверное' in data['error']
    
    def test_check_auth_authenticated(self, auth_client):
        """Проверка аутентификации (авторизован)"""
        response = auth_client.get('/api/check-auth/')
        
        assert response.status_code == 200
        data = get_json(response)
        assert data['authenticated'] is True
    
    def test_check_auth_unauthenticated(self, client):
        """Проверка аутентификации (не авторизован)"""
        response = client.get('/api/check-auth/')
        
        assert response.status_code == 401
        data = get_json(response)
        assert data['authenticated'] is False


# ==================== ТЕСТЫ ЗАМЕТОК ====================

@pytest.mark.django_db
class TestNotes:
    """Тесты для заметок"""
    
    def test_create_note_success(self, auth_client, category):
        """Успешное создание заметки"""
        response = auth_client.post('/api/notes/create/', {
            'title': 'Новая заметка',
            'content': 'Содержание заметки',
            'color': 'yellow',
            'is_important': True,
            'category': category.id
        }, format='json')
        
        assert response.status_code == 201
        assert Note.objects.count() == 1
        note = Note.objects.first()
        assert note.title == 'Новая заметка'
        assert note.content == 'Содержание заметки'
        assert note.color == 'yellow'
        assert note.is_important is True
        assert note.category == category
    
    def test_create_note_without_category(self, auth_client):
        """Создание заметки без категории"""
        response = auth_client.post('/api/notes/create/', {
            'title': 'Заметка без категории',
            'content': 'Содержание',
            'color': 'white'
        }, format='json')
        
        assert response.status_code == 201
        note = Note.objects.first()
        assert note.category is None
    
    def test_create_note_empty_title(self, auth_client):
        """Создание заметки с пустым заголовком"""
        response = auth_client.post('/api/notes/create/', {
            'title': '',
            'content': 'Содержание',
            'color': 'white'
        }, format='json')
        
        assert response.status_code == 400
    
    def test_get_notes_list(self, auth_client, user):
        """Получение списка заметок"""
        Note.objects.create(title='Заметка 1', content='Содержание 1', author=user, color='white')
        Note.objects.create(title='Заметка 2', content='Содержание 2', author=user, color='yellow')
        
        response = auth_client.get('/api/notes/')
        
        assert response.status_code == 200
        data = get_json(response)
        assert len(data) == 2
    
    def test_get_note_detail(self, auth_client, user):
        """Получение деталей заметки"""
        note = Note.objects.create(
            title='Детальная заметка',
            content='Подробное содержание',
            author=user,
            color='green'
        )
        
        response = auth_client.get(f'/api/notes/{note.id}/')
        
        assert response.status_code == 200
        data = get_json(response)
        assert data['title'] == 'Детальная заметка'
        assert data['content'] == 'Подробное содержание'
        assert data['color'] == 'green'
    
    def test_get_note_detail_not_found(self, auth_client):
        """Получение несуществующей заметки"""
        response = auth_client.get('/api/notes/99999/')
        assert response.status_code == 404
    
    def test_update_note(self, auth_client, user):
        """Обновление заметки"""
        note = Note.objects.create(
            title='Старый заголовок',
            content='Старое содержание',
            author=user,
            color='white'
        )
        
        response = auth_client.put(f'/api/notes/{note.id}/update/', {
            'title': 'Новый заголовок',
            'content': 'Новое содержание',
            'color': 'blue',
            'is_important': True
        }, format='json')
        
        assert response.status_code == 200
        note.refresh_from_db()
        assert note.title == 'Новый заголовок'
        assert note.content == 'Новое содержание'
        assert note.color == 'blue'
        assert note.is_important is True
    
    def test_update_note_category(self, auth_client, user):
        """Обновление категории заметки"""
        category1 = Category.objects.create(name='Работа', author=user)
        category2 = Category.objects.create(name='Личное', author=user)
        note = Note.objects.create(
            title='Заметка',
            content='Содержание',
            author=user,
            color='white',
            category=category1
        )
        
        response = auth_client.put(f'/api/notes/{note.id}/update/', {
            'title': 'Заметка',
            'content': 'Содержание',
            'color': 'white',
            'category': category2.id
        }, format='json')
        
        assert response.status_code == 200
        note.refresh_from_db()
        assert note.category == category2
    
    def test_delete_note(self, auth_client, user):
        """Удаление заметки"""
        note = Note.objects.create(
            title='Заметка для удаления',
            content='Содержание',
            author=user,
            color='white'
        )
        
        response = auth_client.delete(f'/api/notes/{note.id}/delete/')
        
        assert response.status_code == 200
        assert not Note.objects.filter(id=note.id).exists()
    
    def test_cannot_access_other_user_note(self, auth_client, user):
        """Доступ к чужой заметке запрещён"""
        other_user = User.objects.create_user(username='other', password='Test123!')
        other_note = Note.objects.create(
            title='Чужая заметка',
            content='Содержание',
            author=other_user,
            color='white'
        )
        
        response = auth_client.get(f'/api/notes/{other_note.id}/')
        assert response.status_code == 404
    
    def test_cannot_update_other_user_note(self, auth_client, user):
        """Редактирование чужой заметки запрещено"""
        other_user = User.objects.create_user(username='other', password='Test123!')
        other_note = Note.objects.create(
            title='Чужая заметка',
            content='Содержание',
            author=other_user,
            color='white'
        )
        
        response = auth_client.put(f'/api/notes/{other_note.id}/update/', {
            'title': 'Попытка взлома',
            'content': 'Новое содержание'
        }, format='json')
        
        assert response.status_code == 404
    
    def test_filter_notes_by_important(self, auth_client, user):
        """Фильтрация по важности"""
        Note.objects.create(title='Важная', content='', author=user, color='white', is_important=True)
        Note.objects.create(title='Обычная', content='', author=user, color='white', is_important=False)
        
        response = auth_client.get('/api/notes/?important=true')
        
        assert response.status_code == 200
        data = get_json(response)
        assert len(data) == 1
        assert data[0]['is_important'] is True
    
    def test_search_notes_by_title(self, auth_client, user):
        """Поиск по заголовку"""
        Note.objects.create(title='Рабочая заметка', content='...', author=user, color='white')
        Note.objects.create(title='Личная заметка', content='...', author=user, color='white')
        
        response = auth_client.get('/api/notes/?search=Рабочая')
        
        assert response.status_code == 200
        data = get_json(response)
        assert len(data) == 1
        assert 'Рабочая' in data[0]['title']


# ==================== ТЕСТЫ КАТЕГОРИЙ ====================

@pytest.mark.django_db
class TestCategories:
    """Тесты для категорий"""
    
    def test_create_category_success(self, auth_client, user):
        """Успешное создание категории"""
        response = auth_client.post('/api/categories/create/', {
            'name': 'Работа'
        }, format='json')
        
        assert response.status_code == 201
        assert Category.objects.count() == 1
        assert Category.objects.first().name == 'Работа'
    
    def test_create_category_empty_name(self, auth_client):
        """Создание категории с пустым названием"""
        response = auth_client.post('/api/categories/create/', {
            'name': ''
        }, format='json')
        
        assert response.status_code == 400
        data = get_json(response)
        assert 'Название категории обязательно' in data['error']
    
    def test_create_duplicate_category(self, auth_client, user):
        """Создание дублирующейся категории"""
        Category.objects.create(name='Работа', author=user)
        
        response = auth_client.post('/api/categories/create/', {
            'name': 'Работа'
        }, format='json')
        
        assert response.status_code == 400
        data = get_json(response)
        assert 'уже существует' in data['error']
    
    def test_get_categories_list(self, auth_client, user):
        """Получение списка категорий"""
        Category.objects.create(name='Работа', author=user)
        Category.objects.create(name='Личное', author=user)
        
        response = auth_client.get('/api/categories/')
        
        assert response.status_code == 200
        data = get_json(response)
        assert len(data) == 2
    
    def test_delete_category(self, auth_client, user):
        """Удаление категории"""
        category = Category.objects.create(name='Работа', author=user)
        
        response = auth_client.delete(f'/api/categories/{category.id}/delete/')
        
        assert response.status_code == 200
        assert not Category.objects.filter(id=category.id).exists()
    
    def test_delete_category_cascades_to_notes(self, auth_client, user):
        """При удалении категории заметки остаются без категории"""
        category = Category.objects.create(name='Работа', author=user)
        note = Note.objects.create(
            title='Заметка',
            content='Содержание',
            author=user,
            color='white',
            category=category
        )
        
        response = auth_client.delete(f'/api/categories/{category.id}/delete/')
        
        assert response.status_code == 200
        note.refresh_from_db()
        assert note.category is None


# ==================== ТЕСТЫ СТАТИСТИКИ ====================

@pytest.mark.django_db
class TestStatistics:
    """Тесты для статистики"""
    
    def test_statistics_returns_correct_data(self, auth_client, user):
        """Статистика возвращает корректные данные"""
        Note.objects.create(title='Важная', content='', author=user, color='yellow', is_important=True)
        Note.objects.create(title='Обычная', content='', author=user, color='white', is_important=False)
        Note.objects.create(title='Зелёная', content='', author=user, color='green', is_important=False)
        
        response = auth_client.get('/api/statistics/')
        
        assert response.status_code == 200
        data = get_json(response)
        assert data['total_notes'] == 3
        assert data['important_notes'] == 1
        assert 'Жёлтый' in data['colors']
        assert data['colors']['Жёлтый'] == 1
