# Google Sheets Import Script

Скрипт для импорта данных из Google Sheets в Firebase.

## 📋 Настройка (один раз)

### 1. Положите ключ Service Account
Скопируйте скачанный JSON-ключ в папку `scripts/` и переименуйте в:
```
service-account.json
```

### 2. Установите зависимости
```powershell
cd scripts
npm install
```

### 3. Укажите ID таблицы
Откройте `import.js` и замените:
```javascript
const SPREADSHEET_ID = 'ВАШ_SPREADSHEET_ID_ЗДЕСЬ';
```
ID находится в URL таблицы:
`https://docs.google.com/spreadsheets/d/ВОТ_ЭТОТ_ID/edit`

---

## 🚀 Использование

### Импорт данных
```powershell
cd scripts
npm run import
```

### Смена месяца
Перед новым месяцем измените в `import.js`:
```javascript
const SHEET_NAME = 'Чаты поддержки (февраль)';
```

---

## 📊 Что импортируется

| Из таблицы | В Firebase |
|------------|------------|
| ФИО | `name` |
| Группа | `team` |
| KPI (%) | `kpi` |
| Количество чатов | `chats` |
| Ошибки | `activityCount` |
| Время ответа | `responseTime` |
| Дата недели | `weekStartDate` / `weekEndDate` |

---

## ⚠️ Важно

- Не добавляйте `service-account.json` в git!
- Запускайте скрипт после обновления данных в таблице
