const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

const app = express();
app.get('/', (req, res) => res.send('حاسبة تحويل الأسعار - Bot Active!'));
app.listen(process.env.PORT || 3000);

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    },
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
    }
});

client.on('qr', (

qr) => {
console.log('📱 QR Code - Scan with WhatsApp:');
qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
console.log('✅ WhatsApp bot is ready!');
});

client.on('auth_failure', msg => {
console.error('❌ Authentication failed:', msg);
});

client.on('disconnected', (reason) => {
console.log('❌ Client was logged out:', reason);
});

client.on('message', async (message) => {
try {
const text = message.body;
console.log('📨 New message:', text);

    function calculate(price, days) {
        if (days <= 0) return { pricePerDay: '0.00', totalWithTax: '0.00' };
        const pricePerDay = (price / days / 1.15) * 3.75;
        const totalWithTax = pricePerDay * days * 1.15;
        return {
            pricePerDay: pricePerDay.toFixed(2),
            totalWithTax: totalWithTax.toFixed(2)
        };
    }

    const priceMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:دولار|dollar|usd|\$)/i);
    const daysMatch 

= text.match(/(\d+)\s*(?:أيام|يوم|days?|day)/i);

    if (priceMatch && daysMatch) {
        const price = parseFloat(priceMatch[1]);
        const days = parseInt(daysMatch[1]);
        const result = calculate(price, days);
        
        const response = `🧮 *حاسبة تحويل الأسعار*\n\n` +
                       `💰 السعر لليوم الواحد (بدون ضريبة):\n*${result.pricePerDay} ريال*\n\n` +
                       `💳 السعر الإجمالي مع الضريبة:\n*${result.totalWithTax} ريال*\n\n` +
                       `📊 التفاصيل:\n• السعر: ${price} دولار\n• المدة: ${days} ${days === 1 ? 'يوم' : 'أيام'}\n• سعر الصرف: 3.75 ريال/دولار\n• الضريبة: 15%\n\n_Abdulaziz 3215_`;
        
        await message.reply(response);
        console.log('✅ Response sent');
    } else if (text.includes('مساعدة') || text.includes('help')) {
        const helpText = `🤖 *مرحباً بك في حاسبة تحويل الأسعار!*\n\n` +
                       `📝 *طريقة الاستخدام:*\nأرسل رسالة تحتوي على السعر 

بالدولار وعدد الأيام\n\n+                             💡 أمثلة:\n• "100 دولار 5 أيام"\n• "50 USD for 3 days"\n• "200$ لمدة 10 يوم"\n\n+                             ✨ سأقوم بحساب السعر بالريال مع الضريبة تلقائياً!\n\n_Abdulaziz 3215_`;

        await message.reply(helpText);
    }
} catch (error) {
    console.error('❌ Error handling message:', error);
}

});

console.log('🚀 Starting WhatsApp Price Calculator Bot...');
client.initialize().catch(console.error);
