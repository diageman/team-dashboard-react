# Инструкция по деплою на GitHub Pages

Выполни следующие команды по очереди в терминале:

1.  **Установка инструмента для деплоя** (если еще не было):
    ```powershell
    npm install --save-dev gh-pages
    ```

2.  **Инициализация Git** (если это еще не git-репозиторий):
    ```powershell
    git init
    git add .
    git commit -m "Готов к деплою"
    ```

3.  **Связка с GitHub**:
    *   Зайди на [GitHub.com](https://github.com) и создай новый **пустой** репозиторий с названием `team-dashboard-react`.
    *   Скопируй ссылку на него (например `https://github.com/ВашНик/team-dashboard-react.git`).
    *   Выполни команду в терминале (заменив ссылку на свою):
    ```powershell
    git remote add origin https://github.com/ВашНик/team-dashboard-react.git
    ```

4.  **Деплой (Публикация)**:
    ```powershell
    npm run deploy
    ```

После выполнения `npm run deploy`, скрипт соберет проект и отправит его в ветку `gh-pages`. Через пару минут сайт появится по ссылке, указанной в настройках репозитория.

> **Важно**: Если при запуске `npm run deploy` будут ошибки, убедитесь, что в файле `package.json` в поле `"homepage"` указана правильная ссылка вида `https://<ваш-ник>.github.io/team-dashboard-react`. Я поставил там временную ссылку `https://diageman.github.io/team-dashboard-react`, поменяйте `diageman` на ваш никнейм на GitHub перед деплоем, если он отличается.

## Как обновлять сайт после изменений
Если вы изменили код (поменяли цвета, логику и т.д.):

1.  Сохраните изменения в Git:
    ```powershell
    git add .
    git commit -m "Описание изменений"
    ```

2.  Опубликуйте новую версию:
    ```powershell
    npm run deploy
    ```

3.  (Опционально) Если хотите сохранить код в основной ветке на GitHub (для истории):
    ```powershell
    git push origin master
    ```
