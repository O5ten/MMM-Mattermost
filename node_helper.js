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

	socketNotificationReceived: function(notification, payload) {
		if (notification === "MMM-Mattermost-fetch-messages") {
			console.log("Fetching the " + this.config.messages + " latest mattermost messages..");
			this.requestMattermostMessages();
		}
		if(notification === "MMM-Mattermost-set-config") {
			this.config = payload;
		}
	},

	// Example function send notification test
	requestMattermostMessages: function() {
		console.log("GET " + this.config.mattermostUrl);
		fetch(this.config.mattermostUrl + "/api/v4/channels/" + this.config.channelId + "/posts" , {
			headers: {
				"Authorization": "Bearer " + this.config.accesstoken
			},
		}).then(res => {
				if (res.status >= 400) {
					throw new Error("Bad response from server: " + res.status);
				}
				return res.json();
			})
			.then(user => {
				console.log(user);
			})
			.catch(err => {
				console.error(err);
			});
	}
});
