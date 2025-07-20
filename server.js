const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

const app = express();
app.get('/', (req, res) => 

res.send('حاسبة تحويل الأسعار - Bot Active!'));
app.listen(process.env.PORT || 3000);

const client = new Client({
authStrategy: new LocalAuth(),
puppeteer: {
headless: true,
args: ['--no-sandbox', '--disable-setuid-sandbox']
}
});

client.on('qr', (qr) => {
console.log('QR Code received, scan with WhatsApp:');
qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
console.log('WhatsApp bot is ready!');
});

client.on('message', async (message) => {
const text = message.body;

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
const daysMatch = 

text.match(/(\d+)\s*(?:أيام|يوم|days?|day)/i);

if (priceMatch && daysMatch) {
    const price = parseFloat(priceMatch[1]);
    const days = parseInt(daysMatch[1]);
    const result = calculate(price, days);
    
    const response = `🧮 حاسبة تحويل الأسعار\n\n` +
                   `💰 السعر لليوم الواحد: ${result.pricePerDay} ريال\n` +
                   `💳 السعر الإجمالي مع الضريبة: ${result.totalWithTax} ريال\n\n` +
                   `Abdulaziz 3215`;
    
    message.reply(response);
}

});

client.initialize();
