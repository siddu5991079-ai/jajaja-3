









// Maine isme stream_quality ka ek naya dropdown add kar diya hai jiske do options hain: 40KBps aur 110KBps. Isko copy karke apni YML file mein paste kar lein:


const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const { spawn, execSync } = require('child_process');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

const TARGET_URL = 'https://dadocric.st/player.php?id=starsp3&v=m';
const RTMP_SERVER = 'rtmp://vsu.okcdn.ru/input/';
const STREAM_KEY = '14601603391083_14040893622891_puxzrwjniu';
const RTMP_DESTINATION = `${RTMP_SERVER}${STREAM_KEY}`;

let browser = null;
let ffmpegProcess = null;

// 24/7 Infinite Loop
async function mainLoop() {
    while (true) {
        try {
            await startDirectStreaming();
            console.log('[!] Stream function resolved unexpectedly. Restarting in 5s...');
            await new Promise(resolve => setTimeout(resolve, 5000));
        } catch (error) {
            console.error('[!] Global Stream Error: Restarting in 5s...', error.message || error);
            await cleanup();
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

async function startDirectStreaming() {
    console.log('[*] Starting browser and FFmpeg for LIVE 24/7 Streaming...');

    const useProxy = process.env.USE_PROXY === 'ON';
    const proxyIpPort = process.env.PROXY_IP_PORT || '31.59.20.176:6754';
    const proxyUser = process.env.PROXY_USER || 'kexwytuq';
    const proxyPass = process.env.PROXY_PASS || 'fw1k19a4lqfd';
    
    // 🚀 NAYA: YML file se quality input catch kar rahe hain
    const streamQuality = process.env.STREAM_QUALITY || '110KBps (Balanced 480p)';

    const browserArgs = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--window-size=1280,720',
        '--kiosk', 
        '--autoplay-policy=no-user-gesture-required'
    ];

    if (useProxy) {
        browserArgs.push(`--proxy-server=http://${proxyIpPort}`);
    }

    console.log(`Launching Browser on GitHub Actions Virtual Screen with Proxy: ${useProxy ? 'ON' : 'OFF'}...`);
    browser = await puppeteer.launch({
        channel: 'chrome',
        headless: false, 
        defaultViewport: { width: 1280, height: 720 },
        ignoreDefaultArgs: ['--enable-automation'], 
        args: browserArgs
    });

    const page = await browser.newPage();

    const pages = await browser.pages();
    for (const p of pages) {
        if (p !== page) await p.close();
    }

    browser.on('targetcreated', async (target) => {
        if (target.type() === 'page') {
            try {
                const newPage = await target.page();
                if (newPage && newPage !== page) {
                    console.log(`[*] Adware tab detected! Forcing video tab back to foreground visually...`);
                    await page.bringToFront(); 
                    setTimeout(() => newPage.close().catch(() => { }), 2000);
                }
            } catch (e) { }
        }
    });

    if (useProxy) {
        await page.authenticate({ username: proxyUser, password: proxyPass });
        console.log("Proxy credentials applied successfully.");
    }

    const recorder = new PuppeteerScreenRecorder(page);
    await recorder.start('debug_video.mp4');
    console.log('🎥 [*] 20-second Visual Debug Recording Started...');

    setTimeout(async () => {
        try {
            await recorder.stop();
            console.log('🛑 [*] Visual Screen recording stopped. Uploading to GitHub Releases...');
            const tagName = `visual-debug-${Date.now()}`;
            execSync(`gh release create ${tagName} debug_video.mp4 --title "Puppeteer Visual Capture"`, { stdio: 'inherit' });
            console.log('✅ [+] Successfully uploaded visual debug wrapper!');
        } catch (err) {
            console.error('❌ [!] Failed to upload visual debug wrapper:', err.message);
        }
    }, 20000);

    const displayNum = process.env.DISPLAY || ':99';

    console.log(`[*] Navigating to target URL using Proxy...`);
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

    console.log('[*] Waiting for potential Cloudflare...');
    for (let i = 0; i < 15; i++) {
        const title = await page.title();
        if (!title.includes('Moment') && !title.includes('Cloudflare')) break;
        await new Promise(r => setTimeout(r, 1000));
    }

    await new Promise(resolve => setTimeout(resolve, 8000));

    console.log('[*] Cleaning up ads visually...');
    for (const frame of page.frames()) {
        try {
            await frame.evaluate(() => {
                const adElement = document.querySelector('div#dontfoid');
                if (adElement) adElement.remove();
            });
        } catch (e) { }
    }

    let targetFrame = null;
    for (const frame of page.frames()) {
        try {
            const hasVideo = await frame.evaluate(() => !!document.querySelector('video'));
            if (hasVideo) {
                targetFrame = frame;
                console.log(`[+] Found video element inside frame: ${frame.url() || 'unknown'}`);
                break;
            }
        } catch (e) { }
    }

    if (!targetFrame) throw new Error('No <video> element could be found.');

    console.log('[*] Executing Audio Unmute and Wait Logic...');
    await targetFrame.evaluate(async () => {
        const video = document.querySelector('video');
        if (!video) return false;
        video.muted = false; 
        await video.play().catch(e => {});
        return true;
    });

    async function applyFullscreenHack() {
        console.log('\n[*] Executing Fullscreen Script...');
        const debugLogs = await targetFrame.evaluate(async () => {
            let terminalLogs = [];
            const vid = document.querySelector('video');
            if (!vid) return terminalLogs;
            
            try {
                if (vid.requestFullscreen) await vid.requestFullscreen();
                else if (vid.webkitRequestFullscreen) await vid.webkitRequestFullscreen();
                terminalLogs.push("🎉 RESULT: requestFullscreen() SUCCESS!");
            } catch (err) {
                vid.style.position = 'fixed';
                vid.style.top = '0';
                vid.style.left = '0';
                vid.style.width = '100vw';
                vid.style.height = '100vh';
                vid.style.zIndex = '2147483647';
                vid.style.backgroundColor = 'black';
                vid.style.objectFit = 'contain';
                terminalLogs.push("✅ RESULT: CSS Force-Stretch Hack Successfully lag gaya!");
            }
            return terminalLogs;
        });
        for (const log of debugLogs) console.log(log);
        await new Promise(r => setTimeout(r, 2000));
    }

    function startBroadcast() {
        if (ffmpegProcess) return; 
        
        let ffmpegArgs = [];

        // 🚀 NAYA: YML Input ke mutabiq dynamic settings
        if (streamQuality.includes('40KBps')) {
            console.log('\n[*] 🚀 FFmpeg Mode: ULTRA-LOW BANDWIDTH (360p @ 20FPS, 200k Video, 32k Audio)...');
            ffmpegArgs = [
                '-y', '-use_wallclock_as_timestamps', '1', '-thread_queue_size', '1024',
                '-f', 'x11grab', '-draw_mouse', '0', '-video_size', '1280x720', '-framerate', '20',
                '-i', displayNum, '-thread_queue_size', '1024', '-f', 'pulse', '-i', 'default',
                '-vf', 'scale=640:360',
                '-c:v', 'libx264', '-preset', 'veryfast', '-profile:v', 'baseline',
                '-b:v', '200k', '-maxrate', '250k', '-bufsize', '500k',
                '-pix_fmt', 'yuv420p', '-g', '40',
                '-c:a', 'aac', '-b:a', '32k', '-ac', '1', '-ar', '44100',
                '-af', 'aresample=async=1', '-f', 'flv', RTMP_DESTINATION 
            ];
        } else {
            console.log('\n[*] 🚀 FFmpeg Mode: BALANCED 480p (854x480 @ 30FPS, 800k Video, 64k Audio)...');
            ffmpegArgs = [
                '-y', '-use_wallclock_as_timestamps', '1', '-thread_queue_size', '1024',
                '-f', 'x11grab', '-draw_mouse', '0', '-video_size', '1280x720', '-framerate', '30',
                '-i', displayNum, '-thread_queue_size', '1024', '-f', 'pulse', '-i', 'default',
                '-vf', 'scale=854:480',
                '-c:v', 'libx264', '-preset', 'veryfast', '-profile:v', 'main',
                '-b:v', '800k', '-maxrate', '850k', '-bufsize', '1700k',
                '-pix_fmt', 'yuv420p', '-g', '60',
                '-c:a', 'aac', '-b:a', '64k', '-ac', '2', '-ar', '44100',
                '-af', 'aresample=async=1', '-f', 'flv', RTMP_DESTINATION 
            ];
        }

        ffmpegProcess = spawn('ffmpeg', ffmpegArgs);

        let heartbeatCount = 0;
        let lastHeartbeatTime = Date.now();
        const FIVE_MINUTES = 5 * 60 * 1000;

        ffmpegProcess.stderr.on('data', (data) => {
            const output = data.toString().trim();
            if (output.includes('frame=') && output.includes('fps=')) {
                heartbeatCount++;
                const currentTime = Date.now();
                if (heartbeatCount <= 7) {
                    console.log(`[FFmpeg ${heartbeatCount}/7]: ${output.substring(0, 100)}`);
                    if (heartbeatCount === 7) console.log(`\n[✅ Success] Stream is live! Suppressing logs...`);
                } else if (currentTime - lastHeartbeatTime >= FIVE_MINUTES) {
                    console.log(`[FFmpeg 5-Min Check]: ${output.substring(0, 100)}`);
                    lastHeartbeatTime = currentTime; 
                }
            } else if (output.includes('Error') || output.includes('Failed')) {
                console.log(`\n[FFmpeg Issue]: ${output}`);
            }
        });

        ffmpegProcess.on('close', (code) => console.log(`\n[*] FFmpeg exited (Code: ${code})`));
    }

    function stopBroadcast() {
        if (ffmpegProcess) {
            console.log('\n🛑 [ACTION] Killing FFmpeg Process to stop OK.ru Broadcast!');
            try {
                ffmpegProcess.stdin.end();
                ffmpegProcess.kill('SIGKILL'); 
            } catch (e) { }
            ffmpegProcess = null;
        }
    }

    await applyFullscreenHack();
    startBroadcast();

    console.log('\n[*] Smart Engine Connected! Monitoring Video Health 24/7...');
    
    let isBroadcasting = true; 
    let lastOfflineLogTime = 0;
    const THREE_MINUTES = 3 * 60 * 1000;

    while (true) {
        if (!browser || !browser.isConnected()) throw new Error("Browser closed.");

        let isVideoHealthy = false;
        try {
            isVideoHealthy = await targetFrame.evaluate(() => {
                const vid = document.querySelector('video');
                if (!vid || vid.clientWidth === 0 || vid.ended || vid.paused) return false;
                if (vid.clientWidth < (window.innerWidth * 0.5)) return false;
                return true;
            });
        } catch (e) {
            isVideoHealthy = false; 
            for (const frame of page.frames()) {
                try {
                    const hasVid = await frame.evaluate(() => !!document.querySelector('video'));
                    if (hasVid) { targetFrame = frame; break; }
                } catch(ex){}
            }
        }

        if (isBroadcasting && !isVideoHealthy) {
            console.log('\n=================================================================');
            console.log('❌ ❌ ❌ VIDEO STREAM OFFLINE, CRASHED OR PAUSED! ❌ ❌ ❌');
            console.log('🛑 STOPPING FFmpeg BROADCAST IMMEDIATELY TO PROTECT VIEWERS!');
            console.log('=================================================================\n');
            stopBroadcast();
            isBroadcasting = false;
            lastOfflineLogTime = Date.now();
        }
        else if (!isBroadcasting && !isVideoHealthy) {
            const timeSinceLastLog = Date.now() - lastOfflineLogTime;
            if (timeSinceLastLog >= THREE_MINUTES) {
                console.log('\n=================================================================');
                console.log('⚠️ ⚠️ ⚠️ STATUS: WAITING FOR STREAM ON THE SAME PAGE... ⚠️ ⚠️ ⚠️');
                console.log('⏳ STILL OFFLINE. FFMPEG IS DEAD. WAITING FOR MATCH TO RESUME.');
                console.log('=================================================================\n');
                lastOfflineLogTime = Date.now();
                try { await targetFrame.evaluate(() => { const v = document.querySelector('video'); if(v) v.play(); }); } catch(e){}
            }
        }
        else if (!isBroadcasting && isVideoHealthy) {
            console.log('\n=================================================================');
            console.log('✅ ✅ ✅ VIDEO STREAM IS BACK ONLINE! ✅ ✅ ✅');
            console.log('🔄 RE-APPLYING FULLSCREEN & RESTARTING OK.RU BROADCAST!');
            console.log('=================================================================\n');
            await applyFullscreenHack();
            await new Promise(r => setTimeout(r, 2000));
            startBroadcast();
            isBroadcasting = true;
        }

        await new Promise(r => setTimeout(r, 3000));
    }
}

async function cleanup() {
    if (ffmpegProcess) {
        try { ffmpegProcess.stdin.end(); ffmpegProcess.kill('SIGINT'); } catch (e) { }
        ffmpegProcess = null;
    }
    if (browser) {
        try { await browser.close(); } catch (e) { }
        browser = null;
    }
}

process.on('SIGINT', async () => {
    console.log('\n[*] Stopping live script cleanly...');
    await cleanup();
    process.exit(0);
});

mainLoop();










































































































// ============= done 110kbps internet speed k liye smooth streaming =====================





// Yeh settings ek "Balanced / Medium Quality" (480p SD) stream ke liye bilkul perfect hain! Aapne jo values choose ki hain, woh mobile aur laptop dono par bohot achi (clear aur smooth) nazar aayengi, aur aawaz bhi nahi phategi.

// Lekin ek technical haqeeqat (fact) aapko zaroor pata honi chahiye:
// Jab aap Video ko 800k aur Audio ko 64k par set karte hain, toh aapki stream ka total size 864 kbps ho jata hai.
// Iska matlab hai ke is stream ko bina ruke (without buffering) dekhne ke liye user ke paas kam az kam 110 KB/s ki internet speed honi chahiye. Toh jo log strictly 40 KB/s wale gaon ke network par hain, unki stream thori buffer karegi. Lekin baqi 90% aam users ke liye yeh sab se behtareen aur clear setting hai!

// Aapki hidayat ke mutabiq, yeh raha aapka 100% Mukammal (Full) Code inhi nayi 480p aur 800k settings ke sath. (Maine isme audio ko wapas Stereo -ac 2 aur video profile ko main kar diya hai taake quality aur behtar ho jaye).



const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const { spawn, execSync } = require('child_process');
const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

const TARGET_URL = 'https://dadocric.st/player.php?id=starsp3&v=m';
const RTMP_SERVER = 'rtmp://vsu.okcdn.ru/input/';
const STREAM_KEY = '14601603391083_14040893622891_puxzrwjniu';
const RTMP_DESTINATION = `${RTMP_SERVER}${STREAM_KEY}`;

let browser = null;
let ffmpegProcess = null;

// 24/7 Infinite Loop
async function mainLoop() {
    while (true) {
        try {
            await startDirectStreaming();
            console.log('[!] Stream function resolved unexpectedly. Restarting in 5s...');
            await new Promise(resolve => setTimeout(resolve, 5000));
        } catch (error) {
            console.error('[!] Global Stream Error: Restarting in 5s...', error.message || error);
            await cleanup();
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

async function startDirectStreaming() {
    console.log('[*] Starting browser and FFmpeg for LIVE 24/7 Streaming...');

    const useProxy = process.env.USE_PROXY === 'ON';
    const proxyIpPort = process.env.PROXY_IP_PORT || '31.59.20.176:6754';
    const proxyUser = process.env.PROXY_USER || 'kexwytuq';
    const proxyPass = process.env.PROXY_PASS || 'fw1k19a4lqfd';

    const browserArgs = [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--window-size=1280,720',
        '--kiosk', // Forces full-screen mode, hiding URL bar
        '--autoplay-policy=no-user-gesture-required'
    ];

    if (useProxy) {
        browserArgs.push(`--proxy-server=http://${proxyIpPort}`);
    }

    console.log(`Launching Browser on GitHub Actions Virtual Screen with Proxy: ${useProxy ? 'ON' : 'OFF'}...`);
    browser = await puppeteer.launch({
        channel: 'chrome',
        headless: false, // Required for Xvfb display
        defaultViewport: { width: 1280, height: 720 },
        ignoreDefaultArgs: ['--enable-automation'], // Removes the "Chrome is being controlled" white bar
        args: browserArgs
    });

    const page = await browser.newPage();

    // Clean up default about:blank tab
    const pages = await browser.pages();
    for (const p of pages) {
        if (p !== page) await p.close();
    }

    // Aggressive Ad-Popup Blocker & Focus Management
    browser.on('targetcreated', async (target) => {
        if (target.type() === 'page') {
            try {
                const newPage = await target.page();
                if (newPage && newPage !== page) {
                    console.log(`[*] Adware tab detected! Forcing video tab back to foreground visually...`);
                    await page.bringToFront(); 
                    setTimeout(() => newPage.close().catch(() => { }), 2000);
                }
            } catch (e) { }
        }
    });

    if (useProxy) {
        await page.authenticate({ username: proxyUser, password: proxyPass });
        console.log("Proxy credentials applied successfully.");
    }

    // GUI Visual Recorder (20 Sec Debug)
    const recorder = new PuppeteerScreenRecorder(page);
    await recorder.start('debug_video.mp4');
    console.log('🎥 [*] 20-second Visual Debug Recording Started...');

    setTimeout(async () => {
        try {
            await recorder.stop();
            console.log('🛑 [*] Visual Screen recording stopped. Uploading to GitHub Releases...');
            const tagName = `visual-debug-${Date.now()}`;
            execSync(`gh release create ${tagName} debug_video.mp4 --title "Puppeteer Visual Capture"`, { stdio: 'inherit' });
            console.log('✅ [+] Successfully uploaded visual debug wrapper!');
        } catch (err) {
            console.error('❌ [!] Failed to upload visual debug wrapper:', err.message);
        }
    }, 20000);

    const displayNum = process.env.DISPLAY || ':99';

    console.log(`[*] Navigating to target URL using Proxy...`);
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

    console.log('[*] Waiting for potential Cloudflare...');
    for (let i = 0; i < 15; i++) {
        const title = await page.title();
        if (!title.includes('Moment') && !title.includes('Cloudflare')) break;
        await new Promise(r => setTimeout(r, 1000));
    }

    await new Promise(resolve => setTimeout(resolve, 8000));

    console.log('[*] Cleaning up ads visually...');
    for (const frame of page.frames()) {
        try {
            await frame.evaluate(() => {
                const adElement = document.querySelector('div#dontfoid');
                if (adElement) adElement.remove();
            });
        } catch (e) { }
    }

    let targetFrame = null;
    for (const frame of page.frames()) {
        try {
            const hasVideo = await frame.evaluate(() => !!document.querySelector('video'));
            if (hasVideo) {
                targetFrame = frame;
                console.log(`[+] Found video element inside frame: ${frame.url() || 'unknown'}`);
                break;
            }
        } catch (e) { }
    }

    if (!targetFrame) throw new Error('No <video> element could be found.');

    console.log('[*] Executing Audio Unmute and Wait Logic...');
    await targetFrame.evaluate(async () => {
        const video = document.querySelector('video');
        if (!video) return false;
        video.muted = false; 
        await video.play().catch(e => {});
        return true;
    });

    // =========================================================================
    // 🛠️ REUSABLE FUNCTIONS (Watchdog controls these)
    // =========================================================================

    async function applyFullscreenHack() {
        console.log('\n[*] Executing Fullscreen Script...');
        const debugLogs = await targetFrame.evaluate(async () => {
            let terminalLogs = [];
            const vid = document.querySelector('video');
            if (!vid) return terminalLogs;
            
            try {
                if (vid.requestFullscreen) await vid.requestFullscreen();
                else if (vid.webkitRequestFullscreen) await vid.webkitRequestFullscreen();
                terminalLogs.push("🎉 RESULT: requestFullscreen() SUCCESS!");
            } catch (err) {
                vid.style.position = 'fixed';
                vid.style.top = '0';
                vid.style.left = '0';
                vid.style.width = '100vw';
                vid.style.height = '100vh';
                vid.style.zIndex = '2147483647';
                vid.style.backgroundColor = 'black';
                vid.style.objectFit = 'contain';
                terminalLogs.push("✅ RESULT: CSS Force-Stretch Hack Successfully lag gaya!");
            }
            return terminalLogs;
        });
        for (const log of debugLogs) console.log(log);
        await new Promise(r => setTimeout(r, 2000));
    }

    function startBroadcast() {
        if (ffmpegProcess) return; 
        
        console.log('\n[*] 🚀 Spawning FFmpeg in Balanced 480p Mode (854x480 @ 30FPS, 800k Video, 64k Audio)...');
        ffmpegProcess = spawn('ffmpeg', [
            '-y', 
            '-use_wallclock_as_timestamps', '1', 
            '-thread_queue_size', '1024',
            
            // 1. Capture at Full HD/720p from Virtual Screen
            '-f', 'x11grab', 
            '-draw_mouse', '0', 
            '-video_size', '1280x720', 
            '-framerate', '30', // 🔄 Updated to 30 FPS
            '-i', displayNum, 
            
            '-thread_queue_size', '1024', 
            '-f', 'pulse', 
            '-i', 'default',
            
            // 2. The Scaler: Convert screen to 480p on the fly
            '-vf', 'scale=854:480', // 🔄 Updated Resolution
            
            // 3. Video Encoding (Balanced Quality)
            '-c:v', 'libx264', 
            '-preset', 'veryfast', 
            '-profile:v', 'main', // 🔄 Main profile for better 480p quality
            '-b:v', '800k', // 🔄 Updated Video Bitrate
            '-maxrate', '850k', 
            '-bufsize', '1700k',
            '-pix_fmt', 'yuv420p', 
            '-g', '60', // 2x FPS
            
            // 4. Audio Encoding
            '-c:a', 'aac', 
            '-b:a', '64k', // 🔄 Updated Audio Bitrate
            '-ac', '2', // Stereo Audio for better sound
            '-ar', '44100',
            '-af', 'aresample=async=1', 
            
            '-f', 'flv', 
            RTMP_DESTINATION 
        ]);

        let heartbeatCount = 0;
        let lastHeartbeatTime = Date.now();
        const FIVE_MINUTES = 5 * 60 * 1000;

        ffmpegProcess.stderr.on('data', (data) => {
            const output = data.toString().trim();
            if (output.includes('frame=') && output.includes('fps=')) {
                heartbeatCount++;
                const currentTime = Date.now();
                if (heartbeatCount <= 7) {
                    console.log(`[FFmpeg ${heartbeatCount}/7]: ${output.substring(0, 100)}`);
                    if (heartbeatCount === 7) console.log(`\n[✅ Success] Stream is live! Suppressing logs...`);
                } else if (currentTime - lastHeartbeatTime >= FIVE_MINUTES) {
                    console.log(`[FFmpeg 5-Min Check]: ${output.substring(0, 100)}`);
                    lastHeartbeatTime = currentTime; 
                }
            } else if (output.includes('Error') || output.includes('Failed')) {
                console.log(`\n[FFmpeg Issue]: ${output}`);
            }
        });

        ffmpegProcess.on('close', (code) => console.log(`\n[*] FFmpeg exited (Code: ${code})`));
    }

    function stopBroadcast() {
        if (ffmpegProcess) {
            console.log('\n🛑 [ACTION] Killing FFmpeg Process to stop OK.ru Broadcast!');
            try {
                ffmpegProcess.stdin.end();
                ffmpegProcess.kill('SIGKILL'); 
            } catch (e) { }
            ffmpegProcess = null;
        }
    }

    // =========================================================================
    // 🚀 INITIAL STARTUP
    // =========================================================================
    await applyFullscreenHack();
    startBroadcast();

    // =========================================================================
    // 🧠 THE SMART WATCHDOG 
    // =========================================================================
    console.log('\n[*] Smart Engine Connected! Monitoring Video Health 24/7...');
    
    let isBroadcasting = true; 
    let lastOfflineLogTime = 0;
    const THREE_MINUTES = 3 * 60 * 1000;

    while (true) {
        if (!browser || !browser.isConnected()) throw new Error("Browser closed.");

        let isVideoHealthy = false;
        try {
            isVideoHealthy = await targetFrame.evaluate(() => {
                const vid = document.querySelector('video');
                if (!vid || vid.clientWidth === 0 || vid.ended || vid.paused) return false;
                if (vid.clientWidth < (window.innerWidth * 0.5)) return false;
                return true;
            });
        } catch (e) {
            isVideoHealthy = false; 
            for (const frame of page.frames()) {
                try {
                    const hasVid = await frame.evaluate(() => !!document.querySelector('video'));
                    if (hasVid) { targetFrame = frame; break; }
                } catch(ex){}
            }
        }

        // --- STATE 1: STREAM GOES OFFLINE ---
        if (isBroadcasting && !isVideoHealthy) {
            console.log('\n=================================================================');
            console.log('❌ ❌ ❌ VIDEO STREAM OFFLINE, CRASHED OR PAUSED! ❌ ❌ ❌');
            console.log('🛑 STOPPING FFmpeg BROADCAST IMMEDIATELY TO PROTECT VIEWERS!');
            console.log('=================================================================\n');
            stopBroadcast();
            isBroadcasting = false;
            lastOfflineLogTime = Date.now();
        }

        // --- STATE 2: WAITING FOR STREAM (Prints every 3 minutes) ---
        else if (!isBroadcasting && !isVideoHealthy) {
            const timeSinceLastLog = Date.now() - lastOfflineLogTime;
            if (timeSinceLastLog >= THREE_MINUTES) {
                console.log('\n=================================================================');
                console.log('⚠️ ⚠️ ⚠️ STATUS: WAITING FOR STREAM ON THE SAME PAGE... ⚠️ ⚠️ ⚠️');
                console.log('⏳ STILL OFFLINE. FFMPEG IS DEAD. WAITING FOR MATCH TO RESUME.');
                console.log('=================================================================\n');
                lastOfflineLogTime = Date.now();
                
                try { await targetFrame.evaluate(() => { const v = document.querySelector('video'); if(v) v.play(); }); } catch(e){}
            }
        }

        // --- STATE 3: STREAM COMES BACK ONLINE! ---
        else if (!isBroadcasting && isVideoHealthy) {
            console.log('\n=================================================================');
            console.log('✅ ✅ ✅ VIDEO STREAM IS BACK ONLINE! ✅ ✅ ✅');
            console.log('🔄 RE-APPLYING FULLSCREEN & RESTARTING OK.RU BROADCAST!');
            console.log('=================================================================\n');
            await applyFullscreenHack();
            await new Promise(r => setTimeout(r, 2000));
            startBroadcast();
            isBroadcasting = true;
        }

        await new Promise(r => setTimeout(r, 3000));
    }
}

async function cleanup() {
    if (ffmpegProcess) {
        try { ffmpegProcess.stdin.end(); ffmpegProcess.kill('SIGINT'); } catch (e) { }
        ffmpegProcess = null;
    }
    if (browser) {
        try { await browser.close(); } catch (e) { }
        browser = null;
    }
}

process.on('SIGINT', async () => {
    console.log('\n[*] Stopping live script cleanly...');
    await cleanup();
    process.exit(0);
});

// Boot
mainLoop();














































// ========================= very very well, bohot slow internet par yeh bohot acha stream kar raha hai , lekin iss mei yeh video thora blur hai opper try karty hai agar n huwa to yeh below teek hai =======================



// below code mein , Ab aapki total stream ka size (200k Video + 32k Audio) = 232 kbps hai. Yeh 40 KB/s (320 kbps) wale internet par bilkul bina ruke (no buffering) chalegi!


// const puppeteer = require('puppeteer-extra');
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// puppeteer.use(StealthPlugin());

// const { spawn, execSync } = require('child_process');
// const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

// const TARGET_URL = 'https://dadocric.st/player.php?id=starsp3&v=m';
// const RTMP_SERVER = 'rtmp://vsu.okcdn.ru/input/';
// const STREAM_KEY = '14601603391083_14040893622891_puxzrwjniu';
// const RTMP_DESTINATION = `${RTMP_SERVER}${STREAM_KEY}`;

// let browser = null;
// let ffmpegProcess = null;

// // 24/7 Infinite Loop
// async function mainLoop() {
//     while (true) {
//         try {
//             await startDirectStreaming();
//             console.log('[!] Stream function resolved unexpectedly. Restarting in 5s...');
//             await new Promise(resolve => setTimeout(resolve, 5000));
//         } catch (error) {
//             console.error('[!] Global Stream Error: Restarting in 5s...', error.message || error);
//             await cleanup();
//             await new Promise(resolve => setTimeout(resolve, 5000));
//         }
//     }
// }

// async function startDirectStreaming() {
//     console.log('[*] Starting browser and FFmpeg for LIVE 24/7 Streaming...');

//     const useProxy = process.env.USE_PROXY === 'ON';
//     const proxyIpPort = process.env.PROXY_IP_PORT || '31.59.20.176:6754';
//     const proxyUser = process.env.PROXY_USER || 'kexwytuq';
//     const proxyPass = process.env.PROXY_PASS || 'fw1k19a4lqfd';

//     const browserArgs = [
//         '--no-sandbox',
//         '--disable-setuid-sandbox',
//         '--window-size=1280,720',
//         '--kiosk', // Forces full-screen mode, hiding URL bar
//         '--autoplay-policy=no-user-gesture-required'
//     ];

//     if (useProxy) {
//         browserArgs.push(`--proxy-server=http://${proxyIpPort}`);
//     }

//     console.log(`Launching Browser on GitHub Actions Virtual Screen with Proxy: ${useProxy ? 'ON' : 'OFF'}...`);
//     browser = await puppeteer.launch({
//         channel: 'chrome',
//         headless: false, // Required for Xvfb display
//         defaultViewport: { width: 1280, height: 720 },
//         ignoreDefaultArgs: ['--enable-automation'], // Removes the "Chrome is being controlled" white bar
//         args: browserArgs
//     });

//     const page = await browser.newPage();

//     // Clean up default about:blank tab
//     const pages = await browser.pages();
//     for (const p of pages) {
//         if (p !== page) await p.close();
//     }

//     // Aggressive Ad-Popup Blocker & Focus Management
//     browser.on('targetcreated', async (target) => {
//         if (target.type() === 'page') {
//             try {
//                 const newPage = await target.page();
//                 if (newPage && newPage !== page) {
//                     console.log(`[*] Adware tab detected! Forcing video tab back to foreground visually...`);
//                     await page.bringToFront(); 
//                     setTimeout(() => newPage.close().catch(() => { }), 2000);
//                 }
//             } catch (e) { }
//         }
//     });

//     if (useProxy) {
//         await page.authenticate({ username: proxyUser, password: proxyPass });
//         console.log("Proxy credentials applied successfully.");
//     }

//     // GUI Visual Recorder (20 Sec Debug)
//     const recorder = new PuppeteerScreenRecorder(page);
//     await recorder.start('debug_video.mp4');
//     console.log('🎥 [*] 20-second Visual Debug Recording Started...');

//     setTimeout(async () => {
//         try {
//             await recorder.stop();
//             console.log('🛑 [*] Visual Screen recording stopped. Uploading to GitHub Releases...');
//             const tagName = `visual-debug-${Date.now()}`;
//             execSync(`gh release create ${tagName} debug_video.mp4 --title "Puppeteer Visual Capture"`, { stdio: 'inherit' });
//             console.log('✅ [+] Successfully uploaded visual debug wrapper!');
//         } catch (err) {
//             console.error('❌ [!] Failed to upload visual debug wrapper:', err.message);
//         }
//     }, 20000);

//     const displayNum = process.env.DISPLAY || ':99';

//     console.log(`[*] Navigating to target URL using Proxy...`);
//     await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

//     console.log('[*] Waiting for potential Cloudflare...');
//     for (let i = 0; i < 15; i++) {
//         const title = await page.title();
//         if (!title.includes('Moment') && !title.includes('Cloudflare')) break;
//         await new Promise(r => setTimeout(r, 1000));
//     }

//     await new Promise(resolve => setTimeout(resolve, 8000));

//     console.log('[*] Cleaning up ads visually...');
//     for (const frame of page.frames()) {
//         try {
//             await frame.evaluate(() => {
//                 const adElement = document.querySelector('div#dontfoid');
//                 if (adElement) adElement.remove();
//             });
//         } catch (e) { }
//     }

//     let targetFrame = null;
//     for (const frame of page.frames()) {
//         try {
//             const hasVideo = await frame.evaluate(() => !!document.querySelector('video'));
//             if (hasVideo) {
//                 targetFrame = frame;
//                 console.log(`[+] Found video element inside frame: ${frame.url() || 'unknown'}`);
//                 break;
//             }
//         } catch (e) { }
//     }

//     if (!targetFrame) throw new Error('No <video> element could be found.');

//     console.log('[*] Executing Audio Unmute and Wait Logic...');
//     await targetFrame.evaluate(async () => {
//         const video = document.querySelector('video');
//         if (!video) return false;
//         video.muted = false; 
//         await video.play().catch(e => {});
//         return true;
//     });

//     // =========================================================================
//     // 🛠️ REUSABLE FUNCTIONS (Watchdog controls these)
//     // =========================================================================

//     async function applyFullscreenHack() {
//         console.log('\n[*] Executing Fullscreen Script...');
//         const debugLogs = await targetFrame.evaluate(async () => {
//             let terminalLogs = [];
//             const vid = document.querySelector('video');
//             if (!vid) return terminalLogs;
            
//             try {
//                 if (vid.requestFullscreen) await vid.requestFullscreen();
//                 else if (vid.webkitRequestFullscreen) await vid.webkitRequestFullscreen();
//                 terminalLogs.push("🎉 RESULT: requestFullscreen() SUCCESS!");
//             } catch (err) {
//                 vid.style.position = 'fixed';
//                 vid.style.top = '0';
//                 vid.style.left = '0';
//                 vid.style.width = '100vw';
//                 vid.style.height = '100vh';
//                 vid.style.zIndex = '2147483647';
//                 vid.style.backgroundColor = 'black';
//                 vid.style.objectFit = 'contain';
//                 terminalLogs.push("✅ RESULT: CSS Force-Stretch Hack Successfully lag gaya!");
//             }
//             return terminalLogs;
//         });
//         for (const log of debugLogs) console.log(log);
//         await new Promise(r => setTimeout(r, 2000));
//     }

//     function startBroadcast() {
//         if (ffmpegProcess) return; 
        
//         console.log('\n[*] 🚀 Spawning FFmpeg in ULTRA-LOW BANDWIDTH Mode (For 40 KB/s Users)...');
//         ffmpegProcess = spawn('ffmpeg', [
//             '-y', 
//             '-use_wallclock_as_timestamps', '1', 
//             '-thread_queue_size', '1024',
            
//             // 1. Capture at Full HD/720p from Virtual Screen
//             '-f', 'x11grab', 
//             '-draw_mouse', '0', 
//             '-video_size', '1280x720', 
//             '-framerate', '20', // ⬇️ FPS reduced to save data
//             '-i', displayNum, 
            
//             '-thread_queue_size', '1024', 
//             '-f', 'pulse', 
//             '-i', 'default',
            
//             // 2. The Magic Scaler: Convert screen to 360p on the fly
//             '-vf', 'scale=640:360', 
            
//             // 3. Video Encoding (Extreme Compression)
//             '-c:v', 'libx264', 
//             '-preset', 'veryfast', 
//             '-profile:v', 'baseline', // 🌟 NAYA: Best for old phones/slow nets
//             '-b:v', '200k', // ⬇️ Video Bitrate (Super Light)
//             '-maxrate', '250k', 
//             '-bufsize', '500k',
//             '-pix_fmt', 'yuv420p', 
//             '-g', '40', 
            
//             // 4. Audio Encoding (Data Saver)
//             '-c:a', 'aac', 
//             '-b:a', '32k', // ⬇️ Audio Bitrate
//             '-ac', '1', // 🌟 NAYA: Mono Audio saves 50% data!
//             '-ar', '44100',
//             '-af', 'aresample=async=1', 
            
//             '-f', 'flv', 
//             RTMP_DESTINATION 
//         ]);

//         let heartbeatCount = 0;
//         let lastHeartbeatTime = Date.now();
//         const FIVE_MINUTES = 5 * 60 * 1000;

//         ffmpegProcess.stderr.on('data', (data) => {
//             const output = data.toString().trim();
//             if (output.includes('frame=') && output.includes('fps=')) {
//                 heartbeatCount++;
//                 const currentTime = Date.now();
//                 if (heartbeatCount <= 7) {
//                     console.log(`[FFmpeg ${heartbeatCount}/7]: ${output.substring(0, 100)}`);
//                     if (heartbeatCount === 7) console.log(`\n[✅ Success] Stream is live! Suppressing logs...`);
//                 } else if (currentTime - lastHeartbeatTime >= FIVE_MINUTES) {
//                     console.log(`[FFmpeg 5-Min Check]: ${output.substring(0, 100)}`);
//                     lastHeartbeatTime = currentTime; 
//                 }
//             } else if (output.includes('Error') || output.includes('Failed')) {
//                 console.log(`\n[FFmpeg Issue]: ${output}`);
//             }
//         });

//         ffmpegProcess.on('close', (code) => console.log(`\n[*] FFmpeg exited (Code: ${code})`));
//     }

//     function stopBroadcast() {
//         if (ffmpegProcess) {
//             console.log('\n🛑 [ACTION] Killing FFmpeg Process to stop OK.ru Broadcast!');
//             try {
//                 ffmpegProcess.stdin.end();
//                 ffmpegProcess.kill('SIGKILL'); 
//             } catch (e) { }
//             ffmpegProcess = null;
//         }
//     }

//     // =========================================================================
//     // 🚀 INITIAL STARTUP
//     // =========================================================================
//     await applyFullscreenHack();
//     startBroadcast();

//     // =========================================================================
//     // 🧠 THE SMART WATCHDOG 
//     // =========================================================================
//     console.log('\n[*] Smart Engine Connected! Monitoring Video Health 24/7...');
    
//     let isBroadcasting = true; 
//     let lastOfflineLogTime = 0;
//     const THREE_MINUTES = 3 * 60 * 1000;

//     while (true) {
//         if (!browser || !browser.isConnected()) throw new Error("Browser closed.");

//         let isVideoHealthy = false;
//         try {
//             isVideoHealthy = await targetFrame.evaluate(() => {
//                 const vid = document.querySelector('video');
//                 if (!vid || vid.clientWidth === 0 || vid.ended || vid.paused) return false;
//                 if (vid.clientWidth < (window.innerWidth * 0.5)) return false;
//                 return true;
//             });
//         } catch (e) {
//             isVideoHealthy = false; 
//             for (const frame of page.frames()) {
//                 try {
//                     const hasVid = await frame.evaluate(() => !!document.querySelector('video'));
//                     if (hasVid) { targetFrame = frame; break; }
//                 } catch(ex){}
//             }
//         }

//         // --- STATE 1: STREAM GOES OFFLINE ---
//         if (isBroadcasting && !isVideoHealthy) {
//             console.log('\n=================================================================');
//             console.log('❌ ❌ ❌ VIDEO STREAM OFFLINE, CRASHED OR PAUSED! ❌ ❌ ❌');
//             console.log('🛑 STOPPING FFmpeg BROADCAST IMMEDIATELY TO PROTECT VIEWERS!');
//             console.log('=================================================================\n');
//             stopBroadcast();
//             isBroadcasting = false;
//             lastOfflineLogTime = Date.now();
//         }

//         // --- STATE 2: WAITING FOR STREAM (Prints every 3 minutes) ---
//         else if (!isBroadcasting && !isVideoHealthy) {
//             const timeSinceLastLog = Date.now() - lastOfflineLogTime;
//             if (timeSinceLastLog >= THREE_MINUTES) {
//                 console.log('\n=================================================================');
//                 console.log('⚠️ ⚠️ ⚠️ STATUS: WAITING FOR STREAM ON THE SAME PAGE... ⚠️ ⚠️ ⚠️');
//                 console.log('⏳ STILL OFFLINE. FFMPEG IS DEAD. WAITING FOR MATCH TO RESUME.');
//                 console.log('=================================================================\n');
//                 lastOfflineLogTime = Date.now();
                
//                 try { await targetFrame.evaluate(() => { const v = document.querySelector('video'); if(v) v.play(); }); } catch(e){}
//             }
//         }

//         // --- STATE 3: STREAM COMES BACK ONLINE! ---
//         else if (!isBroadcasting && isVideoHealthy) {
//             console.log('\n=================================================================');
//             console.log('✅ ✅ ✅ VIDEO STREAM IS BACK ONLINE! ✅ ✅ ✅');
//             console.log('🔄 RE-APPLYING FULLSCREEN & RESTARTING OK.RU BROADCAST!');
//             console.log('=================================================================\n');
//             await applyFullscreenHack();
//             await new Promise(r => setTimeout(r, 2000));
//             startBroadcast();
//             isBroadcasting = true;
//         }

//         await new Promise(r => setTimeout(r, 3000));
//     }
// }

// async function cleanup() {
//     if (ffmpegProcess) {
//         try { ffmpegProcess.stdin.end(); ffmpegProcess.kill('SIGINT'); } catch (e) { }
//         ffmpegProcess = null;
//     }
//     if (browser) {
//         try { await browser.close(); } catch (e) { }
//         browser = null;
//     }
// }

// process.on('SIGINT', async () => {
//     console.log('\n[*] Stopping live script cleanly...');
//     await cleanup();
//     process.exit(0);
// });

// // Boot
// mainLoop();

























































































// ===================== opper waley code mei yeh setting add karty hai k kistra see buffering na hu (low data) ========================






// Agar stream off ho (ya ads aayen), toh page refresh NAHI karna.
// Fauran FFmpeg ko kill kar dena hai taake OK.ru par kachra/ads broadcast na hon.
// Usi page par wait karna hai aur har 3 minute baad GitHub logs mein BIG text print karna hai ke hum wait kar rahe hain.
// Jaise hi video wapas aaye, usko dobara Fullscreen karna hai aur FFmpeg ko wapas zinda kar ke OK.ru par stream resume kar deni hai.







// const puppeteer = require('puppeteer-extra');
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// puppeteer.use(StealthPlugin());

// const { spawn, execSync } = require('child_process');
// const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

// const TARGET_URL = 'https://dadocric.st/player.php?id=starsp3&v=m';
// const RTMP_SERVER = 'rtmp://vsu.okcdn.ru/input/';
// const STREAM_KEY = '14601603391083_14040893622891_puxzrwjniu';
// const RTMP_DESTINATION = `${RTMP_SERVER}${STREAM_KEY}`;

// let browser = null;
// let ffmpegProcess = null;

// // 24/7 Infinite Loop
// async function mainLoop() {
//     while (true) {
//         try {
//             await startDirectStreaming();
//             console.log('[!] Stream function resolved unexpectedly. Restarting in 5s...');
//             await new Promise(resolve => setTimeout(resolve, 5000));
//         } catch (error) {
//             console.error('[!] Global Stream Error: Restarting in 5s...', error.message || error);
//             await cleanup();
//             await new Promise(resolve => setTimeout(resolve, 5000));
//         }
//     }
// }

// async function startDirectStreaming() {
//     console.log('[*] Starting browser and FFmpeg for LIVE 24/7 Streaming...');

//     const useProxy = process.env.USE_PROXY === 'ON';
//     const proxyIpPort = process.env.PROXY_IP_PORT || '31.59.20.176:6754';
//     const proxyUser = process.env.PROXY_USER || 'kexwytuq';
//     const proxyPass = process.env.PROXY_PASS || 'fw1k19a4lqfd';

//     const browserArgs = [
//         '--no-sandbox',
//         '--disable-setuid-sandbox',
//         '--window-size=1280,720',
//         '--kiosk', 
//         '--autoplay-policy=no-user-gesture-required'
//     ];

//     if (useProxy) {
//         browserArgs.push(`--proxy-server=http://${proxyIpPort}`);
//     }

//     console.log(`Launching Browser on GitHub Actions Virtual Screen with Proxy: ${useProxy ? 'ON' : 'OFF'}...`);
//     browser = await puppeteer.launch({
//         channel: 'chrome',
//         headless: false, 
//         defaultViewport: { width: 1280, height: 720 },
//         ignoreDefaultArgs: ['--enable-automation'], 
//         args: browserArgs
//     });

//     const page = await browser.newPage();

//     const pages = await browser.pages();
//     for (const p of pages) {
//         if (p !== page) await p.close();
//     }

//     // Aggressive Ad-Popup Blocker & Focus Management
//     browser.on('targetcreated', async (target) => {
//         if (target.type() === 'page') {
//             try {
//                 const newPage = await target.page();
//                 if (newPage && newPage !== page) {
//                     console.log(`[*] Adware tab detected! Forcing video tab back to foreground visually...`);
//                     await page.bringToFront(); 
//                     setTimeout(() => newPage.close().catch(() => { }), 2000);
//                 }
//             } catch (e) { }
//         }
//     });

//     if (useProxy) {
//         await page.authenticate({ username: proxyUser, password: proxyPass });
//         console.log("Proxy credentials applied successfully.");
//     }

//     const recorder = new PuppeteerScreenRecorder(page);
//     await recorder.start('debug_video.mp4');
//     console.log('🎥 [*] 20-second Visual Debug Recording Started...');

//     setTimeout(async () => {
//         try {
//             await recorder.stop();
//             console.log('🛑 [*] Visual Screen recording stopped. Uploading to GitHub Releases...');
//             const tagName = `visual-debug-${Date.now()}`;
//             execSync(`gh release create ${tagName} debug_video.mp4 --title "Puppeteer Visual Capture"`, { stdio: 'inherit' });
//             console.log('✅ [+] Successfully uploaded visual debug wrapper!');
//         } catch (err) {
//             console.error('❌ [!] Failed to upload visual debug wrapper:', err.message);
//         }
//     }, 20000);

//     const displayNum = process.env.DISPLAY || ':99';

//     console.log(`[*] Navigating to target URL using Proxy...`);
//     await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

//     console.log('[*] Waiting for potential Cloudflare...');
//     for (let i = 0; i < 15; i++) {
//         const title = await page.title();
//         if (!title.includes('Moment') && !title.includes('Cloudflare')) break;
//         await new Promise(r => setTimeout(r, 1000));
//     }

//     await new Promise(resolve => setTimeout(resolve, 8000));

//     console.log('[*] Cleaning up ads visually...');
//     for (const frame of page.frames()) {
//         try {
//             await frame.evaluate(() => {
//                 const adElement = document.querySelector('div#dontfoid');
//                 if (adElement) adElement.remove();
//             });
//         } catch (e) { }
//     }

//     let targetFrame = null;
//     for (const frame of page.frames()) {
//         try {
//             const hasVideo = await frame.evaluate(() => !!document.querySelector('video'));
//             if (hasVideo) {
//                 targetFrame = frame;
//                 console.log(`[+] Found video element inside frame: ${frame.url() || 'unknown'}`);
//                 break;
//             }
//         } catch (e) { }
//     }

//     if (!targetFrame) throw new Error('No <video> element could be found.');

//     console.log('[*] Executing Audio Unmute and Wait Logic...');
//     await targetFrame.evaluate(async () => {
//         const video = document.querySelector('video');
//         if (!video) return false;
//         video.muted = false; 
//         await video.play().catch(e => {});
//         return true;
//     });

//     // =========================================================================
//     // 🛠️ REUSABLE FUNCTIONS (Inko Watchdog control karega)
//     // =========================================================================

//     async function applyFullscreenHack() {
//         console.log('\n[*] Executing Fullscreen Script...');
//         const debugLogs = await targetFrame.evaluate(async () => {
//             let terminalLogs = [];
//             const vid = document.querySelector('video');
//             if (!vid) return terminalLogs;
            
//             try {
//                 if (vid.requestFullscreen) await vid.requestFullscreen();
//                 else if (vid.webkitRequestFullscreen) await vid.webkitRequestFullscreen();
//                 terminalLogs.push("🎉 RESULT: requestFullscreen() SUCCESS!");
//             } catch (err) {
//                 vid.style.position = 'fixed';
//                 vid.style.top = '0';
//                 vid.style.left = '0';
//                 vid.style.width = '100vw';
//                 vid.style.height = '100vh';
//                 vid.style.zIndex = '2147483647';
//                 vid.style.backgroundColor = 'black';
//                 vid.style.objectFit = 'contain';
//                 terminalLogs.push("✅ RESULT: CSS Force-Stretch Hack Successfully lag gaya!");
//             }
//             return terminalLogs;
//         });
//         for (const log of debugLogs) console.log(log);
//         await new Promise(r => setTimeout(r, 2000));
//     }

//     function startBroadcast() {
//         if (ffmpegProcess) return; // Agar pehle se chal raha hai toh naya mat banao
        
//         console.log('\n[*] 🚀 Spawning FFmpeg to capture raw X11 Display & Broadcast to OK.ru...');
//         ffmpegProcess = spawn('ffmpeg', [
//             '-y', '-use_wallclock_as_timestamps', '1', '-thread_queue_size', '1024',
//             '-f', 'x11grab', '-draw_mouse', '0', '-video_size', '1280x720', '-framerate', '30',
//             '-i', displayNum, '-thread_queue_size', '1024', '-f', 'pulse', '-i', 'default',
//             '-c:v', 'libx264', '-preset', 'veryfast', '-maxrate', '3000k', '-bufsize', '6000k',
//             '-pix_fmt', 'yuv420p', '-g', '60', '-c:a', 'aac', '-b:a', '128k', '-ar', '44100',
//             '-af', 'aresample=async=1', '-f', 'flv', RTMP_DESTINATION 
//         ]);

//         let heartbeatCount = 0;
//         let lastHeartbeatTime = Date.now();
//         const FIVE_MINUTES = 5 * 60 * 1000;

//         ffmpegProcess.stderr.on('data', (data) => {
//             const output = data.toString().trim();
//             if (output.includes('frame=') && output.includes('fps=')) {
//                 heartbeatCount++;
//                 const currentTime = Date.now();
//                 if (heartbeatCount <= 7) {
//                     console.log(`[FFmpeg ${heartbeatCount}/7]: ${output.substring(0, 100)}`);
//                     if (heartbeatCount === 7) console.log(`\n[✅ Success] Stream is live! Suppressing logs...`);
//                 } else if (currentTime - lastHeartbeatTime >= FIVE_MINUTES) {
//                     console.log(`[FFmpeg 5-Min Check]: ${output.substring(0, 100)}`);
//                     lastHeartbeatTime = currentTime; 
//                 }
//             } else if (output.includes('Error') || output.includes('Failed')) {
//                 console.log(`\n[FFmpeg Issue]: ${output}`);
//             }
//         });

//         ffmpegProcess.on('close', (code) => console.log(`\n[*] FFmpeg exited (Code: ${code})`));
//     }

//     function stopBroadcast() {
//         if (ffmpegProcess) {
//             console.log('\n🛑 [ACTION] Killing FFmpeg Process to stop OK.ru Broadcast!');
//             try {
//                 ffmpegProcess.stdin.end();
//                 ffmpegProcess.kill('SIGKILL'); // Zabardasti kill karo
//             } catch (e) { }
//             ffmpegProcess = null;
//         }
//     }

//     // =========================================================================
//     // 🚀 INITIAL STARTUP
//     // =========================================================================
//     await applyFullscreenHack();
//     startBroadcast();

//     // =========================================================================
//     // 🧠 THE SMART WATCHDOG (Your requested logic)
//     // =========================================================================
//     console.log('\n[*] Smart Engine Connected! Monitoring Video Health 24/7...');
    
//     let isBroadcasting = true; // State tracker
//     let lastOfflineLogTime = 0;
//     const THREE_MINUTES = 3 * 60 * 1000;

//     while (true) {
//         if (!browser || !browser.isConnected()) throw new Error("Browser closed.");

//         let isVideoHealthy = false;
//         try {
//             // Check if video is playing, visible, and full size
//             isVideoHealthy = await targetFrame.evaluate(() => {
//                 const vid = document.querySelector('video');
//                 if (!vid || vid.clientWidth === 0 || vid.ended || vid.paused) return false;
//                 // Agar video screen se bohot choti ho gayi (ads aa gaye) toh offline maano
//                 if (vid.clientWidth < (window.innerWidth * 0.5)) return false;
//                 return true;
//             });
//         } catch (e) {
//             // Agar website ne iframe hi refresh kar diya ho
//             isVideoHealthy = false; 
            
//             // Re-find karne ki koshish karo usi page par
//             for (const frame of page.frames()) {
//                 try {
//                     const hasVid = await frame.evaluate(() => !!document.querySelector('video'));
//                     if (hasVid) { targetFrame = frame; break; }
//                 } catch(ex){}
//             }
//         }

//         // --- STATE 1: STREAM GOES OFFLINE ---
//         if (isBroadcasting && !isVideoHealthy) {
//             console.log('\n=================================================================');
//             console.log('❌ ❌ ❌ VIDEO STREAM OFFLINE, CRASHED OR PAUSED! ❌ ❌ ❌');
//             console.log('🛑 STOPPING FFmpeg BROADCAST IMMEDIATELY TO PROTECT VIEWERS!');
//             console.log('=================================================================\n');
//             stopBroadcast();
//             isBroadcasting = false;
//             lastOfflineLogTime = Date.now();
//         }

//         // --- STATE 2: WAITING FOR STREAM (Prints every 3 minutes) ---
//         else if (!isBroadcasting && !isVideoHealthy) {
//             const timeSinceLastLog = Date.now() - lastOfflineLogTime;
//             if (timeSinceLastLog >= THREE_MINUTES) {
//                 console.log('\n=================================================================');
//                 console.log('⚠️ ⚠️ ⚠️ STATUS: WAITING FOR STREAM ON THE SAME PAGE... ⚠️ ⚠️ ⚠️');
//                 console.log('⏳ STILL OFFLINE. FFMPEG IS DEAD. WAITING FOR MATCH TO RESUME.');
//                 console.log('=================================================================\n');
//                 lastOfflineLogTime = Date.now();
                
//                 // Extra Push: Agar player pause par phansa hai toh usay play karne ki koshish karega
//                 try { await targetFrame.evaluate(() => { const v = document.querySelector('video'); if(v) v.play(); }); } catch(e){}
//             }
//         }

//         // --- STATE 3: STREAM COMES BACK ONLINE! ---
//         else if (!isBroadcasting && isVideoHealthy) {
//             console.log('\n=================================================================');
//             console.log('✅ ✅ ✅ VIDEO STREAM IS BACK ONLINE! ✅ ✅ ✅');
//             console.log('🔄 RE-APPLYING FULLSCREEN & RESTARTING OK.RU BROADCAST!');
//             console.log('=================================================================\n');
//             await applyFullscreenHack();
//             await new Promise(r => setTimeout(r, 2000));
//             startBroadcast();
//             isBroadcasting = true;
//         }

//         // Har 3 second baad monitor check karega
//         await new Promise(r => setTimeout(r, 3000));
//     }
// }

// async function cleanup() {
//     if (ffmpegProcess) {
//         try { ffmpegProcess.stdin.end(); ffmpegProcess.kill('SIGINT'); } catch (e) { }
//         ffmpegProcess = null;
//     }
//     if (browser) {
//         try { await browser.close(); } catch (e) { }
//         browser = null;
//     }
// }

// process.on('SIGINT', async () => {
//     console.log('\n[*] Stopping live script cleanly...');
//     await cleanup();
//     process.exit(0);
// });

// // Boot
// mainLoop();
















































































































































































































// ========= Done Alhamdullah, bas eek or cheez add karney hai k during running agar crichd mei wo stream off hu qaye tu issue ye tha k woo fullscreen off hu jata tha and pher see full website capture karky ok.ru ko sent karta tha , yeh belwo code mei yeh issue hai ===========================






// const puppeteer = require('puppeteer-extra');
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// puppeteer.use(StealthPlugin());

// const { spawn, execSync } = require('child_process');
// const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

// const TARGET_URL = 'https://dadocric.st/player.php?id=starsp3&v=m';
// const RTMP_SERVER = 'rtmp://vsu.okcdn.ru/input/';
// const STREAM_KEY = '14601603391083_14040893622891_puxzrwjniu';
// const RTMP_DESTINATION = `${RTMP_SERVER}${STREAM_KEY}`;

// let browser = null;
// let ffmpegProcess = null;

// // 24/7 Infinite Loop
// async function mainLoop() {
//     while (true) {
//         try {
//             await startDirectStreaming();
//             console.log('[!] Stream function resolved unexpectedly. Restarting in 5s...');
//             await new Promise(resolve => setTimeout(resolve, 5000));
//         } catch (error) {
//             console.error('[!] Global Stream Error: Restarting in 5s...', error.message || error);
//             await cleanup();
//             await new Promise(resolve => setTimeout(resolve, 5000));
//         }
//     }
// }

// async function startDirectStreaming() {
//     console.log('[*] Starting browser and FFmpeg for LIVE 24/7 Streaming...');

//     const useProxy = process.env.USE_PROXY === 'ON';
//     const proxyIpPort = process.env.PROXY_IP_PORT || '31.59.20.176:6754';
//     const proxyUser = process.env.PROXY_USER || 'kexwytuq';
//     const proxyPass = process.env.PROXY_PASS || 'fw1k19a4lqfd';

//     const browserArgs = [
//         '--no-sandbox',
//         '--disable-setuid-sandbox',
//         '--window-size=1280,720',
//         '--kiosk', // Forces full-screen mode, hiding URL bar
//         '--autoplay-policy=no-user-gesture-required'
//     ];

//     if (useProxy) {
//         browserArgs.push(`--proxy-server=http://${proxyIpPort}`);
//     }

//     console.log(`Launching Browser on GitHub Actions Virtual Screen with Proxy: ${useProxy ? 'ON' : 'OFF'}...`);
//     browser = await puppeteer.launch({
//         channel: 'chrome',
//         headless: false, // Required for Xvfb display
//         defaultViewport: { width: 1280, height: 720 },
//         ignoreDefaultArgs: ['--enable-automation'], // Removes the "Chrome is being controlled" white bar
//         args: browserArgs
//     });

//     const page = await browser.newPage();

//     // Clean up default about:blank tab
//     const pages = await browser.pages();
//     for (const p of pages) {
//         if (p !== page) await p.close();
//     }

//     // Aggressive Ad-Popup Blocker & Focus Management
//     browser.on('targetcreated', async (target) => {
//         if (target.type() === 'page') {
//             try {
//                 const newPage = await target.page();
//                 if (newPage && newPage !== page) {
//                     console.log(`[*] Adware tab detected! Forcing video tab back to foreground visually...`);
//                     await page.bringToFront(); 
//                     setTimeout(() => newPage.close().catch(() => { }), 2000);
//                 }
//             } catch (e) { }
//         }
//     });

//     if (useProxy) {
//         await page.authenticate({ username: proxyUser, password: proxyPass });
//         console.log("Proxy credentials applied successfully.");
//     }

//     // GUI Visual Recorder (20 Sec Debug)
//     const recorder = new PuppeteerScreenRecorder(page);
//     await recorder.start('debug_video.mp4');
//     console.log('🎥 [*] 20-second Visual Debug Recording Started...');

//     setTimeout(async () => {
//         try {
//             await recorder.stop();
//             console.log('🛑 [*] Visual Screen recording stopped. Uploading to GitHub Releases...');
//             const tagName = `visual-debug-${Date.now()}`;
//             execSync(`gh release create ${tagName} debug_video.mp4 --title "Puppeteer Visual Capture"`, { stdio: 'inherit' });
//             console.log('✅ [+] Successfully uploaded visual debug wrapper!');
//         } catch (err) {
//             console.error('❌ [!] Failed to upload visual debug wrapper:', err.message);
//         }
//     }, 20000);

//     const displayNum = process.env.DISPLAY || ':99';

//     console.log(`[*] Navigating to target URL using Proxy...`);
//     await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

//     console.log('[*] Waiting for potential Cloudflare...');
//     for (let i = 0; i < 15; i++) {
//         const title = await page.title();
//         if (!title.includes('Moment') && !title.includes('Cloudflare')) break;
//         await new Promise(r => setTimeout(r, 1000));
//     }

//     await new Promise(resolve => setTimeout(resolve, 8000));

//     console.log('[*] Cleaning up ads visually...');
//     for (const frame of page.frames()) {
//         try {
//             await frame.evaluate(() => {
//                 const adElement = document.querySelector('div#dontfoid');
//                 if (adElement) adElement.remove();
//             });
//         } catch (e) { }
//     }

//     let targetFrame = null;
//     for (const frame of page.frames()) {
//         try {
//             const hasVideo = await frame.evaluate(() => !!document.querySelector('video'));
//             if (hasVideo) {
//                 targetFrame = frame;
//                 console.log(`[+] Found video element inside frame: ${frame.url() || 'unknown'}`);
//                 break;
//             }
//         } catch (e) { }
//     }

//     if (!targetFrame) throw new Error('No <video> element could be found.');

//     // In-Browser Injection: Unmute & Start Video Playback
//     console.log('[*] Executing Audio Unmute and Wait Logic...');
//     await targetFrame.evaluate(async () => {
//         const video = document.querySelector('video');
//         if (!video) return false;

//         video.muted = false; // Unmute so audio flows to PulseAudio
//         await video.play().catch(e => {});

//         await new Promise((resolve) => {
//             let elapsed = 0;
//             const interval = setInterval(() => {
//                 elapsed += 500;
//                 if (video.videoWidth > 0 && video.readyState >= 3) {
//                     clearInterval(interval);
//                     resolve();
//                 } else if (elapsed > 60000) {
//                     clearInterval(interval);
//                     resolve();
//                 }
//             }, 500);
//         });
//         return true;
//     });

//     console.log('[*] Executing GitHub Logs Debugging & Fullscreen Script...');
    
//     // Iframe ke andar ke logs collect kar ke Node.js ko wapas bhejenge
//     const debugLogs = await targetFrame.evaluate(async () => {
//         let terminalLogs = [];
//         terminalLogs.push("\n=======================================================");
//         terminalLogs.push("🔍 BROWSER FULLSCREEN DEBUG REPORT");
//         terminalLogs.push("=======================================================");
        
//         const vid = document.querySelector('video');
        
//         if (vid) {
//             terminalLogs.push("✅ STEP 1: YES! document.querySelector('video') mil gaya hai.");
//         } else {
//             terminalLogs.push("❌ STEP 1: NO! Video element iframe mein nahi mila.");
//             return terminalLogs;
//         }

//         terminalLogs.push("⏳ STEP 2: Native requestFullscreen() apply kar rahe hain...");
//         try {
//             if (vid.requestFullscreen) {
//                 await vid.requestFullscreen();
//             } else if (vid.webkitRequestFullscreen) {
//                 await vid.webkitRequestFullscreen();
//             }
//             terminalLogs.push("🎉 RESULT: requestFullscreen() SUCCESS! Browser ne allow kar diya.");
//         } catch (err) {
//             terminalLogs.push("❌ RESULT: requestFullscreen() FAILED.");
//             terminalLogs.push("⚠️ REASON: " + err.name + " - " + err.message);
            
//             terminalLogs.push("🛠️ STEP 3: CSS Force-Stretch Hack apply kar rahe hain...");
//             vid.style.position = 'fixed';
//             vid.style.top = '0';
//             vid.style.left = '0';
//             vid.style.width = '100vw';
//             vid.style.height = '100vh';
//             vid.style.zIndex = '2147483647';
//             vid.style.backgroundColor = 'black';
//             vid.style.objectFit = 'contain';
//             terminalLogs.push("✅ RESULT: CSS Force-Stretch Hack Successfully lag gaya!");
//         }
        
//         terminalLogs.push("=======================================================\n");
//         return terminalLogs;
//     });

//     // Node.js (GitHub Actions) zabardasti in logs ko print karega
//     for (const log of debugLogs) {
//         console.log(log);
//     }

//     await new Promise(r => setTimeout(r, 2000)); // wait for transitions

//     console.log('[*] Video playing! Spawning FFmpeg to capture raw X11 Display (bypasses all DRM)...');

//     ffmpegProcess = spawn('ffmpeg', [
//         '-y',
//         '-use_wallclock_as_timestamps', '1',
//         '-thread_queue_size', '1024',
//         '-f', 'x11grab',
//         '-draw_mouse', '0', 
//         '-video_size', '1280x720',
//         '-framerate', '30',
//         '-i', displayNum,
//         '-thread_queue_size', '1024',
//         '-f', 'pulse',
//         '-i', 'default',
//         '-c:v', 'libx264',
//         '-preset', 'veryfast',
//         '-maxrate', '3000k',
//         '-bufsize', '6000k',
//         '-pix_fmt', 'yuv420p',
//         '-g', '60',
//         '-c:a', 'aac',
//         '-b:a', '128k',
//         '-ar', '44100',
//         '-af', 'aresample=async=1', 
//         '-f', 'flv',
//         RTMP_DESTINATION 
//     ]);

//     // 🚀 LOG THROTTLER - GitHub Action Memory Saver
//     let heartbeatCount = 0;
//     let lastHeartbeatTime = 0;
//     const FIVE_MINUTES = 5 * 60 * 1000; // 5 minutes in milliseconds

//     ffmpegProcess.stderr.on('data', (data) => {
//         const output = data.toString().trim();
        
//         if (output.includes('frame=') && output.includes('fps=')) {
//             heartbeatCount++;
//             const currentTime = Date.now();

//             // Pehle 7 heartbeats ko print karein
//             if (heartbeatCount <= 7) {
//                 console.log(`[FFmpeg Heartbeat ${heartbeatCount}/7]: ${output.substring(0, 120)}`);
                
//                 if (heartbeatCount === 7) {
//                     lastHeartbeatTime = currentTime;
//                     console.log(`\n[✅ Success] Initial stream check passed! Now suppressing logs to save GitHub Action memory. Next heartbeat in 5 minutes...\n`);
//                 }
//             } 
//             // 7 ke baad sirf tab print karein jab 5 minute guzar chuke hon
//             else if (currentTime - lastHeartbeatTime >= FIVE_MINUTES) {
//                 console.log(`[FFmpeg 5-Min Active Check]: ${output.substring(0, 120)}`);
//                 lastHeartbeatTime = currentTime; // Timer reset karein
//             }
//         } 
//         // Agar koi asal error aaye toh usko hide nahi karna
//         else if (output.includes('Error') || output.includes('Failed') || output.includes('Invalid')) {
//             console.log(`\n[FFmpeg Issue]: ${output}`);
//         }
//     });

//     ffmpegProcess.stdin.on('error', (err) => console.log(`\n[!] ffmpeg stdin closed (${err.code}).`));
//     ffmpegProcess.on('close', (code) => console.log(`\n[*] FFmpeg process exited with code ${code}`));
//     ffmpegProcess.on('error', (err) => console.error('\n[!] FFmpeg failed to start.', err));

//     // Node Watchdog
//     console.log('\n[*] Engine successfully connected! Live 24/7 Broadcast is running to OK.ru...');
//     while (true) {
//         if (!browser || !browser.isConnected()) {
//             throw new Error("Browser was closed intentionally by Detector.");
//         }
//         if (!ffmpegProcess || ffmpegProcess.exitCode !== null) {
//             throw new Error("FFmpeg process died unexpectedly.");
//         }
//         await new Promise(r => setTimeout(r, 2000));
//     }
// }

// async function cleanup() {
//     if (ffmpegProcess) {
//         try {
//             ffmpegProcess.stdin.end();
//             ffmpegProcess.kill('SIGINT');
//         } catch (e) { }
//         ffmpegProcess = null;
//     }
//     if (browser) {
//         try {
//             await browser.close();
//         } catch (e) { }
//         browser = null;
//     }
// }

// process.on('SIGINT', async () => {
//     console.log('\n[*] Stopping live script cleanly...');
//     await cleanup();
//     process.exit(0);
// });

// // Boot
// mainLoop();






















// ======= yes print statment done,abb opper code mei yeh ffpmeg k print statment ko kaam karna hai , yeh bohot zyda print hu rahey hai ================


// const puppeteer = require('puppeteer-extra');
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// puppeteer.use(StealthPlugin());

// const { spawn, execSync } = require('child_process');
// const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

// const TARGET_URL = 'https://dadocric.st/player.php?id=starsp3&v=m';
// const RTMP_SERVER = 'rtmp://vsu.okcdn.ru/input/';
// const STREAM_KEY = '14601603391083_14040893622891_puxzrwjniu';
// const RTMP_DESTINATION = `${RTMP_SERVER}${STREAM_KEY}`;

// let browser = null;
// let ffmpegProcess = null;

// // 24/7 Infinite Loop
// async function mainLoop() {
//     while (true) {
//         try {
//             await startDirectStreaming();
//             console.log('[!] Stream function resolved unexpectedly. Restarting in 5s...');
//             await new Promise(resolve => setTimeout(resolve, 5000));
//         } catch (error) {
//             console.error('[!] Global Stream Error: Restarting in 5s...', error.message || error);
//             await cleanup();
//             await new Promise(resolve => setTimeout(resolve, 5000));
//         }
//     }
// }

// async function startDirectStreaming() {
//     console.log('[*] Starting browser and FFmpeg for LIVE 24/7 Streaming...');

//     const useProxy = process.env.USE_PROXY === 'ON';
//     const proxyIpPort = process.env.PROXY_IP_PORT || '31.59.20.176:6754';
//     const proxyUser = process.env.PROXY_USER || 'kexwytuq';
//     const proxyPass = process.env.PROXY_PASS || 'fw1k19a4lqfd';

//     const browserArgs = [
//         '--no-sandbox',
//         '--disable-setuid-sandbox',
//         '--window-size=1280,720',
//         '--kiosk', // Forces full-screen mode, hiding URL bar
//         '--autoplay-policy=no-user-gesture-required'
//     ];

//     if (useProxy) {
//         browserArgs.push(`--proxy-server=http://${proxyIpPort}`);
//     }

//     console.log(`Launching Browser on GitHub Actions Virtual Screen with Proxy: ${useProxy ? 'ON' : 'OFF'}...`);
//     browser = await puppeteer.launch({
//         channel: 'chrome',
//         headless: false, // Required for Xvfb display
//         defaultViewport: { width: 1280, height: 720 },
//         ignoreDefaultArgs: ['--enable-automation'], // Removes the "Chrome is being controlled" white bar
//         args: browserArgs
//     });

//     const page = await browser.newPage();

//     // Clean up default about:blank tab
//     const pages = await browser.pages();
//     for (const p of pages) {
//         if (p !== page) await p.close();
//     }

//     // Aggressive Ad-Popup Blocker & Focus Management
//     browser.on('targetcreated', async (target) => {
//         if (target.type() === 'page') {
//             try {
//                 const newPage = await target.page();
//                 if (newPage && newPage !== page) {
//                     console.log(`[*] Adware tab detected! Forcing video tab back to foreground visually...`);
//                     await page.bringToFront(); 
//                     setTimeout(() => newPage.close().catch(() => { }), 2000);
//                 }
//             } catch (e) { }
//         }
//     });

//     if (useProxy) {
//         await page.authenticate({ username: proxyUser, password: proxyPass });
//         console.log("Proxy credentials applied successfully.");
//     }

//     // GUI Visual Recorder (20 Sec Debug)
//     const recorder = new PuppeteerScreenRecorder(page);
//     await recorder.start('debug_video.mp4');
//     console.log('🎥 [*] 20-second Visual Debug Recording Started...');

//     setTimeout(async () => {
//         try {
//             await recorder.stop();
//             console.log('🛑 [*] Visual Screen recording stopped. Uploading to GitHub Releases...');
//             const tagName = `visual-debug-${Date.now()}`;
//             execSync(`gh release create ${tagName} debug_video.mp4 --title "Puppeteer Visual Capture"`, { stdio: 'inherit' });
//             console.log('✅ [+] Successfully uploaded visual debug wrapper!');
//         } catch (err) {
//             console.error('❌ [!] Failed to upload visual debug wrapper:', err.message);
//         }
//     }, 20000);

//     const displayNum = process.env.DISPLAY || ':99';

//     console.log(`[*] Navigating to target URL using Proxy...`);
//     await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

//     console.log('[*] Waiting for potential Cloudflare...');
//     for (let i = 0; i < 15; i++) {
//         const title = await page.title();
//         if (!title.includes('Moment') && !title.includes('Cloudflare')) break;
//         await new Promise(r => setTimeout(r, 1000));
//     }

//     await new Promise(resolve => setTimeout(resolve, 8000));

//     console.log('[*] Cleaning up ads visually...');
//     for (const frame of page.frames()) {
//         try {
//             await frame.evaluate(() => {
//                 const adElement = document.querySelector('div#dontfoid');
//                 if (adElement) adElement.remove();
//             });
//         } catch (e) { }
//     }

//     let targetFrame = null;
//     for (const frame of page.frames()) {
//         try {
//             const hasVideo = await frame.evaluate(() => !!document.querySelector('video'));
//             if (hasVideo) {
//                 targetFrame = frame;
//                 console.log(`[+] Found video element inside frame: ${frame.url() || 'unknown'}`);
//                 break;
//             }
//         } catch (e) { }
//     }

//     if (!targetFrame) throw new Error('No <video> element could be found.');

//     // In-Browser Injection: Unmute & Start Video Playback
//     console.log('[*] Executing Audio Unmute and Wait Logic...');
//     await targetFrame.evaluate(async () => {
//         const video = document.querySelector('video');
//         if (!video) return false;

//         video.muted = false; // Unmute so audio flows to PulseAudio
//         await video.play().catch(e => {});

//         await new Promise((resolve) => {
//             let elapsed = 0;
//             const interval = setInterval(() => {
//                 elapsed += 500;
//                 if (video.videoWidth > 0 && video.readyState >= 3) {
//                     clearInterval(interval);
//                     resolve();
//                 } else if (elapsed > 60000) {
//                     clearInterval(interval);
//                     resolve();
//                 }
//             }, 500);
//         });
//         return true;
//     });

//     console.log('[*] Executing GitHub Logs Debugging & Fullscreen Script...');
    
//     // NEW: Iframe ke andar ke logs collect kar ke Node.js ko wapas bhejenge
//     const debugLogs = await targetFrame.evaluate(async () => {
//         let terminalLogs = [];
//         terminalLogs.push("\n=======================================================");
//         terminalLogs.push("🔍 BROWSER FULLSCREEN DEBUG REPORT");
//         terminalLogs.push("=======================================================");
        
//         const vid = document.querySelector('video');
        
//         // 1. Check if Video Exists
//         if (vid) {
//             terminalLogs.push("✅ STEP 1: YES! document.querySelector('video') mil gaya hai.");
//         } else {
//             terminalLogs.push("❌ STEP 1: NO! Video element iframe mein nahi mila.");
//             return terminalLogs;
//         }

//         // 2. Try Native Fullscreen API
//         terminalLogs.push("⏳ STEP 2: Native requestFullscreen() apply kar rahe hain...");
//         try {
//             if (vid.requestFullscreen) {
//                 await vid.requestFullscreen();
//             } else if (vid.webkitRequestFullscreen) {
//                 await vid.webkitRequestFullscreen();
//             }
//             terminalLogs.push("🎉 RESULT: requestFullscreen() SUCCESS! Browser ne allow kar diya.");
//         } catch (err) {
//             // Agar HTML5 fullscreen block ho jaye
//             terminalLogs.push("❌ RESULT: requestFullscreen() FAILED.");
//             terminalLogs.push("⚠️ REASON: " + err.name + " - " + err.message);
            
//             // 3. Fallback: Force CSS Stretch so stream doesn't look bad
//             terminalLogs.push("🛠️ STEP 3: CSS Force-Stretch Hack apply kar rahe hain...");
//             vid.style.position = 'fixed';
//             vid.style.top = '0';
//             vid.style.left = '0';
//             vid.style.width = '100vw';
//             vid.style.height = '100vh';
//             vid.style.zIndex = '2147483647';
//             vid.style.backgroundColor = 'black';
//             vid.style.objectFit = 'contain';
//             terminalLogs.push("✅ RESULT: CSS Force-Stretch Hack Successfully lag gaya!");
//         }
        
//         terminalLogs.push("=======================================================\n");
//         return terminalLogs;
//     });

//     // Node.js (GitHub Actions) zabardasti in logs ko print karega
//     for (const log of debugLogs) {
//         console.log(log);
//     }

//     await new Promise(r => setTimeout(r, 2000)); // wait for transitions

//     console.log('[*] Video playing! Spawning FFmpeg to capture raw X11 Display (bypasses all DRM)...');

//     ffmpegProcess = spawn('ffmpeg', [
//         '-y',
//         '-use_wallclock_as_timestamps', '1',
//         '-thread_queue_size', '1024',
//         '-f', 'x11grab',
//         '-draw_mouse', '0', 
//         '-video_size', '1280x720',
//         '-framerate', '30',
//         '-i', displayNum,
//         '-thread_queue_size', '1024',
//         '-f', 'pulse',
//         '-i', 'default',
//         '-c:v', 'libx264',
//         '-preset', 'veryfast',
//         '-maxrate', '3000k',
//         '-bufsize', '6000k',
//         '-pix_fmt', 'yuv420p',
//         '-g', '60',
//         '-c:a', 'aac',
//         '-b:a', '128k',
//         '-ar', '44100',
//         '-af', 'aresample=async=1', 
//         '-f', 'flv',
//         RTMP_DESTINATION 
//     ]);

//     ffmpegProcess.stderr.on('data', (data) => {
//         const output = data.toString().trim();
//         if (output.includes('frame=') && output.includes('fps=')) {
//             process.stdout.write(`\r[FFmpeg Heartbeat]: ${output.substring(0, 100)}`);
//         } else if (output.includes('Error') || output.includes('Failed')) {
//             console.log(`\n[FFmpeg Issue]: ${output}`);
//         }
//     });

//     ffmpegProcess.stdin.on('error', (err) => console.log(`\n[!] ffmpeg stdin closed (${err.code}).`));
//     ffmpegProcess.on('close', (code) => console.log(`\n[*] FFmpeg process exited with code ${code}`));
//     ffmpegProcess.on('error', (err) => console.error('\n[!] FFmpeg failed to start.', err));

//     // Node Watchdog
//     console.log('\n[*] Engine successfully connected! Live 24/7 Broadcast is running to OK.ru...');
//     while (true) {
//         if (!browser || !browser.isConnected()) {
//             throw new Error("Browser was closed intentionally by Detector.");
//         }
//         if (!ffmpegProcess || ffmpegProcess.exitCode !== null) {
//             throw new Error("FFmpeg process died unexpectedly.");
//         }
//         await new Promise(r => setTimeout(r, 2000));
//     }
// }

// async function cleanup() {
//     if (ffmpegProcess) {
//         try {
//             ffmpegProcess.stdin.end();
//             ffmpegProcess.kill('SIGINT');
//         } catch (e) { }
//         ffmpegProcess = null;
//     }
//     if (browser) {
//         try {
//             await browser.close();
//         } catch (e) { }
//         browser = null;
//     }
// }

// process.on('SIGINT', async () => {
//     console.log('\n[*] Stopping live script cleanly...');
//     await cleanup();
//     process.exit(0);
// });

// // Boot
// mainLoop();





















































































































// ============== Alhamdullah Done, fullscreen done,audio done , Alhamdullah, opper code mei yeh print nahey huwaa k selector hai ya nhey yeh fullscreen k liye hai (document.querySelector('video').requestFullscreen();)  =======================




// const puppeteer = require('puppeteer-extra');
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// puppeteer.use(StealthPlugin());

// const { spawn, execSync } = require('child_process');
// const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

// const TARGET_URL = 'https://dadocric.st/player.php?id=starsp3&v=m';
// const RTMP_SERVER = 'rtmp://vsu.okcdn.ru/input/';
// const STREAM_KEY = '14601603391083_14040893622891_puxzrwjniu';
// const RTMP_DESTINATION = `${RTMP_SERVER}${STREAM_KEY}`;

// let browser = null;
// let ffmpegProcess = null;

// // 24/7 Infinite Loop
// async function mainLoop() {
//     while (true) {
//         try {
//             await startDirectStreaming();
//             console.log('[!] Stream function resolved unexpectedly. Restarting in 5s...');
//             await new Promise(resolve => setTimeout(resolve, 5000));
//         } catch (error) {
//             console.error('[!] Global Stream Error: Restarting in 5s...', error.message || error);
//             await cleanup();
//             await new Promise(resolve => setTimeout(resolve, 5000));
//         }
//     }
// }

// async function startDirectStreaming() {
//     console.log('[*] Starting browser and FFmpeg for LIVE 24/7 Streaming...');

//     const useProxy = process.env.USE_PROXY === 'ON';
//     const proxyIpPort = process.env.PROXY_IP_PORT || '31.59.20.176:6754';
//     const proxyUser = process.env.PROXY_USER || 'kexwytuq';
//     const proxyPass = process.env.PROXY_PASS || 'fw1k19a4lqfd';

//     const browserArgs = [
//         '--no-sandbox',
//         '--disable-setuid-sandbox',
//         '--window-size=1280,720',
//         '--kiosk', 
//         '--autoplay-policy=no-user-gesture-required'
//     ];

//     if (useProxy) {
//         browserArgs.push(`--proxy-server=http://${proxyIpPort}`);
//     }

//     console.log(`Launching Browser on GitHub Actions Virtual Screen with Proxy: ${useProxy ? 'ON' : 'OFF'}...`);
//     browser = await puppeteer.launch({
//         channel: 'chrome',
//         headless: false, 
//         defaultViewport: { width: 1280, height: 720 },
//         ignoreDefaultArgs: ['--enable-automation'], 
//         args: browserArgs
//     });

//     const page = await browser.newPage();

//     // 🚀 NEW: Browser ke andar ke console logs ko GitHub Actions par bhejne ka jadoo
//     page.on('console', msg => {
//         // Sirf apne custom logs ko filter karne ke liye
//         if (msg.text().includes('DEBUG:')) {
//             console.log(`[Browser Console] -> ${msg.text()}`);
//         }
//     });

//     const pages = await browser.pages();
//     for (const p of pages) {
//         if (p !== page) await p.close();
//     }

//     browser.on('targetcreated', async (target) => {
//         if (target.type() === 'page') {
//             try {
//                 const newPage = await target.page();
//                 if (newPage && newPage !== page) {
//                     console.log(`[*] Adware tab detected! Forcing video tab back to foreground visually...`);
//                     await page.bringToFront(); 
//                     setTimeout(() => newPage.close().catch(() => { }), 2000);
//                 }
//             } catch (e) { }
//         }
//     });

//     if (useProxy) {
//         await page.authenticate({ username: proxyUser, password: proxyPass });
//         console.log("Proxy credentials applied successfully.");
//     }

//     const recorder = new PuppeteerScreenRecorder(page);
//     await recorder.start('debug_video.mp4');
//     console.log('🎥 [*] 20-second Visual Debug Recording Started...');

//     setTimeout(async () => {
//         try {
//             await recorder.stop();
//             console.log('🛑 [*] Visual Screen recording stopped. Uploading to GitHub Releases...');
//             const tagName = `visual-debug-${Date.now()}`;
//             execSync(`gh release create ${tagName} debug_video.mp4 --title "Puppeteer Visual Capture"`, { stdio: 'inherit' });
//             console.log('✅ [+] Successfully uploaded visual debug wrapper!');
//         } catch (err) {
//             console.error('❌ [!] Failed to upload visual debug wrapper:', err.message);
//         }
//     }, 20000);

//     const displayNum = process.env.DISPLAY || ':99';

//     console.log(`[*] Navigating to target URL using Proxy...`);
//     await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

//     console.log('[*] Waiting for potential Cloudflare...');
//     for (let i = 0; i < 15; i++) {
//         const title = await page.title();
//         if (!title.includes('Moment') && !title.includes('Cloudflare')) break;
//         await new Promise(r => setTimeout(r, 1000));
//     }

//     await new Promise(resolve => setTimeout(resolve, 8000));

//     console.log('[*] Cleaning up ads visually...');
//     for (const frame of page.frames()) {
//         try {
//             await frame.evaluate(() => {
//                 const adElement = document.querySelector('div#dontfoid');
//                 if (adElement) adElement.remove();
//             });
//         } catch (e) { }
//     }

//     let targetFrame = null;
//     for (const frame of page.frames()) {
//         try {
//             const hasVideo = await frame.evaluate(() => !!document.querySelector('video'));
//             if (hasVideo) {
//                 targetFrame = frame;
//                 console.log(`[+] Found video element inside frame: ${frame.url() || 'unknown'}`);
//                 break;
//             }
//         } catch (e) { }
//     }

//     if (!targetFrame) throw new Error('No <video> element could be found.');

//     console.log('[*] Executing Audio Unmute and Wait Logic...');
//     await targetFrame.evaluate(async () => {
//         const video = document.querySelector('video');
//         if (!video) return false;

//         video.muted = false; 
//         await video.play().catch(e => console.log('DEBUG: Auto-play manually blocked/failed: ' + e));

//         await new Promise((resolve) => {
//             let elapsed = 0;
//             const interval = setInterval(() => {
//                 elapsed += 500;
//                 if (video.videoWidth > 0 && video.readyState >= 3) {
//                     clearInterval(interval);
//                     resolve();
//                 } else if (elapsed > 60000) {
//                     clearInterval(interval);
//                     resolve();
//                 }
//             }, 500);
//         });
//         return true;
//     });

//     console.log('[*] Executing GitHub Logs Debugging & Fullscreen Script...');
//     // 🚀 NEW: Ab yahan se double click khatam, aur direct inspection aur Fullscreen try hoga
//     await targetFrame.evaluate(async () => {
//         console.log("DEBUG: ---------------- FULLSCREEN DEBUG START ----------------");
        
//         const vid = document.querySelector('video');
        
//         // 1. Check if Video Exists
//         if (vid) {
//             console.log("DEBUG: ✅ YES! document.querySelector('video') majood hai.");
//         } else {
//             console.log("DEBUG: ❌ NO! Video element nahi mila.");
//             return;
//         }

//         // 2. Try Native Fullscreen API
//         console.log("DEBUG: ⏳ Trying native requestFullscreen()...");
//         try {
//             if (vid.requestFullscreen) {
//                 await vid.requestFullscreen();
//             } else if (vid.webkitRequestFullscreen) {
//                 await vid.webkitRequestFullscreen();
//             }
//             console.log("DEBUG: 🎉 requestFullscreen() SUCCESS! Browser accepted it.");
//         } catch (err) {
//             // Agar HTML5 fullscreen block ho jaye (jo ke bots mein ho jata hai)
//             console.log("DEBUG: ❌ requestFullscreen() FAILED. Error details:");
//             console.log("DEBUG: " + err.name + " - " + err.message);
            
//             // 3. Fallback: Force CSS Stretch so stream doesn't look bad
//             console.log("DEBUG: ⚠️ Applying CSS Force-Stretch Hack instead...");
//             vid.style.position = 'fixed';
//             vid.style.top = '0';
//             vid.style.left = '0';
//             vid.style.width = '100vw';
//             vid.style.height = '100vh';
//             vid.style.zIndex = '2147483647';
//             vid.style.backgroundColor = 'black';
//             vid.style.objectFit = 'contain';
//             console.log("DEBUG: ✅ CSS Force-Stretch Hack Applied Successfully!");
//         }
        
//         console.log("DEBUG: ---------------- FULLSCREEN DEBUG END ----------------");
//     });

//     await new Promise(r => setTimeout(r, 2000)); // wait for transitions

//     console.log('[*] Video playing! Spawning FFmpeg to capture raw X11 Display...');

//     ffmpegProcess = spawn('ffmpeg', [
//         '-y',
//         '-use_wallclock_as_timestamps', '1',
//         '-thread_queue_size', '1024',
//         '-f', 'x11grab',
//         '-draw_mouse', '0', 
//         '-video_size', '1280x720',
//         '-framerate', '30',
//         '-i', displayNum,
//         '-thread_queue_size', '1024',
//         '-f', 'pulse',
//         '-i', 'default',
//         '-c:v', 'libx264',
//         '-preset', 'veryfast',
//         '-maxrate', '3000k',
//         '-bufsize', '6000k',
//         '-pix_fmt', 'yuv420p',
//         '-g', '60',
//         '-c:a', 'aac',
//         '-b:a', '128k',
//         '-ar', '44100',
//         '-af', 'aresample=async=1', 
//         '-f', 'flv',
//         RTMP_DESTINATION 
//     ]);

//     ffmpegProcess.stderr.on('data', (data) => {
//         const output = data.toString().trim();
//         if (output.includes('frame=') && output.includes('fps=')) {
//             process.stdout.write(`\r[FFmpeg Heartbeat]: ${output.substring(0, 100)}`);
//         } else if (output.includes('Error') || output.includes('Failed')) {
//             console.log(`\n[FFmpeg Issue]: ${output}`);
//         }
//     });

//     ffmpegProcess.stdin.on('error', (err) => console.log(`\n[!] ffmpeg stdin closed (${err.code}).`));
//     ffmpegProcess.on('close', (code) => console.log(`\n[*] FFmpeg process exited with code ${code}`));
//     ffmpegProcess.on('error', (err) => console.error('\n[!] FFmpeg failed to start.', err));

//     console.log('\n[*] Engine successfully connected! Live 24/7 Broadcast is running to OK.ru...');
//     while (true) {
//         if (!browser || !browser.isConnected()) {
//             throw new Error("Browser was closed intentionally by Detector.");
//         }
//         if (!ffmpegProcess || ffmpegProcess.exitCode !== null) {
//             throw new Error("FFmpeg process died unexpectedly.");
//         }
//         await new Promise(r => setTimeout(r, 2000));
//     }
// }

// async function cleanup() {
//     if (ffmpegProcess) {
//         try {
//             ffmpegProcess.stdin.end();
//             ffmpegProcess.kill('SIGINT');
//         } catch (e) { }
//         ffmpegProcess = null;
//     }
//     if (browser) {
//         try {
//             await browser.close();
//         } catch (e) { }
//         browser = null;
//     }
// }

// process.on('SIGINT', async () => {
//     console.log('\n[*] Stopping live script cleanly...');
//     await cleanup();
//     process.exit(0);
// });

// mainLoop();








// opper gemenui se try karty hai fullscreen 


// const puppeteer = require('puppeteer-extra');
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// puppeteer.use(StealthPlugin());

// const { spawn, execSync } = require('child_process');
// const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

// const TARGET_URL = 'https://dadocric.st/player.php?id=starsp3&v=m';
// const RTMP_SERVER = 'rtmp://vsu.okcdn.ru/input/';
// const STREAM_KEY = '14601603391083_14040893622891_puxzrwjniu';
// const RTMP_DESTINATION = `${RTMP_SERVER}${STREAM_KEY}`;

// let browser = null;
// let ffmpegProcess = null;

// // 24/7 Infinite Loop
// async function mainLoop() {
//     while (true) {
//         try {
//             await startDirectStreaming();
//             console.log('[!] Stream function resolved unexpectedly. Restarting in 5s...');
//             await new Promise(resolve => setTimeout(resolve, 5000));
//         } catch (error) {
//             console.error('[!] Global Stream Error: Restarting in 5s...', error.message || error);
//             await cleanup();
//             await new Promise(resolve => setTimeout(resolve, 5000));
//         }
//     }
// }

// async function startDirectStreaming() {
//     console.log('[*] Starting browser and FFmpeg for LIVE 24/7 Streaming...');

//     const useProxy = process.env.USE_PROXY === 'ON';
//     const proxyIpPort = process.env.PROXY_IP_PORT || '31.59.20.176:6754';
//     const proxyUser = process.env.PROXY_USER || 'kexwytuq';
//     const proxyPass = process.env.PROXY_PASS || 'fw1k19a4lqfd';

//     const browserArgs = [
//         '--no-sandbox',
//         '--disable-setuid-sandbox',
//         '--window-size=1280,720',
//         '--kiosk', // NAYA: Forces full-screen mode, completely hiding the Chrome URL bar and tabs!
//         '--autoplay-policy=no-user-gesture-required'
//     ];

//     if (useProxy) {
//         browserArgs.push(`--proxy-server=http://${proxyIpPort}`);
//     }

//     console.log(`Launching Browser on GitHub Actions Virtual Screen with Proxy: ${useProxy ? 'ON' : 'OFF'}...`);
//     browser = await puppeteer.launch({
//         channel: 'chrome',
//         headless: false, // Required for Xvfb display
//         defaultViewport: { width: 1280, height: 720 },
//         ignoreDefaultArgs: ['--enable-automation'], // Removes the "Chrome is being controlled" white bar
//         args: browserArgs
//     });

//     const page = await browser.newPage();

//     // Clean up default about:blank tab so it doesn't clutter the Xvfb screen
//     const pages = await browser.pages();
//     for (const p of pages) {
//         if (p !== page) await p.close();
//     }

//     // NAYA: Aggressive Ad-Popup Blocker & Focus Management
//     browser.on('targetcreated', async (target) => {
//         if (target.type() === 'page') {
//             try {
//                 const newPage = await target.page();
//                 if (newPage && newPage !== page) {
//                     console.log(`[*] Adware tab detected! Forcing video tab back to foreground visually...`);
//                     await page.bringToFront(); // X11grab will instantly snap back to the video!
//                     setTimeout(() => newPage.close().catch(() => { }), 2000);
//                 }
//             } catch (e) { }
//         }
//     });

//     if (useProxy) {
//         await page.authenticate({ username: proxyUser, password: proxyPass });
//         console.log("Proxy credentials applied successfully.");
//     }

//     // GUI Visual Recorder (20 Sec Debug) to verify visual output logic
//     const recorder = new PuppeteerScreenRecorder(page);
//     await recorder.start('debug_video.mp4');
//     console.log('🎥 [*] 20-second Visual Debug Recording Started...');

//     setTimeout(async () => {
//         try {
//             await recorder.stop();
//             console.log('🛑 [*] Visual Screen recording stopped. Uploading to GitHub Releases...');
//             const tagName = `visual-debug-${Date.now()}`;
//             execSync(`gh release create ${tagName} debug_video.mp4 --title "Puppeteer Visual Capture"`, { stdio: 'inherit' });
//             console.log('✅ [+] Successfully uploaded visual debug wrapper!');
//         } catch (err) {
//             console.error('❌ [!] Failed to upload visual debug wrapper:', err.message);
//         }
//     }, 20000);

//     const displayNum = process.env.DISPLAY || ':99';

//     console.log(`[*] Navigating to target URL using Proxy...`);
//     await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

//     console.log('[*] Waiting for potential Cloudflare...');
//     for (let i = 0; i < 15; i++) {
//         const title = await page.title();
//         if (!title.includes('Moment') && !title.includes('Cloudflare')) break;
//         await new Promise(r => setTimeout(r, 1000));
//     }

//     await new Promise(resolve => setTimeout(resolve, 8000));

//     console.log('[*] Cleaning up ads visually...');
//     for (const frame of page.frames()) {
//         try {
//             await frame.evaluate(() => {
//                 const adElement = document.querySelector('div#dontfoid');
//                 if (adElement) adElement.remove();
//             });
//         } catch (e) { }
//     }

//     let targetFrame = null;
//     for (const frame of page.frames()) {
//         try {
//             const hasVideo = await frame.evaluate(() => !!document.querySelector('video'));
//             if (hasVideo) {
//                 targetFrame = frame;
//                 console.log(`[+] Found video element inside frame: ${frame.url() || 'unknown'}`);
//                 break;
//             }
//         } catch (e) { }
//     }

//     if (!targetFrame) throw new Error('No <video> element could be found.');

//     // In-Browser Injection: Unmute & Start Video Playback First!
//     await targetFrame.evaluate(async () => {
//         const video = document.querySelector('video');
//         if (!video) throw new Error('No <video> element found.');

//         video.muted = false; // Unmute so audio flows to PulseAudio
//         await video.play().catch(e => console.log('Auto-play manually blocked/failed:', e));

//         await new Promise((resolve) => {
//             let elapsed = 0;
//             const interval = setInterval(() => {
//                 elapsed += 500;
//                 if (video.videoWidth > 0 && video.readyState >= 3) {
//                     clearInterval(interval);
//                     resolve();
//                 } else if (elapsed > 60000) {
//                     clearInterval(interval);
//                     resolve();
//                 }
//             }, 500);
//         });

//         return true;
//     });

//     // NAYA: Use exact physical clicks AFTER video is fully loaded to clear Adware overlay and trigger Native HTML5 Fullscreen!
//     try {
//         const iframeElement = await targetFrame.frameElement();
//         const box = await iframeElement.boundingBox();

//         if (box) {
//             const centerX = box.x + (box.width / 2);
//             const centerY = box.y + (box.height / 2) + 20; // Click slightly below center

//             await page.mouse.move(centerX, centerY, { steps: 5 });
//             await new Promise(r => setTimeout(r, 500));

//             // 1st Click: This drops the UNMUTE overlay and usually spawns the Adware tab!
//             console.log('[*] Engaging 1st Click to clear Player Overlays / trigger Adware...');
//             await page.mouse.click(centerX, centerY, { delay: 50 }); // Delay makes it look human

//             // Wait 4 seconds for the Adware to spawn, and our Popup Blocker to murder it and refocus
//             console.log('[*] Waiting 4 seconds for Ad-Blocker to refocus screen...');
//             await new Promise(r => setTimeout(r, 4000));

//             // 2nd Action: Double Click! This tells the perfectly-loaded Native Player to go TRUE Fullscreen!
//             console.log('[*] Engaging HUMAN Double-Click to activate Native Fullscreen API!');
//             // Native HTML5 elements often require real gaps between down/up to register double click
//             await page.mouse.click(centerX, centerY, { clickCount: 2, delay: 100 });

//             // 3rd Action: Programmatic Fullscreen injection as an absolute guarantee!
//             console.log('[*] Injecting Javascript requestFullscreen() as an absolute guarantee...');
//             await targetFrame.evaluate(() => {
//                 try {
//                     const vid = document.querySelector('video');
//                     if (vid) {
//                         if (vid.requestFullscreen) vid.requestFullscreen();
//                         else if (vid.webkitRequestFullscreen) vid.webkitRequestFullscreen();
//                     }
//                 } catch(err) {
//                     console.log('JS Fullscreen API failed or already active:', err);
//                 }
//             });

//             console.log('[*] Player should now be natively Full Screen!');
//             await new Promise(r => setTimeout(r, 2000)); // wait for fullscreen animation CSS to transition
//         }
//     } catch (e) {
//         console.error('[!] Physical clicking sequence failed...', e);
//     }

//     console.log('[*] Video playing! Spawning FFmpeg to capture raw X11 Display (bypasses all DRM)...');

//     ffmpegProcess = spawn('ffmpeg', [
//         '-y',
//         '-use_wallclock_as_timestamps', '1', // NAYA: Perfectly aligns Video and Audio timelines using system clock
//         '-thread_queue_size', '1024',
//         '-f', 'x11grab',
//         '-draw_mouse', '0', // NAYA: Stops mouse movements from causing video stutters/desync
//         '-video_size', '1280x720',
//         '-framerate', '30',
//         '-i', displayNum,
//         '-thread_queue_size', '1024',
//         '-f', 'pulse',
//         '-i', 'default',
//         '-c:v', 'libx264',
//         '-preset', 'veryfast',
//         '-maxrate', '3000k',
//         '-bufsize', '6000k',
//         '-pix_fmt', 'yuv420p',
//         '-g', '60',
//         '-c:a', 'aac',
//         '-b:a', '128k',
//         '-ar', '44100',
//         '-af', 'aresample=async=1', // NAYA: Forces FFmpeg to intelligently stretch/squeeze audio to perfectly match video frames
//         '-f', 'flv',
//         RTMP_DESTINATION // Live broadcast to OK.ru
//     ]);

//     ffmpegProcess.stderr.on('data', (data) => {
//         const output = data.toString().trim();
//         if (output.includes('frame=') && output.includes('fps=')) {
//             process.stdout.write(`\r[FFmpeg Heartbeat]: ${output.substring(0, 100)}`);
//         } else if (output.includes('Error') || output.includes('Failed')) {
//             console.log(`\n[FFmpeg Issue]: ${output}`);
//         }
//     });

//     ffmpegProcess.stdin.on('error', (err) => console.log(`\n[!] ffmpeg stdin closed (${err.code}).`));
//     ffmpegProcess.on('close', (code) => console.log(`\n[*] FFmpeg process exited with code ${code}`));
//     ffmpegProcess.on('error', (err) => console.error('\n[!] FFmpeg failed to start.', err));

//     // Node Watchdog
//     console.log('\n[*] Engine successfully connected! Live 24/7 Broadcast is running to OK.ru...');
//     while (true) {
//         if (!browser || !browser.isConnected()) {
//             throw new Error("Browser was closed intentionally by Detector.");
//         }
//         if (!ffmpegProcess || ffmpegProcess.exitCode !== null) {
//             throw new Error("FFmpeg process died unexpectedly.");
//         }
//         await new Promise(r => setTimeout(r, 2000));
//     }
// }

// async function cleanup() {
//     if (ffmpegProcess) {
//         try {
//             ffmpegProcess.stdin.end();
//             ffmpegProcess.kill('SIGINT');
//         } catch (e) { }
//         ffmpegProcess = null;
//     }
//     if (browser) {
//         try {
//             await browser.close();
//         } catch (e) { }
//         browser = null;
//     }
// }

// process.on('SIGINT', async () => {
//     console.log('\n[*] Stopping live script cleanly...');
//     await cleanup();
//     process.exit(0);
// });

// // Boot
// mainLoop();










// great job audio iss purely sync with video the belwo code is done , in the opper code try to full screen like double click the video screen


// const puppeteer = require('puppeteer-extra');
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// puppeteer.use(StealthPlugin());

// const { spawn, execSync } = require('child_process');
// const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

// const TARGET_URL = 'https://dadocric.st/player.php?id=starsp3&v=m';
// const RTMP_SERVER = 'rtmp://vsu.okcdn.ru/input/';
// const STREAM_KEY = '14601603391083_14040893622891_puxzrwjniu';
// const RTMP_DESTINATION = `${RTMP_SERVER}${STREAM_KEY}`;

// let browser = null;
// let ffmpegProcess = null;

// // 24/7 Infinite Loop
// async function mainLoop() {
//     while (true) {
//         try {
//             await startDirectStreaming();
//             console.log('[!] Stream function resolved unexpectedly. Restarting in 5s...');
//             await new Promise(resolve => setTimeout(resolve, 5000));
//         } catch (error) {
//             console.error('[!] Global Stream Error: Restarting in 5s...', error.message || error);
//             await cleanup();
//             await new Promise(resolve => setTimeout(resolve, 5000));
//         }
//     }
// }

// async function startDirectStreaming() {
//     console.log('[*] Starting browser and FFmpeg for LIVE 24/7 Streaming...');

//     const useProxy = process.env.USE_PROXY === 'ON';
//     const proxyIpPort = process.env.PROXY_IP_PORT || '31.59.20.176:6754';
//     const proxyUser = process.env.PROXY_USER || 'kexwytuq';
//     const proxyPass = process.env.PROXY_PASS || 'fw1k19a4lqfd';

//     const browserArgs = [
//         '--no-sandbox',
//         '--disable-setuid-sandbox',
//         '--window-size=1280,720',
//         '--kiosk', // NAYA: Forces full-screen mode, completely hiding the Chrome URL bar and tabs!
//         '--autoplay-policy=no-user-gesture-required'
//     ];

//     if (useProxy) {
//         browserArgs.push(`--proxy-server=http://${proxyIpPort}`);
//     }

//     console.log(`Launching Browser on GitHub Actions Virtual Screen with Proxy: ${useProxy ? 'ON' : 'OFF'}...`);
//     browser = await puppeteer.launch({
//         channel: 'chrome',
//         headless: false, // Required for Xvfb display
//         defaultViewport: { width: 1280, height: 720 },
//         ignoreDefaultArgs: ['--enable-automation'], // Removes the "Chrome is being controlled" white bar
//         args: browserArgs
//     });

//     const page = await browser.newPage();
    
//     // Clean up default about:blank tab so it doesn't clutter the Xvfb screen
//     const pages = await browser.pages();
//     for (const p of pages) {
//         if (p !== page) await p.close();
//     }

//     // NAYA: Aggressive Ad-Popup Blocker & Focus Management
//     browser.on('targetcreated', async (target) => {
//         if (target.type() === 'page') {
//             try {
//                 const newPage = await target.page();
//                 if (newPage && newPage !== page) {
//                     console.log(`[*] Adware tab detected! Forcing video tab back to foreground visually...`);
//                     await page.bringToFront(); // X11grab will instantly snap back to the video!
//                     setTimeout(() => newPage.close().catch(() => {}), 2000);
//                 }
//             } catch(e) {}
//         }
//     });

//     if (useProxy) {
//         await page.authenticate({ username: proxyUser, password: proxyPass });
//         console.log("Proxy credentials applied successfully.");
//     }

//     // GUI Visual Recorder (20 Sec Debug) to verify visual output logic
//     const recorder = new PuppeteerScreenRecorder(page);
//     await recorder.start('debug_video.mp4');
//     console.log('🎥 [*] 20-second Visual Debug Recording Started...');

//     setTimeout(async () => {
//         try {
//             await recorder.stop();
//             console.log('🛑 [*] Visual Screen recording stopped. Uploading to GitHub Releases...');
//             const tagName = `visual-debug-${Date.now()}`;
//             execSync(`gh release create ${tagName} debug_video.mp4 --title "Puppeteer Visual Capture"`, { stdio: 'inherit' });
//             console.log('✅ [+] Successfully uploaded visual debug wrapper!');
//         } catch (err) {
//             console.error('❌ [!] Failed to upload visual debug wrapper:', err.message);
//         }
//     }, 20000);

//     const displayNum = process.env.DISPLAY || ':99';

//     console.log(`[*] Navigating to target URL using Proxy...`);
//     await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

//     console.log('[*] Waiting for potential Cloudflare...');
//     for (let i = 0; i < 15; i++) {
//         const title = await page.title();
//         if (!title.includes('Moment') && !title.includes('Cloudflare')) break;
//         await new Promise(r => setTimeout(r, 1000));
//     }

//     await new Promise(resolve => setTimeout(resolve, 8000));

//     console.log('[*] Cleaning up ads visually...');
//     for (const frame of page.frames()) {
//         try {
//             await frame.evaluate(() => {
//                 const adElement = document.querySelector('div#dontfoid');
//                 if (adElement) adElement.remove();
//             });
//         } catch (e) { }
//     }

//     let targetFrame = null;
//     for (const frame of page.frames()) {
//         try {
//             const hasVideo = await frame.evaluate(() => !!document.querySelector('video'));
//             if (hasVideo) {
//                 targetFrame = frame;
//                 console.log(`[+] Found video element inside frame: ${frame.url() || 'unknown'}`);
//                 break;
//             }
//         } catch (e) { }
//     }

//     if (!targetFrame) throw new Error('No <video> element could be found.');

//     // NAYA: Force specifically the VIDEO iframe to cover exactly the entire browser window
//     try {
//         const iframeElement = await targetFrame.frameElement();
        
//         await page.evaluate((el) => {
//             el.style.position = 'fixed';
//             el.style.top = '0';
//             el.style.left = '0';
//             el.style.width = '100vw';
//             el.style.height = '100vh';
//             el.style.zIndex = '999999';
//             el.style.margin = '0';
//             el.style.padding = '0';
//             el.style.border = 'none';
            
//             document.body.style.overflow = 'hidden';
//             document.body.style.margin = '0';
//             document.body.style.backgroundColor = 'black';
//         }, iframeElement);

//         const box = await iframeElement.boundingBox();
//         if (box) {
//             await page.mouse.move(box.x + (box.width / 2), box.y + (box.height / 2), { steps: 5 });
//             await new Promise(r => setTimeout(r, 500));
//             await page.mouse.click(box.x + (box.width / 2), box.y + (box.height / 2));
//             console.log('[*] Succeeded in clicking the exact center of the video player.');
//         }
//     } catch (e) {
//         try { await targetFrame.click('video'); } catch (err) { }
//     }

//     // In-Browser Injection: Force Fullscreen visually & Play
//     await targetFrame.evaluate(async () => {
//         const video = document.querySelector('video');
//         if (!video) throw new Error('No <video> element found.');

//         video.muted = false; // Unmute so audio flows to PulseAudio
//         await video.play().catch(e => console.log('Auto-play manually blocked/failed:', e));

//         await new Promise((resolve) => {
//             let elapsed = 0;
//             const interval = setInterval(() => {
//                 elapsed += 500;
//                 if (video.videoWidth > 0 && video.readyState >= 3) {
//                     clearInterval(interval);
//                     resolve();
//                 } else if (elapsed > 60000) {
//                     clearInterval(interval);
//                     resolve();
//                 }
//             }, 500);
//         });

//         // Force CSS Fullscreen fallback so video consumes 100% of the Xvfb display
//         try {
//             video.style.position = 'fixed';
//             video.style.top = '0';
//             video.style.left = '0';
//             video.style.width = '100vw';
//             video.style.height = '100vh';
//             video.style.zIndex = '999999';
//             video.style.backgroundColor = 'black';
//             video.style.objectFit = 'contain';
//         } catch(e) {}

//         return true;
//     });

//     console.log('[*] Video playing! Spawning FFmpeg to capture raw X11 Display (bypasses all DRM)...');

//     ffmpegProcess = spawn('ffmpeg', [
//         '-y',
//         '-use_wallclock_as_timestamps', '1', // NAYA: Perfectly aligns Video and Audio timelines using system clock
//         '-thread_queue_size', '1024',
//         '-f', 'x11grab',
//         '-draw_mouse', '0', // NAYA: Stops mouse movements from causing video stutters/desync
//         '-video_size', '1280x720',
//         '-framerate', '30',
//         '-i', displayNum,
//         '-thread_queue_size', '1024',
//         '-f', 'pulse',
//         '-i', 'default',
//         '-c:v', 'libx264',
//         '-preset', 'veryfast',
//         '-maxrate', '3000k',
//         '-bufsize', '6000k',
//         '-pix_fmt', 'yuv420p',
//         '-g', '60',
//         '-c:a', 'aac',
//         '-b:a', '128k',
//         '-ar', '44100',
//         '-af', 'aresample=async=1', // NAYA: Forces FFmpeg to intelligently stretch/squeeze audio to perfectly match video frames
//         '-f', 'flv',
//         RTMP_DESTINATION // Live broadcast to OK.ru
//     ]);

//     ffmpegProcess.stderr.on('data', (data) => {
//         const output = data.toString().trim();
//         if (output.includes('frame=') && output.includes('fps=')) {
//             process.stdout.write(`\r[FFmpeg Heartbeat]: ${output.substring(0, 100)}`);
//         } else if (output.includes('Error') || output.includes('Failed')) {
//             console.log(`\n[FFmpeg Issue]: ${output}`);
//         }
//     });

//     ffmpegProcess.stdin.on('error', (err) => console.log(`\n[!] ffmpeg stdin closed (${err.code}).`));
//     ffmpegProcess.on('close', (code) => console.log(`\n[*] FFmpeg process exited with code ${code}`));
//     ffmpegProcess.on('error', (err) => console.error('\n[!] FFmpeg failed to start.', err));

//     // Node Watchdog
//     console.log('\n[*] Engine successfully connected! Live 24/7 Broadcast is running to OK.ru...');
//     while (true) {
//         if (!browser || !browser.isConnected()) {
//             throw new Error("Browser was closed intentionally by Detector.");
//         }
//         if (!ffmpegProcess || ffmpegProcess.exitCode !== null) {
//             throw new Error("FFmpeg process died unexpectedly.");
//         }
//         await new Promise(r => setTimeout(r, 2000));
//     }
// }

// async function cleanup() {
//     if (ffmpegProcess) {
//         try {
//             ffmpegProcess.stdin.end();
//             ffmpegProcess.kill('SIGINT');
//         } catch (e) { }
//         ffmpegProcess = null;
//     }
//     if (browser) {
//         try {
//             await browser.close();
//         } catch (e) { }
//         browser = null;
//     }
// }

// process.on('SIGINT', async () => {
//     console.log('\n[*] Stopping live script cleanly...');
//     await cleanup();
//     process.exit(0);
// });

// // Boot
// mainLoop();






// the belwo code ,they zoom the wrong div 


// const puppeteer = require('puppeteer-extra');
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// puppeteer.use(StealthPlugin());

// const { spawn, execSync } = require('child_process');
// const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

// const TARGET_URL = 'https://dadocric.st/player.php?id=starsp3&v=m';
// const RTMP_SERVER = 'rtmp://vsu.okcdn.ru/input/';
// const STREAM_KEY = '14601603391083_14040893622891_puxzrwjniu';
// const RTMP_DESTINATION = `${RTMP_SERVER}${STREAM_KEY}`;

// let browser = null;
// let ffmpegProcess = null;

// // 24/7 Infinite Loop
// async function mainLoop() {
//     while (true) {
//         try {
//             await startDirectStreaming();
//             console.log('[!] Stream function resolved unexpectedly. Restarting in 5s...');
//             await new Promise(resolve => setTimeout(resolve, 5000));
//         } catch (error) {
//             console.error('[!] Global Stream Error: Restarting in 5s...', error.message || error);
//             await cleanup();
//             await new Promise(resolve => setTimeout(resolve, 5000));
//         }
//     }
// }

// async function startDirectStreaming() {
//     console.log('[*] Starting browser and FFmpeg for LIVE 24/7 Streaming...');

//     const useProxy = process.env.USE_PROXY === 'ON';
//     const proxyIpPort = process.env.PROXY_IP_PORT || '31.59.20.176:6754';
//     const proxyUser = process.env.PROXY_USER || 'kexwytuq';
//     const proxyPass = process.env.PROXY_PASS || 'fw1k19a4lqfd';

//     const browserArgs = [
//         '--no-sandbox',
//         '--disable-setuid-sandbox',
//         '--window-size=1280,720',
//         '--kiosk', // NAYA: Forces full-screen mode, completely hiding the Chrome URL bar and tabs!
//         '--autoplay-policy=no-user-gesture-required'
//     ];

//     if (useProxy) {
//         browserArgs.push(`--proxy-server=http://${proxyIpPort}`);
//     }

//     console.log(`Launching Browser on GitHub Actions Virtual Screen with Proxy: ${useProxy ? 'ON' : 'OFF'}...`);
//     browser = await puppeteer.launch({
//         channel: 'chrome',
//         headless: false, // Required for Xvfb display
//         defaultViewport: { width: 1280, height: 720 },
//         ignoreDefaultArgs: ['--enable-automation'], // Removes the "Chrome is being controlled" white bar
//         args: browserArgs
//     });

//     const page = await browser.newPage();
    
//     // Clean up default about:blank tab so it doesn't clutter the Xvfb screen
//     const pages = await browser.pages();
//     for (const p of pages) {
//         if (p !== page) await p.close();
//     }

//     // NAYA: Aggressive Ad-Popup Blocker & Focus Management
//     browser.on('targetcreated', async (target) => {
//         if (target.type() === 'page') {
//             try {
//                 const newPage = await target.page();
//                 if (newPage && newPage !== page) {
//                     console.log(`[*] Adware tab detected! Forcing video tab back to foreground visually...`);
//                     await page.bringToFront(); // X11grab will instantly snap back to the video!
//                     setTimeout(() => newPage.close().catch(() => {}), 2000);
//                 }
//             } catch(e) {}
//         }
//     });

//     if (useProxy) {
//         await page.authenticate({ username: proxyUser, password: proxyPass });
//         console.log("Proxy credentials applied successfully.");
//     }

//     // GUI Visual Recorder (20 Sec Debug) to verify visual output logic
//     const recorder = new PuppeteerScreenRecorder(page);
//     await recorder.start('debug_video.mp4');
//     console.log('🎥 [*] 20-second Visual Debug Recording Started...');

//     setTimeout(async () => {
//         try {
//             await recorder.stop();
//             console.log('🛑 [*] Visual Screen recording stopped. Uploading to GitHub Releases...');
//             const tagName = `visual-debug-${Date.now()}`;
//             execSync(`gh release create ${tagName} debug_video.mp4 --title "Puppeteer Visual Capture"`, { stdio: 'inherit' });
//             console.log('✅ [+] Successfully uploaded visual debug wrapper!');
//         } catch (err) {
//             console.error('❌ [!] Failed to upload visual debug wrapper:', err.message);
//         }
//     }, 20000);

//     const displayNum = process.env.DISPLAY || ':99';

//     console.log(`[*] Navigating to target URL using Proxy...`);
//     await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

//     console.log('[*] Waiting for potential Cloudflare...');
//     for (let i = 0; i < 15; i++) {
//         const title = await page.title();
//         if (!title.includes('Moment') && !title.includes('Cloudflare')) break;
//         await new Promise(r => setTimeout(r, 1000));
//     }

//     await new Promise(resolve => setTimeout(resolve, 8000));

//     console.log('[*] Cleaning up ads visually...');
//     for (const frame of page.frames()) {
//         try {
//             await frame.evaluate(() => {
//                 const adElement = document.querySelector('div#dontfoid');
//                 if (adElement) adElement.remove();
//             });
//         } catch (e) { }
//     }

//     let targetFrame = null;
//     for (const frame of page.frames()) {
//         try {
//             const hasVideo = await frame.evaluate(() => !!document.querySelector('video'));
//             if (hasVideo) {
//                 targetFrame = frame;
//                 console.log(`[+] Found video element inside frame: ${frame.url() || 'unknown'}`);
//                 break;
//             }
//         } catch (e) { }
//     }

//     if (!targetFrame) throw new Error('No <video> element could be found.');

//     // NAYA: Force the iframe exactly to cover the entire browser window (bypassing the chat and wrapper)
//     await page.evaluate(() => {
//         const frames = Array.from(document.querySelectorAll('iframe'));
//         for (const f of frames) {
//             f.style.position = 'fixed';
//             f.style.top = '0';
//             f.style.left = '0';
//             f.style.width = '100vw';
//             f.style.height = '100vh';
//             f.style.zIndex = '999999';
//             f.style.margin = '0';
//             f.style.padding = '0';
//             f.style.border = 'none';
//         }
//         document.body.style.overflow = 'hidden'; // Remove scrollbars
//         document.body.style.margin = '0';
//         document.body.style.backgroundColor = 'black';
//     });

//     try {
//         const iframeElement = await targetFrame.frameElement();
//         const box = await iframeElement.boundingBox();
//         if (box) {
//             await page.mouse.move(box.x + (box.width / 2), box.y + (box.height / 2), { steps: 5 });
//             await new Promise(r => setTimeout(r, 500));
//             await page.mouse.click(box.x + (box.width / 2), box.y + (box.height / 2));
//             console.log('[*] Succeeded in clicking the exact center of the video player.');
//         }
//     } catch (e) {
//         try { await targetFrame.click('video'); } catch (err) { }
//     }

//     // In-Browser Injection: Force Fullscreen visually & Play
//     await targetFrame.evaluate(async () => {
//         const video = document.querySelector('video');
//         if (!video) throw new Error('No <video> element found.');

//         video.muted = false; // Unmute so audio flows to PulseAudio
//         await video.play().catch(e => console.log('Auto-play manually blocked/failed:', e));

//         await new Promise((resolve) => {
//             let elapsed = 0;
//             const interval = setInterval(() => {
//                 elapsed += 500;
//                 if (video.videoWidth > 0 && video.readyState >= 3) {
//                     clearInterval(interval);
//                     resolve();
//                 } else if (elapsed > 60000) {
//                     clearInterval(interval);
//                     resolve();
//                 }
//             }, 500);
//         });

//         // Force CSS Fullscreen fallback so video consumes 100% of the Xvfb display
//         try {
//             video.style.position = 'fixed';
//             video.style.top = '0';
//             video.style.left = '0';
//             video.style.width = '100vw';
//             video.style.height = '100vh';
//             video.style.zIndex = '999999';
//             video.style.backgroundColor = 'black';
//             video.style.objectFit = 'contain';
//         } catch(e) {}

//         return true;
//     });

//     console.log('[*] Video playing! Spawning FFmpeg to capture raw X11 Display (bypasses all DRM)...');

//     ffmpegProcess = spawn('ffmpeg', [
//         '-y',
//         '-thread_queue_size', '1024',
//         '-f', 'x11grab',
//         '-video_size', '1280x720',
//         '-framerate', '30',
//         '-i', displayNum,
//         '-thread_queue_size', '1024',
//         '-f', 'pulse',
//         '-i', 'default',
//         '-c:v', 'libx264',
//         '-preset', 'veryfast',
//         '-maxrate', '3000k',
//         '-bufsize', '6000k',
//         '-pix_fmt', 'yuv420p',
//         '-g', '60',
//         '-c:a', 'aac',
//         '-b:a', '128k',
//         '-ar', '44100',
//         '-f', 'flv',
//         // RTMP_DESTINATION // Uncomment this line to push live to ok.ru
//         'test_stream_output.flv'
//     ]);

//     ffmpegProcess.stderr.on('data', (data) => {
//         const output = data.toString().trim();
//         if (output.includes('frame=') && output.includes('fps=')) {
//             process.stdout.write(`\r[FFmpeg Heartbeat]: ${output.substring(0, 100)}`);
//         } else if (output.includes('Error') || output.includes('Failed')) {
//             console.log(`\n[FFmpeg Issue]: ${output}`);
//         }
//     });

//     ffmpegProcess.stdin.on('error', (err) => console.log(`\n[!] ffmpeg stdin closed (${err.code}).`));
//     ffmpegProcess.on('close', (code) => console.log(`\n[*] FFmpeg process exited with code ${code}`));
//     ffmpegProcess.on('error', (err) => console.error('\n[!] FFmpeg failed to start.', err));

//     // NAYA: TEST MODE UPLOAD LOGIC
//     console.log('\n[*] TEST MODE: Recording locally for 30 seconds then uploading to GitHub...');
//     await new Promise(r => setTimeout(r, 60000)); // wait extra 60 seconds to ensure chunks are heavy
    
//     console.log('\n🛑 [*] 60 seconds reached. Stopping FFmpeg to save local file test_stream_output.flv...');
//     ffmpegProcess.kill('SIGINT');
    
//     await new Promise(r => setTimeout(r, 8000)); // Wait for ffmpeg to gracefully save
    
//     try {
//         const tagName = `x11grab-test-${Date.now()}`;
//         console.log(`[*] Uploading test_stream_output.flv to GitHub Release ${tagName}...`);
//         execSync(`gh release create ${tagName} test_stream_output.flv --title "FFmpeg Stream X11 Test"`, { stdio: 'inherit' });
//         console.log('✅ [+] Successfully uploaded FFmpeg FLV to GitHub Releases!');
//     } catch (err) {
//         console.error('❌ [!] Failed to upload FFmpeg test file:', err.message);
//     }
    
//     console.log('[*] Test Complete! Exiting gracefully.');
//     process.exit(0);
// }

// async function cleanup() {
//     if (ffmpegProcess) {
//         try {
//             ffmpegProcess.stdin.end();
//             ffmpegProcess.kill('SIGINT');
//         } catch (e) { }
//         ffmpegProcess = null;
//     }
//     if (browser) {
//         try {
//             await browser.close();
//         } catch (e) { }
//         browser = null;
//     }
// }

// process.on('SIGINT', async () => {
//     console.log('\n[*] Stopping live script cleanly...');
//     await cleanup();
//     process.exit(0);
// });

// // Boot
// mainLoop();








// const puppeteer = require('puppeteer-extra');
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// puppeteer.use(StealthPlugin());

// const { spawn, execSync } = require('child_process');
// const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

// const TARGET_URL = 'https://dadocric.st/player.php?id=starsp3&v=m';
// const RTMP_SERVER = 'rtmp://vsu.okcdn.ru/input/';
// const STREAM_KEY = '14601603391083_14040893622891_puxzrwjniu';
// const RTMP_DESTINATION = `${RTMP_SERVER}${STREAM_KEY}`;

// let browser = null;
// let ffmpegProcess = null;

// // 24/7 Infinite Loop
// async function mainLoop() {
//     while (true) {
//         try {
//             await startDirectStreaming();
//             console.log('[!] Stream function resolved unexpectedly. Restarting in 5s...');
//             await new Promise(resolve => setTimeout(resolve, 5000));
//         } catch (error) {
//             console.error('[!] Global Stream Error: Restarting in 5s...', error.message || error);
//             await cleanup();
//             await new Promise(resolve => setTimeout(resolve, 5000));
//         }
//     }
// }

// async function startDirectStreaming() {
//     console.log('[*] Starting browser and FFmpeg for LIVE 24/7 Streaming...');

//     const useProxy = process.env.USE_PROXY === 'ON';
//     const proxyIpPort = process.env.PROXY_IP_PORT || '31.59.20.176:6754';
//     const proxyUser = process.env.PROXY_USER || 'kexwytuq';
//     const proxyPass = process.env.PROXY_PASS || 'fw1k19a4lqfd';

//     const browserArgs = [
//         '--no-sandbox',
//         '--disable-setuid-sandbox',
//         '--window-size=1280,720',
//         '--autoplay-policy=no-user-gesture-required'
//     ];

//     if (useProxy) {
//         browserArgs.push(`--proxy-server=http://${proxyIpPort}`);
//     }

//     console.log(`Launching Browser on GitHub Actions Virtual Screen with Proxy: ${useProxy ? 'ON' : 'OFF'}...`);
//     browser = await puppeteer.launch({
//         channel: 'chrome',
//         headless: false, // Required for Xvfb display
//         defaultViewport: { width: 1280, height: 720 },
//         ignoreDefaultArgs: ['--enable-automation'], // Removes the "Chrome is being controlled" white bar
//         args: browserArgs
//     });

//     const page = await browser.newPage();
    
//     // Clean up default about:blank tab so it doesn't clutter the Xvfb screen
//     const pages = await browser.pages();
//     for (const p of pages) {
//         if (p !== page) await p.close();
//     }

//     // NAYA: Aggressive Ad-Popup Blocker & Focus Management
//     browser.on('targetcreated', async (target) => {
//         if (target.type() === 'page') {
//             try {
//                 const newPage = await target.page();
//                 if (newPage && newPage !== page) {
//                     console.log(`[*] Adware tab detected! Forcing video tab back to foreground visually...`);
//                     await page.bringToFront(); // X11grab will instantly snap back to the video!
//                     setTimeout(() => newPage.close().catch(() => {}), 2000);
//                 }
//             } catch(e) {}
//         }
//     });

//     if (useProxy) {
//         await page.authenticate({ username: proxyUser, password: proxyPass });
//         console.log("Proxy credentials applied successfully.");
//     }

//     // GUI Visual Recorder (20 Sec Debug) to verify visual output logic
//     const recorder = new PuppeteerScreenRecorder(page);
//     await recorder.start('debug_video.mp4');
//     console.log('🎥 [*] 20-second Visual Debug Recording Started...');

//     setTimeout(async () => {
//         try {
//             await recorder.stop();
//             console.log('🛑 [*] Visual Screen recording stopped. Uploading to GitHub Releases...');
//             const tagName = `visual-debug-${Date.now()}`;
//             execSync(`gh release create ${tagName} debug_video.mp4 --title "Puppeteer Visual Capture"`, { stdio: 'inherit' });
//             console.log('✅ [+] Successfully uploaded visual debug wrapper!');
//         } catch (err) {
//             console.error('❌ [!] Failed to upload visual debug wrapper:', err.message);
//         }
//     }, 20000);

//     const displayNum = process.env.DISPLAY || ':99';

//     console.log(`[*] Navigating to target URL using Proxy...`);
//     await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

//     console.log('[*] Waiting for potential Cloudflare...');
//     for (let i = 0; i < 15; i++) {
//         const title = await page.title();
//         if (!title.includes('Moment') && !title.includes('Cloudflare')) break;
//         await new Promise(r => setTimeout(r, 1000));
//     }

//     await new Promise(resolve => setTimeout(resolve, 8000));

//     console.log('[*] Cleaning up ads visually...');
//     for (const frame of page.frames()) {
//         try {
//             await frame.evaluate(() => {
//                 const adElement = document.querySelector('div#dontfoid');
//                 if (adElement) adElement.remove();
//             });
//         } catch (e) { }
//     }

//     let targetFrame = null;
//     for (const frame of page.frames()) {
//         try {
//             const hasVideo = await frame.evaluate(() => !!document.querySelector('video'));
//             if (hasVideo) {
//                 targetFrame = frame;
//                 console.log(`[+] Found video element inside frame: ${frame.url() || 'unknown'}`);
//                 break;
//             }
//         } catch (e) { }
//     }

//     if (!targetFrame) throw new Error('No <video> element could be found.');

//     try {
//         const iframeElement = await targetFrame.frameElement();
//         const box = await iframeElement.boundingBox();
//         if (box) {
//             await page.mouse.move(box.x + (box.width / 2), box.y + (box.height / 2), { steps: 5 });
//             await new Promise(r => setTimeout(r, 500));
//             await page.mouse.click(box.x + (box.width / 2), box.y + (box.height / 2));
//             console.log('[*] Succeeded in clicking the exact center of the video player.');
//         }
//     } catch (e) {
//         try { await targetFrame.click('video'); } catch (err) { }
//     }

//     // In-Browser Injection: Force Fullscreen visually & Play
//     await targetFrame.evaluate(async () => {
//         const video = document.querySelector('video');
//         if (!video) throw new Error('No <video> element found.');

//         video.muted = false; // Unmute so audio flows to PulseAudio
//         await video.play().catch(e => console.log('Auto-play manually blocked/failed:', e));

//         await new Promise((resolve) => {
//             let elapsed = 0;
//             const interval = setInterval(() => {
//                 elapsed += 500;
//                 if (video.videoWidth > 0 && video.readyState >= 3) {
//                     clearInterval(interval);
//                     resolve();
//                 } else if (elapsed > 60000) {
//                     clearInterval(interval);
//                     resolve();
//                 }
//             }, 500);
//         });

//         // Force CSS Fullscreen fallback so video consumes 100% of the Xvfb display
//         try {
//             video.style.position = 'fixed';
//             video.style.top = '0';
//             video.style.left = '0';
//             video.style.width = '100vw';
//             video.style.height = '100vh';
//             video.style.zIndex = '999999';
//             video.style.backgroundColor = 'black';
//             video.style.objectFit = 'contain';
//         } catch(e) {}

//         return true;
//     });

//     console.log('[*] Video playing! Spawning FFmpeg to capture raw X11 Display (bypasses all DRM)...');

//     ffmpegProcess = spawn('ffmpeg', [
//         '-y',
//         '-thread_queue_size', '1024',
//         '-f', 'x11grab',
//         '-video_size', '1280x720',
//         '-framerate', '30',
//         '-i', displayNum,
//         '-thread_queue_size', '1024',
//         '-f', 'pulse',
//         '-i', 'default',
//         '-c:v', 'libx264',
//         '-preset', 'veryfast',
//         '-maxrate', '3000k',
//         '-bufsize', '6000k',
//         '-pix_fmt', 'yuv420p',
//         '-g', '60',
//         '-c:a', 'aac',
//         '-b:a', '128k',
//         '-ar', '44100',
//         '-f', 'flv',
//         // RTMP_DESTINATION // Uncomment this line to push live to ok.ru
//         'test_stream_output.flv'
//     ]);

//     ffmpegProcess.stderr.on('data', (data) => {
//         const output = data.toString().trim();
//         if (output.includes('frame=') && output.includes('fps=')) {
//             process.stdout.write(`\r[FFmpeg Heartbeat]: ${output.substring(0, 100)}`);
//         } else if (output.includes('Error') || output.includes('Failed')) {
//             console.log(`\n[FFmpeg Issue]: ${output}`);
//         }
//     });

//     ffmpegProcess.stdin.on('error', (err) => console.log(`\n[!] ffmpeg stdin closed (${err.code}).`));
//     ffmpegProcess.on('close', (code) => console.log(`\n[*] FFmpeg process exited with code ${code}`));
//     ffmpegProcess.on('error', (err) => console.error('\n[!] FFmpeg failed to start.', err));

//     // NAYA: TEST MODE UPLOAD LOGIC
//     console.log('\n[*] TEST MODE: Recording locally for 30 seconds then uploading to GitHub...');
//     await new Promise(r => setTimeout(r, 60000)); // wait extra 60 seconds to ensure chunks are heavy
    
//     console.log('\n🛑 [*] 60 seconds reached. Stopping FFmpeg to save local file test_stream_output.flv...');
//     ffmpegProcess.kill('SIGINT');
    
//     await new Promise(r => setTimeout(r, 8000)); // Wait for ffmpeg to gracefully save
    
//     try {
//         const tagName = `x11grab-test-${Date.now()}`;
//         console.log(`[*] Uploading test_stream_output.flv to GitHub Release ${tagName}...`);
//         execSync(`gh release create ${tagName} test_stream_output.flv --title "FFmpeg Stream X11 Test"`, { stdio: 'inherit' });
//         console.log('✅ [+] Successfully uploaded FFmpeg FLV to GitHub Releases!');
//     } catch (err) {
//         console.error('❌ [!] Failed to upload FFmpeg test file:', err.message);
//     }
    
//     console.log('[*] Test Complete! Exiting gracefully.');
//     process.exit(0);
// }

// async function cleanup() {
//     if (ffmpegProcess) {
//         try {
//             ffmpegProcess.stdin.end();
//             ffmpegProcess.kill('SIGINT');
//         } catch (e) { }
//         ffmpegProcess = null;
//     }
//     if (browser) {
//         try {
//             await browser.close();
//         } catch (e) { }
//         browser = null;
//     }
// }

// process.on('SIGINT', async () => {
//     console.log('\n[*] Stopping live script cleanly...');
//     await cleanup();
//     process.exit(0);
// });

// // Boot
// mainLoop();





















// # ============= done fullscreen capture and broadscast to ok.ru =====================


// const puppeteer = require('puppeteer-extra');
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// puppeteer.use(StealthPlugin());

// const { spawn, execSync } = require('child_process');
// const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

// const TARGET_URL = 'https://dadocric.st/player.php?id=starsp3&v=m';
// const RTMP_SERVER = 'rtmp://vsu.okcdn.ru/input/';
// const STREAM_KEY = '14601603391083_14040893622891_puxzrwjniu';
// const RTMP_DESTINATION = `${RTMP_SERVER}${STREAM_KEY}`;

// let browser = null;
// let ffmpegProcess = null;
// let lastChunkTime = Date.now();

// // 24/7 Infinite Loop
// async function mainLoop() {
//     while (true) {
//         try {
//             await startDirectStreaming();
//             console.log('[!] Stream function resolved unexpectedly. Restarting in 5s...');
//             await new Promise(resolve => setTimeout(resolve, 5000));
//         } catch (error) {
//             console.error('[!] Global Stream Error: Restarting in 5s...', error.message || error);
//             await cleanup();
//             await new Promise(resolve => setTimeout(resolve, 5000));
//         }
//     }
// }

// async function startDirectStreaming() {
//     console.log('[*] Starting browser and FFmpeg for LIVE 24/7 Streaming...');

//     // FFmpeg Process will be spanned dynamically when the first stream chunk arrives
//     // to prevent EBML pos 0 errors if navigation or proxy fails before starting.

//     // ==========================================
//     // NAYA CHROME LAUNCH LOGIC (HUMAN-LIKE)
//     // ==========================================
//     // Check if we should use proxy (default is OFF unless specified)
//     const useProxy = process.env.USE_PROXY === 'ON';
    
//     const proxyIpPort = process.env.PROXY_IP_PORT || '31.59.20.176:6754';
//     const proxyUser = process.env.PROXY_USER || 'kexwytuq';
//     const proxyPass = process.env.PROXY_PASS || 'fw1k19a4lqfd';

//     const browserArgs = [
//         '--no-sandbox',
//         '--disable-setuid-sandbox',
//         '--window-size=1280,720',
//         '--autoplay-policy=no-user-gesture-required'
//     ];

//     if (useProxy) {
//         browserArgs.push(`--proxy-server=http://${proxyIpPort}`);
//     }

//     console.log(`Launching Browser on GitHub Actions Virtual Screen with Proxy: ${useProxy ? 'ON' : 'OFF'}...`);
//     browser = await puppeteer.launch({
//         channel: 'chrome',
//         headless: false, // Xvfb par render karne ke liye false
//         defaultViewport: { width: 1280, height: 720 },
//         ignoreDefaultArgs: ['--enable-automation'], // NAYA: Hides the "Chrome is being controlled" infobar
//         args: browserArgs
//     });

//     const page = await browser.newPage();
    
//     // NAYA: Clean up default about:blank tab so it doesn't clutter the display
//     const pages = await browser.pages();
//     for (const p of pages) {
//         if (p !== page) await p.close();
//     }

//     // NAYA: Aggressive Ad-Popup Blocker & Focus Management
//     browser.on('targetcreated', async (target) => {
//         if (target.type() === 'page') {
//             try {
//                 const newPage = await target.page();
//                 if (newPage && newPage !== page) {
//                     console.log(`[*] New tab detected. Bringing video tab back to front and queued for close...`);
//                     // Instantly steal focus back to the video!
//                     await page.bringToFront();
//                     // Wait 2 seconds before closing so Puppeteer-stealth plugin doesn't crash from missing targets
//                     setTimeout(() => {
//                         newPage.close().catch(() => {});
//                     }, 2000);
//                 }
//             } catch(e) {}
//         }
//     });

//     page.on('console', msg => {
//         const text = msg.text();
//         console.log(`[Browser Console]: ${text}`);
        
//         // Only restart if the player throws 0x50014 (Cross-domain/DRM failure).
//         // Ignored generic 403s in console output, as they are often just blocked ads or trackers.
//         if (text.includes('0x50014')) {
//             console.log(`\n🚨 [ALERT] Error code 0x50014 detected in console!`);
//             if (browser && browser.isConnected()) {
//                 console.log(`[*] Forcefully closing browser to initiate instant restart...`);
//                 browser.close().catch(() => { });
//             }
//         }
//     });

//     page.on('response', response => {
//         if (response.status() === 403 || response.status() === 404) {
//             const url = response.url();
//             if (url.includes('.m3u8') || url.includes('.ts')) {
//                 console.log(`\n🚨 [ALERT] Blocked (${response.status()}) detected for media sequence: ${url}`);
//                 if (browser && browser.isConnected()) {
//                     console.log(`[*] Forcefully closing browser to initiate instant restart...`);
//                     browser.close().catch(() => { });
//                 }
//             }
//         }
//     });

//     // Proxy Authentication (Only if Proxy is ON)
//     if (useProxy) {
//         await page.authenticate({
//             username: proxyUser,
//             password: proxyPass
//         });
//         console.log("Proxy credentials applied successfully.");
//     } else {
//         console.log("Skipping proxy authentication because Proxy is OFF.");
//     }

//     // Let stealth plugin manage the User-Agent to prevent fingerprint mismatch
//     // ==========================================

//     // Screen Recording Logic (20 Sec Debug)
//     const recorder = new PuppeteerScreenRecorder(page);
//     await recorder.start('debug_video.mp4');
//     console.log('🎥 [*] 20-second Debug Screen Recording Started...');

//     setTimeout(async () => {
//         try {
//             await recorder.stop();
//             console.log('🛑 [*] Screen recording stopped. Uploading to GitHub Releases...');
//             const tagName = `debug-video-${Date.now()}`;
//             execSync(`gh release create ${tagName} debug_video.mp4 --title "Debug Record: ${tagName}" --notes "Automated 20 seconds Chrome recording check."`, { stdio: 'inherit' });
//             console.log('✅ [+] Successfully uploaded video to GitHub Releases!');
//         } catch (err) {
//             console.error('❌ [!] Failed to upload debug video:', err.message);
//         }
//     }, 20000);

//     // Get Xvfb display number, usually provided by xvfb-run
//     const displayNum = process.env.DISPLAY || ':99';

//     await page.exposeFunction('triggerInstantRestart', async (reason) => {
//         console.log(`\n🚨 [ALERT] In-Browser Detector Triggered: ${reason}`);
//         console.log(`[*] Forcefully closing browser to initiate instant restart...`);
//         if (browser) await browser.close().catch(() => { });
//     });

//     console.log(`[*] Navigating to target URL using Proxy...`);
//     try {
//         await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
//     } catch (e) {
//         if (e.message.includes('ERR_TUNNEL_CONNECTION_FAILED')) {
//             throw new Error(`Proxy tunnel failed. Your proxy (${proxyIpPort}) is likely dead, blocked, or out of bandwidth.`);
//         }
//         throw e;
//     }

//     console.log('[*] Waiting for potential Cloudflare...');
//     for (let i = 0; i < 15; i++) {
//         const title = await page.title();
//         if (!title.includes('Moment') && !title.includes('Cloudflare')) break;
//         await new Promise(r => setTimeout(r, 1000));
//     }

//     await new Promise(resolve => setTimeout(resolve, 8000));

//     console.log('[*] Cleaning up ads...');
//     for (const frame of page.frames()) {
//         try {
//             await frame.evaluate(() => {
//                 const adElement = document.querySelector('div#dontfoid');
//                 if (adElement) adElement.remove();
//             });
//         } catch (e) { }
//     }

//     let targetFrame = null;
//     for (const frame of page.frames()) {
//         try {
//             const hasVideo = await frame.evaluate(() => !!document.querySelector('video'));
//             if (hasVideo) {
//                 targetFrame = frame;
//                 console.log(`[+] Found video element inside frame: ${frame.url() || 'unknown'}`);
//                 break;
//             }
//         } catch (e) { }
//     }

//     if (!targetFrame) throw new Error('No <video> element could be found.');

//     try {
//         const iframeElement = await targetFrame.frameElement();
//         const box = await iframeElement.boundingBox();
//         if (box) {
//             await page.mouse.move(box.x + (box.width / 2), box.y + (box.height / 2), { steps: 15 });
//             await new Promise(r => setTimeout(r, 1000));
//             await page.mouse.click(box.x + (box.width / 2), box.y + (box.height / 2));
//             console.log('[*] Succeeded in clicking the exact center of the video player.');
//         }
//     } catch (e) {
//         try { await targetFrame.click('video'); } catch (err) { }
//     }

//     // In-Browser Injection: Force Fullscreen & Play
//     await targetFrame.evaluate(async () => {
//         const video = document.querySelector('video');
//         if (!video) throw new Error('No <video> element found.');

//         video.muted = false; // Unmute so audio flows to PulseAudio
//         await video.play().catch(e => console.log('[Player Debug] Auto-play manually blocked/failed:', e));

//         await new Promise((resolve, reject) => {
//             let elapsed = 0;
//             const interval = setInterval(() => {
//                 elapsed += 500;
                
//                 if (video.videoWidth > 0 && video.readyState >= 3) {
//                     clearInterval(interval);
//                     resolve();
//                 } else if (elapsed > 60000) {
//                     clearInterval(interval);
//                     reject(new Error('Timeout: Video took longer than 60 seconds to populate.'));
//                 }
//             }, 500);
//         });

//         // Force CSS Fullscreen fallback on the video
//         try {
//             video.style.position = 'fixed';
//             video.style.top = '0';
//             video.style.left = '0';
//             video.style.width = '100vw';
//             video.style.height = '100vh';
//             video.style.zIndex = '999999';
//             video.style.backgroundColor = 'black';
//             video.style.objectFit = 'contain';
//         } catch(e) {}

//         // NAYA CODE: Error & Freeze Detector
//         setInterval(() => {
//             try {
//                 const bodyText = document.body.innerText || "";
//                 if (bodyText.includes('0x50014') || bodyText.includes('Error')) {
//                     if (window.triggerInstantRestart) window.triggerInstantRestart("Player Error 0x50014 Detected");
//                     return;
//                 }

//                 if (video) {
//                     if (window.lastVideoTime === undefined) window.lastVideoTime = -1;
//                     if (video.currentTime === window.lastVideoTime && video.readyState > 0 && !video.paused) {
//                         window.frozenCount = (window.frozenCount || 0) + 1;
//                         if (window.frozenCount > 8) {
//                             if (window.triggerInstantRestart) window.triggerInstantRestart("Video completely frozen");
//                         }
//                     } else {
//                         window.frozenCount = 0;
//                     }
//                     window.lastVideoTime = video.currentTime;
//                 }
//             } catch (e) { }
//         }, 5000);

//         return true;
//     });

//     console.log('[*] Video playing! Spawning FFmpeg to capture X11 Display & PulseAudio...');

//     ffmpegProcess = spawn('ffmpeg', [
//         '-y',
//         '-thread_queue_size', '1024',
//         '-f', 'x11grab',
//         '-video_size', '1280x720',
//         '-framerate', '30',
//         '-i', displayNum,
//         '-thread_queue_size', '1024',
//         '-f', 'pulse',
//         '-i', 'default',
//         '-c:v', 'libx264',
//         '-preset', 'veryfast',  // Important to prevent CPU maxout on GH Actions
//         '-maxrate', '3000k',
//         '-bufsize', '6000k',
//         '-pix_fmt', 'yuv420p',
//         '-g', '60',
//         '-c:a', 'aac',
//         '-b:a', '128k',
//         '-ar', '44100',
//         '-f', 'flv',
//         RTMP_DESTINATION
//     ]);

//     ffmpegProcess.stderr.on('data', (data) => {
//         const output = data.toString().trim();
//         // Log periodically to avoid massive github logs, but show critical debug
//         if (output.includes('frame=') && output.includes('fps=')) {
//             // print as a single overriding line in terminal if possible
//             process.stdout.write(`\r[FFmpeg Heartbeat]: ${output.substring(0, 100)}`);
//         } else if (output.includes('Error') || output.includes('Failed')) {
//             console.log(`\n[FFmpeg Issue]: ${output}`);
//         }
//     });

//     ffmpegProcess.stdin.on('error', (err) => console.log(`\n[!] ffmpeg stdin closed (${err.code}).`));
//     ffmpegProcess.on('close', (code) => console.log(`\n[*] FFmpeg process exited with code ${code}`));
//     ffmpegProcess.on('error', (err) => console.error('\n[!] FFmpeg failed to start.', err));

//     // Node Watchdog
//     console.log('\n[*] Engine successfully connected! Monitoring stream health via FFmpeg heartbeat...');
//     while (true) {
//         if (!browser || !browser.isConnected()) {
//             throw new Error("Browser was closed intentionally by Detector.");
//         }
//         if (!ffmpegProcess || ffmpegProcess.exitCode !== null) {
//             throw new Error("FFmpeg process died unexpectedly.");
//         }
//         await new Promise(r => setTimeout(r, 2000));
//     }
// }

// async function cleanup() {
//     if (ffmpegProcess) {
//         try {
//             ffmpegProcess.stdin.end();
//             ffmpegProcess.kill('SIGINT');
//         } catch (e) { }
//         ffmpegProcess = null;
//     }
//     if (browser) {
//         try {
//             await browser.close();
//         } catch (e) { }
//         browser = null;
//     }
// }

// process.on('SIGINT', async () => {
//     console.log('\n[*] Stopping live script cleanly...');
//     await cleanup();
//     process.exit(0);
// });

// // Boot
// mainLoop();








// 222

// const puppeteer = require('puppeteer-extra');
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// puppeteer.use(StealthPlugin());

// const { spawn, execSync } = require('child_process');
// const { PuppeteerScreenRecorder } = require('puppeteer-screen-recorder');

// const TARGET_URL = 'https://dadocric.st/player.php?id=starsp3&v=m';
// const RTMP_SERVER = 'rtmp://vsu.okcdn.ru/input/';
// const STREAM_KEY = '14601603391083_14040893622891_puxzrwjniu';
// const RTMP_DESTINATION = `${RTMP_SERVER}${STREAM_KEY}`;

// let browser = null;
// let ffmpegProcess = null;
// let lastChunkTime = Date.now();

// // 24/7 Infinite Loop
// async function mainLoop() {
//     while (true) {
//         try {
//             await startDirectStreaming();
//             console.log('[!] Stream function resolved unexpectedly. Restarting in 5s...');
//             await new Promise(resolve => setTimeout(resolve, 5000));
//         } catch (error) {
//             console.error('[!] Global Stream Error: Restarting in 5s...', error.message || error);
//             await cleanup();
//             await new Promise(resolve => setTimeout(resolve, 5000));
//         }
//     }
// }

// async function startDirectStreaming() {
//     console.log('[*] Starting browser and FFmpeg for LIVE 24/7 Streaming...');

//     // FFmpeg Process will be spanned dynamically when the first stream chunk arrives
//     // to prevent EBML pos 0 errors if navigation or proxy fails before starting.

//     // ==========================================
//     // NAYA CHROME LAUNCH LOGIC (HUMAN-LIKE)
//     // ==========================================
//     // Check if we should use proxy (default is OFF unless specified)
//     const useProxy = process.env.USE_PROXY === 'ON';
    
//     const proxyIpPort = process.env.PROXY_IP_PORT || '31.59.20.176:6754';
//     const proxyUser = process.env.PROXY_USER || 'kexwytuq';
//     const proxyPass = process.env.PROXY_PASS || 'fw1k19a4lqfd';

//     const browserArgs = [
//         '--no-sandbox',
//         '--disable-setuid-sandbox',
//         '--window-size=1280,720',
//         '--autoplay-policy=no-user-gesture-required'
//     ];

//     if (useProxy) {
//         browserArgs.push(`--proxy-server=http://${proxyIpPort}`);
//     }

//     console.log(`Launching Browser on GitHub Actions Virtual Screen with Proxy: ${useProxy ? 'ON' : 'OFF'}...`);
//     browser = await puppeteer.launch({
//         channel: 'chrome',
//         headless: false, // Xvfb par render karne ke liye false
//         defaultViewport: { width: 1280, height: 720 },
//         ignoreDefaultArgs: ['--enable-automation'], // NAYA: Hides the "Chrome is being controlled" infobar
//         args: browserArgs
//     });

//     const page = await browser.newPage();
    
//     // NAYA: Clean up default about:blank tab so it doesn't clutter the display
//     const pages = await browser.pages();
//     for (const p of pages) {
//         if (p !== page) await p.close();
//     }

//     // NAYA: Aggressive Ad-Popup Blocker & Focus Management
//     browser.on('targetcreated', async (target) => {
//         if (target.type() === 'page') {
//             try {
//                 const newPage = await target.page();
//                 if (newPage && newPage !== page) {
//                     console.log(`[*] New tab detected. Bringing video tab back to front and queued for close...`);
//                     // Instantly steal focus back to the video!
//                     await page.bringToFront();
//                     // Wait 2 seconds before closing so Puppeteer-stealth plugin doesn't crash from missing targets
//                     setTimeout(() => {
//                         newPage.close().catch(() => {});
//                     }, 2000);
//                 }
//             } catch(e) {}
//         }
//     });

//     page.on('console', msg => {
//         const text = msg.text();
//         console.log(`[Browser Console]: ${text}`);
        
//         // Only restart if the player throws 0x50014 (Cross-domain/DRM failure).
//         // Ignored generic 403s in console output, as they are often just blocked ads or trackers.
//         if (text.includes('0x50014')) {
//             console.log(`\n🚨 [ALERT] Error code 0x50014 detected in console!`);
//             if (browser && browser.isConnected()) {
//                 console.log(`[*] Forcefully closing browser to initiate instant restart...`);
//                 browser.close().catch(() => { });
//             }
//         }
//     });

//     page.on('response', response => {
//         if (response.status() === 403 || response.status() === 404) {
//             const url = response.url();
//             if (url.includes('.m3u8') || url.includes('.ts')) {
//                 console.log(`\n🚨 [ALERT] Blocked (${response.status()}) detected for media sequence: ${url}`);
//                 if (browser && browser.isConnected()) {
//                     console.log(`[*] Forcefully closing browser to initiate instant restart...`);
//                     browser.close().catch(() => { });
//                 }
//             }
//         }
//     });

//     // Proxy Authentication (Only if Proxy is ON)
//     if (useProxy) {
//         await page.authenticate({
//             username: proxyUser,
//             password: proxyPass
//         });
//         console.log("Proxy credentials applied successfully.");
//     } else {
//         console.log("Skipping proxy authentication because Proxy is OFF.");
//     }

//     // Let stealth plugin manage the User-Agent to prevent fingerprint mismatch
//     // ==========================================

//     // Screen Recording Logic (20 Sec Debug)
//     const recorder = new PuppeteerScreenRecorder(page);
//     await recorder.start('debug_video.mp4');
//     console.log('🎥 [*] 20-second Debug Screen Recording Started...');

//     setTimeout(async () => {
//         try {
//             await recorder.stop();
//             console.log('🛑 [*] Screen recording stopped. Uploading to GitHub Releases...');
//             const tagName = `debug-video-${Date.now()}`;
//             execSync(`gh release create ${tagName} debug_video.mp4 --title "Debug Record: ${tagName}" --notes "Automated 20 seconds Chrome recording check."`, { stdio: 'inherit' });
//             console.log('✅ [+] Successfully uploaded video to GitHub Releases!');
//         } catch (err) {
//             console.error('❌ [!] Failed to upload debug video:', err.message);
//         }
//     }, 20000);

//     // Get Xvfb display number, usually provided by xvfb-run
//     const displayNum = process.env.DISPLAY || ':99';

//     await page.exposeFunction('triggerInstantRestart', async (reason) => {
//         console.log(`\n🚨 [ALERT] In-Browser Detector Triggered: ${reason}`);
//         console.log(`[*] Forcefully closing browser to initiate instant restart...`);
//         if (browser) await browser.close().catch(() => { });
//     });

//     console.log(`[*] Navigating to target URL using Proxy...`);
//     try {
//         await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
//     } catch (e) {
//         if (e.message.includes('ERR_TUNNEL_CONNECTION_FAILED')) {
//             throw new Error(`Proxy tunnel failed. Your proxy (${proxyIpPort}) is likely dead, blocked, or out of bandwidth.`);
//         }
//         throw e;
//     }

//     console.log('[*] Waiting for potential Cloudflare...');
//     for (let i = 0; i < 15; i++) {
//         const title = await page.title();
//         if (!title.includes('Moment') && !title.includes('Cloudflare')) break;
//         await new Promise(r => setTimeout(r, 1000));
//     }

//     await new Promise(resolve => setTimeout(resolve, 8000));

//     console.log('[*] Cleaning up ads...');
//     for (const frame of page.frames()) {
//         try {
//             await frame.evaluate(() => {
//                 const adElement = document.querySelector('div#dontfoid');
//                 if (adElement) adElement.remove();
//             });
//         } catch (e) { }
//     }

//     let targetFrame = null;
//     for (const frame of page.frames()) {
//         try {
//             const hasVideo = await frame.evaluate(() => !!document.querySelector('video'));
//             if (hasVideo) {
//                 targetFrame = frame;
//                 console.log(`[+] Found video element inside frame: ${frame.url() || 'unknown'}`);
//                 break;
//             }
//         } catch (e) { }
//     }

//     if (!targetFrame) throw new Error('No <video> element could be found.');

//     try {
//         const iframeElement = await targetFrame.frameElement();
//         const box = await iframeElement.boundingBox();
//         if (box) {
//             await page.mouse.move(box.x + (box.width / 2), box.y + (box.height / 2), { steps: 15 });
//             await new Promise(r => setTimeout(r, 1000));
//             await page.mouse.click(box.x + (box.width / 2), box.y + (box.height / 2));
//             console.log('[*] Succeeded in clicking the exact center of the video player.');
//         }
//     } catch (e) {
//         try { await targetFrame.click('video'); } catch (err) { }
//     }

//     // In-Browser Injection: Force Fullscreen & Play
//     await targetFrame.evaluate(async () => {
//         const video = document.querySelector('video');
//         if (!video) throw new Error('No <video> element found.');

//         video.muted = false; // Unmute so audio flows to PulseAudio
//         await video.play().catch(e => console.log('[Player Debug] Auto-play manually blocked/failed:', e));

//         await new Promise((resolve, reject) => {
//             let elapsed = 0;
//             const interval = setInterval(() => {
//                 elapsed += 500;
                
//                 if (video.videoWidth > 0 && video.readyState >= 3) {
//                     clearInterval(interval);
//                     resolve();
//                 } else if (elapsed > 60000) {
//                     clearInterval(interval);
//                     reject(new Error('Timeout: Video took longer than 60 seconds to populate.'));
//                 }
//             }, 500);
//         });

//         // Force CSS Fullscreen fallback on the video
//         try {
//             video.style.position = 'fixed';
//             video.style.top = '0';
//             video.style.left = '0';
//             video.style.width = '100vw';
//             video.style.height = '100vh';
//             video.style.zIndex = '999999';
//             video.style.backgroundColor = 'black';
//             video.style.objectFit = 'contain';
//         } catch(e) {}

//         // NAYA CODE: Error & Freeze Detector
//         setInterval(() => {
//             try {
//                 const bodyText = document.body.innerText || "";
//                 if (bodyText.includes('0x50014') || bodyText.includes('Error')) {
//                     if (window.triggerInstantRestart) window.triggerInstantRestart("Player Error 0x50014 Detected");
//                     return;
//                 }

//                 if (video) {
//                     if (window.lastVideoTime === undefined) window.lastVideoTime = -1;
//                     if (video.currentTime === window.lastVideoTime && video.readyState > 0 && !video.paused) {
//                         window.frozenCount = (window.frozenCount || 0) + 1;
//                         if (window.frozenCount > 8) {
//                             if (window.triggerInstantRestart) window.triggerInstantRestart("Video completely frozen");
//                         }
//                     } else {
//                         window.frozenCount = 0;
//                     }
//                     window.lastVideoTime = video.currentTime;
//                 }
//             } catch (e) { }
//         }, 5000);

//         return true;
//     });

//     console.log('[*] Video playing! Spawning FFmpeg to capture X11 Display & PulseAudio...');

//     ffmpegProcess = spawn('ffmpeg', [
//         '-y',
//         '-thread_queue_size', '1024',
//         '-f', 'x11grab',
//         '-video_size', '1280x720',
//         '-framerate', '30',
//         '-i', displayNum,
//         '-thread_queue_size', '1024',
//         '-f', 'pulse',
//         '-i', 'default',
//         '-c:v', 'libx264',
//         '-preset', 'veryfast',  // Important to prevent CPU maxout on GH Actions
//         '-maxrate', '3000k',
//         '-bufsize', '6000k',
//         '-pix_fmt', 'yuv420p',
//         '-g', '60',
//         '-c:a', 'aac',
//         '-b:a', '128k',
//         '-ar', '44100',
//         // RTMP_DESTINATION // Commented out for local test
//         'test_stream_output.flv'
//     ]);

//     ffmpegProcess.stderr.on('data', (data) => {
//         const output = data.toString().trim();
//         // Log periodically to avoid massive github logs, but show critical debug
//         if (output.includes('frame=') && output.includes('fps=')) {
//             // print as a single overriding line in terminal if possible
//             process.stdout.write(`\r[FFmpeg Heartbeat]: ${output.substring(0, 100)}`);
//         } else if (output.includes('Error') || output.includes('Failed')) {
//             console.log(`\n[FFmpeg Issue]: ${output}`);
//         }
//     });

//     ffmpegProcess.stdin.on('error', (err) => console.log(`\n[!] ffmpeg stdin closed (${err.code}).`));
//     ffmpegProcess.on('close', (code) => console.log(`\n[*] FFmpeg process exited with code ${code}`));
//     ffmpegProcess.on('error', (err) => console.error('\n[!] FFmpeg failed to start.', err));

//     // NAYA: TEST MODE UPLOAD LOGIC
//     console.log('\n[*] TEST MODE: Recording locally for 30 seconds then uploading to GitHub...');
//     await new Promise(r => setTimeout(r, 30000)); // wait 30 seconds
    
//     console.log('\n🛑 [*] 30 seconds reached. Stopping FFmpeg to save local file test_stream_output.flv...');
//     ffmpegProcess.kill('SIGINT');
    
//     await new Promise(r => setTimeout(r, 5000)); // Wait for ffmpeg to gracefully save
    
//     try {
//         const tagName = `ffmpeg-test-${Date.now()}`;
//         console.log(`[*] Uploading test_stream_output.flv to GitHub Release ${tagName}...`);
//         execSync(`gh release create ${tagName} test_stream_output.flv --title "FFmpeg Stream X11 Test"`, { stdio: 'inherit' });
//         console.log('✅ [+] Successfully uploaded FFmpeg FLV to GitHub Releases!');
//     } catch (err) {
//         console.error('❌ [!] Failed to upload FFmpeg test file:', err.message);
//     }
    
//     console.log('[*] Test Complete. Exiting script gracefully.');
//     process.exit(0);
// }

// async function cleanup() {
//     if (ffmpegProcess) {
//         try {
//             ffmpegProcess.stdin.end();
//             ffmpegProcess.kill('SIGINT');
//         } catch (e) { }
//         ffmpegProcess = null;
//     }
//     if (browser) {
//         try {
//             await browser.close();
//         } catch (e) { }
//         browser = null;
//     }
// }

// process.on('SIGINT', async () => {
//     console.log('\n[*] Stopping live script cleanly...');
//     await cleanup();
//     process.exit(0);
// });

// // Boot
// mainLoop();
























































































// ===================== I think proxy nahey hai is liyee video nahy play hu raha hai =========================




// const puppeteer = require('puppeteer-extra');
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// puppeteer.use(StealthPlugin());

// const { spawn } = require('child_process');

// const TARGET_URL = 'https://dadocric.st/player.php?id=starsp3&v=m';
// const RTMP_SERVER = 'rtmps://vsu.okcdn.ru/input/'; // OK.ru TLS dropped the feed, reverting to standard RTMP
// const STREAM_KEY = '14601603391083_14040893622891_puxzrwjniu';
// const RTMP_DESTINATION = `${RTMP_SERVER}${STREAM_KEY}`;

// let browser = null;
// let ffmpegProcess = null;
// let lastChunkTime = Date.now();

// // An infinite loop controller for 24/7 broadcasting
// async function mainLoop() {
//     while (true) {
//         try {
//             await startDirectStreaming();
//             // If function resolves normally (it shouldn't in 24/7), wait 5 seconds and restart
//             console.log('[!] Stream function resolved unexpectedly. Restarting in 5s...');
//             await new Promise(resolve => setTimeout(resolve, 5000));
//         } catch (error) {
//             console.error('[!] Global Stream Error: Restarting in 5s...', error.message || error);
//             await cleanup();
//             await new Promise(resolve => setTimeout(resolve, 5000));
//         }
//     }
// }

// async function startDirectStreaming() {
//     console.log('[*] Starting browser and FFmpeg for LIVE 24/7 Streaming...');

//     // Spawn FFmpeg to listen on standard input (pipe:0)
//     // We tune this heavily for live RTMP rebroadcasting
//     ffmpegProcess = spawn('ffmpeg', [
//         '-y',
//         '-analyzeduration', '100M', // Help FFmpeg parse the incoming live WebM stream
//         '-probesize', '100M',
//         '-f', 'webm',               // Our input chunk format from Chrome
//         '-i', 'pipe:0',             // Read from stdin
//         '-c:v', 'libx264',          // Encode to H.264
//         '-preset', 'veryfast',      // Low latency CPU preset
//         '-maxrate', '3000k',        // Control bitrate
//         '-bufsize', '6000k',        // Control stream buffering
//         '-pix_fmt', 'yuv420p',      // Standard pixel format for RTMP compatibility
//         '-r', '30',                 // STRICT CFR 30fps injection. Live ingest servers crash if it receives VFR
//         '-g', '60',                 // Keyframe interval (2 seconds at 30fps)
//         '-c:a', 'aac',              // Audio codec
//         '-b:a', '128k',             // Audio bitrate
//         '-ar', '44100',             // Audio sample rate
//         '-f', 'flv',                // RTMP relies on the FLV container format



//         // RTMP_DESTINATION
//         'local_buffer.flv' // <-- Yahan RTMP URL ki jagah local file ka naam de dein

//     ]);

//     ffmpegProcess.stderr.on('data', (data) => {
//         // Output FFmpeg's deep error trace to terminal
//         console.log(`[FFmpeg]: ${data.toString()}`);
//     });

//     // CRITICAL: Swallow stdin EOF exceptions so Node doesn't violently exit if the stream provider drops our connection
//     ffmpegProcess.stdin.on('error', (err) => {
//         console.log(`[!] ffmpeg stdin closed (${err.code}). Reconnecting...`);
//     });

//     ffmpegProcess.on('close', (code) => {
//         console.log(`[*] FFmpeg process exited with code ${code}`);
//     });

//     ffmpegProcess.on('error', (err) => {
//         console.error('[!] FFmpeg failed to start.', err);
//     });

//     browser = await puppeteer.launch({
//         channel: 'chrome',
//         headless: false,
//         args: [
//             '--start-maximized',
//             '--autoplay-policy=no-user-gesture-required',
//             '--disable-web-security', // ESSENTIAL for capturing cross-origin streams without throwing SecurityError
//             '--no-sandbox',
//             '--disable-setuid-sandbox'
//         ],
//         defaultViewport: null,
//     });

//     const page = await browser.newPage();

//     // We expose a function that the browser can call to pipe the live video byte buffers into Node
//     await page.exposeFunction('streamChunkToNode', async (base64Chunk) => {
//         lastChunkTime = Date.now(); // Reset the watchdog
//         // Strict verification that the pipe is alive before writing
//         if (ffmpegProcess && ffmpegProcess.stdin && ffmpegProcess.exitCode === null) {
//             try {
//                 const buffer = Buffer.from(base64Chunk, 'base64');
//                 ffmpegProcess.stdin.write(buffer, (err) => {
//                     if (err) console.error("FFmpeg write cleanly dropped:", err.message);
//                 });
//             } catch (err) { }
//         }
//     });

//     console.log(`[*] Navigating to ${TARGET_URL}...`);

//     // Add a normal User-Agent to further disguise the browser
//     await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36');

//     // Use domcontentloaded instead of networkidle2 because streaming sites constantly background-load ad trackers
//     await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

//     console.log('[*] Waiting for potential Cloudflare Turnstile to securely resolve itself...');
//     // We poll until the page title is no longer 'Just a moment...' or 15 seconds elapse
//     for (let i = 0; i < 15; i++) {
//         const title = await page.title();
//         if (!title.includes('Moment') && !title.includes('Cloudflare')) break;
//         await new Promise(r => setTimeout(r, 1000));
//     }

//     console.log('[*] Waiting for iframes to load natively...');
//     await new Promise(resolve => setTimeout(resolve, 8000));

//     console.log('[*] Cleaning up ad elements across all frames...');
//     for (const frame of page.frames()) {
//         try {
//             await frame.evaluate(() => {
//                 const adElement = document.querySelector('div#dontfoid');
//                 if (adElement) adElement.remove();
//             });
//         } catch (e) {
//             // Ignore cross-origin access errors
//         }
//     }

//     console.log('[*] Searching all iframes for the target video element...');
//     let targetFrame = null;
//     for (const frame of page.frames()) {
//         try {
//             const hasVideo = await frame.evaluate(() => !!document.querySelector('video'));
//             if (hasVideo) {
//                 targetFrame = frame;
//                 console.log(`[+] Found video element inside frame: ${frame.url() || 'unknown'}`);
//                 break;
//             }
//         } catch (e) {
//             // Ignore
//         }
//     }

//     if (!targetFrame) {
//         throw new Error('No <video> element could be found.');
//     }

//     console.log('[*] Injecting LIVE MediaRecorder streaming logic...');

//     // Perform an aggressive physical mouse click precisely in the center of the iframe to break through the 'CLICK HERE TO UNMUTE' overlay
//     try {
//         const iframeElement = await targetFrame.frameElement();
//         const box = await iframeElement.boundingBox();
//         if (box) {
//             await page.mouse.click(box.x + (box.width / 2), box.y + (box.height / 2));
//             console.log('[*] Succeeded in clicking the exact center of the video player.');
//         }
//     } catch (e) {
//         console.log('[!] Overlay physical click failed, attempting standard DOM click...');
//         try { await targetFrame.click('video'); } catch (err) { }
//     }

//     // Evaluate setup. Return as soon as recording starts instead of waiting forever.
//     await targetFrame.evaluate(async () => {
//         const video = document.querySelector('video');
//         if (!video) throw new Error('No <video> element found.');

//         video.muted = false;

//         // Ensure the video is playing
//         await video.play().catch(e => console.log('Auto-play blocked or failed:', e));

//         // CRITICAL: Wait for physical dimensions. If we capture before width > 0, the EBML Header is corrupted!
//         await new Promise((resolve, reject) => {
//             let elapsed = 0;
//             const interval = setInterval(() => {
//                 elapsed += 500;
//                 if (video.videoWidth > 0 && video.readyState >= 3) {
//                     clearInterval(interval);
//                     resolve();
//                 } else if (elapsed > 60000) {
//                     clearInterval(interval);
//                     reject(new Error('Timeout: Video took longer than 60 seconds to load dimensions.'));
//                 }
//             }, 500);
//         });

//         let stream = video.captureStream ? video.captureStream() : video.mozCaptureStream();

//         // CRITICAL: Wait for an active, live video track
//         await new Promise((resolve, reject) => {
//             let elapsed = 0;
//             const trackInterval = setInterval(() => {
//                 elapsed += 500;
//                 const tracks = stream.getVideoTracks();
//                 if (tracks.length > 0 && tracks[0].readyState === 'live') {
//                     clearInterval(trackInterval);
//                     resolve();
//                 } else if (elapsed > 20000) {
//                     clearInterval(trackInterval);
//                     reject(new Error('Timeout: Video stream tracks never populated.'));
//                 }
//             }, 500);
//         });

//         // Let the stream buffer a tiny bit to ensure the first I-frame is present
//         await new Promise(r => setTimeout(r, 1000));

//         const options = { mimeType: 'video/webm; codecs=vp8,opus' };
//         const recorder = new MediaRecorder(stream, MediaRecorder.isTypeSupported(options.mimeType) ? options : undefined);

//         let chunkQueue = [];
//         let isProcessing = false;

//         // Synchronous sequential queue for flawless chronological base64 transmission
//         async function processQueue() {
//             if (isProcessing) return;
//             isProcessing = true;
//             while (chunkQueue.length > 0) {
//                 const blob = chunkQueue.shift();
//                 try {
//                     const base64Data = await new Promise((resolve) => {
//                         const reader = new FileReader();
//                         reader.onloadend = () => {
//                             // DO NOT use split(',') because Chromium injects commas into the mime-type: "video/webm;codecs=vp8,opus"
//                             resolve(reader.result.split('base64,')[1]);
//                         };
//                         reader.readAsDataURL(blob);
//                     });
//                     if (window.streamChunkToNode) {
//                         await window.streamChunkToNode(base64Data);
//                     }
//                 } catch (e) {
//                     console.log('Chunk processing error:', e);
//                 }
//             }
//             isProcessing = false;
//         }

//         recorder.ondataavailable = (event) => {
//             if (event.data && event.data.size > 0) {
//                 chunkQueue.push(event.data);
//                 processQueue();
//             }
//         };

//         // Output massive 3-second chunks to ensure headers are stable
//         recorder.start(3000);
//         console.log('LIVE Streaming started successfully with active tracks!');
//         return true;
//     });

//     // Watchdog logic (runs in Node)
//     lastChunkTime = Date.now();
//     console.log('[*] Engine successfully connected! Monitoring stream health...');
//     while (true) {
//         if (Date.now() - lastChunkTime > 20000) {
//             throw new Error("Stream dropped: No video chunks received from browser for 20 seconds.");
//         }
//         await new Promise(r => setTimeout(r, 2000)); // Check every 2 seconds heartbeat
//     }
// }

// // Ensure processes drop cleanly during a forced restart
// async function cleanup() {
//     if (ffmpegProcess) {
//         try {
//             ffmpegProcess.stdin.end();
//             ffmpegProcess.kill('SIGINT');
//         } catch (e) { }
//         ffmpegProcess = null;
//     }
//     if (browser) {
//         try {
//             await browser.close();
//         } catch (e) { }
//         browser = null;
//     }
// }

// // Graceful exit
// process.on('SIGINT', async () => {
//     console.log('\n[*] Stopping live script cleanly...');
//     await cleanup();
//     process.exit(0);
// });

// // Boot script
// mainLoop();
