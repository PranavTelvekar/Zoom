import React, { useEffect, useRef, useState } from "react"
import styles from "../styles/videoComponant.module.css"
import { Badge, IconButton, TextField } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import CallEnd from '@mui/icons-material/CallEnd'
import io from "socket.io-client";

import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'

import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'

import server from "../environment"



const server_url=server;

var connections={};


const peerConfigConnections = {
    "iceServers": [
        { "urls":"stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent(){

    var socketRef=useRef();
    let socketIdRef=useRef();
    let localVideoRef=useRef();
    let [videoAvailabel,setVideoAvailabel]=useState(true);
    let [audioAvailabel,setAudioAvailabel]=useState(true);
    let [video,setVideo]=useState([]);
    let [audio,setAudio]=useState();
    let [screen,setScreen]=useState();
    let [showModal,setModal]=useState(true);
    let [screenAvailabel,setScreenAvailabel]=useState();
    let [messages,setMessages]=useState([]);
    let [message,setMessage]=useState("")
    let [newMessages,setNewMessages]=useState(0);
    let [askForUserName,setAskForUsername]=useState(true);
    let [username,setUsername]=useState();
    const videoRef=useRef([]);
    let [videos,setVideos]=useState([]);

    const getPermissions=async()=>{
        try {
            const videoPermission=await navigator.mediaDevices.getUserMedia({video:true})
            console.log("Video Permission",videoPermission)
            if(videoPermission){
                setVideoAvailabel(true)
            }else{
                setVideoAvailabel(false)
            }

            const audioPermission=await navigator.mediaDevices.getUserMedia({audio:true})

            console.log("audio Permission",audioPermission);

            if(audioPermission){
                setAudioAvailabel(true)
            }else{
                setAudioAvailabel(false)
            }

            if(navigator.mediaDevices.getDisplayMedia){
                setScreenAvailabel(true)
            }else{
                setScreenAvailabel(false)

            }

            if (videoAvailabel || audioAvailabel) {
                 const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailabel, audio: audioAvailabel });
                 console.log("User Media Stream",userMediaStream)
                    if(userMediaStream){
                        window.localStream=userMediaStream;
                        if(localVideoRef.current){
                            localVideoRef.current.srcObject=userMediaStream
                        }
                    }
            }

            


        } catch (error) {
            setVideoAvailabel(false);
            setAudioAvailabel(false);
            console.log(error)
        }
    }

    useEffect(()=>{
        getPermissions();
    },[])


    let getDislayMediaSuccess = (stream) => {
        console.log("HERE")
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoRef.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoRef.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoRef.current.srcObject = window.localStream

            getUserMedia()

        })
    }

    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoRef.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                console.log("Here Is Description In GetUserMediaSuccess",description)
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoRef.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoRef.current.srcObject = window.localStream

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        })
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }

    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }









    let getUserMedia = () => {

        console.log("Here Is Video",video)

        if ((video && videoAvailabel) || (audio && audioAvailabel)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoRef.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { }
        }
    }

    useEffect(()=>{

        console.log("i am in use effect")

        if(video!==undefined&&audio!==undefined){
            getUserMedia()

            console.log("SET STATE HAS ", video , audio)
        }
    },[video,audio])


    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }


    

    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false })

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href)
            socketIdRef.current = socketRef.current.id

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
            })

            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                    // Wait for their ice candidate       
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    // Wait for their video stream
                    connections[socketListId].onaddstream = (event) => {
                        console.log("BEFORE:", videoRef.current);
                        console.log("FINDING ID: ", socketListId);

                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                            console.log("FOUND EXISTING");

                            // Update the stream of the existing video
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            // Create a new video
                            console.log("CREATING NEW");
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoplay: true,
                                playsinline: true
                            };

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };

                    // Add the local video stream
                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream)
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream)
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }




    let getMedia=()=>{
        setVideo(videoAvailabel)
        setAudio(audioAvailabel)
        connectToSocketServer()
    }



    let connect=()=>{
        setAskForUsername(false)
        getMedia();
    }


    ///Display Code

    let handleVideo=()=>{
        setVideo(!video)
    }

    let handleAudio=()=>{
        setAudio(!audio)
    }

    useEffect(()=>{
        if(screen!==undefined){
            getDislayMedia();

        }
    },[screen])

    let getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e))
            }
        }
    }

    let handleScreen=()=>{
        setScreen(!screen)
    }

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };

    let sendMessage = () => {
        console.log(socketRef.current);
        socketRef.current.emit('chat-message', message, username)
        setMessage("");

        // this.setState({ message: "", sender: username })
    }


    //let routeTo=useNavigate()

    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { }
        window.location.href = "/"
    }


    return(
        <div>

            {askForUserName===true?
            <div>
                <h2>Enter Into Lobby</h2>
                <TextField id="outlined-basic" label="username" onChange={e=>setUsername(e.target.value)} variant="outlined" />
                <Button variant="contained" onClick={connect}>Connect</Button>
                <div>
                    <video ref={localVideoRef} autoPlay muted></video>
                </div>
            </div>:
            <div className={styles.meetVideoContainer} >

            {showModal ? <div className={styles.chatRoom}>

            <div className={styles.chatContainer}>
                <h1>Chat</h1>

                <div className={styles.chattingDisplay}>

                    {messages.length !== 0 ? messages.map((item, index) => {

                        //console.log(messages)
                        return (
                            <div style={{ marginBottom: "20px" }} key={index}>
                                <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                                <p> {console.log(item.data)}  {item.data}</p>
                            </div>
                        )
                    }) : <p>No Messages Yet</p>}


                </div>

                <div className={styles.chattingArea}>
                    <TextField value={message} onChange={(e) => setMessage(e.target.value)} id="outlined-basic" label="Enter Your chat" variant="outlined" />
                    <Button variant='contained' onClick={sendMessage}>Send</Button>
                </div>


            </div>
            </div> : <></>}


                <div className={styles.buttonContainers}>
                    <IconButton onClick={handleVideo} style={{color:"white",fontSize:"32px"}}>
                        {(video===true)?<VideocamIcon/>:<VideocamOffIcon/>}
                    </IconButton>
                    <IconButton onClick={handleEndCall} style={{color:"red",fontSize:"32px"}}>
                        <CallEnd/>
                    </IconButton>
                    <IconButton onClick={handleAudio} style={{color:"white",fontSize:"32px"}}>
                        {(audio===true)?<MicIcon/>:<MicOffIcon/>}
                    </IconButton>
                    {screenAvailabel === true ?
                            <IconButton onClick={handleScreen}  style={{ color: "white" }}>
                                {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                            </IconButton> : <></>}

                    <Badge badgeContent={newMessages} max={999} color="secondary">
                        <IconButton onClick={()=>setModal(!showModal)} style={{color:"white",fontSize:"32px"}}>
                            <ChatIcon/>
                        </IconButton>
                    </Badge>
                </div>
                
                <video className={styles.meetUserVideo} ref={localVideoRef} autoPlay muted></video>

                <div className={styles.conferenceView}>
                        {videos.map((video) => (
                            <div key={video.socketId}>
                                <video
                                    className={styles.video}
                                    data-socket={video.socketId}
                                    ref={ref => {
                                        if (ref && video.stream) {
                                            ref.srcObject = video.stream;
                                        }
                                    }}
                                    autoPlay
                                >
                                </video>
                            </div>

                        ))}

                    </div>



            </div>
            
        }

        </div>
    )
}

