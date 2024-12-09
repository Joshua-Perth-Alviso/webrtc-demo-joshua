import { useState, useRef, useEffect } from "react";

const Caller = () => {
  const username = 'caller';
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
    const webSocket = new WebSocket("ws://localhost:3000");

    webSocket.onopen = () => {
      console.log("WebSocket connected (Caller)");
      webSocket.send(JSON.stringify({ type: "store_user", username }));
    };

    webSocket.onmessage = (message) => handleWebSocketMessage(JSON.parse(message.data));
    webSocket.onclose = () => console.log("WebSocket disconnected (Caller)");

    setWs(webSocket);

    return () => webSocket.close();
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

  const startCall = async () => {
    const pc = new RTCPeerConnection(iceServers);
    setPeerConnection(pc);

    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        if (ws) {
          ws.send(JSON.stringify({ type: "store_ICE_candidate", candidate: event.candidate, username }));
        } else {
          // Store the ICE candidate until WebSocket is ready
          setPendingCandidates((prev) => [...prev, event.candidate]);
        }
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        console.log('Remote Video Ref: ', remoteVideoRef)
      }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    ws.send(JSON.stringify({ type: "store_offer", offer, username }));

    // Send pending candidates if any
    pendingCandidates.forEach(candidate => {
      ws.send(JSON.stringify({ type: "store_ICE_candidate", candidate, username }));
    });
    setPendingCandidates([]);
  };

  const handleWebSocketMessage = async (data) => {
    switch (data.type) {
      case "answer":
        if (peerConnection) {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
        }
        break;
      case "candidate":
        if (peerConnection) {
          await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
        break;
      default:
        break;
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
        <button onClick={startCall} style={{ margin: "10px" }}>
          Start Call
        </button>
      </div>
    </div>
  );
};

export default Caller;
