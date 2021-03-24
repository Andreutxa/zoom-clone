// Js frontend
// socket.emit =>>> will send
// socket.on =>>>> will receive

// const { text } = require("express");

const socket = io('/')
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');
myVideo.muted = true;

let peer = new Peer(undefined, {
    // because we told our server to use it
    path: '/peerjs',
    // to make the peer access from localhost, heroku... 
    host: '/',
    // our server is listening to this port
    port: '3000'
});

let myVideoStream;
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on('call', call => {
        // the peer answe the call
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })
    // variable recieves the video
    socket.on('user-connected', (userId) => {
        connectToNewUser(userId, stream)
    })

    const text = document.getElementById('chat-message')

    document.addEventListener('keydown', event => {
        const keyName = event.key
        if (keyName == 'Enter' && text.value.length !== 0) {
            socket.emit('message', text.value);
            text.value = '';
        }
    })

    socket.on('createMessage', message => {
        console.log(message)
        const ulMessages = document.getElementById('ul-messages');
        const newLi = document.createElement('li');
        const userSendingMsg = document.createElement('B')
        userSendingMsg.innerHTML += 'user'
        const breakSpace = document.createElement('br')
        newLi.appendChild(userSendingMsg);
        newLi.appendChild(breakSpace);
        newLi.appendChild(document.createTextNode(`${message}`));
        newLi.setAttribute('class', 'message');
        ulMessages.appendChild(newLi)
        // ulMessages.append(`<li class="message"><b>user</b><br/>${message}</li>`)
        scrollToBottom()
    })


})

peer.on('open', id => {
    // the id is for every person who is connecting
    // this person that is connected has joined this room, and I pass the id 
    socket.emit('join-room', ROOM_ID, id)
})

const connectToNewUser = (userId, stream) => {
    //peer comes from line 27 and stream comes from the promise .then()
    const call = peer.call(userId, stream)
    // create a video element for this new user
    const video = document.createElement('video')
    // when I receive the stream, I add that video stream
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
}

const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video)
}

const scrollToBottom = () => {
    let chatWindow = document.querySelector('.main-chat-window');
    chatWindow.scrollTop = chatWindow.scrollHeight    
}

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `
        <i class="fas fa-microphone"></i>
        <span>Mute</span>
    `

    document.querySelector('.main-mute-button').innerHTML = html;
}

const setUnmuteButton = () => {
    const html = `
        <i class="unmute fas fa-microphone-slash"></i>
        <span>Unmute</span>
    `

    document.querySelector('.main-mute-button').innerHTML = html;
}

const playStop = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;

    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo()
    } else {
        setStopVideo()
        myVideoStream.getVideoTracks()[0].enabled = true
    }
}

const setStopVideo = () => {
    const html = `
        <i class="fas fa-video"></i>
        <span>Stop Video</span>
    `

    document.querySelector('.main-video-button').innerHTML = html
}

const setPlayVideo = () => {
    const html = `
        <i class="stop fas fa-video-slash"></i>
        <span>Stop Video</span>
    `

    document.querySelector('.main-video-button').innerHTML = html
}