from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import Note

class NoteForm(forms.ModelForm):
    """
    Форма для создания и редактирования заметки
    """
    class Meta:
        model = Note
        fields = ['title', 'content', 'color', 'is_important']
        widgets = {
            'title': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Введите заголовок'
            }),
            'content': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': 'Введите содержание заметки...',
                'rows': 10
            }),
            'color': forms.Select(attrs={'class': 'form-control'}),
            'is_important': forms.CheckboxInput(attrs={'class': 'form-check-input'})
        }
        labels = {
            'title': 'Заголовок',
            'content': 'Содержание',
            'color': 'Цвет заметки',
            'is_important': 'Важная заметка'
        }

class UserRegisterForm(UserCreationForm):
    """
    Форма регистрации пользователя
    """
    email = forms.EmailField(required=True, widget=forms.EmailInput(attrs={
        'class': 'form-control',
        'placeholder': 'Email'
    }))
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']
        widgets = {
            'username': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Имя пользователя'
            }),
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['password1'].widget.attrs.update({
            'class': 'form-control',
            'placeholder': 'Пароль'
        })
        self.fields['password2'].widget.attrs.update({
            'class': 'form-control',
            'placeholder': 'Подтверждение пароля'
        })

class UserLoginForm(forms.Form):
    """
    Форма входа
    """
    username = forms.CharField(widget=forms.TextInput(attrs={
        'class': 'form-control',
        'placeholder': 'Имя пользователя'
    }))
    password = forms.CharField(widget=forms.PasswordInput(attrs={
        'class': 'form-control',
        'placeholder': 'Пароль'
    }))