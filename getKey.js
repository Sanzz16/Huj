import puppeteer from "puppeteer";

export default async function handler(req, res) {
    try {
        // Jalankan Puppeteer headless browser
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true
        });
        const page = await browser.newPage();

        // Buka shortlink Starcool
        await page.goto("https://sfl.gl/huA6l", { waitUntil: "networkidle2" });

        // Tunggu redirect balik ke halaman generate key
        await page.waitForTimeout(2000); // bisa di-adjust sesuai redirect

        // Cek kalau ada parameter ?gen=true di URL
        const url = page.url();
        if (!url.includes("?gen=true")) {
            // Tambahkan param agar auto generate
            await page.goto(url + "?gen=true", { waitUntil: "networkidle2" });
        }

        // Ambil key dari element #keyText
        const key = await page.$eval("#keyText", el => el.textContent.trim());

        await browser.close();

        if (key && key !== "Maximum Key" && key !== "Klik Generate") {
            res.status(200).json({
                success: true,
                key: key
            });
        } else {
            res.status(200).json({
                success: false,
                message: "Key belum tersedia atau limit tercapai"
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.toString() });
    }
}
