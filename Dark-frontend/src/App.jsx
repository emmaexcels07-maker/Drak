import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io.connect("http://localhost:3001");

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", room);
      setShowChat(true);
    }
  };

  const sendMessage = () => {
    if (!currentMessage.trim()) return;

    const now = new Date();

    const messageData = {
      room,
      author: username,
      message: currentMessage,
      time: `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes()
      ).padStart(2, "0")}`,
    };

    socket.emit("send_message", messageData);

    // Don't add locally.
    // Wait for receive_message event.

    setCurrentMessage("");
  };

  const chatBodyRef = useRef(null);

  useEffect(() => {
    chatBodyRef.current?.scrollTo({
      top: chatBodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messageList]);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });
  }, [socket]);

  return (
    <div className="App">
      {!showChat ? (
        <div className="login-container">
          <h1>Dark Chat</h1>
          <input
            type="text"
            placeholder="Username..."
            onChange={(event) => {
              setUsername(event.target.value);
            }}
          />
          <input
            type="text"
            placeholder="Room ID..."
            onChange={(event) => {
              setRoom(event.target.value);
            }}
          />
          <button onClick={joinRoom}>Join Room</button>
        </div>
      ) : (
        <div className="chat-window">
          <div className="chat-header">
            <p>Dark Chat — Room: {room}</p>
          </div>

          <div className="chat-body">
            {messageList.map((messageContent, index) => {
              return (
                <div
                  key={index}
                  className="message"
                  id={username === messageContent.author ? "you" : "other"}
                >
                  <div>
                    <div className="message-content">
                      <p>{messageContent.message}</p>
                    </div>
                    <div className="message-meta">
                      <p id="author">{messageContent.author}</p>
                      <p id="time">{messageContent.time}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          

            <div className="chat-footer">
              <input
                type="text"
                value={currentMessage}
                placeholder="Type a message..."
                onChange={(event) => {
                  setCurrentMessage(event.target.value);
                }}
                onKeyDown={(event) => {
                  event.key === "Enter" && sendMessage();
                }}
              />
              <button onClick={sendMessage}>&#10148;</button>
            </div>
          </div>
      )}
        </div>
      );
}

      export default App;