document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = 'ppscJobOpenerEnabled';
  const toggle = document.getElementById("toggleSwitch");
  const statusText = document.getElementById("statusText");

  if (!toggle || !statusText) return;

  // Load current state
  chrome.storage.local.get([STORAGE_KEY], (result) => {
    const enabled = result[STORAGE_KEY] !== false; // default to true
    toggle.checked = enabled;
    statusText.textContent = enabled ? "Status: ON" : "Status: OFF";
  });

  // On toggle change
  toggle.addEventListener("change", () => {
    const newState = toggle.checked;
    chrome.storage.local.set({ [STORAGE_KEY]: newState });
    statusText.textContent = newState ? "Status: ON" : "Status: OFF";

    // Notify the content script on the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "TOGGLE_STATE_CHANGED",
        value: newState
      });
    });
  });
});
