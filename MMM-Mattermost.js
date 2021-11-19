/* global Module */

/* Magic Mirror
 * Module: MMM-Mattermost
 *
 * By Mikael Östberg
 * MIT Licensed.
 */

Module.register("MMM-Mattermost", {
	defaults: {
		animationSpeed: 2000,
		updateInterval: 60000,
		rotationInterval: 15000,
		retryDelay: 5000,
		teamId: "",
		searchTerms: "",
		limit: 10,
		title: "Mattermost",
		accesstoken: ""
	},

	currentMessage: undefined,
	posts: undefined,
	postIds: [],
	requiresVersion: "2.1.0", 
	currentMessageIndex: 0,

	rotateMessage: function(){
		this.currentMessage = this.postIds[this.currentMessageIndex];
		this.currentMessageIndex = this.currentMessageIndex == this.config.limit ? 0 : this.currentMessageIndex + 1;
		if(this.postIds.length <= this.currentMessageIndex) {
			this.currentMessageIndex = 0;
		}
		this.updateDom(this.config.animationSpeed);
	},

	fetchMessages: function(){
		this.sendSocketNotification("MMM-Mattermost-fetch-messages");
	},

	start: function() {
		this.sendSocketNotification("MMM-Mattermost-set-config", this.config);
		this.fetchMessages();
		setInterval(this.fetchMessages.bind(this), this.config.updateInterval);
		setInterval(this.rotateMessage.bind(this), this.config.rotationInterval);
	},

	getIsoDateString(timestamp){
		let dateString = new Date(timestamp).toISOString().replace("T", " ").replace("Z", " ");
		let dotIx = dateString.indexOf('.');
		return dateString.substring(0, dotIx);
	},

	getDom: function() {
		let wrapper = document.createElement("div");
		let message = document.createElement("label");
		let author = document.createElement("div");
		let authorImage = document.createElement("img");
		let authorText = document.createElement("span");
		authorText.style = "color: #444; font-size: 14px;"
		author.appendChild(authorImage);
		author.appendChild(authorText);
		let header = document.createElement("h2");
		header.innerHTML = this.config.title;

		if(this.posts !== undefined) {
			let post = this.posts.find(p => p.id === this.currentMessage);
			let dateString = this.getIsoDateString(post.create_at);
			message.innerHTML = post.message
			authorImage.style = 'width:15px;height:15px; border-radius:15px;'
			authorImage.src = "data:image/jpeg;base64, " + post.user.b64;
			authorText.innerHTML = " " + [post.user.first_name, post.user.last_name].join(' ') + " at " + dateString;
		} else {
			message.innerHTML = "No mattermost messages found, try modifying your searchterms";
		}

		wrapper.appendChild(header);
		wrapper.appendChild(message);
		wrapper.appendChild(author);

		return wrapper;
	},

	socketNotificationReceived: function (notification, payload) {
		if(notification === "MMM-Mattermost-received-messages") {
			this.postIds = payload.order.slice(0, this.config.limit-1);
			this.posts = payload.posts
			if(!this.currentMessage){
				this.rotateMessage();
			}
			this.updateDom(this.config.animationSpeed);
		} 
	}
});
