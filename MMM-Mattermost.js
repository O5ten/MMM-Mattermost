/* global Module */

/* Magic Mirror
 * Module: MMM-Mattermost
 *
 * By Mikael Östberg
 * MIT Licensed.
 */

//NEXT: Display user with picture :thinking_face:

Module.register("MMM-Mattermost", {
	defaults: {
		animationSpeed: 2000,
		updateInterval: 60000,
		rotationInterval: 15000,
		retryDelay: 5000,
		teamId: "",
		searchTerms: "",
		channelId: "",
		messages: 10
	},

	currentMessage: undefined,
	messages: [],
	requiresVersion: "2.1.0", 

	start: function() {
		this.loaded = false;
		this.sendSocketNotification("MMM-Mattermost-set-config", this.config);
		let fetchMessages = () => {
			this.sendSocketNotification("MMM-Mattermost-fetch-messages");
		}
		fetchMessages();
		setInterval(fetchMessages, this.config.updateInterval, 0);
		let i = 0;
		setInterval(() => {
			i = i > this.messages.length ? 0 : i + 1;
			let limit = this.config.messages < this.messages.length ? this.config.messages : this.messages.length
			this.currentMessage = this.messages[i % limit];
			this.updateDom(this.config.animationSpeed);
		}, this.config.rotationInterval);
	},

	getDom: function() {
		let wrapper = document.createElement("div");
		let wrapperDataRequest = document.createElement("div");
		let labelDataRequest = document.createElement("label");
		let header = document.createElement("h1");
		header.innerHTML = "Mattermost";

		if(this.messages.length !== 0) {
			let currentMessage = this.messages.order[0];
			labelDataRequest.innerHTML = this.messages.posts[currentMessage].message
		} else {
			labelDataRequest.innerHTML = "No mattermost messages found, try modifying your searchterms";
		}

		wrapper.appendChild(header);
		wrapper.appendChild(labelDataRequest);

		if (this.Messages) {
			let wrapperMessages = document.createElement("div");
			wrapperMessages.innerHTML =  this.Messages.date;
			wrapper.appendChild(wrapperMessages);
		}
		return wrapper;
	},

	socketNotificationReceived: function (notification, payload) {
		if(notification === "MMM-Mattermost-received-messages") {
			this.messages = payload;
			console.log("Received messages from mattermost:" + this.messages.order.length)
			this.updateDom(this.config.animationSpeed);
		} 
	}
});
