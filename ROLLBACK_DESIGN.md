# 🔄 Откат дизайна (Rollback Instructions)

> **Дата создания:** 2026-01-30  
> **Причина:** Перед масштабным обновлением дизайна

## 🚨 Как откатить изменения

### Вариант 1: Git Reset (Рекомендуется)

Если вы ещё **не сделали коммит** после обновления:
```bash
git checkout -- .
git clean -fd
```

Если **сделали коммит**, найдите нужный коммит и откатитесь:
```bash
git log --oneline -n 10  # Посмотреть последние коммиты
git reset --hard <COMMIT_HASH>  # Откатиться к нужному
```

### Вариант 2: Восстановить файлы вручную

Если Git недоступен, замените следующие файлы на резервные копии:

| Файл | Описание |
|------|----------|
| `src/index.css` | Все CSS стили |
| `src/components/Layout.tsx` | Шапка и навигация |
| `src/components/Podium.tsx` | Подиум с лидерами |
| `src/components/Ui.tsx` | Кнопки, инпуты |
| `src/pages/Dashboard.tsx` | Главная страница |
| `src/pages/AddEmployee.tsx` | Форма добавления |

---

## 📋 Текущее состояние (до изменений)

### index.css
- Liquid Glass стили (iOS 26)
- Переменные: `--taxi-yellow`, `--taxi-dark`, etc.
- Кастомный скроллбар
- `.glass-panel`, `.gradient-text`, `.taxi-*` утилиты

### Layout.tsx
- Framer Motion page transitions
- Liquid glass header/nav

### Podium.tsx
- `motion.div` для карточек
- `whileHover` эффекты
- Командные блоки: синий (Команда 1), красный (Команда 2)

### Ui.tsx
- `motion.button` с `whileTap`/`whileHover`
- `motion.input` с фокус-анимацией

---

## 🛡️ Резервная копия перед изменениями

Создайте архив текущего состояния:
```bash
git stash push -m "Backup before design overhaul"
```

Восстановить:
```bash
git stash pop
```
