from django.urls import path
from . import views

app_name = 'notes'

urlpatterns = [
    # API для аутентификации
    path('api/login/', views.api_login, name='api_login'),
    path('api/register/', views.api_register, name='api_register'),
    path('api/check-auth/', views.api_check_auth, name='api_check_auth'),
    path('api/logout/', views.api_logout, name='api_logout'),
    path('api/csrf/', views.api_get_csrf, name='api_csrf'),
    path('api/check-username/', views.api_check_username, name='api_check_username'),
    
    
    # API для заметок
    path('api/notes/', views.api_note_list, name='api_note_list'),
    path('api/notes/<int:pk>/', views.api_note_detail, name='api_note_detail'),
    path('api/notes/create/', views.api_note_create, name='api_note_create'),
    path('api/notes/<int:pk>/update/', views.api_note_update, name='api_note_update'),
    path('api/notes/<int:pk>/delete/', views.api_note_delete, name='api_note_delete'),
    path('api/statistics/', views.api_statistics, name='api_statistics'),


    # API для категорий
    path('api/categories/', views.api_category_list, name='api_category_list'),
    path('api/categories/create/', views.api_category_create, name='api_category_create'),
    path('api/categories/<int:pk>/delete/', views.api_category_delete, name='api_category_delete'),
    
   
]
