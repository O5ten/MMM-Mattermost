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
		let requestPromises = users.map((user) => {
			return fetch(this.config.mattermostUrl + "/api/v4/users/" + user.id + "/image", {
				headers: this.authHeaders()
			}).then((res) => {
				return res.arrayBuffer().then((buffer) => {
					return {
						id: user.id, 
						b64: this.base64ArrayBuffer(buffer)
					};
				});
			});
		});
		return Promise.all(requestPromises);
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
					this.requestMattermostUserProfilePictures(users).then((imagePromises) => {
						Promise.all(imagePromises).then((images) => {
							let usersWithImages = users.map((u) => {
								u.b64 = images.find((img) => img.id === u.id).b64
								return u;
							}); 
							let postsWithUsers = postIds.map((id) => {
								let userId = posts[id].user_id;
								let user = usersWithImages.find(u => u.id === userId);
								posts[id].user = user; 
								return posts[id];
							});
							searchResult.posts = postsWithUsers;
							this.sendSocketNotification("MMM-Mattermost-received-messages", searchResult);
						});
					});
				});
			});
		})
		.catch(err => {
			console.error(err.message);
		});
	},

	base64ArrayBuffer: function(arrayBuffer) {
		//Function honestly borrowed from here: https://gist.github.com/garylgh/15b36876eb00b876a9c9
		var base64    = ''
		var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
	  
		var bytes         = new Uint8Array(arrayBuffer)
		var byteLength    = bytes.byteLength
		var byteRemainder = byteLength % 3
		var mainLength    = byteLength - byteRemainder
	  
		var a, b, c, d
		var chunk
	  
		for (var i = 0; i < mainLength; i = i + 3) {
		  chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]
		  a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
		  b = (chunk & 258048)   >> 12 // 258048   = (2^6 - 1) << 12
		  c = (chunk & 4032)     >>  6 // 4032     = (2^6 - 1) << 6
		  d = chunk & 63               // 63       = 2^6 - 1
		  base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
		}
	  
		if (byteRemainder == 1) {
		  chunk = bytes[mainLength]
		  a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2
		  b = (chunk & 3)   << 4 // 3   = 2^2 - 1
		  base64 += encodings[a] + encodings[b] + '=='
		} else if (byteRemainder == 2) {
		  chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]
		  a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
		  b = (chunk & 1008)  >>  4 // 1008  = (2^6 - 1) << 4
		  c = (chunk & 15)    <<  2 // 15    = 2^4 - 1
		  base64 += encodings[a] + encodings[b] + encodings[c] + '='
		}
		
		return base64;
	}

});
