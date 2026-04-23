from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse
from django.utils import timezone

class Note(models.Model):
    """
    Модель заметки
    """
    title = models.CharField('Заголовок', max_length=200)
    content = models.TextField('Содержание')
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    updated_at = models.DateTimeField('Дата обновления', auto_now=True)
    author = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        verbose_name='Автор',
        related_name='notes'
    )
    
    # Дополнительные поля для удобства
    is_important = models.BooleanField('Важная', default=False)
    color = models.CharField('Цвет', max_length=20, default='white', 
                            choices=[
                                ('white', 'Белый'),
                                ('yellow', 'Жёлтый'),
                                ('green', 'Зелёный'),
                                ('blue', 'Синий'),
                                ('pink', 'Розовый'),
                            ])
    
    class Meta:
        verbose_name = 'Заметка'
        verbose_name_plural = 'Заметки'
        ordering = ['-created_at']  # Сортировка по убыванию даты
    
    def __str__(self):
        return self.title
    
    def get_absolute_url(self):
        return reverse('note_detail', args=[str(self.id)])
    
    def get_excerpt(self, words=30):
        """Возвращает заданное количество первых слов из текста заметки"""
        words_list = self.content.split()
        if len(words_list) > words:
            return ' '.join(words_list[:words]) + '...'
        return self.content