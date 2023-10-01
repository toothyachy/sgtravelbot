const keyword = "malay food"
const url = `https://api.stb.gov.sg/content/food-beverages/v2/search?searchType=keyword&searchValues=${keyword}&limit=5`;
console.log(`Calling ${url}`);

const callTih = async () => {
    const response = await fetch(url, {
        headers: {
            'X-API-KEY': '9ULYL7YXUfoeqQF2jpTa1vmz2JFsLl50'
        },
    });
    const data = await response.json();
    console.log(data);
}

// callTih()

const geolib = require('geolib');
const dist = geolib.getDistance(
    { latitude: 1.3596942407588961, longitude: 103.88511816761205 },
    { latitude: 1.3527191448028362, longitude: 103.94466246761209 },
);
console.log(dist);
// Heartland Mall = 1.3596942407588961, 103.88511816761205
// Tampinese Mall = 1.3527191448028362, 103.94466246761209


// const myLocation = global.navigator.geolocation.getCurrentPosition(position => {
//     const { latitude, longitude } = position.coords;
//   });

//   console.log(myLocation);




// [tool/start] [1:chain:AgentExecutor > 3:tool:DynamicStructuredTool] Entering Tool run with input: "{"cryptoName":"bitcoin","vsCurrency":"try"}"
// Triggered fetchCryptoPrice function with options:  { cryptoName: 'bitcoin', vsCurrency: 'try' }
// https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=try got called
// url response is [object Response]
// Data is [object Object]
// [tool/end] [1:chain:AgentExecutor > 3:tool:DynamicStructuredTool] [338ms] Exiting Tool run with output: "738521"
// [llm/start] [1:chain:AgentExecutor > 4:llm:ChatOpenAI] Entering LLM run with input: {

// [tool/start] [1:chain:AgentExecutor > 3:tool:DynamicStructuredTool] Entering Tool run with input: "{"searchType":"keyword","searchValues":"malay food","limit":"5"}"
// Triggered fetchSGFoodPlaces function with options:  { searchType: 'keyword', searchValues: 'malay food', limit: '5' }
// Calling https://api.stb.gov.sg/content/food-beverages/v2/search?searchType=keyword&searchValues=malay food&limit=5
// Error in handler ConsoleCallbackHandler, handleToolEnd: TypeError: run.outputs?.output?.trim is not a function
// [llm/start] [1:chain:AgentExecutor > 3:llm:ChatOpenAI] Entering LLM run with input: {

// [tool/start] [1:chain:AgentExecutor > 3:tool:DynamicStructuredTool] Entering Tool run with input: "{"searchType":"cuisine","searchValues":"Malay","limit":"5"}"
// Triggered fetchSGFoodPlaces function with options:  { searchType: 'cuisine', searchValues: 'Malay', limit: '5' }
// Calling https://api.stb.gov.sg/content/food-beverages/v2/search?searchType=cuisine&searchValues=Malay&limit=5
// [tool/error] [1:chain:AgentExecutor > 3:tool:DynamicStructuredTool] [72ms] Tool run errored with error: "Cannot read properties of undefined (reading 'map')"
// [chain/error] [1:chain:AgentExecutor] [2.71s] Chain run errored with error: "Cannot read properties of undefined (reading 'map')"
// - error app/api/chat/route.ts (128:28) @ map
// - error Cannot read properties of undefined (reading 'map')
//   126 |     const data = await response.json();
//   127 |     const list = data.data;
// > 128 |     const foodPlaces = list.map((entry: { name: string; }) => entry.name)
//       |                            ^
//   129 | 
//   130 |     return foodPlaces;
//   131 |   }