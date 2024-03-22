import { useEffect, useState, useRef } from 'react';
import { stripHtml } from 'string-strip-html';
import axios from 'axios';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import minimizeImg from './images/minimize.svg';
import refreshImg from './images/refresh.svg';
import micImg from './images/mic.svg';
import sendArrowImg from './images/sendArrow.svg';
import chatBotImg from './images/chatBot.svg';
import smileyImg from './images/smiley.svg';
import attachmentImg from './images/attachment.svg';
import speakerImg from './images/speaker.svg';
import './App.css';

function App() {
  // const [chatHistory, setChatHistory] = useState([{ messageType: 'R', message: 'Hello! How can I assist you today?' }])
  const [chatHistory, setChatHistory] = useState([{ messageType: 'R', message: 'The capital of China is Beijing.<br><br/><div class="source">Sources: <ol><li><a href="https://en.wikipedia.org/wiki/China">https: //en.wikipedia.org/wiki/China</a></li></ol></div>' }])
  const [message, setMessage] = useState('');
  let sessionId = useRef('');
  // let inactivityTime = function () {
  //   console.log("inside inactivity");
  //   let time;
  //   window.onload = resetTimer;
  //   document.onmousemove = resetTimer;
  //   document.onkeypress = resetTimer;
  //   function logout() {
  //     console.log("You are now logged out.")
  //     chatHistory.push({ messageType: 'R', message: "Your session is expired" });
  //     setChatHistory([...chatHistory]);
  //     sessionId.current = 'logout';
  //   }
  //   function resetTimer() {
  //     clearTimeout(time);
  //     time = setTimeout(logout, 60000)
  //   }
  // };
  // window.onload = function() {
  //   inactivityTime();
  // }
  // // console.log('Please wait...');

  useEffect(() => {
    // callMessagingAPI("get_session_id");
    axios.post("https://4ztrb2qdny7zrjeqwkf5vnvwbm0vapyp.lambda-url.ap-south-1.on.aws/", {
      user_input: 'get_session_id',
      sessionId: sessionId.current
    }, {
      headers: {
        "Content-Type": "text/plain",
      },
    }).then(response => {
      sessionId.current = response.data;
    }).catch(err => {
    });
  }, [sessionId])

  useEffect(() => {

    var el = document.getElementById('centerPanel');
    el.scrollTop = el.scrollHeight - el.clientHeight;
    var confirmButton = document.getElementById("btnConfirm");

    if (confirmButton) {
      confirmButton.addEventListener("click", handleConfirm);
      confirmButton.removeAttribute("id");
      return () => {
        confirmButton.removeEventListener('click', handleConfirm);
      }
    }
  }, [chatHistory]);

  const commands = [
    {
      command: 'confirm',
      callback: () => {
        setMessage('');
        handleConfirm();
      }
    },
  ]

  const {
    transcript,
    listening,
    finalTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition({ commands });

  useEffect(() => {
    setMessage(transcript);
  }, [transcript])

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  function handleChange(event) {
    setMessage(event.target.value);
  };
  function callMessagingAPI(input) {
    axios.post("https://4ztrb2qdny7zrjeqwkf5vnvwbm0vapyp.lambda-url.ap-south-1.on.aws/", {
      user_input: input,
      sessionId: sessionId.current
    }, {
      headers: {
        "Content-Type": "text/plain",
      },
    }).then(response => {
      chatHistory.push({ messageType: 'R', message: response.data });
      setChatHistory([...chatHistory]);
      // handleSpeech(response.data);
    }).catch(err => {
      console.log("error", err);
      chatHistory.push({ messageType: 'R', message: "Sorry, we couldn't help you this time due to server issue" });
      setChatHistory([...chatHistory]);
    });
  }

  function handleSendMessage() {
    if (message) {
      chatHistory.push({ messageType: 'S', message: message });
      setChatHistory([...chatHistory])
      setMessage('');
      callMessagingAPI(message);
    }
  }

  function handleConfirm() {
    // event.stopPropagation();
    var confirmButton = document.getElementsByClassName("btnBlue");
    if (confirmButton[0]) {
      confirmButton[0].classList.add("btnGrey");
      confirmButton[0].disabled = true;
      confirmButton[0].classList.remove("btnBlue");
    }
    callMessagingAPI('confirm_button');
  }

  function handleEnterKey(event) {
    if (event.keyCode === 13) {
      handleSendMessage();
    }
  }

  function handleSpeech(event) {
    event.stopPropagation();
    var msg = event.target.previousSibling.innerText ;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(stripHtml(msg).result);
    const voices = speechSynthesis.getVoices();
    if (!voices.length) {
      utterance.voice = voices[0];
    }
    // utterance.lang = 'fr';
    // utterance.rate = 2;
    speechSynthesis.speak(utterance);
  }

  return (
    <div className="container">
      <div className="bar">
        <img src={chatBotImg} className='chatBotLogo' />
        <span className="barHeading">GenAI<span className="botText">Bot</span></span>
        <span className="barRight">
          <img src={refreshImg} />
          <img src={minimizeImg} className='minimizeImg' />
        </span>
      </div>
      <div className='centerPanel' id="centerPanel" >
        {
          chatHistory.map((msgRow, index) => {
            return <>
              {msgRow.messageType === "R" &&
              <>
                  <div id="receivedMsg" className="receivedMsgSection" dangerouslySetInnerHTML={{ __html: msgRow.message }} />
                  <img src={speakerImg} className='speakerImg' onClick={handleSpeech} />
              </>
              }
              {msgRow.messageType === "S" && <div className="sentMsgSection" >{msgRow.message}</div>}
            </>
          })
        }
      </div>
      <div className="inputSection">
        <span className='msgSectionLeft'>
          <img src={smileyImg} className='smileyImg' />
          <input type="text" placeholder='Type a message' value={message} className='inputBox' onChange={handleChange} onKeyUp={handleEnterKey} />
          <img src={attachmentImg} className='attachmentImg' />
        </span>
        <span className='msgSectionRight'>
          <span className='mic'><img src={micImg} className="micImage" onMouseDown={SpeechRecognition.startListening} onMouseUp={SpeechRecognition.stopListening} /></span>
          <span className="sendArrow"><img src={sendArrowImg} className='sendArrowImg' onClick={handleSendMessage} /></span>
        </span>
      </div>
    </div>
  );
}

export default App;
