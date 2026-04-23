from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q
from .models import Note
from .forms import NoteForm, UserRegisterForm, UserLoginForm

def index(request):
    """
    Главная страница
    """
    return render(request, 'notes/index.html')

def register(request):
    """
    Регистрация пользователя
    """
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, 'Регистрация прошла успешно!')
            return redirect('notes:note_list')
        else:
            messages.error(request, 'Исправьте ошибки в форме')
    else:
        form = UserRegisterForm()
    return render(request, 'notes/register.html', {'form': form})

def user_login(request):
    """
    Вход пользователя
    """
    if request.method == 'POST':
        form = UserLoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                messages.success(request, 'Вы успешно вошли в систему!')
                return redirect('notes:note_list')
            else:
                messages.error(request, 'Неверное имя пользователя или пароль')
    else:
        form = UserLoginForm()
    return render(request, 'notes/login.html', {'form': form})

def user_logout(request):
    """
    Выход пользователя
    """
    logout(request)
    messages.info(request, 'Вы вышли из системы')
    return redirect('notes:index')

@login_required
def note_list(request):
    """
    Список заметок пользователя
    """
    # Поиск
    search_query = request.GET.get('search', '')
    
    # Базовый запрос - все заметки пользователя
    notes = Note.objects.filter(author=request.user)
    
    # Если есть поисковый запрос
    if search_query:
        # Приводим запрос к нижнему регистру
        search_lower = search_query.lower()
        
        # Получаем все заметки пользователя и фильтруем вручную
        all_notes = list(notes)  # Превращаем QuerySet в список
        filtered_notes = []
        
        for note in all_notes:
            # Приводим заголовок и содержание к нижнему регистру для сравнения
            title_lower = note.title.lower() if note.title else ''
            content_lower = note.content.lower() if note.content else ''
            
            if search_lower in title_lower or search_lower in content_lower:
                filtered_notes.append(note)
        
        notes = filtered_notes
    else:
        notes = list(notes)  # Превращаем в список для единообразия
    
    # Фильтрация по важности (работает со списком)
    important_only = request.GET.get('important', '')
    if important_only:
        filtered_notes = []
        for note in notes:
            if note.is_important:
                filtered_notes.append(note)
        notes = filtered_notes
    
    # Сортировка (работает со списком)
    sort_by = request.GET.get('sort', '-created_at')
    if sort_by == 'created_at':
        notes.sort(key=lambda x: x.created_at)
    elif sort_by == '-created_at':
        notes.sort(key=lambda x: x.created_at, reverse=True)
    elif sort_by == 'title':
        notes.sort(key=lambda x: x.title.lower() if x.title else '')
    elif sort_by == '-title':
        notes.sort(key=lambda x: x.title.lower() if x.title else '', reverse=True)
    
    context = {
        'notes': notes,
        'search_query': search_query,
        'important_only': important_only,
        'sort': sort_by,
        'notes_count': len(notes),
    }
    return render(request, 'notes/note_list.html', context)

@login_required
def note_detail(request, pk):
    """
    Детальный просмотр заметки
    """
    note = get_object_or_404(Note, pk=pk, author=request.user)
    return render(request, 'notes/note_detail.html', {'note': note})

@login_required
def note_create(request):
    """
    Создание новой заметки
    """
    if request.method == 'POST':
        form = NoteForm(request.POST)
        if form.is_valid():
            note = form.save(commit=False)
            note.author = request.user
            note.save()
            messages.success(request, 'Заметка успешно создана!')
            return redirect('notes:note_detail', pk=note.pk)
    else:
        form = NoteForm()
    return render(request, 'notes/note_form.html', {'form': form, 'title': 'Создание заметки'})

@login_required
def note_update(request, pk):
    """
    Редактирование заметки
    """
    note = get_object_or_404(Note, pk=pk, author=request.user)
    if request.method == 'POST':
        form = NoteForm(request.POST, instance=note)
        if form.is_valid():
            form.save()
            messages.success(request, 'Заметка успешно обновлена!')
            return redirect('notes:note_detail', pk=note.pk)
    else:
        form = NoteForm(instance=note)
    return render(request, 'notes/note_form.html', {'form': form, 'title': 'Редактирование заметки'})

@login_required
def note_delete(request, pk):
    """
    Удаление заметки
    """
    note = get_object_or_404(Note, pk=pk, author=request.user)
    if request.method == 'POST':
        note.delete()
        messages.success(request, 'Заметка успешно удалена!')
        return redirect('notes:note_list')
    return render(request, 'notes/note_confirm_delete.html', {'note': note})

@login_required
def note_statistics(request):
    """
    Статистика по заметкам
    """
    user_notes = Note.objects.filter(author=request.user)
    
    # Основная статистика
    total_notes = user_notes.count()
    important_notes = user_notes.filter(is_important=True).count()
    
    # Статистика по цветам
    colors = {}
    for color_choice in Note._meta.get_field('color').choices:
        color_value = color_choice[0]
        color_label = color_choice[1]
        count = user_notes.filter(color=color_value).count()
        if count > 0:
            colors[color_label] = count

    
    
    # Активность по датам (последние 7 дней)
    from django.utils import timezone
    from datetime import timedelta
    dates = []
    for i in range(6, -1, -1):
        date = timezone.now().date() - timedelta(days=i)
        count = user_notes.filter(created_at__date=date).count()
        dates.append({
            'date': date.strftime('%d.%m'),
            'count': count
        })
    
    context = {
        'total_notes': total_notes,
        'important_notes': important_notes,
        'colors': colors,
        'dates': dates,
    }
    return render(request, 'notes/statistics.html', context)