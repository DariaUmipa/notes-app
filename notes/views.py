from django.contrib.auth import login, authenticate, logout as auth_logout
from django.db.models import Q
from django.contrib.auth.models import User
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
import json
import re
from .models import Note, Category


@require_http_methods(["POST"])
def api_login(request):
    """API для входа"""
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            return JsonResponse({'success': True, 'username': user.username})
        else:
            return JsonResponse({'error': 'Неверное имя пользователя или пароль'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@require_http_methods(["POST"])
def api_register(request):
    """API для регистрации"""
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')
        
        if not username or len(username) < 3:
            return JsonResponse({'error': 'Имя пользователя должно содержать минимум 3 символа'}, status=400)
        
        if len(username) > 30:
            return JsonResponse({'error': 'Имя пользователя не должно превышать 30 символов'}, status=400)
        
        if not re.match(r'^[a-zA-Z0-9_]+$', username):
            return JsonResponse({'error': 'Имя пользователя может содержать только буквы, цифры и символ подчёркивания (_)'}, status=400)
        
        if User.objects.filter(username=username).exists():
            return JsonResponse({'error': 'Пользователь с таким именем уже существует'}, status=400)
        
        if not password or len(password) < 8:
            return JsonResponse({'error': 'Пароль должен содержать минимум 8 символов'}, status=400)
        
        if not re.match(r'^[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};:""\\|,.<>\/?]+$', password):
            return JsonResponse({'error': 'Пароль может содержать только английские буквы, цифры и спецсимволы'}, status=400)
        
        username_lower = username.lower()
        password_lower = password.lower()
        if username_lower in password_lower:
            return JsonResponse({'error': 'Пароль не должен содержать имя пользователя'}, status=400)
                
        try:
            validate_password(password, user=None)
        except ValidationError as e:
            return JsonResponse({'error': ' '.join(e.messages)}, status=400)
        
        user = User.objects.create_user(username=username, password=password)
        login(request, user)
        return JsonResponse({'success': True})
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@require_http_methods(["GET"])
def api_check_auth(request):
    """Проверка авторизации"""
    if request.user.is_authenticated:
        return JsonResponse({'authenticated': True, 'username': request.user.username})
    return JsonResponse({'authenticated': False}, status=401)


@require_http_methods(["GET"])
def api_logout(request):
    """Выход из системы"""
    auth_logout(request)
    return JsonResponse({'success': True})


@require_http_methods(["GET"])
def api_note_list(request):
    """Список заметок с фильтрацией"""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Не авторизован'}, status=401)
    
    notes = Note.objects.filter(author=request.user)
    
    search = request.GET.get('search', '').strip()
    if search:
        notes = notes.filter(Q(title__icontains=search) | Q(content__icontains=search))
    
    important = request.GET.get('important', '')
    if important and important.lower() == 'true':
        notes = notes.filter(is_important=True)
    
    sort = request.GET.get('sort', '-created_at')
    if sort == 'created_at':
        notes = notes.order_by('created_at')
    elif sort == '-created_at':
        notes = notes.order_by('-created_at')
    elif sort == 'title':
        notes = notes.order_by('title')
    elif sort == '-title':
        notes = notes.order_by('-title')
    else:
        notes = notes.order_by('-created_at')
    
    notes_list = []
    for note in notes:
        notes_list.append({
            'id': note.id,
            'title': note.title,
            'content': note.content,
            'created_at': note.created_at.isoformat(),
            'updated_at': note.updated_at.isoformat(),
            'is_important': note.is_important,
            'color': note.color,
            'category': note.category.id if note.category else None,
            'category_name': note.category.name if note.category else None
        })
    
    return JsonResponse(notes_list, safe=False)


@require_http_methods(["POST"])
def api_note_create(request):
    """Создание заметки"""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Не авторизован'}, status=401)
    
    try:
        data = json.loads(request.body) 
        title = data.get('title', '')
        if not title or not title.strip():
            return JsonResponse({'error': 'Заголовок не может быть пустым'}, status=400)
        
        category_id = data.get('category')
        category = None
        if category_id:
            try:
                category = Category.objects.get(id=category_id, author=request.user)
            except Category.DoesNotExist:
                pass
        
        note = Note.objects.create(
            title=data.get('title'),
            content=data.get('content'),
            color=data.get('color', 'white'),
            is_important=data.get('is_important', False),
            author=request.user,
            category=category
        )
        return JsonResponse({
            'id': note.id,
            'title': note.title,
            'content': note.content,
            'color': note.color,
            'is_important': note.is_important,
            'category': note.category.id if note.category else None,
            'category_name': note.category.name if note.category else None,
            'created_at': note.created_at.isoformat()
        }, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@require_http_methods(["DELETE"])
def api_note_delete(request, pk):
    """Удаление заметки"""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Не авторизован'}, status=401)
    
    try:
        note = Note.objects.get(pk=pk, author=request.user)
        note.delete()
        return JsonResponse({'success': True})
    except Note.DoesNotExist:
        return JsonResponse({'error': 'Заметка не найдена'}, status=404)


@require_http_methods(["GET"])
def api_note_detail(request, pk):
    """Детали заметки"""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Не авторизован'}, status=401)
    
    try:
        note = Note.objects.get(pk=pk, author=request.user)
        return JsonResponse({
            'id': note.id,
            'title': note.title,
            'content': note.content,
            'color': note.color,
            'is_important': note.is_important,
            'created_at': note.created_at.isoformat(),
            'updated_at': note.updated_at.isoformat(),
            'category': note.category.id if note.category else None,
            'category_name': note.category.name if note.category else None
        })
    except Note.DoesNotExist:
        return JsonResponse({'error': 'Заметка не найдена'}, status=404)


@require_http_methods(["PUT"])
def api_note_update(request, pk):
    """Обновление заметки"""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Не авторизован'}, status=401)
    
    try:
        note = Note.objects.get(pk=pk, author=request.user)
        data = json.loads(request.body)
        
        note.title = data.get('title', note.title)
        note.content = data.get('content', note.content)
        note.color = data.get('color', note.color)
        note.is_important = data.get('is_important', note.is_important)
        
        category_id = data.get('category')
        if category_id:
            try:
                note.category = Category.objects.get(id=category_id, author=request.user)
            except Category.DoesNotExist:
                note.category = None
        else:
            note.category = None
        
        note.save()
        return JsonResponse({'success': True})
    except Note.DoesNotExist:
        return JsonResponse({'error': 'Заметка не найдена'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@require_http_methods(["GET"])
def api_statistics(request):
    """Статистика"""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Не авторизован'}, status=401)
    
    user_notes = Note.objects.filter(author=request.user)
    total_notes = user_notes.count()
    important_notes = user_notes.filter(is_important=True).count()
    
    colors = {}
    for color_choice in Note._meta.get_field('color').choices:
        color_label = color_choice[1]
        count = user_notes.filter(color=color_choice[0]).count()
        if count > 0:
            colors[color_label] = count
    
    return JsonResponse({
        'total_notes': total_notes,
        'important_notes': important_notes,
        'colors': colors
    })


@require_http_methods(["GET"])
def api_get_csrf(request):
    """Получение CSRF токена"""
    return JsonResponse({'csrfToken': get_token(request)})


@require_http_methods(["GET"])
def api_check_username(request):
    """Проверка уникальности username"""
    username = request.GET.get('username', '')
    exists = User.objects.filter(username=username).exists()
    return JsonResponse({'exists': exists})


# === API ДЛЯ КАТЕГОРИЙ ===

@require_http_methods(["GET"])
def api_category_list(request):
    """Список категорий пользователя"""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Не авторизован'}, status=401)
    
    categories = Category.objects.filter(author=request.user).values('id', 'name')
    return JsonResponse(list(categories), safe=False)


@require_http_methods(["POST"])
def api_category_create(request):
    """Создание категории"""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Не авторизован'}, status=401)
    
    try:
        data = json.loads(request.body)
        name = data.get('name', '').strip()
        
        if not name:
            return JsonResponse({'error': 'Название категории обязательно'}, status=400)
        
        if Category.objects.filter(author=request.user, name=name).exists():
            return JsonResponse({'error': 'Категория с таким названием уже существует'}, status=400)
        
        category = Category.objects.create(name=name, author=request.user)
        return JsonResponse({'id': category.id, 'name': category.name}, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@require_http_methods(["DELETE"])
def api_category_delete(request, pk):
    """Удаление категории"""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Не авторизован'}, status=401)
    
    try:
        category = Category.objects.get(pk=pk, author=request.user)
        Note.objects.filter(category=category).update(category=None)
        category.delete()
        return JsonResponse({'success': True})
    except Category.DoesNotExist:
        return JsonResponse({'error': 'Категория не найдена'}, status=404)
