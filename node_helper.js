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
			this.findUsersByIds = "/api/v4/users/ids";
		}
	},

	authHeaders: function(){
		return {
			"Authorization": "Bearer " + this.config.accesstoken,
			"Content-Type": "application/json"
		}
	},

	requestMattermostUsers: function(userIds){
		return fetch(this.config.mattermostUrl + this.findUsersByIds, {
			headers: this.authHeaders(),
			method: "POST",
			body: JSON.stringify(userIds)
		}).then((usersResponse) => {
			return usersResponse.json();
		}).catch(err => {
			console.error(err.message);
		});
	},

	requestMattermostUserProfilePictures: function(users){
		//TODO
	},

	requestMattermostMessages: function() {
		let payload = JSON.stringify({
			terms: this.config.searchTerms,
			is_or_search: !!this.config.isOrSearch
		});
		fetch(this.config.mattermostUrl + this.searchPostsPath, {
			headers: this.authHeaders(),
			method: "POST", 
			body: payload
		}).then(searchResponse => {
			if (searchResponse.status >= 400) {
				throw new Error("Bad response from server: " + searchResponse.status);
			}
			searchResponse.json().then((searchResult) => {
				let posts = searchResult.posts;
				let postIds = Object.keys(posts);
				let userIds = postIds.map((id) => posts[id].user_id);
				this.requestMattermostUsers(userIds).then((users) => {
					let postsWithUsers = postIds.map((id) => {
						let userId = posts[id].user_id;
						let user = users.find(u => u.id === userId);
						posts[id].user = user; 
						return posts[id];
					});
					searchResult.posts = postsWithUsers;
					this.sendSocketNotification("MMM-Mattermost-received-messages", searchResult);
				});
			});
		})
		.catch(err => {
			console.error(err.message);
		});
	}
});
