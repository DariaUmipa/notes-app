from django.db import models
from django.contrib.auth.models import User
from django.urls import reverse




class Category(models.Model):
    """Модель категории для группировки заметок"""
    name = models.CharField('Название категории', max_length=50)
    author = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Автор')
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    
    class Meta:
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'
        unique_together = ['name', 'author']


    
    def __str__(self):
        return self.name





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
    
    
    is_important = models.BooleanField('Важная', default=False)
    color = models.CharField('Цвет', max_length=20, default='white', 
                            choices=[
                                ('white', 'Белый'),
                                ('yellow', 'Жёлтый'),
                                ('green', 'Зелёный'),
                                ('blue', 'Синий'),
                                ('pink', 'Розовый'),
                            ])
    

   
    category = models.ForeignKey(
        Category, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        verbose_name='Категория',
        related_name='notes'
    )
    
    class Meta:
        verbose_name = 'Заметка'
        verbose_name_plural = 'Заметки'
        ordering = ['-created_at']  
    
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