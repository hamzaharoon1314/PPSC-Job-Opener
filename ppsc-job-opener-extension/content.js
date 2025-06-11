(function () {
  'use strict';

const STORAGE_KEY = 'ppscJobOpenerEnabled';

function isEnabled(callback) {
  chrome.storage.local.get([STORAGE_KEY], (result) => {
    if (result[STORAGE_KEY] === undefined) {
      chrome.storage.local.set({ [STORAGE_KEY]: true });
      callback(true);
    } else {
      callback(result[STORAGE_KEY]);
    }
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TOGGLE_STATE_CHANGED") {
    const btn = document.getElementById('ppsc-job-toggle');
    if (btn) {
      btn.textContent = message.value ? '🔓 Job Opener: ON' : '🔒 Job Opener: OFF';
      btn.style.backgroundColor = message.value ? '#28a745' : '#dc3545';
    }
  }
});



function setEnabled(value) {
  chrome.storage.local.set({ [STORAGE_KEY]: value });
}


  function createToggleButton() {
  const btn = document.createElement('button');
  btn.id = 'ppsc-job-toggle';
  btn.style.position = 'fixed';
  btn.style.top = '10px';
  btn.style.right = '10px';
  btn.style.zIndex = '9999';
  btn.style.padding = '10px 15px';
  btn.style.color = 'white';
  btn.style.border = 'none';
  btn.style.borderRadius = '5px';
  btn.style.cursor = 'pointer';
  btn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
  btn.style.fontSize = '14px';


    function updateButtonUI(enabled) {
      btn.textContent = enabled ? '🔓 Job Opener: ON' : '🔒 Job Opener: OFF';
      btn.style.backgroundColor = enabled ? '#28a745' : '#dc3545';
    }

    isEnabled((enabled) => {
      updateButtonUI(enabled);
      toggleLinkBehavior(enabled);
    });

    btn.addEventListener('click', () => {
        isEnabled((current) => {
            const newState = !current;
            setEnabled(newState);
            updateButtonUI(newState);
            toggleLinkBehavior(newState);
        });
    });


    document.body.appendChild(btn);
  }

function toggleLinkBehavior(enabled) {
  const jobLinks = document.querySelectorAll("a[href^='javascript:__doPostBack'], a[data-original-href^='javascript:__doPostBack']");

  jobLinks.forEach(link => {
    if (enabled) {
      // Save original href once if not already stored
      if (!link.dataset.originalHref) {
        link.dataset.originalHref = link.getAttribute("href");
      }
      link.removeAttribute("href");
    } else {
      // Restore href when toggle is OFF
      if (link.dataset.originalHref) {
        link.setAttribute("href", link.dataset.originalHref);
      }
    }
  });
}


  window.addEventListener('load', function () {
    createToggleButton();

    const jobLinks = document.querySelectorAll("a[href^=\"javascript:__doPostBack\"]");

    jobLinks.forEach(link => {
      if (link.dataset.listenerAttached === "true") return;
      link.dataset.listenerAttached = "true";

      const onclickText = link.getAttribute("href");
      const matches = onclickText.match(/__doPostBack\('([^']*)','([^']*)'\)/);
      if (!matches) return;

      const eventTarget = matches[1];
      const eventArgument = matches[2];

      link.addEventListener("click", function (e) {
        isEnabled((enabled) => {
          if (!enabled) return;

          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();

          const viewstate = document.querySelector('input[name="__VIEWSTATE"]');
          const viewstategenerator = document.querySelector('input[name="__VIEWSTATEGENERATOR"]');
          const eventvalidation = document.querySelector('input[name="__EVENTVALIDATION"]');

          if (!viewstate || !eventvalidation) {
            console.warn("Required ASP.NET hidden fields are missing.");
            return;
          }

          const form = document.createElement('form');
          form.method = 'POST';
          form.target = '_blank';
          form.action = window.location.href;

          const hiddenFields = [
            { name: '__EVENTTARGET', value: eventTarget },
            { name: '__EVENTARGUMENT', value: eventArgument },
            { name: '__VIEWSTATE', value: viewstate.value },
            { name: '__VIEWSTATEGENERATOR', value: viewstategenerator ? viewstategenerator.value : '' },
            { name: '__EVENTVALIDATION', value: eventvalidation.value }
          ];

          hiddenFields.forEach(({ name, value }) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = name;
            input.value = value;
            form.appendChild(input);
          });

          document.body.appendChild(form);
          form.submit();
          document.body.removeChild(form);
        });
      });
    });
  });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "TOGGLE_STATE_CHANGED") {
      const btn = document.getElementById('ppsc-job-toggle');
      if (btn) {
        btn.textContent = message.value ? '🔓 Job Opener: ON' : '🔒 Job Opener: OFF';
        btn.style.backgroundColor = message.value ? '#28a745' : '#dc3545';
      }
    }
  });
})();