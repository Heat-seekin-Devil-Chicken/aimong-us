import React, { useState } from 'react';

const Message = (props) => {
  const [clicked, setClicked] = useState(false);
  const [message_id] = useState(props.id);
  const [sender_id] = useState(props.sender_id);
  const [dateTime] = useState(props);
  const { user_id, leaderboard, userScore } = props;
  const date = new Date(dateTime).toLocaleDateString();
  const time = new Date(dateTime).toLocaleTimeString();

  const calcScore = (event) => {
    if (clicked) {
      return;
    } else {
      setClicked(true);
      // const message = document.getElementById(`${message_id}`);
      // console.dir(message);
      // message.style.backgroundColor = 'grey';
      // event.target.style.backgroundColor = 'grey';
      event.currentTarget.style.backgroundColor = 'grey';

      fetch('/check', {
        method: 'POST',
        headers: {
          // 'Accept': 'application.json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender_id,
          user_id,
        }),
      })
        // {first_name : [name, score]....}
        .then((response) => response.json())
        .then((data) => {
          const { first_place, second_place, third_place } = data;
          props.setUserScore(data.current_user);
          props.setLeaderboard({
            1 : `${first_place[0]} : ${first_place[1]}`,
            2 : `${second_place[0]} : ${second_place[1]}`,
            3 : `${third_place[0]} : ${third_place[1]}`
          });
        }).then(() => {
          console.log(user_id, leaderboard);
        });
      
    }
  };
  return (
    <div onClick={calcScore} className="message" id={message_id}>
      <span className="message-user">anonymous crewmate</span>
      <span className="message-message">{props.message}</span>
      <span className="message-timestamp">
        {date} @ {time}
      </span>
    </div>
  );
};

export default Message;
