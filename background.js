// Copyright Joseph Peransi, 2026. Be excellent to each other.
// HandyVoice Bridge v1.3.6 - Opaque Fetch (No-CORS) Architecture

const API_BASE = "https://api.handyfeeling.com/api/handy/v2";
const RULE_ID = 1;

/**
 * Atomic sync of declarativeNetRequest rules.
 * This strips the extension origin and injects headers at the kernel level
 * so fetch() calls remain "simple" and do not trigger CORS preflight OPTIONS.
 */
async function syncDNR(key) {
    const cleanKey = key.trim();
    if (!cleanKey) return;

    await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: [RULE_ID],
        addRules: [{
            id: RULE_ID,
            priority: 1,
            action: {
                type: "modifyHeaders",
                requestHeaders: [
                    { header: "X-Connection-Key", operation: "set", value: cleanKey },
                    { header: "Content-Type", operation: "set", value: "application/json" },
                    { header: "Origin", operation: "remove" },
                    { header: "Referer", operation: "set", value: "https://www.handyfeeling.com/" }
                ]
            },
            condition: {
                urlFilter: "https://api.handyfeeling.com/*",
                resourceTypes: ["xmlhttprequest", "other"]
            }
        }]
    });
    
    // Crucial buffer: Allow browser thread to apply DNR rules before fetching
    await new Promise(r => setTimeout(r, 200));
}

/**
 * Header-free fetch wrapper using Opaque mode to bypass OPTIONS preflight.
 */
async function apiCall(path, method, body = null) {
    const options = { 
        method, 
        mode: 'no-cors',
        cache: 'no-cache'
    };
    
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    try {
        // mode: 'no-cors' resolves opaquely, preventing JS from crashing on CORS blocks
        await fetch(`${API_BASE}${path}`, options);
    } catch (err) {
        console.error(`Bridge Network Error [${path}]:`, err.message);
    }
}

chrome.runtime.onMessage.addListener((msg) => {
    (async () => {
        const { handyKey } = await chrome.storage.local.get(["handyKey"]);
        if (!handyKey) return;

        await syncDNR(handyKey);

        try {
            if (msg.type === "EXECUTE_CALIBRATION_STROKE") {
                console.log("Bridge: Calibration sequence initiated...");
                await apiCall("/slider/stroke", "PUT", { min: 0, max: 100 });
                await apiCall("/slider/velocity", "PUT", { velocity: 50 });
                await apiCall("/slider/state", "PUT", { state: 1 });
                await new Promise(r => setTimeout(r, 1200));
                await apiCall("/slider/state", "PUT", { state: 0 });
                console.log("Bridge: Calibration complete.");
            } else if (msg.type === "EXECUTE_HANDY_TELEMETRY") {
                const { speed, min, max } = msg.payload;
                await Promise.all([
                    apiCall("/slider/stroke", "PUT", { min, max }),
                    apiCall("/call/velocity", "PUT", { velocity: speed })
                ]);
                await apiCall("/slider/state", "PUT", { state: speed > 0 ? 1 : 0 });
            }
        } catch (e) {
            console.error("Bridge Error:", e.message);
        }
    })();
    return true;
});