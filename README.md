# 📝 Приложение для заметок

Веб-приложение для создания, организации и хранения личных заметок с цветовыми метками, категориями и статистикой.

## Возможности

- Регистрация и авторизация (сессии Django + CSRF-защита)
- Создание, редактирование и удаление заметок
- Цветовая маркировка (белый, жёлтый, зелёный, синий, розовый)
- Категории для группировки заметок
- Отметка важных заметок
- Поиск по заголовку и содержимому
- Фильтрация по цвету, категории, важности
- Сортировка по дате и алфавиту
- Статистика по заметкам и цветам
- Адаптивный дизайн

## Технологии

| Слой            | Стек                                           |
| --------------- | ---------------------------------------------- |
| Бэкенд          | Python 3.11, Django 5.2, Django REST Framework |
| Фронтенд        | React 19, React Router 7, Axios, Vite          |
| База данных     | SQLite                                         |
| Контейнеризация | Docker, Docker Compose, Nginx                  |

## Архитектура сервисов

Проект состоит из двух основных частей:

- **backend/** — Django‑приложение, предоставляющее REST API.
- **frontend/** — React‑приложение (SPA), собираемое с помощью Vite.

В Docker-режиме поднимаются два сервиса:

- **backend** — Django-сервер (через Gunicorn).
- **frontend** — Nginx, раздающий собранную статику React и проксирующий запросы `/api/` к backend.

## Структура проекта

\`\`\`
notes_app/
├── backend/ # Django API
│ ├── notes/ # Основное приложение
│ │ ├── migrations/ # Миграции БД
│ │ ├── models.py # Модели Note, Category
│ │ ├── views.py # API views
│ │ ├── serializers.py # DRF сериализаторы
│ │ ├── urls.py # Маршруты API
│ │ └── tests.py # Тесты
│ ├── notes_project/ # Настройки Django
│ │ ├── settings.py
│ │ └── urls.py
│ ├── manage.py
│ ├── requirements.txt
│ ├── Dockerfile
│ └── .env.example
│
├── frontend/ # React SPA
│ ├── src/
│ │ ├── components/ # UI-компоненты с тестами
│ │ ├── services/ # API-сервис (Axios + CSRF)
│ │ ├── test/ # Настройка тестов
│ │ ├── App.jsx # Главный компонент
│ │ └── main.jsx # Точка входа
│ ├── nginx.conf # Конфиг Nginx для Docker
│ ├── Dockerfile
│ ├── vite.config.js
│ ├── eslint.config.js
│ └── package.json
│
├── .gitignore
├── docker-compose.yml
└── README.md
\`\`\`

## Порты

| Сервис              | Порт                    |
| ------------------- | ----------------------- |
| Docker (приложение) | `http://localhost:8081` |
| Docker (бэкенд)     | `http://localhost:8003` |
| Локально (бэкенд)   | `http://localhost:8002` |
| Локально (фронтенд) | `http://localhost:5173` |

## Переменные окружения

Файл: `backend/.env.example`

| Переменная      | По умолчанию                  | Описание              |
| --------------- | ----------------------------- | --------------------- |
| `SECRET_KEY`    | `your-secret-key-here`        | Секретный ключ Django |
| `DEBUG`         | `1`                           | Режим отладки         |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1,backend` | Разрешённые хосты     |

## Примеры API-запросов

### Регистрация

\`\`\`bash
curl -X POST http://127.0.0.1:8002/api/register/ \
 -H "Content-Type: application/json" \
 -d '{"username": "user", "password": "qwerty123"}'
\`\`\`

### Вход (с сохранением сессии)

\`\`\`bash
curl -c cookies.txt -X POST http://127.0.0.1:8002/api/login/ \
 -H "Content-Type: application/json" \
 -d '{"username": "user", "password": "qwerty123"}'
\`\`\`

### Создание заметки (требуется сессия и CSRF-токен)

\`\`\`bash

# Получить CSRF-токен

curl -c cookies.txt http://127.0.0.1:8002/api/csrf/

# Создать заметку

curl -b cookies.txt -X POST http://127.0.0.1:8002/api/notes/create/ \
 -H "Content-Type: application/json" \
 -H "X-CSRFToken: <токен_из_cookies>" \
 -d '{
"title": "Тестовая заметка",
"content": "Содержание",
"color": "yellow",
"is_important": true,
"category": null
}'
\`\`\`

## Тестирование

**Бэкенд:**

\`\`\`bash
cd backend
python manage.py test
\`\`\`

**Фронтенд:**

\`\`\`bash
cd frontend
npm test
\`\`\`

## Быстрый старт

### Docker (рекомендуется)

\`\`\`bash
cp backend/.env.example backend/.env

# отредактируйте backend/.env, указав SECRET_KEY

docker compose up --build
\`\`\`

Открыть: `http://localhost:8081`

### Локальный запуск

**Бэкенд:**

\`\`\`bash
cd backend
python -m venv venv
venv\Scripts\activate # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8002
\`\`\`

**Фронтенд:**

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

Открыть: `http://localhost:5173`

## API

### Аутентификация

| Метод | URL                | Описание             |
| ----- | ------------------ | -------------------- |
| POST  | `/api/register/`   | Регистрация          |
| POST  | `/api/login/`      | Вход                 |
| GET   | `/api/logout/`     | Выход                |
| GET   | `/api/check-auth/` | Проверка авторизации |
| GET   | `/api/csrf/`       | Получить CSRF-токен  |

### Заметки

| Метод  | URL                       | Описание         |
| ------ | ------------------------- | ---------------- |
| GET    | `/api/notes/`             | Список заметок   |
| POST   | `/api/notes/create/`      | Создать заметку  |
| GET    | `/api/notes/{id}/`        | Просмотр заметки |
| PUT    | `/api/notes/{id}/update/` | Обновить заметку |
| DELETE | `/api/notes/{id}/delete/` | Удалить заметку  |

### Категории

| Метод  | URL                            | Описание          |
| ------ | ------------------------------ | ----------------- |
| GET    | `/api/categories/`             | Список категорий  |
| POST   | `/api/categories/create/`      | Создать категорию |
| DELETE | `/api/categories/{id}/delete/` | Удалить категорию |

### Статистика

| Метод | URL                | Описание               |
| ----- | ------------------ | ---------------------- |
| GET   | `/api/statistics/` | Статистика по заметкам |

## Безопасность

- CSRF-защита всех изменяющих запросов
- Сессии Django (7 дней)
- Каждый пользователь видит только свои данные
