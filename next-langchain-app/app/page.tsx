'use client';

import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div className="mx-auto w-full max-w-md py-24 flex flex-col stretch">
      {messages.length > 0
        ? messages.map(m => (
            <div key={m.id} className="whitespace-pre-wrap">
              {m.role === 'user' ? 'User: ' : 'AI: '}
              {m.content}
            </div>
          ))
        : null}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed w-full max-w-md bottom-0 border border-gray-300 rounded mb-8 shadow-xl p-2"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}

// // Check if geolocation is supported by the browser
// if ("geolocation" in navigator) {
// // Prompt user for permission to access their location
// navigator.geolocation.getCurrentPosition(
//   // Success callback function
//   (position) => {
//     // Get the user's latitude and longitude coordinates
//     const lat = position.coords.latitude;
//     const lng = position.coords.longitude;

//     // Do something with the location data, e.g. display on a map
//     console.log(`Latitude: ${lat}, longitude: ${lng}`);
//   },
//   // Error callback function
//   (error) => {
//     // Handle errors, e.g. user denied location sharing permissions
//     console.error("Error getting user location:", error);
//   }
// );
// } else {
// // Geolocation is not supported by the browser
// console.error("Geolocation is not supported by this browser.");
// }
