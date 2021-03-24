// Js frontend

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
    audio: false
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