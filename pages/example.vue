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
    <button @click="startPractice()">Start Practice</button>
    <button @click="testPeer()">Create Peer</button>
  </div>
</template>

<script>
/**
* Video consultation flow in Yesdok
* 1. Check scheduled appointment (by API)
* 2. If there are schedule and it will start in less than 20 seconds, then button "Start Practice" will Appear
* 3. "Start Practice" will connect Peer to Peer RTC between Doctor and Patient
*/

import RtcLib from '../assets/RtcLib'
// import { connectSocket, signaling, onCall, onData, setData, send } from '../assets/Socket'
import { setData } from '../assets/Socket'

export default {
  name: 'Example',
  data() {
    return {
      isCalling: false,
      readyToConsult: false,
      rtc: null,
      socket: null,
      iceCandidates: []
    }
  },
  computed: {
    storeChanges() {
      return JSON.stringify(this.$store.state)
    }
  },
  watch: {
    // 'storeChanges'() {
    //   setData(this.$store.state)
    // },
    'isCalling'(isCalling) {
      if (isCalling) {
        console.log('Call sound Play!')
        this.prepareConsultation(false)
      } else {
        console.log('Call sound Stopped')
      }
    }
  },
  methods: {
    getCurrentSchedule() {
      this.$store.dispatch('getCurrentSchedule')
    },
    // initSocket() {
    //   const self = this
    //   connectSocket()
    //   self.$store.dispatch('setQueue').then((res) => {
    //     console.log('masuk ke before doctor authorize')
    //     this.send('DoctorAuthorization', self.$store.state.doctorSessionID)
    //     self.sendNotif()
    //   })
    //   // this.send('DoctorAuthorization', 'asdasdasd')
    //   signaling((type, data) => {
    //     console.log('masuk ke signalling')
    //     self.rtc.handleSignalling(type, data)
    //   })
    //   onCall((data) => {
    //     console.log('masuk ke on call')
    //     self.$store.dispatch('consultation/onCall', data)
    //     self.isCalling = true
    //   })
    //   onData((data) => {
    //     console.log('masuk ke onData')
    //     if (data.Status !== 'Accepted') {
    //       console.log('Patient Reject Call')
    //     } else {
    //       self.$store.dispatch('consultation/initConsultation')
    //         .then((res) => {
    //           this.send('ConsultationID', res.ID)
    //           this.send('Message', { id: 'ConsultationID', data: res.ID })
    //           self.isCalling = false
    //           self.$store.commit('consultation/SET_CALL_STATUS', 'IN_CALL')
    //           self.iceCandidates.forEach((iceCandidates) => {
    //             this.send('Message', { id: 'IceCandidate', data: iceCandidates })
    //           })
    //         })
    //         .catch((err) => {
    //           console.log(err)
    //         })
    //     }
    //   })
    // },
    async initiateSocket() {
      console.log('jalan kah')
      const self = this
      this.$store.commit('SET_SOCKET_PRACTICE', this.makeid(10))

      this.socket = await this.$nuxtSocket({
        name: 'practicing',
        channel: '/',
        persist: this.$store.state.practiceSocket.PersistName,
        url: 'https://socks7server13.yesdok.com'
        // reconnection: false,
      })

      this.socket.on('connect', () => {
        console.log('socket practicing connected')
        self.$store.dispatch('setQueue').then((res) => {
          console.log('masuk ke before doctor authorize')
          // this.send('DoctorAuthorization', self.$store.state.doctorSessionID)
          self.$store.dispatch(
            '$nuxtSocket/emit',
            {
              label: self.$store.state.practiceSocket.PersistName,
              evt: 'DoctorAuthorization',
              msg: self.$store.state.doctorSessionID
            }, { root: true }
          ).then((res) => {
            console.log('Doctor Authorized')
            self.sendNotif()
          }).catch((err) => {
            console.log('Doctor Authorize Error!')
          })
        })
      })

      this.socket.on('Message', (data, response) => {
        console.log('ke message ngga sih')
        response(1)
        if (data.id == 'ProcessedAnswer') {
          self.rtc.handleSignalling('sdp', data.data)
        }
        if (data.id == 'IceCandidate') {
          self.rtc.handleSignalling('candidate', data.data)
        }
      })

      this.socket.on('Call', (data, response) => {
        console.log('ke call ga sih')
        response(1)
        self.$store.dispatch('consultation/onCall', data)
        self.isCalling = true
      })

      this.socket.on('Data', (data, response) => {
        console.log('ke data gasih')
        response(1)
        // callback(data)
        if (data.Status !== 'Accepted') {
          console.log('Patient Reject Call')
        } else {
          self.$store.dispatch('consultation/initConsultation')
            .then((res) => {
              self.send('ConsultationID', res.ID)
              self.send('Message', { id: 'ConsultationID', data: res.ID })
              self.isCalling = false
              self.$store.commit('consultation/SET_CALL_STATUS', 'IN_CALL')
              self.iceCandidates.forEach((iceCandidates) => {
                self.send('Message', { id: 'IceCandidate', data: iceCandidates })
              })
            })
            .catch((err) => {
              console.log(err)
            })
        }
      })
    },
    startPractice() {
      this.checkLoginPatient()
      // this.initSocket()
      this.initiateSocket()
    },
    prepareConsultation(options) {
      this.$store.commit('consultation/SET_CALL_STATUS', 'PROCESSING_CALL')
      this.rtc.createPeer(options)
    },
    checkLoginPatient() {
      const appointmentID = this.$store.state.currentSchedule.Appointment.ID
      this.$store.dispatch('consultation/checkLoginPatient', appointmentID)
        .then((res) => {
          console.log("patient logged in :", res.data.Data.IsPatientLoggedIn)
        })
        .catch((err) => {
          throw new Error(err)
        })
    },
    setQueue() {
      this.$store.dispatch('setQueue').then((res) => {
        console.log(res)
      })
    },
    sendNotif() {
      this.$store.dispatch('sendPushNotifiation').then((res) => {
        console.log(res, 'res notif')
      })
    },
    sendSignallingMessage(type, message) {
      const self = this
      switch (type) {
        case 'peerHaveSdp':
          self.send('Call', { id: 'Call', sdpOffer: message })
          self.send('Message', { id: 'GenerateOffer', data: message })
          break
        case 'peerHaveCandidate':
          if (self.$store.state.consultation.callStatus === 'IN_CALL') {
            self.send('Message', { id: 'IceCandidate', data: message.candidate })
            self.iceCandidates.push(message.candidate)
          } else if (self.$store.state.consultation.callStatus === 'PROCESSING_CALL') {
            self.iceCandidates.push(message.candidate)
          }
          break
        default:
          break
      }
    },
    send(channel, message) {
      // this.socket.emit(channel, message)
      const self = this
      self.$store.dispatch(
        '$nuxtSocket/emit',
        {
          label: self.$store.state.practiceSocket.PersistName,
          evt: channel,
          msg: message
        }, { root: true }
      )
    },
    makeid (length) {
      let result = ''
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      const charactersLength = characters.length
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
      }
      return result
    },
  },
  mounted() {
    const config = {
      videoIdLocal: 'videoLocal',
      videoIdRemote: 'videoRemote',
    }
    this.rtc = new RtcLib(config, this.sendSignallingMessage)
    this.rtc.startMedia()
    // set data store to Socket file
    setData(this.$store.state)
    // get scheduled appointment with patient
    this.getCurrentSchedule()
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
