/**
 * Диагностика данных сотрудника
 * Запуск: node scripts/check-employee.js "Миненкова Алина"
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getISOWeek, getISOWeekYear, parseISO } from 'date-fns';

const __dirname = dirname(fileURLToPath(import.meta.url));

const serviceAccount = JSON.parse(
    readFileSync(join(__dirname, 'service-account.json'), 'utf8')
);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkEmployee(name) {
    console.log(`\n🔍 Поиск сотрудника: "${name}"\n`);

    const snapshot = await db.collection('employees')
        .where('name', '==', name)
        .limit(1)
        .get();

    if (snapshot.empty) {
        console.log('❌ Сотрудник не найден!');
        return;
    }

    const emp = snapshot.docs[0].data();
    console.log(`✅ Найден: ${emp.name} (ID: ${emp.id})`);
    console.log(`   Команда: ${emp.team}`);
    console.log(`   Активен: ${emp.isActive !== false ? 'Да' : 'Нет'}`);

    // Показываем все дни
    console.log(`\n📅 Дни (days):`);
    const days = emp.days || {};
    const sortedDays = Object.entries(days).sort((a, b) => a[0].localeCompare(b[0]));

    if (sortedDays.length === 0) {
        console.log('   (нет данных)');
    } else {
        // Группируем по неделям
        const weekGroups = new Map();

        sortedDays.forEach(([date, data]) => {
            const d = parseISO(date);
            const weekNum = getISOWeek(d);
            const year = getISOWeekYear(d);
            const weekKey = `${year}-W${weekNum}`;

            if (!weekGroups.has(weekKey)) {
                weekGroups.set(weekKey, []);
            }
            weekGroups.get(weekKey).push({ date, data, isoYear: year, isoWeek: weekNum });
        });

        weekGroups.forEach((days, weekKey) => {
            console.log(`\n   📆 ${weekKey}:`);
            let totalKpi = 0, kpiCount = 0, totalChats = 0, totalResponseTime = 0, rtCount = 0;

            days.forEach(({ date, data }) => {
                const kpi = data.kpi || 0;
                const chats = data.chats || 0;
                const responseTime = data.responseTime || 0;
                const shiftCount = data._shiftCount || 1;

                // Форматируем время ответа
                const rtMin = Math.floor(responseTime / 60);
                const rtSec = responseTime % 60;
                const rtFormatted = `${rtMin}:${String(rtSec).padStart(2, '0')}`;

                console.log(`      ${date}: KPI=${kpi.toFixed(2)}%, Чаты=${chats}, Ответ=${rtFormatted}, Смен=${shiftCount}`);

                if (kpi > 0) {
                    totalKpi += kpi;
                    kpiCount++;
                }
                totalChats += chats;
                if (responseTime > 0) {
                    totalResponseTime += responseTime;
                    rtCount++;
                }
            });

            const avgKpi = kpiCount > 0 ? totalKpi / kpiCount : 0;
            const avgRt = rtCount > 0 ? totalResponseTime / rtCount : 0;
            const avgRtMin = Math.floor(avgRt / 60);
            const avgRtSec = Math.round(avgRt % 60);
            console.log(`      ─────────────────────────`);
            console.log(`      Среднее KPI: ${avgKpi.toFixed(2)}% (из ${kpiCount} дней с KPI > 0)`);
            console.log(`      Среднее время ответа: ${avgRtMin}:${String(avgRtSec).padStart(2, '0')} (из ${rtCount} дней)`);
            console.log(`      Всего чатов: ${totalChats}`);
        });
    }

    // Показываем недели (если есть)
    console.log(`\n📊 Недели (weeks):`);
    const weeks = emp.weeks || {};
    if (Object.keys(weeks).length === 0) {
        console.log('   (нет данных)');
    } else {
        Object.entries(weeks).forEach(([month, monthData]) => {
            console.log(`   ${month}:`);
            Object.entries(monthData).forEach(([startDate, weekData]) => {
                console.log(`      ${startDate} - ${weekData.endDate || '?'}: KPI=${weekData.kpi}%, Чаты=${weekData.chats}`);
            });
        });
    }
}

const employeeName = process.argv[2] || 'Миненкова Алина';
checkEmployee(employeeName)
    .then(() => process.exit(0))
    .catch(err => {
        console.error('❌ Ошибка:', err);
        process.exit(1);
    });
