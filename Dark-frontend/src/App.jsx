import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

// Update to your live Render backend URL when deploying
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

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time: new Date(Date.now()).getHours().toString().padStart(2, '0') + ":" + 
              new Date(Date.now()).getMinutes().toString().padStart(2, '0'),
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });
  }, [socket]);

  return (
    <div className="App">
      {!showChat ? (
        <div className="login-container">
          <div className="login-card">
            <div className="logo-glow"></div>
            <h1>Dark Chat</h1>
            <p className="login-sub">Immersive encrypted messaging</p>
            <input
              type="text"
              placeholder="Enter Username..."
              onChange={(event) => setUsername(event.target.value)}
            />
            <input
              type="text"
              placeholder="Enter Room ID..."
              onChange={(event) => setRoom(event.target.value)}
            />
            <button onClick={joinRoom}>Access Terminal</button>
          </div>
        </div>
      ) : (
        <div className="main-app-screen">
          {/* Sidebar */}
          <div className="sidebar">
            <div className="sidebar-header">
              <h2>Dark Chat</h2>
            </div>
            <div className="search-box">
              <input type="text" placeholder="Search Channels..." />
            </div>
            <div className="channels-list">
              <div className="channel-item active">
                <div className="channel-avatar glowing-ring"></div>
                <div className="channel-info">
                  <span className="channel-name">Room: {room}</span>
                  <span className="channel-status online">Active Terminal</span>
                </div>
              </div>
              <div className="channel-item">
                <div className="channel-avatar"></div>
                <div className="channel-info">
                  <span className="channel-name">Dev Lounge</span>
                  <span className="channel-status away">Away</span>
                </div>
              </div>
              <div className="channel-item">
                <div className="channel-avatar"></div>
                <div className="channel-info">
                  <span className="channel-name">NEXUS Network</span>
                  <span className="channel-status online">Online</span>
                </div>
              </div>
            </div>
            <div className="user-profile">
              <div className="avatar-small"></div>
              <span className="profile-name">{username}</span>
            </div>
          </div>

          {/* Chat Window */}
          <div className="chat-window">
            <div className="chat-header">
              <div className="active-chat-info">
                <div className="avatar-medium"></div>
                <div>
                  <h3>Room: {room}</h3>
                  <span className="sub-text">Encrypted Channel</span>
                </div>
              </div>
              <div className="header-controls">
                <button className="ctrl-btn">&#128222;</button>
                <button className="ctrl-btn">&#128249;</button>
                <button className="ctrl-btn">&#128269;</button>
              </div>
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
              <button className="attach-btn">+</button>
              <input
                type="text"
                value={currentMessage}
                placeholder="Type a dark message..."
                onChange={(event) => setCurrentMessage(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && sendMessage()}
              />
              <button className="emoji-btn">&#128522;</button>
              <button className="send-btn" onClick={sendMessage}>&#10148;</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;