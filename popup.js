// Copyright Joseph Peransi, 2026. Be excellent to each other.

document.addEventListener('DOMContentLoaded', () => {
    const keyInput = document.getElementById('connectionKey');
    const saveBtn = document.getElementById('saveBtn');
    const statusDiv = document.getElementById('status');

    chrome.storage.local.get(['handyKey'], (result) => {
        if (result.handyKey) keyInput.value = result.handyKey;
    });

    saveBtn.addEventListener('click', () => {
        const key = keyInput.value.trim();
        if (!key) return;

        console.log("Popup: Saving key and requesting calibration...");
        chrome.storage.local.set({ handyKey: key }, () => {
            statusDiv.textContent = 'Key saved! Calibrating...';
            statusDiv.style.opacity = '1';
            
            chrome.runtime.sendMessage({ type: "EXECUTE_CALIBRATION_STROKE" });

            setTimeout(() => { statusDiv.style.opacity = '0'; }, 3000);
        });
    });
});