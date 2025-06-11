// ==UserScript==
// @name         PPSC Open Job in New Tab (With Toggle & Rescan)
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Open PPSC job listings in a new tab automatically, with toggle and manual re-scan support.
// @author       Hamza Haroon
// @match        https://www.ppsc.gop.pk/*/Jobs.aspx*
// @grant        none
// @run-at       window-load
// @updateURL    https://raw.githubusercontent.com/hamzaharoon1314/PPSC-Job-Opener/main/ppsc-job-opener.user.js
// @downloadURL  https://raw.githubusercontent.com/hamzaharoon1314/PPSC-Job-Opener/main/ppsc-job-opener.user.js
// ==/UserScript==

(function () {
    'use strict';

    const STORAGE_KEY = 'ppscJobOpenerEnabled';

    function isEnabled() {
        if (localStorage.getItem(STORAGE_KEY) === null) {
            setEnabled(true);
            return true;
        }
        return localStorage.getItem(STORAGE_KEY) === 'true';
    }

    function setEnabled(value) {
        localStorage.setItem(STORAGE_KEY, value.toString());
    }

    function createButton(id, text, bgColor, topOffset) {
        const btn = document.createElement('button');
        btn.id = id;
        btn.textContent = text;
        btn.style.position = 'fixed';
        btn.style.top = topOffset;
        btn.style.right = '10px';
        btn.style.zIndex = '9999';
        btn.style.padding = '10px 15px';
        btn.style.backgroundColor = bgColor;
        btn.style.color = 'white';
        btn.style.border = 'none';
        btn.style.borderRadius = '5px';
        btn.style.cursor = 'pointer';
        btn.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
        btn.style.fontSize = '14px';
        return btn;
    }

    function createToggleButton() {
        const btn = createButton('ppsc-job-toggle',
            isEnabled() ? '🔓 Job Opener: ON' : '🔒 Job Opener: OFF',
            isEnabled() ? '#28a745' : '#dc3545',
            '10px'
        );

        btn.addEventListener('click', () => {
            const newState = !isEnabled();
            setEnabled(newState);
            btn.textContent = newState ? '🔓 Job Opener: ON' : '🔒 Job Opener: OFF';
            btn.style.backgroundColor = newState ? '#28a745' : '#dc3545';

            // Show/hide Rescan Button
            const rescanBtn = document.getElementById('ppsc-rescan');
            if (rescanBtn) {
                rescanBtn.style.display = newState ? 'block' : 'none';
            }
        });

        document.body.appendChild(btn);
    }

    function createRescanButton() {
        const btn = createButton('ppsc-rescan',
            '🔄 Re-scan Jobs',
            '#007bff',
            '60px'
        );

        btn.style.display = isEnabled() ? 'block' : 'none'; // Initial visibility

        btn.addEventListener('click', () => {
            attachJobListeners();

            const originalText = btn.textContent;
            btn.textContent = '✅ Scanned!';
            btn.style.backgroundColor = '#17a2b8';

            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.backgroundColor = '#007bff';
            }, 2000);
        });

        document.body.appendChild(btn);
    }



    function attachJobListeners() {
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
                if (!isEnabled()) return;

                e.preventDefault();

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
    }

    window.addEventListener('load', function () {
        createToggleButton();
        createRescanButton();
        attachJobListeners();
    });
})();
