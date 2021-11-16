/* Magic Mirror
 * Node Helper: {{MODULE_NAME}}
 *
 * By {{AUTHOR_NAME}}
 * {{LICENSE}} Licensed.
 */

let NodeHelper = require("node_helper");
let fetch = require("cross-fetch");

module.exports = NodeHelper.create({

	config: undefined, 
	postsPath: undefined,
	searchPostsPath: undefined,
	searchTerms: undefined,
	
	socketNotificationReceived: function(notification, payload) {
		
		if (notification === "MMM-Mattermost-fetch-messages") {
			this.requestMattermostMessages();
		}

		if(notification === "MMM-Mattermost-set-config") {
			this.config = payload;
			this.postsPath = "/api/v4/channels/" + this.config.channelId + "/posts";
			this.searchPostsPath = "/api/v4/teams/" + this.config.teamId + "/posts/search";
		}
	},

	requestMattermostMessages: function() {
		let payload = JSON.stringify({
			terms: this.config.searchTerms,
			is_or_search: !!this.config.isOrSearch
		});
		fetch(this.config.mattermostUrl + this.searchPostsPath, {
			headers: {
				"Authorization": "Bearer " + this.config.accesstoken
			},
			method: "POST", 
			body: payload
		}).then(res => {
			if (res.status >= 400) {
				throw new Error("Bad response from server: " + res.status);
			}
			res.json().then((json) => {
				this.sendSocketNotification("MMM-Mattermost-received-messages", json);
			});
		})
		.catch(err => {
			console.error(err.message);
		});
	}
});
