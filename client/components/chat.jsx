import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Message from './message';
// import Leaderboard from './leaderboard';

const socket = io();

const Chat = () => {
  // Set initial states
  const [messages, setMessages] = useState([]);
  const [leaderboard, setLeaderboard] = useState({ first: '', second: '', third: '' });
  console.log(leaderboard);
  const [messageInput, setMessageInput] = useState('');
  const [pollIntervalId, setPollIntervalId] = useState(null);
  const [userId, setuserId] = useState(null);
  const [userScore, setUserScore] = useState(null);

  // Handler to update state of controlled input
  const handleMessageInput = (e) => setMessageInput(e.target.value);

  // Handler to create a new message
  const handleMessageSend = () => {
    socket.emit('send-message', { sender_id: userId, message: messageInput });
    setMessageInput('');
  };

  // const handleAiMessageSend = () => {
  //   socket.emit('ai-message', { sender_id: userId, message: messageInput })
  //   setMessageInput('');
  // };

  // On mount fetch sender id
  useEffect(() => {
    socket.on('connect', () => console.log('websockets babyyyyyy'));

    const fetchAndSetuserId = async () => {
      try {
        const response = await fetch('/api/user_id'); // update endpoint when ready
        const userId = await response.json();
        setuserId(userId.user_id); // update properties to match up if needed
      } catch (err) {
        console.log(err);
      }
    };

    const fetchAllMessages = async () => {
      try {
        const response = await fetch('/api/messages');
        if (response.status === 200) {
          const body = await response.json();
          setMessages(body.messages);
        } else {
          const error = response.json();
          throw new Error(error.message);
        }
      } catch (err) {
        console.log(err);
      }
    };


    // const postAiMessage = async () => {
    //   try {
    //     fetch('/api/ai-message', {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json'
    //       }
    //     })
    //     .then((response) => response.json());

    // const fetchLeaderBoard = async () => {
    //   try {
    //     const response = await fetch('/check', {method: 'POST', headers: {'Content-Type': 'application/json'}});
    //     if (response.status === 200) {
    //       const body = await response.json();
    //       console.log(body);
    //       // setLeaderboard(body)
    //     } else {
    //       const error = response.json();
    //       throw new Error(error.message);
    //     }

    //   } catch (err) {
    //     console.log(err)
    //   }
    // }


    // postAiMessage();
    
    // fetchLeaderBoard()

    fetchAndSetuserId();
    fetchAllMessages();
  }, []);

  socket.on('receive-message', (message) => {
    setMessages([...messages, message]);
  });

  const createLeaderboard = (leaderboard) => {
    const result = [];
    let i = 1;
    for (const key in leaderboard) {
      result.push(<div>
        <span>{key}</span>
        <span>{leaderboard[key]}</span>
      </div>);
    }
    return result;
  }


  // Create list of message elements to render
  const messageElementList = messages.map((message) => {
    return (
      <Message
        leaderboard={leaderboard}
        setUserScore={setUserScore}
        setLeaderboard={setLeaderboard}
        user_id={userId}
        sender_id={message.sender_id}
        username={message.username}
        message={message.message}
        dateTime={message.time}
        key={message.message_id}
        id={message.message_id}
      />
    );
  });

  // Render chatroom elements
  return (
    <div className="chatroom">
      <h1 onClick={handleAiMessage}>AI-mong Us</h1>

      <div>{createLeaderboard(leaderboard)}</div>

      {/* <Leaderboard
        leaderboard={leaderboard}
      /> */}

      <div className="messages">
        <div>{messageElementList}</div>
      </div>

      <div className="message-input">
        <input
          placeholder="Say something to the chat..."
          value={messageInput}
          onChange={handleMessageInput}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleMessageSend();
          }}
        ></input>
        <button onClick={handleMessageSend}>Send</button>
      </div>
    </div>
  );
};

export default Chat;
