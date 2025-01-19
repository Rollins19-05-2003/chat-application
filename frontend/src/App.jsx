import React, { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

const App = () => {
  const socket = useMemo(
    () =>
      io("https://chat-application-backend-kl7l.onrender.com/"),
    []
  );

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [room, setRoom] = useState("");
  const [socketID, setSocketId] = useState("");
  const [roomName, setRoomName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit("message", { room, message, senderId: socket.id });
    setMessages((messages) => [...messages, { text: message, fromSelf: true }]);
    setMessage("");
  };

  const joinRoomHandler = (e) => {
    e.preventDefault();
    socket.emit("join-room", roomName);
    setRoomName("");
  };

  useEffect(() => {
    socket.on("connect", () => {
      setSocketId(socket.id);
      console.log("connected", socket.id);
    });

    socket.on("receive-message", (data) => {
      console.log(data);
      const isFromSelf = data.senderId === socket.id;
      setMessages((messages) => [
        ...messages,
        { text: data.message, fromSelf: isFromSelf },
      ]);
    });

    socket.on("welcome", (msg) => {
      console.log(msg);
    });

    socket.on('connect_error', (err) => {
      console.error('Connection failed:', err.message);
      setTimeout(() => socket.connect(), 5000); // Retry after 5 seconds
    });
    
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-black via-gray-500 to-black">
      <div className="w-full max-w-md p-5 bg-white shadow-2xl rounded-lg">
        <div className="mb-5">
          <h1 className="text-sm font-bold text-center text-gray-700">
            Socket ID
          </h1>
          <p className="text-center text-gray-500">{socketID}</p>
        </div>

        <form onSubmit={joinRoomHandler} className="mb-5">
          <h5 className="text-lg font-semibold mb-3 text-gray-700">
            Join Room
          </h5>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Room Name"
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-300 mb-3"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Join
          </button>
        </form>

        <form onSubmit={handleSubmit} className="mb-5">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message"
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-green-300 mb-3"
          />
          <input
            type="text"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Enter room name"
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-green-300 mb-3"
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
          >
            Send
          </button>
        </form>

        <div className="space-y-3 flex flex-col">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg max-w-[70%] break-words ${
                m.fromSelf
                  ? "bg-green-900 text-white self-end"
                  : "bg-black text-white self-start"
              }`}
            >
              {m.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
