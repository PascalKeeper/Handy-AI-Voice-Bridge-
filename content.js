// Copyright Joseph Peransi, 2026. Be excellent to each other.
// HandyVoice Bridge: Enhanced DOM Observer v1.3.5

(function() {
    console.log("HandyVoice Bridge: Content Script v1.3.5 initialized.");

    let lastCommand = "";
    let isCalibrated = false;
    
    // The precise trigger phrase from the system prompt
    const CALIBRATION_PHRASE = "System online. I am ready to take control. Tell me what you want.";
    
    // Improved Regex to handle variations in spacing or formatting
    const TELEMETRY_REGEX = /\[Speed:\s*(\d+)\]\s*\[Range:\s*(\d+)-(\d+)\]/gi;

    /**
     * Scans the document for telemetry brackets and handles the logic
     */
    function scanForCommands() {
        const bodyText = document.body.innerText;

        // Check for the initial system acknowledgement
        if (!isCalibrated && bodyText.includes(CALIBRATION_PHRASE)) {
            isCalibrated = true;
            console.log("HandyVoice Bridge: Telemetry confirmation detected. Signaling background for calibration...");
            chrome.runtime.sendMessage({ type: "EXECUTE_CALIBRATION_STROKE" });
        }

        // Find all matches but only process the most recent one
        const matches = [...bodyText.matchAll(TELEMETRY_REGEX)];
        if (matches.length > 0) {
            const latestMatch = matches[matches.length - 1];
            const fullMatchString = latestMatch[0];

            // Only send if the command has actually changed to save bandwidth
            if (fullMatchString !== lastCommand) {
                lastCommand = fullMatchString;
                
                const payload = {
                    speed: parseInt(latestMatch[1], 10),
                    min: parseInt(latestMatch[2], 10),
                    max: parseInt(latestMatch[3], 10)
                };

                console.log(`HandyVoice Bridge: Telemetry Sync -> Speed: ${payload.speed}%, Stroke: ${payload.min}-${payload.max}%`);
                
                chrome.runtime.sendMessage({
                    type: "EXECUTE_HANDY_TELEMETRY",
                    payload: payload
                });
            }
        }
    }

    // Use a MutationObserver to watch for real-time chat updates without polling
    const observer = new MutationObserver((mutations) => {
        let shouldScan = false;
        for (const mutation of mutations) {
            if (mutation.addedNodes.length || mutation.type === 'characterData') {
                shouldScan = true;
                break;
            }
        }
        if (shouldScan) scanForCommands();
    });

    // Observe the entire document to ensure we catch messages in any chat container
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });

    // Initial scan in case the page was refreshed during a conversation
    scanForCommands();
})();