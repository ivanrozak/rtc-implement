<template>
  <div id="app">
    <h1>Sandbox webRtc</h1>
    <div class="flex">
      <div class="local-container">
        <p>Local Video</p>
        <video id="videoLocal" muted="muted" width="300" height="200" />
      </div>
      <div class="remote-container">
        <p>Remote Video</p>
        <video id="videoRemote" />
      </div>
    </div>
    <!-- <button @click="startPractice()">Start Practice</button> -->
    <button @click="createPeer()">Create Peer</button>
  </div>
</template>

<script>
const Peer = require('simple-peer')
const getUserMedia = require('getusermedia')

let PEER = null
let LOCAL_STREAM = null

export default {
  name: 'Test',
  methods: {
    createPeer() {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          let videoElementLocal = document.getElementById('videoLocal')
          if ('srcObject' in videoElementLocal) {
            videoElementLocal.srcObject = stream
            LOCAL_STREAM = stream
          }
          videoElementLocal.play()
          PEER = new Peer({
            initiator: true,
            trickle: true,
            stream,
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

            }
            if (data.candidate) {

            }
          })
          PEER.on('error', (data) => {

          })

        }).catch((err) => {
          throw new Error(err)
        })
    }
  },
  mounted() {
    
  }
}
</script>

<style scoped>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    margin-top: 60px;
  }

  video {
    background: black;
    width: 300px;
    height: 200px;
  }

  button {
    padding: 6px 12px;
    cursor: pointer;
    font-weight: 700;
  }

  .flex {
    display: flex;
    justify-content: flex-start;
    gap: 20px;
    margin-bottom: 10px;
  }
</style>
