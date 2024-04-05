import "./index.css";
import { name } from "@/utils";
import { io } from 'socket.io-client'
console.log("client side chatroom page", name);
import { UserData } from '@/service/UserService'

type UserMsg = { userData: UserData, msg: string, time: number }

const clientIo = io()

const url = new URLSearchParams(location.search)
const userName = url.get('user_name')
const roomName = url.get('room_name')

if (!userName || !roomName) {
    location.href = '/main/main.html'
}

clientIo.emit('join', { userName, roomName })

const textInput = document.getElementById('textInput') as HTMLInputElement
const submitBtn = document.getElementById('submitBtn') as HTMLButtonElement
submitBtn.addEventListener('click', () => {
    const textValue = textInput.value
    if(textValue){
      clientIo.emit('chat', textValue)
    }
    
})

const headerRoomName = document.getElementById('headerRoomName') as HTMLParagraphElement
headerRoomName.innerText = roomName || ''

let userID = ''

const backBtn = document.getElementById('backBtn') as HTMLButtonElement
backBtn.addEventListener('click', () => {
    location.href = '/main/main.html'
})
const chatBoard = document.getElementById('chatBoard') as HTMLDivElement

console.log('')

function msgHandler(data: UserMsg) {

    console.log(data.time)
 
    const date = new Date(data.time)
    const time = `${date.getHours()}:${date.getMinutes()}`

    const divBox = document.createElement('div')
    divBox.classList.add('flex', 'mb-4', 'items-end')
    if (data.userData.id === userID) {
        divBox.classList.add('justify-end')
        divBox.innerHTML = `
        <p class="text-xs text-gray-700 mr-4">${time}</p>
    
        <div>
          <p class="text-xs text-white mb-1 text-right">${data.userData.userName}</p>
          <p
            class="mx-w-[50%] break-all bg-white px-4 py-2 rounded-bl-full rounded-br-full rounded-tl-full"
          >
            ${data.msg}
          </p>
            </div>`
    } else {
        divBox.classList.add('justify-start')
        divBox.innerHTML = `

        <div>
          <p class="text-xs text-gray-700 mb-1">${data.userData.userName}</p>
          <p
            class="mx-w-[50%] break-all bg-gray-800 px-4 py-2 rounded-tr-full rounded-br-full rounded-tl-full text-white"
          >
            ${data.msg}
          </p>
        </div>
        <p class="text-xs text-gray-700 ml-4">${time}</p>
      `
    }

    chatBoard.appendChild(divBox)
    textInput.value = ''
    chatBoard.scrollTop = chatBoard.scrollHeight
}

function roomMsgHandler(msg: string) {
    const divBox = document.createElement('div')
    divBox.classList.add('flex', 'justify-center', 'mb-4', 'items-center')
    divBox.innerHTML = `<p class="text-gray-700 text-sm">${msg}</p>`
    chatBoard.append(divBox)
    chatBoard.scrollTop = chatBoard.scrollHeight

}

clientIo.on('join', (msg) => {
    console.log(msg)

    roomMsgHandler(msg) // 此時可以試多個使用者進入聊天室的情況

})


clientIo.on('chat', (data: UserMsg) => {
    msgHandler(data)

})

clientIo.on('leave', (msg) => {
    roomMsgHandler(msg)
})

clientIo.on('userID', (id) => {
    userID = id
})