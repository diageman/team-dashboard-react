// Скрипт для проверки данных в Firebase
import admin from 'firebase-admin';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccountPath = join(__dirname, 'service-account.json');
const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkEmployeeData() {
    const snapshot = await db.collection('employees').get();

    console.log('='.repeat(60));
    console.log('ПРОВЕРКА ДАННЫХ ТУМАКОВ ЯРОСЛАВ');
    console.log('='.repeat(60));

    for (const doc of snapshot.docs) {
        const emp = doc.data();

        // Фильтруем только Тумаков Ярослав
        if (!emp.name.includes('Тумаков')) continue;

        console.log(`\n👤 ${emp.name}`);
        console.log(`   isActive: ${emp.isActive}`);
        console.log(`   Дни в январе 2026:`);

        const days = emp.days || {};
        const januaryDays = Object.entries(days)
            .filter(([date]) => date.startsWith('2026-01'))
            .sort(([a], [b]) => a.localeCompare(b));

        let totalKpi = 0;
        let count = 0;
        let totalChats = 0;

        // Неделя 2 (ISO): 5-11 января 2026
        let week2Chats = 0;
        const week2Dates = ['2026-01-05', '2026-01-06', '2026-01-07', '2026-01-08', '2026-01-09', '2026-01-10', '2026-01-11'];

        januaryDays.forEach(([date, data]) => {
            const shifts = data._shiftCount || 1;
            console.log(`      ${date}: KPI=${data.kpi}%, Chats=${data.chats}, Shifts=${shifts}`);
            totalKpi += data.kpi || 0;
            totalChats += data.chats || 0;
            count++;

            if (week2Dates.includes(date)) {
                week2Chats += data.chats || 0;
            }
        });

        if (count > 0) {
            console.log(`\n   📊 Среднее KPI за январь: ${(totalKpi / count).toFixed(1)}%`);
            console.log(`   📊 Всего дней: ${count}`);
            console.log(`   📊 Всего чатов за январь: ${totalChats}`);
            console.log(`\n   🗓️  НЕДЕЛЯ 5-11 января (ISO Week 2):`);
            console.log(`   📊 Чатов за неделю 2: ${week2Chats}`);
        }
    }

    process.exit(0);
}

checkEmployeeData();
