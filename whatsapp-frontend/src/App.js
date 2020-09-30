import React, { useEffect, useState } from 'react';
import './App.css';
import Sidebar from './Sidebar';
import Chat from './Chat';
import Pusher from 'pusher-js';
import axios from "./axios";


function App() {
  const[messages, setMessages] = useState([]);
  
  useEffect(()=>{
    axios.get('/messages/sync')
    .then(response =>{
      setMessages(response.data)
    })
  }, []);

  useEffect(()=>{
    const pusher = new Pusher('b3e2fdc58f60c853f34f', {
      cluster: 'eu'
    });

    const channel = pusher.subscribe('messages');
    channel.bind('inserted',(newMessage)=> {
      setMessages([...messages,newMessage])
    });

    return ()=>{
      channel.unbind_all()
      channel.unsubscribe();
    };

  }, [messages]);

  console.log(messages);

  return (
    <div className="app">
      <div className="app__body">
        <Sidebar/>
        <Chat messages={messages}/>
      </div>
    </div>
  );
}

export default App;
