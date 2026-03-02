# Handy-AI-Voice-Bridge-
HandyVoice Bridge is a Chrome extension connecting The Handy API to web-based LLMs for real-time haptic feedback. Currently in active development—looking for contributors to help resolve CORS/network routing issues to get the API handshake functioning perfectly. Licensed under GNU GPLv3.
HandyVoice Bridge

Copyright © 2026 Joseph Peransi. Be excellent to each other.

⚠️ Call for Contributors

This project is currently in active development and I am looking for help getting it to function flawlessly. We are actively working through CORS pre-flight (OPTIONS) network rejections from the Handy V2 API within the Chrome Manifest V3 service worker environment. If you have advanced experience with Chrome Extension network routing (declarativeNetRequest), opaque fetches, or hardware API bridging, your pull requests and expertise are highly welcome!

Overview

HandyVoice Bridge is a Google Chrome extension designed to bridge The Handy toy's API with web-based LLM conversational AI interfaces (such as ChatGPT, Claude, xAI, Google, and Perplexity). It allows seamless, voice-triggered or chat-triggered interaction between the AI's output and the physical device.

Installation Instructions

Run the Installer: Double-click the install_handyvoice.bat file.
This script will automatically create a directory named HandyVoiceBridge in the same location. It provisions the manifest.json, the necessary JavaScript files, and natively generates valid transparent PNG icons to ensure zero installation errors.

Load the Extension in Chrome:

Open Google Chrome and navigate to chrome://extensions/.

Toggle Developer mode on in the top right corner.

Click the Load unpacked button in the top left.

Select the newly created HandyVoiceBridge folder.

File Structure & Architecture

manifest.json: The core configuration file that grants the extension permissions to access the LLM chat URLs and the Handy API.

background.js: The service worker operating in the background. It securely handles the API calls to api.handyfeeling.com without exposing your connection key to the DOM.

content.js: The script injected into the LLM chat pages. It monitors the conversation and sends signals to the background worker based on the AI's text or voice responses.

popup.html & popup.js: The user interface accessed by clicking the extension icon. Use this to input your Handy Connection Key and adjust settings.

icons/: Contains the generated 48x48, 128x128, and 512x512 transparent PNGs to satisfy Chrome's packaging requirements.

Usage

Once installed and your Connection Key is entered via the extension popup, navigate to your preferred LLM. The content script will monitor the active DOM elements for trigger phrases or API hooks, routing them through the background service worker to control your device in real-time.

License

This project is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License v3.0 as published by the Free Software Foundation.
