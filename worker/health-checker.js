const puppeteer = require('puppeteer');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

// โหลด Configuration
const configPath = path.join(__dirname, 'config.json');
let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

/**
 * ฟังก์ชันตรวจสอบสถานะของหน้า Facebook (อ้างอิงจาก check-fb.js)
 */
async function checkFacebookLink(browser, url) {
    const page = await browser.newPage();
    try {
        const separator = url.includes('?') ? '&' : '?';
        const checkUrl = `${url}${separator}locale=en_US`;

        await page.goto(checkUrl, { waitUntil: 'networkidle2', timeout: 30000 });

        const result = await page.evaluate(() => {
            const text = document.body.innerText;
            const title = document.title.trim();
            const ogTitle = document.querySelector('meta[property="og:title"]');

            return {
                text: text,
                title: title,
                hasOgTitle: !!ogTitle,
                ogTitleContent: ogTitle ? ogTitle.content : null
            };
        });

        const isBrokenText = result.text.includes("This content isn't available right now") ||
            result.text.includes("This page isn't available") ||
            result.text.includes("เนื้อหานี้ไม่พร้อมใช้งาน");

        const isTitleBroken = result.title === "Facebook";
        const isMetaBroken = !result.hasOgTitle || result.ogTitleContent === "Facebook";

        if (isBrokenText || (isTitleBroken && isMetaBroken)) {
            return { status: 'broken' };
        } else {
            return { status: 'active' };
        }
    } catch (error) {
        return { status: 'error', error: error.message };
    } finally {
        await page.close();
    }
}

/**
 * ฟังก์ชันหลักในการรันการตรวจสอบทุกเพจ
 */
async function runHealthCheck() {
    console.log(`\n[${new Date().toLocaleString('th-TH')}] 🚀 เริ่มต้นกระบวนการ Health Check`);
    
    // โหลด config ใหม่ทุกครั้งเผื่อมีการแก้ไขไฟล์ config.json ระหว่างที่รัน
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const pages = config.pagesToCheck || [];
    
    if (pages.length === 0) {
        console.log("⚠️ ไม่พบรายชื่อเพจใน config.json");
        return;
    }

    console.log(`กำลังตรวจสอบ ${pages.length} เพจ...`);
    
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });

    const results = [];

    for (const page of pages) {
        process.stdout.write(`ตรวจสอบ [${page.name}]... `);
        const checkResult = await checkFacebookLink(browser, page.url);
        
        if (checkResult.status === 'active') {
            console.log("✅ ปกติ (Active)");
        } else if (checkResult.status === 'broken') {
            console.log("❌ พัง (Broken)");
        } else {
            console.log(`⚠️ ผิดพลาด: ${checkResult.error}`);
        }

        results.push({
            id: page.id,
            name: page.name,
            url: page.url,
            status: checkResult.status
        });
        
        // ถ่วงเวลาเล็กน้อยเพื่อไม่ให้ Facebook block
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    await browser.close();
    
    // สรุปผล
    const brokenPages = results.filter(r => r.status === 'broken');
    console.log(`\n📊 สรุปผลการตรวจสอบ:`);
    console.log(`ตรวจสอบทั้งหมด: ${results.length} เพจ`);
    console.log(`เพจปกติ: ${results.length - brokenPages.length} เพจ`);
    console.log(`เพจพัง: ${brokenPages.length} เพจ`);
    
    if (brokenPages.length > 0) {
        console.log(`\n🔴 รายชื่อเพจที่ต้องการการแก้ไข:`);
        brokenPages.forEach(p => console.log(`- ${p.name} (${p.url})`));
    }
    
    fs.writeFileSync(path.join(__dirname, 'result.json'), JSON.stringify({
        total: results.length,
        active: results.length - brokenPages.length,
        broken: brokenPages.length,
        details: results
    }, null, 2), 'utf8');

    console.log('✅ สิ้นสุดกระบวนการ Health Check\n');
}

// ==========================================
// การตั้งเวลา (Scheduler)
// ==========================================

console.log(`\n⚡ Page Health Checker Worker เริ่มทำงาน`);
if (config.cronSchedules && config.cronSchedules.length > 0) {
    console.log(`📅 ตั้งเวลาทำงานตามรอบต่อไปนี้:`);
    config.cronSchedules.forEach(schedule => {
        console.log(` - Cron: "${schedule}"`);
        cron.schedule(schedule, () => {
            runHealthCheck();
        }, {
            scheduled: true,
            timezone: "Asia/Bangkok"
        });
    });
}

// สั่งให้รัน 1 รอบทันทีเมื่อเปิดโปรแกรม เพื่อดูผลลัพธ์
runHealthCheck();
