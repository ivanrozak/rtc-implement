const Peer = require('simple-peer')

let PEER = null

const RtcLib = (config, sendCallback) => {
  if (!config || !sendCallback) {
    throw new Error('Parameter not set!')
  }

  // let peer = null
  let streamLocal = null
  let streamRemote = null
  let videoIdLocal = config.videoIdLocal || false
  let videoIdRemote = config.videoIdRemote || false
  // let mediaStreamConnected = config.mediaStreamConnected || false
  // let mediaStreamRemoved = config.mediaStreamRemoved || false
  let enableFilter = config.enableFilter || false
  let videoFilterId = config.videoFilterId || false

  if (!videoIdLocal || !videoIdRemote) {
    throw new Error('Parameters not correctly set!')
  }

  // Initialize Peer Connection
  const createPeer = (options) => {
    // if (!streamLocalConnected) {
    //   throw new Error('User media not available')
    // }
    console.log('peer start running')
    PEER = new Peer({
      initiator: true,
      trickle: true,
      stream: streamLocal,
      offerOptions: {
        iceRestart: false
      },
      config: {
        iceServers: [
          {
            urls: ['stun:stun.l.google.com:19302']
          },
          {
            urls: ['stun:turn.quickblox.com'],
            username: 'quickblox',
            credential: 'baccb97ba2d92d71e26eb9886da5f1e0'
          },
          {
            urls: ['turn:turn.quickblox.com:3478?transport=udp'],
            username: 'quickblox',
            credential: 'baccb97ba2d92d71e26eb9886da5f1e0'
          },
          {
            urls: ['turn:turn.quickblox.com:3478?transport=tcp'],
            username: 'quickblox',
            credential: 'baccb97ba2d92d71e26eb9886da5f1e0'
          },
          {
            urls: ['turn:turn.yesdok.com:3478'],
            username: 'guestaja',
            credential: 'somepasswordaja'
          },
          {
            urls: ['stun:stun.yesdok.com:3478'],
            username: 'guestaja',
            credential: 'somepasswordaja'
          }
        ]
      }
    })

    // const SignalTime = self.$moment().unix()
    PEER.on('iceStateChange', (data) => {
      console.log('icestatechange', JSON.stringify(data))
      if (data === 'disconnected') {
        console.log('peer disconnected')
      }
      if (data === 'connected') {
        console.log('peer connected')
      }
    })

    PEER.on('signal', (data) => {
      console.log('peer signal', JSON.stringify(data))
      if (data.sdp) {
        sendCallback('peerHaveSdp', data.sdp)
      }
      if (data.candidate) {
        sendCallback('peerHaveCandidate', data.candidate)
      }
    })

    PEER.on('stream', (remoteStream) => {
      console.log('peer run stream')
      let videoElementRemote = document.getElementById(videoIdRemote)
      streamRemote = remoteStream
      if ('srcObject' in videoElementRemote) {
        videoElementRemote.srcObject = remoteStream
      } else {
        videoElementRemote.src = window.URL.createObjectURL(remoteStream)
      }
      videoElementRemote.play()
    })

    PEER.on('error', () => {
      PEER.destroy()
    })
  }

  const handleSignalling = (type, data) => {
    console.log('handle signalling running', type, data)
    switch (type) {
      case 'sdp':
        PEER.signal({ type: 'answer', sdp: data })
        break
      case 'candidate':
        PEER.signal({ candidate: data })
        break
      default:
        break
    }
  }

  // Connect Local Camera & Mic
  const startMedia = () => {
    let videoElementLocal = document.getElementById(videoIdLocal)
    let filter = enableFilter ? document.getElementById(videoFilterId) : null

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        streamLocal = stream
        if ('srcObject' in videoElementLocal) {
          videoElementLocal.srcObject = stream
        }
        videoElementLocal.play()

        if (enableFilter) {
          filter.addEventListener('change', (event) => {
            const currentFilter = event.target.value
            videoElementLocal.style.filter = currentFilter
            // action send filtered stream to peer
            event.preventDefault
          })
        }
      })
      .catch((err) => {
        throw new Error(err)
      })
  }

  return {
    startMedia,
    createPeer,
    handleSignalling
  }
}

export default RtcLib