## Book Verse - Платформа для книжных клубов

### 📚 О проекте

Book Verse - это веб-платформа для организации и управления книжными клубами. Проект позволяет пользователям создавать клубы по интересам, добавлять книги в библиотеку, проводить голосования за книги для чтения, отслеживать прогресс чтения, планировать встречи и обсуждать прочитанное.

**Основные возможности:**
- 📖 Управление библиотекой книг с загрузкой обложек
- 👥 Создание и управление книжными клубами
- 🗳️ Голосование за книги для совместного чтения
- 📊 Отслеживание прогресса чтения (персональный и клубный)
- 💬 Обсуждения книг в реальном времени
- 📅 Планирование встреч клуба с отметкой участников
- 🔐 JWT-авторизация

### 🛠️ Стек технологий

**Бэкенд:**
- Java 17+
- Spring Boot
- Spring Security + JWT
- Spring Data JPA
- PostgreSQL
- Hibernate
- Lombok
- Maven/Gradle

**Фронтенд:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Axios
- React Router DOM

**Дизайн:**
- Glassmorphism UI
- Адаптивная верстка
- Анимации и эффекты

### 📋 Требования

- Java 17 или выше
- Node.js 18 или выше
- PostgreSQL 14 или выше
- Maven 3.8+ или Gradle 7+
- npm 9+

### 🚀 Инструкция по запуску

#### 1. Настройка базы данных PostgreSQL

```bash
# Подключитесь к PostgreSQL
psql -U postgres

# Создайте базу данных
CREATE DATABASE bookverse;

# Создайте пользователя (если нужно)
CREATE USER bookverse_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE bookverse TO bookverse_user;
```

#### 2. Настройка бэкенда

```bash
# Клонируйте репозиторий
git clone https://github.com/yourusername/bookverse.git
cd bookverse/backend

# Настройте application.properties или application.yml
```

**application.properties:**
```properties
# Сервер
server.port=8080

# База данных PostgreSQL
spring.datasource.url=jdbc:postgresql://localhost:5432/bookverse
spring.datasource.username=postgres
spring.datasource.password=your_password

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# JWT
jwt.secret=your_jwt_secret_key_here_make_it_long_and_random
jwt.expiration=86400000

# Загрузка файлов
file.upload-dir=uploads

# CORS
spring.web.cors.allowed-origins=http://localhost:3000
```

```bash
# Запустите бэкенд
./mvnw spring-boot:run
# или
mvn spring-boot:run
```

#### 3. Настройка фронтенда

```bash
# Перейдите в директорию фронтенда
cd ../frontend

# Установите зависимости
npm install

# Создайте .env файл (опционально)
echo "VITE_API_URL=http://localhost:8080" > .env
```

```bash
# Запустите фронтенд
npm run dev
```

#### 4. Проверка работоспособности

- Фронтенд: http://localhost:3000
- Бэкенд: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui/index.html

### 📁 Структура проекта

```
bookverse/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/BookVerse/
│   │   │   │   ├── Config/
│   │   │   │   ├── Controllers/
│   │   │   │   ├── Service/
│   │   │   │   ├── Repository/
│   │   │   │   ├── Entity/
│   │   │   │   ├── dto/
│   │   │   │   └── Mapper/
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── types/
│   │   └── App.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
└── README.md
```

### 🔑 Первый запуск

1. **Зарегистрируйтесь** на http://localhost:3000/register
2. **Войдите** в систему
3. **Создайте клуб** в разделе "Клубы"
4. **Добавьте книги** в разделе "Библиотека"
5. **Начните голосование** за книгу месяца
6. **Отслеживайте прогресс** чтения
7. **Обсуждайте** книги в чате
8. **Планируйте встречи** клуба

### 🎨 Особенности дизайна

- **Glassmorphism** - полупрозрачные элементы с размытием фона
- **Библиотечная тема** - тёплые оттенки пергамента и дерева
- **Адаптивность** - корректное отображение на всех устройствах
- **Анимации** - плавные переходы и эффекты наведения

### 📝 API Документация

Полная документация API доступна через Swagger UI после запуска бэкенда:
http://localhost:8080/swagger-ui/index.html
