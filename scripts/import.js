/**
 * Google Sheets → Firebase Import Script
 * 
 * Использование:
 * 1. Положите service-account.json в эту папку
 * 2. Запустите: npm install
 * 3. Запустите: npm run import
 */

import { google } from 'googleapis';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ============ НАСТРОЙКИ ============
// Замените на ID вашей таблицы (из URL)
const SPREADSHEET_ID = '15HWSNolbbdvi9GJwIb2aXuH5v3uYRqdNamYq-TWCLd4';

// Ключевые слова для поиска актуального листа
// Скрипт найдёт ВСЕ листы, содержащие ОБА этих слова
const SHEET_KEYWORDS = ['Чаты поддержки', 'акт'];

// Названия месяцев на русском для парсинга из имени листа
// Используем достаточно длинные префиксы для надёжного распознавания
const MONTH_NAMES = {
    'январ': 1, 'феврал': 2, 'март': 3, 'апрел': 4,
    'май': 5, 'мая': 5, 'июн': 6, 'июл': 7, 'август': 8,
    'сентябр': 9, 'октябр': 10, 'ноябр': 11, 'декабр': 12
};

// Извлечение номера месяца из названия листа
// "Чаты поддержки (февраль) акт" → 2
function extractMonthFromSheetName(sheetName) {
    const lower = sheetName.toLowerCase();
    for (const [prefix, monthNum] of Object.entries(MONTH_NAMES)) {
        if (lower.includes(prefix)) {
            return monthNum;
        }
    }
    return null;
}

// Инициализация Firebase Admin
const serviceAccount = JSON.parse(
    readFileSync(join(__dirname, 'service-account.json'), 'utf8')
);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Инициализация Google Sheets API
async function getSheets() {
    console.log('📡 Подключение к Google Sheets API...');
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: join(__dirname, 'service-account.json'),
            scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
        });
        const sheets = google.sheets({ version: 'v4', auth });
        console.log('✅ API подключён\n');
        return sheets;
    } catch (err) {
        console.error('❌ Ошибка подключения к API:', err.message);
        throw err;
    }
}

// Парсинг KPI "101.17%" → 101.17
function parseKpi(kpiStr) {
    if (!kpiStr) return 0;
    return parseFloat(kpiStr.replace('%', '').replace(',', '.')) || 0;
}

// Парсинг времени "0:08:27" → секунды
function parseTime(timeStr) {
    if (!timeStr || !timeStr.includes(':')) return 0;
    const parts = timeStr.split(':').map(n => parseInt(n) || 0);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return 0;
}

// Очистка данных активных сотрудников (уволенные сохраняются!)
async function clearActiveEmployeesData() {
    console.log('🗑️ Очистка данных активных сотрудников...');
    const employeesRef = db.collection('employees');
    const snapshot = await employeesRef.get();

    let cleared = 0;
    let preserved = 0;

    for (const doc of snapshot.docs) {
        const data = doc.data();

        // Если сотрудник уволен (isActive === false) — НЕ трогаем его
        if (data.isActive === false) {
            console.log(`⏸️  Сохранён уволенный: ${data.name}`);
            preserved++;
            continue;
        }

        // Для активных — очищаем только days, сохраняем остальное
        await doc.ref.update({
            days: {},
            weeks: {}
        });
        cleared++;
    }

    console.log(`   Очищено: ${cleared}, Сохранено уволенных: ${preserved}\n`);
}

// Обработка одного листа
async function processSheet(sheets, sheetName) {
    const range = `'${sheetName}'!A:BK`;

    console.log(`📋 Диапазон: ${range}`);
    console.log('⏳ Запрос данных...\n');

    let response;
    try {
        response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: range,
        });
    } catch (err) {
        console.error('❌ Ошибка при получении данных:', err.message);
        return { imported: 0, skipped: 0 };
    }

    const rows = response.data.values || [];
    console.log(`📊 Получено ${rows.length} строк`);

    if (rows.length === 0) {
        console.log('❌ Данные не найдены!\n');
        return { imported: 0, skipped: 0 };
    }

    let imported = 0;
    let skipped = 0;

    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];

        const dateCell = row[0];
        const nameCell = row[2];
        const kpiCell = row[3];
        const chatsCell = row[4];
        const responseTimeCell = row[10]; // Столбец K (раньше N)

        // Пропускаем если нет имени или даты
        if (!nameCell || !dateCell || nameCell === 'Менеджер') {
            skipped++;
            continue;
        }

        // Пропускаем ночные смены (дата вида "03.01-04.01")
        const isNightShift = /\d{1,2}\.\d{1,2}[\s]*[-–—][\s]*\d{1,2}\.\d{1,2}/.test(dateCell);
        if (isNightShift) {
            console.log(`⏭️  Пропущена ночная смена: ${nameCell} (${dateCell})`);
            skipped++;
            continue;
        }

        // Парсим дату
        const dateParts = dateCell.split('.');
        if (dateParts.length < 2) {
            skipped++;
            continue;
        }

        const day = parseInt(dateParts[0]);
        const monthNum = parseInt(dateParts[1]);

        // Определяем год автоматически: если месяц больше текущего, значит это прошлый год
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const year = monthNum > currentMonth ? currentYear - 1 : currentYear;

        const dateStr = `${year}-${String(monthNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        const employeeName = nameCell.trim();
        const team = 'Команда 1';

        const dayStats = {
            kpi: parseKpi(kpiCell),
            chats: parseInt(chatsCell) || 0,
            responseTime: parseTime(responseTimeCell),
            activities: [],
            startDate: dateStr,
            endDate: dateStr
        };

        // Поиск или создание сотрудника в Firestore
        const employeesRef = db.collection('employees');
        const snapshot = await employeesRef
            .where('name', '==', employeeName)
            .limit(1)
            .get();

        if (snapshot.empty) {
            const employeeId = crypto.randomUUID();
            const employeeData = {
                id: employeeId,
                name: employeeName,
                team: team,
                avatar: '',
                isActive: true,
                weeks: {},
                days: {
                    [dateStr]: dayStats
                }
            };
            await employeesRef.doc(employeeId).set(employeeData);
            console.log(`✅ Создан: ${employeeName}`);
        } else {
            const docRef = snapshot.docs[0];
            const existing = docRef.data();

            // Если сотрудник уволен — пропускаем его
            if (existing.isActive === false) {
                console.log(`⏸️  Пропущен уволенный: ${employeeName}`);
                skipped++;
                continue;
            }

            const days = existing.days || {};

            // Если данные за этот день уже есть
            if (days[dateStr]) {
                // Проверяем: это дубликат (тот же KPI из другого листа) или реальная вторая смена?
                const existingKpi = days[dateStr].kpi;

                // Если KPI почти одинаковый (разница < 1%) — это дубликат, пропускаем
                if (Math.abs(existingKpi - dayStats.kpi) < 1) {
                    console.log(`⏭️  Пропущен дубликат: ${employeeName} (${dateStr}) — KPI ${existingKpi}% ≈ ${dayStats.kpi}%`);
                    skipped++;
                    continue;
                }

                // Это реальная вторая смена — суммируем
                const prevCount = days[dateStr]._shiftCount || 1;
                const newCount = prevCount + 1;

                // Правильное накопительное среднее: (oldAvg * oldCount + newValue) / newCount
                const newKpi = (days[dateStr].kpi * prevCount + dayStats.kpi) / newCount;
                const newResponseTime = (days[dateStr].responseTime * prevCount + dayStats.responseTime) / newCount;

                days[dateStr] = {
                    ...days[dateStr],
                    kpi: parseFloat(newKpi.toFixed(2)),
                    chats: days[dateStr].chats + dayStats.chats, // Сумма чатов
                    responseTime: Math.round(newResponseTime),
                    _shiftCount: newCount // Сохраняем счётчик для следующего слияния
                };
                console.log(`➕ Добавлены данные к смене: ${employeeName} (${dateStr}) [смен: ${newCount}]`);
            } else {
                days[dateStr] = { ...dayStats, _shiftCount: 1 };
            }

            await docRef.ref.update({ days });
            console.log(`🔄 Обновлён: ${employeeName} (${dateStr})`);
        }

        imported++;
    }

    return { imported, skipped };
}

// Главная функция импорта
async function importData() {
    console.log('🚀 Запуск импорта из Google Sheets...\n');

    // Очищаем данные активных сотрудников (уволенные сохраняются)
    await clearActiveEmployeesData();

    const sheets = await getSheets();

    // Получаем список листов и ищем подходящие
    console.log('📋 Поиск листов...');
    console.log(`🔍 Ключевые слова: ${SHEET_KEYWORDS.join(' + ')}\n`);

    let matchingSheets = [];

    try {
        const metadata = await sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID,
        });

        const sheetNames = metadata.data.sheets.map(s => s.properties.title);

        // Ищем КАЖДЫЙ лист, содержащий ВСЕ ключевые слова
        matchingSheets = sheetNames.filter(name =>
            SHEET_KEYWORDS.every(keyword =>
                name.toLowerCase().includes(keyword.toLowerCase())
            )
        );

        if (matchingSheets.length === 0) {
            console.error('❌ Листы не найдены!');
            console.log('📚 Доступные листы:');
            sheetNames.slice(0, 20).forEach((name, i) => console.log(`   ${i + 1}. "${name}"`));
            return;
        }

        console.log(`📚 Найдено ${matchingSheets.length} подходящих листов по ключевым словам:`);
        matchingSheets.forEach((name, i) => console.log(`   ${i + 1}. "${name}"`));

        // Всегда импортируем текущий + предыдущий месяц
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1; // 1-12

        // Вычисляем предыдущий месяц и его год
        let prevMonth, prevYear;
        if (currentMonth === 1) {
            prevMonth = 12;
            prevYear = currentYear - 1;
        } else {
            prevMonth = currentMonth - 1;
            prevYear = currentYear;
        }

        console.log(`\n📅 Импорт за 2 месяца: ${currentMonth}/${currentYear} и ${prevMonth}/${prevYear}`);
        console.log(`🔍 Фильтруем листы...\n`);

        matchingSheets = matchingSheets.filter(name => {
            const sheetMonth = extractMonthFromSheetName(name);
            if (sheetMonth === null) {
                console.log(`   ⚠️  "${name}" — месяц не определён, пропускаем`);
                return false;
            }

            // Определяем год листа: если месяц > текущего, значит это прошлый год
            const sheetYear = sheetMonth > currentMonth ? currentYear - 1 : currentYear;

            // Проверяем: лист за текущий месяц?
            const isCurrentMonth = (sheetMonth === currentMonth && sheetYear === currentYear);

            // Проверяем: лист за предыдущий месяц?
            const isPrevMonth = (sheetMonth === prevMonth && sheetYear === prevYear);

            if (isCurrentMonth) {
                console.log(`   ✅ "${name}" — ${sheetMonth}/${sheetYear} (текущий месяц)`);
                return true;
            }
            if (isPrevMonth) {
                console.log(`   ✅ "${name}" — ${sheetMonth}/${sheetYear} (предыдущий месяц)`);
                return true;
            }
            console.log(`   ⏭️  "${name}" — ${sheetMonth}/${sheetYear} (пропускаем)`);
            return false;
        });

        if (matchingSheets.length === 0) {
            console.error('\n❌ Нет актуальных листов для импорта!');
            return;
        }

        console.log(`\n📋 К импорту: ${matchingSheets.length} листов`);

    } catch (err) {
        console.error('❌ Не удалось получить список листов:', err.message);
        throw err;
    }

    // Обрабатываем ВСЕ найденные листы
    let totalImported = 0;
    let totalSkipped = 0;

    for (let i = 0; i < matchingSheets.length; i++) {
        const sheetName = matchingSheets[i];
        console.log(`\n${'='.repeat(50)}`);
        console.log(`📋 Обработка листа ${i + 1}/${matchingSheets.length}: "${sheetName}"`);
        console.log(`${'='.repeat(50)}\n`);

        const { imported, skipped } = await processSheet(sheets, sheetName);
        totalImported += imported;
        totalSkipped += skipped;

        console.log(`   Лист завершён: +${imported} записей`);
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`✨ ИМПОРТ ЗАВЕРШЁН!`);
    console.log(`${'='.repeat(50)}`);
    console.log(`   📊 Всего листов обработано: ${matchingSheets.length}`);
    console.log(`   ✅ Всего импортировано: ${totalImported}`);
    console.log(`   ⏭️  Всего пропущено: ${totalSkipped}`);
}

// Запуск
importData()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('❌ Ошибка:', err);
        process.exit(1);
    });
