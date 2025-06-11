// ==UserScript==
// @name         PPSC Open Job in New Tab
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Open PPSC job listings in a new tab automatically.
// @author       Hamza Haroon
// @match        https://ppsc.gop.pk/*Jobs.aspx*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/hamzaharoon1314/PPSC-Job-Opener/main/ppsc-job-opener.user.js
// @downloadURL  https://raw.githubusercontent.com/hamzaharoon1314/PPSC-Job-Opener/main/ppsc-job-opener.user.js
// ==/UserScript==


(function () {
    'use strict';

    // Wait until the DOM is fully loaded
    window.addEventListener('load', function () {
        const jobLinks = document.querySelectorAll("a[href^=\"javascript:__doPostBack\"]");

        jobLinks.forEach(link => {
            const onclickText = link.getAttribute("href");
            const matches = onclickText.match(/__doPostBack\('([^']*)','([^']*)'\)/);
            if (!matches) return;

            const eventTarget = matches[1];
            const eventArgument = matches[2];

            link.addEventListener("click", function (e) {
                e.preventDefault();

                const form = document.createElement('form');
                form.method = 'POST';
                form.target = '_blank'; // Open in new tab
                form.action = window.location.href;

                // Required hidden fields from the original page
                const viewstate = document.querySelector('input[name="__VIEWSTATE"]');
                const viewstategenerator = document.querySelector('input[name="__VIEWSTATEGENERATOR"]');
                const eventvalidation = document.querySelector('input[name="__EVENTVALIDATION"]');

                const hiddenFields = [
                    { name: '__EVENTTARGET', value: eventTarget },
                    { name: '__EVENTARGUMENT', value: eventArgument },
                    { name: '__VIEWSTATE', value: viewstate ? viewstate.value : '' },
                    { name: '__VIEWSTATEGENERATOR', value: viewstategenerator ? viewstategenerator.value : '' },
                    { name: '__EVENTVALIDATION', value: eventvalidation ? eventvalidation.value : '' }
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
})();
