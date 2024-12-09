import { useState, useRef, useEffect } from "react";

const Receiver = () => {
  const username = 'caller'; // Matching username to the caller
  const [ws, setWs] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [pendingCandidates, setPendingCandidates] = useState([]);
  
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  const iceServers = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  useEffect(() => {
    let webSocket = new WebSocket("ws://localhost:3000");
  
    webSocket.onopen = () => {
      console.log("WebSocket connected (Receiver)");
      webSocket.send(JSON.stringify({ type: "store_user", username }));
    };
  
    webSocket.onmessage = (message) => handleWebSocketMessage(JSON.parse(message.data));
  
    webSocket.onclose = () => {
      console.log("WebSocket disconnected (Receiver)");
    };
  
    setWs(webSocket);
  
    return () => {
      if (webSocket && webSocket.readyState === WebSocket.OPEN) {
        webSocket.close();
      }
      setWs(null);
    };
  }, []);
  

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(mediaStream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing media devices: ", error);
    }
  };

  const joinCall = () => {
    if (ws) {
      console.log("Receiver requesting to join call");
      ws.send(JSON.stringify({ type: "join_call", username }));
    } else {
      console.error("WebSocket is not connected. Cannot join call.");
    }
  };

  const handleWebSocketMessage = async (data) => {
    console.log("Receiver received WebSocket message:", data);
    switch (data.type) {
      case "offer":
        await handleOffer(data.offer);
        break;
      case "candidate":
        if (peerConnection) {
          console.log("Receiver received ICE candidate:", data.candidate);
          await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        } else {
          console.log("Queueing candidate since peer connection is not ready");
          setPendingCandidates((prev) => [...prev, data.candidate]);
        }
        break;
      default:
        break;
    }
  };

  const handleOffer = async (offer) => {
    const pc = new RTCPeerConnection(iceServers);
    setPeerConnection(pc);

    console.log('PC LOG: ', pc)

    localStream?.getTracks().forEach((track) => {
      console.log("Adding track to PeerConnection (Receiver):", track);
      pc.addTrack(track, localStream);
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendIceCandidate(event.candidate);
      }
    };

    pc.ontrack = (event) => {
      console.log("Receiver received remote track:", event.streams[0]);
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    console.log("Receiver setting remote description and creating answer.");
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    // Send the answer, retrying if necessary
    sendAnswer(answer);

    // Send pending ICE candidates if any
    pendingCandidates.forEach(candidate => {
      sendIceCandidate(candidate);
    });
    setPendingCandidates([]);
  };

  const sendIceCandidate = (candidate, retries = 3) => {
    if (retries <= 0) {
      console.error("Max retries reached for sending ICE candidate");
      return;
    }
  
    if (ws) {
      ws.send(JSON.stringify({ type: "send_ICE_candidate", candidate, username }));
    } else {
      console.error("WebSocket is not connected. Retrying to send ICE candidate...");
      setTimeout(() => sendIceCandidate(candidate, retries - 1), 500);
    }
  };
  
  const sendAnswer = (answer, retries = 3) => {
    if (retries <= 0) {
      console.error("Max retries reached for sending answer");
      return;
    }
    
  
    if (ws) {
      ws.send(JSON.stringify({ type: "send_answer", answer, username }));
    } else {
      console.error("WebSocket is not connected. Retrying to send answer...");
      setTimeout(() => sendAnswer(answer, retries - 1), 500);
    }
  };

  return (
    <div>
      <div className="flex">
        <video ref={localVideoRef} className="w-96 h-60 m-5 bg-slate-50" autoPlay muted />
        <video ref={remoteVideoRef} className="w-96 h-60 m-5 bg-slate-50" autoPlay />
      </div>
      <div>
        <button onClick={startCamera} style={{ margin: "10px" }}>
          Start Camera
        </button>
        <button onClick={joinCall} style={{ margin: "10px" }}>
          Join Call
        </button>
      </div>
    </div>
  );
};

export default Receiver;
