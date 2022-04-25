<template>
  <div id="app">
    <h1>Sandbox webRtc</h1>
    <div class="flex">
      <div class="local-container">
        <p>Local Video</p>
        <video id="videoLocal" muted="muted" width="300" height="200" />
        <div>
          <select id="videoFilter">
            <option value="none">Normal</option>
            <option value="grayscale(100%)">B & W</option>
            <option value="sepia(100%)">Old School</option>
            <option value="contrast(150%)">Lumination</option>
            <option value="blur(20px)">Hidden Mist</option>
            <option value="invert(100%)">Dracula</option>
            <option value="hue-rotate(180deg">X-men Beast</option>
            <option value="saturate(25)">Super Saiyan God</option>
          </select>
        </div>
      </div>
      <div class="remote-container">
        <p>Remote Video</p>
        <video id="videoRemote" />
      </div>
    </div>
    <button @click="handleChange()">test</button>
  </div>
</template>

<script>
// const { YDRTC, Coba } = require('../assets/YDRTC')
import RtcLib from '../assets/RtcLib'
import { connectSocketPractice, connectGlobalSocket, test } from '../assets/practiceSocket'

export default {
  name: 'SandBox',
  data() {
    return {
      newData: null,
      rtc: null
    }
  },
  mounted() {
    // this.newData = new YDRTC('asd', 'asddsdas')
    // connectGlobalSocket()
    // test(this.sendListenMessage)
    const config = {
      videoIdLocal: 'videoLocal',
      videoIdRemote: 'videoRemote',
      mediaStreamConnected: 'asdsad',
      mediaStreamRemoved: 'mediaStreamRemoved',
      enableFilter: true,
      videoFilterId: 'videoFilter'
    }
    this.rtc = new RtcLib(config, 'sendCallback')
    this.rtc.startMedia('start', 'asdasd')
  },
  methods: {
    handleChange() {
      // connectSocketPractice()
      this.rtc.initConnection({
        data: 'asdas',
        message: 'asdasd'
      })
    },
    sendListenMessage(message) {
      console.log(message)
    }
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
