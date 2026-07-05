# URLs Checker

Приложение для асинхронной проверки списка URL.

## Описание

Fullstack-приложение для асинхронной проверки списка URL. Пользователь отправляет список URL, система создаёт задание, выполняет HEAD-запросы к каждому URL и отображает результаты в реальном времени.

## Возможности

- Создание задания на проверку списка URL
- Асинхронная обработка с ограничением конкурентности (5 одновременных HEAD-запросов на задание)
- Случайная задержка 0–10 секунд перед каждым запросом
- Просмотр статуса задания и результатов проверки в реальном времени (polling каждые 2 секунды)
- Отмена выполнения задания
- Статистика по URL (успешно, ошибки, ожидают, отменены)
- Валидация на стороне клиента с понятными сообщениями на русском языке
- Перевод серверных ошибок валидации на русский язык
- Swagger-документация API
- Health endpoint
- Адаптивный интерфейс (десктоп и мобильные устройства)

## Архитектура

- **Backend:** NestJS + TypeScript, модульная архитектура, in-memory хранилище
  - Контроллеры — тонкий слой, бизнес-логика в сервисах
  - In-memory repository pattern (без базы данных)
  - Очередь обработки с собственным Semaphore для ограничения конкурентности
  - Глобальная валидация (ValidationPipe) и обработка ошибок (AllExceptionsFilter)
  - Логирование через встроенный Logger NestJS
- **Frontend:** React + TypeScript + Vite, Zustand для управления состоянием
  - Слой API (Axios не вызывается напрямую из компонентов)
  - Глобальное состояние через Zustand store
  - Валидация URL на стороне клиента перед отправкой
  - Перевод серверных ошибок валидации на русский язык
  - Polling с защитой от race conditions
  - Tailwind CSS для стилизации
- **Контейнеризация:** Docker + Docker Compose

## Структура проекта

```text
root/
├── .husky/
│   └── pre-commit
├── backend/
│   ├── Dockerfile
│   └── src/
│       ├── app.module.ts
│       ├── main.ts
│       ├── common/
│       │   └── filters/
│       │       └── all-exceptions.filter.ts
│       ├── health/
│       │   ├── health.controller.ts
│       │   ├── health.controller.spec.ts
│       │   └── health.module.ts
│       └── jobs/
│           ├── jobs.module.ts
│           ├── controller/
│           │   └── jobs.controller.ts
│           ├── dto/
│           │   ├── create-job.dto.ts
│           │   └── create-job-response.dto.ts
│           ├── interfaces/
│           │   └── job-repository.interface.ts
│           ├── models/
│           │   ├── job.model.ts
│           │   ├── job-status.enum.ts
│           │   ├── url-item.model.ts
│           │   └── url-status.enum.ts
│           ├── queue/
│           │   ├── queue.processor.ts
│           │   ├── queue.processor.spec.ts
│           │   └── queue.processor.cancellation.spec.ts
│           ├── repository/
│           │   └── job.repository.ts
│           ├── services/
│           │   ├── jobs.service.ts
│           │   └── jobs.service.spec.ts
│           └── utils/
│               ├── delay.ts
│               └── semaphore.ts
├── frontend/
│   ├── Dockerfile
│   └── src/
│       ├── App.tsx
│       ├── App.test.tsx
│       ├── main.tsx
│       ├── api/
│       │   └── jobsApi.ts
│       ├── components/
│       │   ├── EmptyState/
│       │   ├── ErrorMessage/
│       │   ├── JobDetails/
│       │   ├── JobForm/
│       │   ├── JobList/
│       │   ├── JobListItem/
│       │   ├── JobProgress/
│       │   ├── Loading/
│       │   ├── StatCard/
│       │   ├── StatusBadge/
│       │   ├── UrlRow/
│       │   └── UrlTable/
│       ├── hooks/
│       │   └── usePolling.ts
│       ├── store/
│       │   ├── jobsStore.ts
│       │   └── jobsStore.test.ts
│       ├── test/
│       │   └── setup.ts
│       ├── types/
│       │   └── index.ts
│       └── styles/
│           └── global.css
├── docker-compose.yml
├── .editorconfig
└── .gitignore
```

## Используемый стек

### Стек Backend

- Node.js 22+
- TypeScript (strict mode)
- NestJS
- Axios (HEAD-запросы, timeout 5000ms, max 5 redirects)
- class-validator / class-transformer
- Jest
- Swagger (@nestjs/swagger)

### Стек Frontend

- React 18 + TypeScript (strict mode)
- Vite
- Zustand
- Axios
- Tailwind CSS v4
- Lucide React (иконки)
- Vitest + React Testing Library

### Dev Tools

- Docker + Docker Compose
- Yarn 4
- ESLint + Prettier
- Husky + lint-staged

## Запуск через Docker

```bash
docker compose up
```

После запуска доступны:

- **Frontend:** <http://localhost:5173>
- **Backend:** <http://localhost:3000>
- **Swagger UI:** <http://localhost:3000/api/docs>
- **Health:** <http://localhost:3000/health>

## Локальный запуск

### Запуск Backend

```bash
cd backend
yarn install
yarn start:dev
```

### Запуск Frontend

```bash
cd frontend
yarn install
yarn dev
```

При локальном запуске Vite проксирует запросы `/api` на `http://localhost:3000`.

## API

### Endpoints

| Метод  | Endpoint        | Описание                                              |
| ------ | --------------- | ----------------------------------------------------- |
| POST   | `/api/jobs`     | Создание задания. Body: `{ "urls": ["https://..."] }` |
| GET    | `/api/jobs`     | Получение списка всех заданий                         |
| GET    | `/api/jobs/:id` | Получение задания по ID                               |
| DELETE | `/api/jobs/:id` | Отмена задания                                        |
| GET    | `/health`       | Проверка работоспособности                            |

### Пример запроса

```bash
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{"urls": ["https://example.com", "https://google.com"]}'
```

### Пример ответа

```json
{
  "jobId": "ffa54f0c-7f03-4073-a453-411d4d137051"
}
```

Полные данные задания доступны через `GET /api/jobs/:id`.

### Валидация

- `urls` — обязательное поле, массив
- Минимум 1 URL
- Каждый URL — строка, не пустая
- Каждый URL — валидный адрес (с протоколом `http://` или `https://`)

### Статусы

**JobStatus:** `pending`, `in_progress`, `completed`, `failed`, `cancelled`

**UrlStatus:** `pending`, `in_progress`, `success`, `error`, `cancelled`

## Swagger

Swagger UI доступен по адресу: <http://localhost:3000/api/docs>

Документация включает описание всех endpoints, модели данных и примеры запросов/ответов.

## Тесты

### Backend

```bash
cd backend
yarn test
```

Покрытие: JobsService, QueueProcessor, Cancellation (23 теста).

### Frontend

```bash
cd frontend
yarn test
```

Покрытие: App, JobForm, JobList, JobDetails, Zustand Store (27 тестов).
