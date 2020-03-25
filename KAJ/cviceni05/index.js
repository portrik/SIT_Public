/**
 * Returns a Promise that resolves with a JSON object
 * @param {String} url - URL of the request
 */
async function requestGet(url) {
    return new Promise((resolve, reject) => {
        let request = new XMLHttpRequest();

        request.onreadystatechange = function () {
            if (this.readyState == XMLHttpRequest.DONE) {
                if (this.status === 200) {
                    resolve(JSON.parse(this.response));
                }
                else {
                    reject(new Error(this.response));
                }
            }
        }

        request.open('GET', url);
        request.send();
    });
}

/**
 * Async fetch wrapper
 * @param {String} url - URL of the request
 */
async function requestFetch(url) {
    let response = await fetch(url);
    let data = response.json();
    
    return data;
}

/**
 * Creates a websocket and listener for input
 */
function createChatSocket() {
    let socket = new WebSocket('ws://salty-peak-74076.herokuapp.com/');

    socket.addEventListener('message', (message) => {
        let chatElement = document.getElementById('chat');
        chatElement.value += message.data + '\n';
    });

    let input = document.getElementById('chat-input');

    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            socket.send(input.value);
        }
    });

    return socket;
}

/**
 * Adds Star Wars names to the list
 * @param {JSON} rawData - raw data from the server
 */
function populateStarWars(rawData) {
    let names = [];
    rawData["results"].forEach((person) => names.push(person.name));

    let targetElement = document.getElementById('star-wars');

    names.forEach((name) => {
        let nameElement = document.createElement('li');
        nameElement.innerText = name;

        targetElement.appendChild(nameElement);
    });

    const socket = createChatSocket();
}

/**
 * Fetches XML from URL
 * @param {String} url - URL of the request
 */
async function fetchXmlData(url) {
    let response = await fetch(url);
    let data = response.text();

    return data;
}

/**
 * Prints out Mapy data
 * @param {String} rawData - XML data
 */
function populateMap(rawData) {
    let targetElement = document.getElementById('mapy');
    targetElement.innerText = rawData;
}

// Runs on page load
(async () => {
    let firstCharacters = await requestGet('https://swapi.co/api/people/');
    populateStarWars(firstCharacters);

    let secondCharacters = await requestFetch('https://swapi.co/api/people/?page=2');
    populateStarWars(secondCharacters);

    const socket = createChatSocket();

    let mapData = await fetchXmlData('https://api.mapy.cz/geocode?query=praha');
    populateMap(mapData);
})();

/*
urls:
    HTTP API with JSON response of StarWars characters
        https://swapi.co/api/people/
    WebSocket API with text messages
        ws://salty-peak-74076.herokuapp.com/
    HTTP API with XML response of places matching given query
        https://api.mapy.cz/geocode?query=praha

Main tasks
    1. Use XMLHttpRequest to create HTTP request and get data from StarWarsApi
        1. Parse StarWars data
        2. Transform the data into list of character names
            ["Luke Skywalker", "C-3PO", ...]
        3. Render character names into the list - <ul id="star-wars"></ul>
    2. Create function that fetches data with XMLHttpRequest but exposes Promises interface.
        myRequest(url)
            .then(response => {
                // ok state
            })
            .catch(error => {
                // error states
            })

        1. For rendering the Star-Wars characters - switch from XMLHttpRequest to your "myRequest" function
    3. Try to use browser's fetch API
        1. For rendering the Star-Wars characters - try to switch to browsers fetch API
    4. Try to use async/await for interaction with
        1. myRequest
        2. fetch

Bonus Tasks
    1. Websocket chat
        1. Connect to WebSocket API
        2. When messages comes in, render it to the - <textarea id="chat">
        3. When user types in text in <input type="text" id="chat-input"> and presses enter, send the message to the chat
    2. Mapy.cz API with XML response
        1. Fetch the data, the idea is the same, except we get XML instead of JSON as a response
*/