import socketIO from 'socket.io-client'

// define socket
const socketGlobal = socketIO('https://server13.yesdok.com:3002')
let socketPractice = null

// let socketGlobal3 = null
// socketGlobal3 = socketIO('https://socks7server13.yesdok.com')

// if (socketGlobal3) {
//   socketGlobal3.on('connect', () => {
//     console.log('asdasdasdasdasd')
//   })
// }
// required data field
let state = {}

const setData = (data) => {
  state = data
}

socketGlobal.on('connect', () => {
  console.log('connected socket')
  socketGlobal.emit('Authorization', state.user && state.user.Token)
})

const connectSocket = () => {
  socketPractice = socketIO('https://socks7server13.yesdok.com')
}

const signaling = callback => {
  console.log('signalling terpanggil')
  socketPractice.on('Message', (data, response) => {
    console.log('ke message ngga sih')
    response(1)
    if (data.id == 'ProcessedAnswer') {
      callback('sdp', data.data)
    }
    if (data.id == 'IceCandidate') {
      callback('candidate', data.data)
    }
  })
}

const onCall = callback => {
  console.log('oncall terpanggil')
  socketPractice.on('Call', (data, response) => {
    console.log('ke call ga sih')
    response(1)
    callback(data)
  })
}

const onData = callback => {
  console.log('ondata terpanggil')
  socketPractice.on('Data', (data, response) => {
    console.log('ke data gasih')
    response(1)
    callback(data)
  })
}

const send = (channel, message) => {
  socketPractice.emit(channel, message)
}

export {
  connectSocket,
  signaling,
  onCall,
  onData,
  setData,
  send
}