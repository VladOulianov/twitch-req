
const TWITCH_CHANNEL = "83599274";
// The ID of the application (provided when registering the app on
// dev.twitch.tv)
const CLIENT_ID = "ljqcuksnjjvgb6arley3mrcua6vokr";

// The URL on which the user will be redirected after the authentication
const REDIRECT_URI = "https://vladoulianov.github.io/twitch-req/";

// The required scopes (none for now, we will see that in future examples)
const SCOPES = [];

const helpers = {
  // Encode an object to a querystring
  // {name: "Truc Muche", "foo": "bar"}  ->  "name=Truc+Muche&foo=bar"
  encodeQueryString: function (params) {
    const queryString = new URLSearchParams();
    for (let paramName in params) {
      queryString.append(paramName, params[paramName]);
    }
    return queryString.toString();
  },

  // Decode a querystring to an object
  // "name=Truc+Muche&foo=bar"  ->  {name: "Truc Muche", "foo": "bar"}
  decodeQueryString: function (string) {
    const params = {};
    const queryString = new URLSearchParams(string);
    for (let [paramName, value] of queryString) {
      params[paramName] = value;
    }
    return params;
  },

  // Get perameters from URL's anchor
  //
  // For example, if the URL of the curent page is
  //
  //     http://localhost:5500/#name=Truc+Muche&foo=bar
  //
  // Then, this function will return
  //
  //     {name: "Truc Muche", "foo": "bar"}
  getUrlParams: function () {
    return helpers.decodeQueryString(location.hash.slice(1));
  },
};

const request = {

    // [Promise] Download (GET) a JSON from the given URL
    getJson: function(url, params=null, headers={}) {
        requestUrl = url;

        if (params) {
            requestUrl = `${url}?${helpers.encodeQueryString(params)}`
        }

        const req = new Request(requestUrl, {
            method: "GET",
            headers: headers,
        });

        return fetch(req)
            .then(function(response) {
                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status}`);
                }

                return response.json();
            });
    },

};

const twitch = {
  // Check if the user is already authenticated
  isAuthenticated: function () {
    const params = helpers.getUrlParams();
    return params["access_token"] !== undefined;
  },

  // Retirect the user to the Twitch auth page with all required params
  authentication: function () {
    const params = {
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: "token",
      scope: SCOPES.join(" "),
    };
    const redirectUrl = `https://id.twitch.tv/oauth2/authorize?${helpers.encodeQueryString(
      params
    )}`;
    location.href = redirectUrl;
  },
  getUserId: function(username) {
    const params = helpers.getUrlParams();
    return request.getJson("https://api.twitch.tv/helix/streams", {
        user_id: username,
    }, {
        "client-id": CLIENT_ID,
        "Authorization": `Bearer ${params["access_token"]}`,
    }).then(function(data) {
        
        if (data.length === 0) {
            
            const insertAfter = (element, htmlString) => element.insertAdjacentHTML("afterend", htmlString);
            const element = document.getElementById("pointing-element");
            const htmlString = "<p> Nono n'est pas en live </p>"
            insertAfter (element,htmlString)
            //throw new Error("The API returned unexpected data");
            
        }else{
            console.log(data);
            const viewers = data.data[0].viewer_count
            console.log(viewers);
            const insertAfter = (element, htmlString) => element.insertAdjacentHTML("afterend", htmlString);
            const element = document.getElementById("pointing-element");
            const htmlString = "<p> Nono est en live !!!"+ viewers +"</p>"
            insertAfter (element,htmlString)
        //return data.data[0].id;
        }
        
        
    });
}
};

function main() {
  if (!twitch.isAuthenticated()) {
    twitch.authentication();
  } else {
    twitch.getUserId(TWITCH_CHANNEL);
  }
}

window.onload = main;
