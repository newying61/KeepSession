// BSD License.
// Do whatever you want, but don't sue me.
// Keep Session by ajax call every 10 mins

(function(document, window, undefined) {
    // Reset sotred data every time this is loaded
    if(!getSites()) {
        saveSites([{
                id : 'example',
                url : 'http://localhost:8000/',
                enabled : false
        }]);
    }

    function getSites() {
        var sites = JSON.parse(localStorage.getItem('sites'));

        return sites;
    }

    function saveSites(sites) {
        localStorage.setItem('sites', JSON.stringify(sites));
    }

    function requestUrl(url) {
        var req = new XMLHttpRequest();
        req.open("GET", url, true);

        // No need to do anything, just request.
        req.onload = function() {};

        req.send(null);
    }

    chrome.runtime.onMessage.addListener(function(msg, _, sendResponse) {
        if(msg.getSites) {
            // Send sites to popup
            var sites = getSites();
            sendResponse(sites);
        } else if(msg.saveSites) {
            saveSites(msg.s);
        }
    });

    chrome.alarms.onAlarm.addListener(function() {
        var sites = getSites();

        sites.forEach(function(site) {
            if(site.enabled) {
                requestUrl(site.url);
            }
        });
    });

    chrome.alarms.create({delayInMinutes: 10});
})(document, window)
