import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io.connect("http://localhost:3001");

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [currentView, setCurrentView] = useState("chat"); // "chat" or "profile"
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
      time:
        `${String(now.getHours()).padStart(2, "0")}:` +
        `${String(now.getMinutes()).padStart(2, "0")}`,
    };

    socket.emit("send_message", messageData);

    setCurrentMessage("");
  };

  useEffect(() => {
    const receiveHandler = (data) => {
      setMessageList((list) => [...list, data]);
    };

    socket.on("receive_message", receiveHandler);

    return () => {
      socket.off("receive_message", receiveHandler);
    };
  }, []);

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
              <div
                className={`channel-item ${currentView === 'chat' ? 'active' : ''}`}
                onClick={() => setCurrentView("chat")}
              >
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

            {/* Profile Navigation Button */}
            <div
              className={`user-profile ${currentView === 'profile' ? 'active-profile' : ''}`}
              onClick={() => setCurrentView("profile")}
            >
              <div className="avatar-small"></div>
              <span className="profile-name">{username}</span>
              <span className="profile-settings-hint">&#9881;</span>
            </div>
          </div>

          {/* Conditional Rendering: Chat View vs User Profile View */}
          {currentView === "chat" ? (
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
                      key={`${messageContent.author}-${messageContent.time}-${index}`}
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
          ) : (
            <div className="user-profile-page">
              <div className="profile-card">
                <div className="profile-avatar-large"></div>
                <h2>{username}</h2>
                <p className="profile-status">&#128994; Status: Verified Operative</p>

                <div className="profile-details-grid">
                  <div className="detail-box">
                    <span className="detail-label">Role</span>
                    <span className="detail-value">Administrator</span>
                  </div>
                  <div className="detail-box">
                    <span className="detail-label">Active Room</span>
                    <span className="detail-value">{room}</span>
                  </div>
                  <div className="detail-box">
                    <span className="detail-label">Encryption Protocol</span>
                    <span className="detail-value">AES-256 (GCM)</span>
                  </div>
                  <div className="detail-box">
                    <span className="detail-label">Node Status</span>
                    <span className="detail-value" style={{ color: '#00ffaa' }}>Connected</span>
                  </div>
                </div>

                <div className="profile-actions">
                  <button className="profile-btn edit-btn">Edit Profile</button>
                  <button className="profile-btn secure-btn">Lock Session</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;