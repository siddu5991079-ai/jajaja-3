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
        '--kiosk', // NAYA: Forces full-screen mode, completely hiding the Chrome URL bar and tabs!
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
    
    // Clean up default about:blank tab so it doesn't clutter the Xvfb screen
    const pages = await browser.pages();
    for (const p of pages) {
        if (p !== page) await p.close();
    }

    // NAYA: Aggressive Ad-Popup Blocker & Focus Management
    browser.on('targetcreated', async (target) => {
        if (target.type() === 'page') {
            try {
                const newPage = await target.page();
                if (newPage && newPage !== page) {
                    console.log(`[*] Adware tab detected! Forcing video tab back to foreground visually...`);
                    await page.bringToFront(); // X11grab will instantly snap back to the video!
                    setTimeout(() => newPage.close().catch(() => {}), 2000);
                }
            } catch(e) {}
        }
    });

    if (useProxy) {
        await page.authenticate({ username: proxyUser, password: proxyPass });
        console.log("Proxy credentials applied successfully.");
    }

    // GUI Visual Recorder (20 Sec Debug) to verify visual output logic
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

    // NAYA: Force specifically the VIDEO iframe to cover exactly the entire browser window
    try {
        const iframeElement = await targetFrame.frameElement();
        
        await page.evaluate((el) => {
            el.style.position = 'fixed';
            el.style.top = '0';
            el.style.left = '0';
            el.style.width = '100vw';
            el.style.height = '100vh';
            el.style.zIndex = '999999';
            el.style.margin = '0';
            el.style.padding = '0';
            el.style.border = 'none';
            
            document.body.style.overflow = 'hidden';
            document.body.style.margin = '0';
            document.body.style.backgroundColor = 'black';
        }, iframeElement);

        const box = await iframeElement.boundingBox();
        if (box) {
            await page.mouse.move(box.x + (box.width / 2), box.y + (box.height / 2), { steps: 5 });
            await new Promise(r => setTimeout(r, 500));
            await page.mouse.click(box.x + (box.width / 2), box.y + (box.height / 2));
            console.log('[*] Succeeded in clicking the exact center of the video player.');
        }
    } catch (e) {
        try { await targetFrame.click('video'); } catch (err) { }
    }

    // In-Browser Injection: Force Fullscreen visually & Play
    await targetFrame.evaluate(async () => {
        const video = document.querySelector('video');
        if (!video) throw new Error('No <video> element found.');

        video.muted = false; // Unmute so audio flows to PulseAudio
        await video.play().catch(e => console.log('Auto-play manually blocked/failed:', e));

        await new Promise((resolve) => {
            let elapsed = 0;
            const interval = setInterval(() => {
                elapsed += 500;
                if (video.videoWidth > 0 && video.readyState >= 3) {
                    clearInterval(interval);
                    resolve();
                } else if (elapsed > 60000) {
                    clearInterval(interval);
                    resolve();
                }
            }, 500);
        });

        // Force CSS Fullscreen fallback so video consumes 100% of the Xvfb display
        try {
            video.style.position = 'fixed';
            video.style.top = '0';
            video.style.left = '0';
            video.style.width = '100vw';
            video.style.height = '100vh';
            video.style.zIndex = '999999';
            video.style.backgroundColor = 'black';
            video.style.objectFit = 'contain';
        } catch(e) {}

        return true;
    });

    console.log('[*] Video playing! Spawning FFmpeg to capture raw X11 Display (bypasses all DRM)...');

    ffmpegProcess = spawn('ffmpeg', [
        '-y',
        '-use_wallclock_as_timestamps', '1', // NAYA: Perfectly aligns Video and Audio timelines using system clock
        '-thread_queue_size', '1024',
        '-f', 'x11grab',
        '-draw_mouse', '0', // NAYA: Stops mouse movements from causing video stutters/desync
        '-video_size', '1280x720',
        '-framerate', '30',
        '-i', displayNum,
        '-thread_queue_size', '1024',
        '-f', 'pulse',
        '-i', 'default',
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-maxrate', '3000k',
        '-bufsize', '6000k',
        '-pix_fmt', 'yuv420p',
        '-g', '60',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-ar', '44100',
        '-af', 'aresample=async=1', // NAYA: Forces FFmpeg to intelligently stretch/squeeze audio to perfectly match video frames
        '-f', 'flv',
        RTMP_DESTINATION // Live broadcast to OK.ru
    ]);

    ffmpegProcess.stderr.on('data', (data) => {
        const output = data.toString().trim();
        if (output.includes('frame=') && output.includes('fps=')) {
            process.stdout.write(`\r[FFmpeg Heartbeat]: ${output.substring(0, 100)}`);
        } else if (output.includes('Error') || output.includes('Failed')) {
            console.log(`\n[FFmpeg Issue]: ${output}`);
        }
    });

    ffmpegProcess.stdin.on('error', (err) => console.log(`\n[!] ffmpeg stdin closed (${err.code}).`));
    ffmpegProcess.on('close', (code) => console.log(`\n[*] FFmpeg process exited with code ${code}`));
    ffmpegProcess.on('error', (err) => console.error('\n[!] FFmpeg failed to start.', err));

    // Node Watchdog
    console.log('\n[*] Engine successfully connected! Live 24/7 Broadcast is running to OK.ru...');
    while (true) {
        if (!browser || !browser.isConnected()) {
            throw new Error("Browser was closed intentionally by Detector.");
        }
        if (!ffmpegProcess || ffmpegProcess.exitCode !== null) {
            throw new Error("FFmpeg process died unexpectedly.");
        }
        await new Promise(r => setTimeout(r, 2000));
    }
}

async function cleanup() {
    if (ffmpegProcess) {
        try {
            ffmpegProcess.stdin.end();
            ffmpegProcess.kill('SIGINT');
        } catch (e) { }
        ffmpegProcess = null;
    }
    if (browser) {
        try {
            await browser.close();
        } catch (e) { }
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
