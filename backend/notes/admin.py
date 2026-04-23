from django.contrib import admin
from .models import Note, Category

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'author', 'created_at']
    list_filter = ['author']
    search_fields = ['name']

@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'category', 'created_at', 'is_important', 'color']
    list_filter = ['is_important', 'color', 'created_at', 'author', 'category']
    search_fields = ['title', 'content']
    date_hierarchy = 'created_at'
    raw_id_fields = ['author']
    
    fieldsets = (
        ('Основная информация', {
            'fields': ('title', 'content', 'author', 'category')
        }),
        ('Дополнительно', {
            'fields': ('is_important', 'color'),
            'classes': ('collapse',)
        }),
    )