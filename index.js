import { FunctionChain } from "ai-function-chain";

const functionChain = new FunctionChain();

const res1 = await functionChain.call("Search for 'golden poodle' on Wikipedia", {
  functionArray: ["getWikipediaSummary"]
});

const res2 = await functionChain.call("Get me the latest price of Bitcoin");
const res3 = await functionChain.call("Get me the latest price of Ethereum", {
  functionArray: ["fetchCryptoPrice"] // Optionally specify which functions to use
});

console.log(`${res1} \n${res2} \n${res3}`);
// console.log(`${res2} \n${res3}`);

