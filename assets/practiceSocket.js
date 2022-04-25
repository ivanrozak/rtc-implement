// import socket-io library
import socketIO from 'socket.io-client'

// provide the required field
import {state} from '../store/index'
const newState = state()
const { user, currentSchedule, doctorSessionID } = newState


// initialize socket
const globalSocket = socketIO('https://server13.yesdok.com:3002')
const practiceSocket = socketIO('https://socks7server13.yesdok.com')

let isGlobalSocketConnected = false
let isPracticeSocketConnected = false
let isDoctorReconnect = false
let connectionError = false
let isPatientNoAnswer = false
let mode = 'Video'

const connectGlobalSocket = () => {
  globalSocket.on('connect', () => {
    isGlobalSocketConnected = true
    console.log('Global Socket Connected')
    globalSocket.emit('Authorization', user.Token)
  })

  globalSocket.on('error', (data) => {
    console.log('Global Socket Error', JSON.stringify(data))
  })

  globalSocket.on('reconnect', (data) => {
    console.log('Global Socket Reconnect', JSON.stringify(data))
    isDoctorReconnect = true
  })

  globalSocket.on('Reconnect', (data) => {
    console.log('Doctor Reconnect', JSON.stringify(data))
    if (!isDoctorReconnect) {
      // if (currentSchedule.Appointment.ConsultationStatus === 'IN_SESSION' && consultation.callStatus === 'IN_CALL') {
      //   // show modal something wrong
      // }
      return
    }
    // callback function doctorReconnect()
  })

  globalSocket.on('connect_error', (data) => {
    console.log('Global Connect Socket Error', JSON.stringify(data))
    // if (connectionError && !globalSocketConnect && !inConsultation && $route.name === 'console') {
    // show swall "Mencoba terhubung dengan server..."
    //   connectionError = false
    // }
  })

  globalSocket.on('disconnect', (data) => {
    console.log('Global Socket Disconnected', JSON.stringify(data))
    isGlobalSocketConnected = false
    connectionError = true
  })
}
  
const connectSocketPractice = () => {
  practiceSocket.on('connect', () => {
    log({
      data: 'Consultation Connected to Socket'
    })
    isPracticeSocketConnected = true
    // doctorAuthorization here
  })

  practiceSocket.on('error', (data) => {
    log({
      data: 'Consultation Socket Error: ' + JSON.stringify(data),
      status: 'ERROR'
    })
  })

  practiceSocket.on('reconnect', (data) => {
    log({
      data: 'Consultation Socket Reconnect: ' + JSON.stringify(data),
      status: 'ERROR'
    })
  })

  practiceSocket.on('disconnect', (data) => {
    log({
      data: 'Consultation Disconnected from Socket '
    })
    // if (this.$store.state.consultation.position === 1 || this.$store.state.consultation.position === 2) {
    //   // if socket disconnected while position 1 or 2, it means patient no answer
    //   this.patientNoAnswer()
    //   this.$sentry.captureException(new Error('[CONSULTATION_SOCKET_DISCONNECT] Patient No Answer'))
    // }
    // this.$sentry.captureException(new Error(`[CONSULTATION_SOCKET_DISCONNECT] ${data}`))

    // this.$store.dispatch('consultation/checkIncompleteConsultation')
    // setTimeout(() => {
    //   if (this.$store.state.consultation.inConsultation) {
    //     this.$bvModal.show('modalIceConnectionDie')
    //     this.$bvModal.hide('modalPatientConnectionDie')
    //     this.connectionDisconnect = true
    //   }
    // }, 500)
  })

  practiceSocket.on('Call', (data, response) => {
    console.log('GET START CALL')
    response(1)
    mode = data.CallType
  })
}

function log (payload) {
  const {data, status = 'INFO', consoleLog = true} = payload
  if(!isGlobalSocketConnected) {
    console.log('Global Socket Not Connected')
    return
  }
  let message = `[${$nuxt.$moment().format('YYYY-MM-DD HH:mm:ss')}] [${status}] ${data}`
  if(consoleLog) { console.log(message) }
  globalSocket.emit('DoctorPracticeSessionLogs', message)
}

const test = (sendCallback) => {
  // console.log(user)
  log({
    data: 'Socket Practice Connected'
  })
  sendCallback(message)
}

const send = (channel, message) => {
  practiceSocket.emit(channel, message)
}

export { connectGlobalSocket, connectSocketPractice, test, send }
