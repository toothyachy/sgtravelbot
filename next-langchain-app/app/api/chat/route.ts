// ------------ A. SET-UP -------------------
// 1. Create app by using Vercel SDK, follow instructions at https://github.com/vercel/ai/tree/main/examples/next-langchain
// View the full documentation and examples on sdk.vercel.ai/docs.
// 2. Upgrade Langchain to latest
// 3. Optional: Go to https://smith.langchain.com, create a new project and put env variables into the ".env" file there so that it can log your usage
// 4. Get api key from langsmith and put it into the ".env" file

// ------------ B.1 IMPORT MODULES FOR CHAT FUNCTIONALITY AND SCHEMA VALIDATION -------------------
import { StreamingTextResponse } from 'ai';
// StreamingTextResponse is good functionality in this repo

// For creating custom tools
import { DynamicTool, DynamicStructuredTool } from "langchain/tools";
// DynamicTool takes in string, DynamicStructuredTool takes in object

// To use OpenAI model
import { ChatOpenAI } from 'langchain/chat_models/openai';

// For agent executor
import { initializeAgentExecutorWithOptions } from 'langchain/agents'

// Tools
import { WikipediaQueryRun, SerpAPI } from "langchain/tools";

// zod library for schema validation
import * as z from "zod";

// ------------ B.2 IMPORT OTHER FUNCTIONAL MODULES -------------------
import * as geolib from "geolib";

// ------------ C. DEFINE OTHER VARIABLES -------------------
// SPECIFY EXECUTION RUNTIME AS 'EDGE', REQUIRED BY VERCEL
export const runtime = 'edge';

const llm = new ChatOpenAI({
  modelName: "gpt-3.5-turbo-16k",
  temperature: 0.1,
  streaming: true,
});

// // ------------ D. DEFINE POST METHOD (WITHOUT TOOLS) -------------------
// import { LangChainStream, Message } from 'ai';
// import { AIMessage, HumanMessage } from 'langchain/schema';

// export async function POST(req: Request, res: Response) {

//   const { stream, handlers } = LangChainStream();

//   // Extract message data from incoming request 
//   const { messages } = await req.json();
//   console.log(messages);

//   llm
//     .call(
//       (messages as Message[]).map(m =>
//         m.role == 'user'
//           ? new HumanMessage(m.content)
//           : new AIMessage(m.content),
//       ),
//       {},
//       [handlers],
//     )
//     .catch(console.error);

//     console.log(stream);

//   return new StreamingTextResponse(stream);
// }


// ------------ E. SET UP TOOLS AND INITIALISE AGENT -------------------

// Tool for wikipedia query
const wikipediaQuery = new WikipediaQueryRun({
  topKResults: 2,
  maxDocContentLength: 300,
})

// Tool for web search
const serpApi = new SerpAPI(process.env.SERPAPI_API_KEY, {
  hl: "en",
  gl: "sg",
})

// // Tool for SG travel search
// const vs = "https://www.visitsingapore.com/en/";
// const fetchSGPlaces = new DynamicStructuredTool({
//   name: 'fetchSGPlaces',
//   description: 'Fetches places of interest for visiting in Singapore based on keywords',
//   schema: z.object({
//     keyword: z.string(),
//   }),
//   func: async (options) => {
//     console.log('Triggered fetchSGPlaces function with options: ', options);
//     const { keyword } = options;
//     const places = new SerpAPI(process.env.SERPAPI_API_KEY, {
//       hl: "en",
//       gl: "sg",
//       q: keyword,
//     }, vs);
//     return places
//   }
// })

// Tool for foo
const foo = new DynamicTool({
  name: 'foo',
  description: 'returns the answer to what foo is',
  func: async () => {
    console.log('Triggered foo function');
    return 'The value of foo is "Something only Python students know".'
  }
})

// Tool for crypto price
const fetchCryptoPrice = new DynamicStructuredTool({
  name: 'fetchCryptoPrice',
  description: 'Fetches the current price of a specified cryptocurrency',
  schema: z.object({
    cryptoName: z.string(),
    vsCurrency: z.string().optional().default('usd')
  }),
  func: async (options) => {
    console.log('Triggered fetchCryptoPrice function with options: ', options);
    const { cryptoName, vsCurrency } = options;
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoName}&vs_currencies=${vsCurrency}`;
    console.log(`Calling ${url}`);

    const response = await fetch(url); // {"bitcoin":{"sgd":36803}}

    const data = await response.json();
    return data[cryptoName.toLowerCase()][vsCurrency.toLowerCase()].toString();
  }
})

// Tool for comparing distances
const compareDistance = new DynamicStructuredTool({
  name: 'compareDistance',
  description: 'Compares the distance between different places based on their coordinates',
  schema: z.object({
    placeA: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }),
    placeB: z.object({
      latitude: z.number(),
      longitude: z.number(),
    })
  }),
  func: async (options) => {
    console.log('Triggered compareDistance function with options: ', options);
    const { placeA, placeB } = options;
    const dist = geolib.getDistance(placeA, placeB);
    const distString = dist.toString()
    return distString
  }
})
// 23 Glasgow = 1.3621899856592987, 103.87880374247312
// Heartland Mall = 1.3596942407588961, 103.88511816761205
// Tampinese Mall = 1.3527191448028362, 103.94466246761209
// What is the distance between these two places:  Heartland Mall = 1.3596942407588961, 103.88511816761205 Tampinese Mall = 1.3527191448028362, 103.94466246761209

// ------------- TOOLS FOR TIH ------------

// Tool for food places
const fetchSGFoodPlaces = new DynamicStructuredTool({
  name: 'fetchSGFoodPlaces',
  description: 'Fetches a listing of food places in Singapore based on specified keywords',
  schema: z.object({
    searchType: z.string().default('keyword'),
    searchValues: z.string().default('Singapore%20food'),
    limit: z.string().optional().default('5')
  }),
  func: async (options) => {
    console.log('Triggered fetchSGFoodPlaces function with options: ', options);
    const { searchType, searchValues, limit } = options;
    const url = `https://api.stb.gov.sg/content/food-beverages/v2/search?searchType=${searchType}&searchValues=${searchValues}&limit=${limit}`;
    console.log(`Calling ${url}`);

    try {
      const response = await fetch(url, {
        headers: {
          "X-API-KEY": "9ULYL7YXUfoeqQF2jpTa1vmz2JFsLl50"
        },
      });
      const data = await response.json();
      const list = data.data;
      console.log(`List: ${list}`);

      const foodContent = list.map((entry: { name: string; body: string; address: any; streetName: any; nearestMrtStation: string}) => `Name: ${entry.name}\nBody: ${entry.body}\nAddress: ${entry.address.streetName}\nNearest MRT: ${entry.nearestMrtStation}`).join('\n\n');

      console.log(foodContent);

      return foodContent;

    } catch (error) {
      console.error(error);
    }
  }
})

// Tool for bars
const fetchSGBars = new DynamicStructuredTool({
  name: 'fetchSGBars',
  description: 'Fetches a listing of bars in Singapore based on specified keywords',
  schema: z.object({
    searchType: z.string().default('keyword'),
    searchValues: z.string().default('Singapore%20bar'),
    limit: z.string().optional().default('5')
  }),
  func: async (options) => {
    console.log('Triggered fetchSGBars function with options: ', options);
    const { searchType, searchValues, limit } = options;
    const url = `https://api.stb.gov.sg/content/bars-clubs/v2/search?searchType=${searchType}&searchValues=${searchValues}&limit=${limit}`;
    console.log(`Calling ${url}`);

    try {
      const response = await fetch(url, {
        headers: {
          "X-API-KEY": "9ULYL7YXUfoeqQF2jpTa1vmz2JFsLl50"
        },
      });
      const data = await response.json();
      const list = data.data;
      console.log(`List: ${list}`);

      const barContent = list.map((entry: { name: string; body: string; address: any; streetName: any; nearestMrtStation: string}) => `Name: ${entry.name}\nBody: ${entry.body}\nAddress: ${entry.address.streetName}\nNearest MRT: ${entry.nearestMrtStation}`).join('\n\n');

      console.log(barContent);

      return barContent;

    } catch (error) {
      console.error(error);
    }
  }
})


// Tool for tours
const fetchSGTours = new DynamicStructuredTool({
  name: 'fetchSGTours',
  description: 'Fetches a listing of tours in Singapore based on specified keywords.',
  schema: z.object({
    searchType: z.string().default('keyword'),
    searchValues: z.string().default('Marina%20Bay'),
    limit: z.string().optional().default('5')
  }),
  func: async (options) => {
    console.log('Triggered fetchSGTours function with options: ', options);
    const { searchType, searchValues, limit } = options;
    const url = `https://api.stb.gov.sg/content/tours/v2/search?searchType=${searchType}&searchValues=${searchValues}&limit=${limit}`;
    console.log(`Calling ${url}`);

    try {
      const response = await fetch(url, {
        headers: {
          "X-API-KEY": "9ULYL7YXUfoeqQF2jpTa1vmz2JFsLl50"
        },
      });
      const data = await response.json();
      const list = data.data;
      console.log(`List: ${list}`);

      const tourContent = list.map((entry: { name: string; body: string; companyName: string; officialWebsite: string; pricing: string }) => `Name: ${entry.name}\nBody: ${entry.body}\nCompany Name: ${entry.companyName}\nWebsite: ${entry.officialWebsite}\nPricing: ${entry.pricing}`).join('\n\n');

      console.log(tourContent);

      return tourContent;

    } catch (error) {
      console.error(error);
    }
  }
})

// ------------ E. DEFINE POST METHOD (WITH AGENT AND TOOLS) -------------------
export async function POST(req: Request, res: Response) {

  // Extract message data from incoming request 
  const { messages } = await req.json();

  // Extract the most recent input message from the array of messages
  const input = messages[messages.length - 1].content;

  // Set up tools and agent
  const tools = [foo, fetchCryptoPrice, fetchSGFoodPlaces, fetchSGBars, fetchSGTours, compareDistance, serpApi]; // excluded wikipediaQuery
  const executor = await initializeAgentExecutorWithOptions(tools, llm, {
    agentType: "openai-functions",
    verbose: true,
  });

  // Execute the agent with the provided input to get a response
  const result = await executor.run(input);

  // Break result into individual word chunks for streaming
  const chunks = result.split(" ");

  // Define streaming method to send chunks of data to the client
  const responseStream = new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        const bytes = new TextEncoder().encode(chunk + " ");
        controller.enqueue(bytes);
        await new Promise((r) => setTimeout(r, Math.floor(Math.random() * 20 + 10)))
      }
      controller.close();
    }
  })

  // Send the created stream as a response to the client
  return new StreamingTextResponse(responseStream);
}

console.log("----------------------------------- END -----------------------------------");
