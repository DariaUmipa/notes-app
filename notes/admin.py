from django.contrib import admin
from .models import Note

@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    """
    Настройки админ-панели для заметок
    """
    list_display = ['title', 'author', 'created_at', 'updated_at', 'is_important', 'color']
    list_filter = ['is_important', 'color', 'created_at', 'author']
    search_fields = ['title', 'content']
    date_hierarchy = 'created_at'
    raw_id_fields = ['author']
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('title', 'content', 'author')
        }),
        ('Дополнительно', {
            'fields': ('is_important', 'color'),
            'classes': ('collapse',)
        }),
    )