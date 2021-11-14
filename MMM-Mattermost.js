/* global Module */

/* Magic Mirror
 * Module: MMM-Mattermost
 *
 * By Mikael Östberg
 * MIT Licensed.
 */

Module.register("MMM-Mattermost", {
	defaults: {
		animationSpeed: 2,
		updateInterval: 5000,
		retryDelay: 5000
	},

	messages: [],
	requiresVersion: "2.1.0", 

	start: function() {
		this.loaded = false;
		this.sendSocketNotification("MMM-Mattermost-set-config", this.config);
		this.sendSocketNotification("MMM-Mattermost-fetch-messages");
		setInterval(function() {
			this.sendSocketNotification("MMM-Mattermost-fetch-messages");
		}, this.config.updateInterval);
	},

	getDom: function() {
		var wrapper = document.createElement("div");
		var wrapperDataRequest = document.createElement("div");
		wrapperDataRequest.innerHTML = this.messages;

		var labelDataRequest = document.createElement("label");
		labelDataRequest.innerHTML = "Mattermost will show up here. :)";

		wrapper.appendChild(labelDataRequest);
		wrapper.appendChild(wrapperDataRequest);

		if (this.Messages) {
			var wrapperMessages = document.createElement("div");
			wrapperMessages.innerHTML =  this.Messages.date;
			wrapper.appendChild(wrapperMessages);
		}
		return wrapper;
	},

	getScripts: function() {
		return [];
	},

	getStyles: function () {
		return [
			"MMM-Mattermost.css"
		];
	},

	// socketNotificationReceived from helper
	socketNotificationReceived: function (notification, payload) {
		if(notification === "MMM-Mattermost-received-messages") {
			this.messages = payload;
			this.updateDom();
		}
	},
});
