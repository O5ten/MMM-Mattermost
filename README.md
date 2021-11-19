# MMM-Mattermost
This is a module for [MagicMirror](https://github.com/MichMich/MagicMirror/). It displays announcements from [Mattermost](https://www.mattermost.com).

![Screen Shot](/announcements.png?raw=true "Screen Shot")

# Installation
1. Move to MagicMirror's `modules` directory and clone the repo with<br>
`git clone https://github.com/O5ten/MMM-Mattermost.git`
2. cd into `MMM-Mattermost` and run `npm install`

# Config
At a minimum, you need a Personal Access Token for Mattermost from the account settings. The mattermost server must be configure to allow this kind of token. But you can probably also use a token for a bot account or use basic auth with your base64-encoded credentials. 

You also need to provide some search-terms in `config/config.js` and the module will search for messages that match those. The ten latest messages matching the searchTerms will be displayed unless you change the `limit`. 

![Screen Shot](/accesstoken.png?raw=true "Personal Access Token")

|Option|Description|
|:--|:--|
|mattermostUrl | **REQUIRED** <br>The url of your mattermost instances|
|accesstoken         |**REQUIRED**<br>A personal access token for your mattermost account<br><br>Type: *string*|
|teamId              |**REQUIRED**<br>The teamId of the mattermost instance that you want to search messages within<br><br>Type: *string*|
|searchTerms              |**REQUIRED**<br>The keywords to use to select mattermost messages to display. Be advised all channels and direct messages the user have are searched.<br><br>Type: *string*|
|isOrSearch              |**REQUIRED**<br>If multiple searchTerms are used then this boolean governs whether it is an OR search or an AND search with those terms. default false<br><br>Type: *boolean*|

## Default config
```javascript
    animationSpeed: 2000,
    updateInterval: 60000,
    rotationInterval: 15000,
    retryDelay: 5000,
    teamId: "",
    searchTerms: "",
    accesstoken: "",
    mattermostUrl: "",
    limit: 10,
    title: "Mattermost"
```

Here is an example of an entry in `config.js`. The id's and tokens are obviously jibberish, but it makes for an easy copy. Get ahold of the teamId by curling the API directly. 

```curl
curl -H"Authorization: Bearer <PERSONAL_ACCESS_TOKEN>" -H"Content-Type: application/json" https://<my.mattermostserver.org>/api/v4/teams | jq .
```

```javascript
{
        module: "MMM-Mattermost",
        position: "middle_center",
        config: {
                mattermostUrl: "https://my.mattermostserver.org",
                accesstoken: "8mggde5gztbdplskqlkmklzmlk",
                teamId: "9fpxdh4fet853ex8s98uf09sowls",
                searchTerms: "#announcement",
                isOrSearch: true,
                title: "Announcements"
        }
},
```

## Dependencies
This package depends on the following:
- [cross-fetch](https://www.npmjs.com/package/cross-fetch)