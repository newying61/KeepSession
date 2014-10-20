// BSD License.
// Do whatever you want. But don't sue me.

(function(document, window, undefined) {

	var sites = null, sitesList = {};

	function _template (tempId, context, other) {
		var temp = document.getElementById(tempId).innerHTML,
			htmlText = '';

		if(temp) {
			// Create html text
			var htmlText = temp.replace(/\{(\w+)\}/g, function(match, key) {
				return context[key] || other[key] || key;
			});
		}

		return htmlText;
	}

	function update() {
		var htmlStr = '';
		// process each site
		sites.forEach(function(site) {
			htmlStr += _template('siteCtrl', site);

			sitesList[site.id] = site;
		});

		document.getElementById('sitesArea').innerHTML = htmlStr;

		// Bind click function for buttons
		var btns = document.getElementsByClassName('ctrlBtn');

		for(var i = 0; i < btns.length; i++) {
			var btn = btns.item(i);

			switchBtnText(btn);

			btn.addEventListener('click', function() {
				var site = sitesList[this.attributes.ref.value];

				site.enabled = !site.enabled;

				// Update and save
				switchBtnText(this, site);
				saveSites();
			}, false);
		}

		var delBtns = document.getElementsByClassName('delBtn');

		for(var i = 0; i < delBtns.length; i++) {
			var delBtn = delBtns.item(i);

			delBtn.addEventListener('click', function() {
				var targetId = this.attributes.ref.value,
					newSites = [];

				// Remove target obj
				delete sitesList[targetId];

				sites.forEach(function(value) {
					if(value.id !== targetId) {
						newSites.push(value);
					}
				});

				// Save the new one
				sites = newSites;
				saveSites();
				update();
			}, false);
		}
	}

	function switchBtnText(btn, s) {
		var site = s || sitesList[btn.attributes.ref.value];

		btn.textContent = site.enabled ? 'Stop' : 'Keep Session';
	}

	function getSites() {
		chrome.runtime.sendMessage({ getSites: true }, function(s) {
			sites = s;
			update();
		});
	}

	function saveSites() {
		chrome.runtime.sendMessage({ saveSites: true, s: sites }, function() {
			console.log('sites saved')
		});
	}

	function init() {
		getSites();

		// Add btn
		var addBtn = document.getElementById('addNewUrlBtn');

		addBtn.addEventListener('click', function() {
			var newId = document.getElementById('newId').value.trim(),
				newUrl = document.getElementById('newUrl').value.trim();

			if(!newId || !newUrl) {
				return;
			}

			// Replace existing one
			if(sitesList[newId]) {
				sitesList[newId].url = newUrl;
				sitesList[newId].enabled = true;
			} else {
				var newTarget = {
					id : newId,
					url : newUrl,
					enabled : true
				};

				sitesList[newId] = newTarget;
				sites.push(newTarget);
			}

			saveSites();
			update();
		});

	}

	chrome.runtime.onMessage.addListener(function(msg, _, sendResponse) {

	});

	// When dom is ready
	document.addEventListener('DOMContentLoaded', function () {
		init();
	});
})(document, window);

