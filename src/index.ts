import devServer from "./server/dev";
import prodServer from "./server/prod";
import express from "express";
import { name } from "@/utils";
import UserService from '@/service/UserService'
import { Server } from 'socket.io'
import https from 'http'
import moment from 'moment'

const userService = new UserService()

const port = 3000;
const app = express();
// 參考: With Express -> https://socket.io/docs/v4/server-initialization/
const server = https.createServer(app)
const io = new Server(server)

// 參見:https://socket.io/docs/v4/server-initialization/

io.on('connection', (socket) => {
  socket.emit('join', 'welcome')  // (event, args(參數))
  // 備註:socket.id : Each new connection is assigned a random 20-characters identifier.
  // 代表每個socket都有一個獨特的id

  // 在進行connection時就把socket.id傳到前端
  socket.emit('userID', socket.id)

  socket.on('chat', (msg) => {
    console.log('server :', msg)    // 註:server的log會展示在terminal

    const userData = userService.getUser(socket.id)
    const time = moment.utc()
    if (userData) {
      io.to(userData.roomName).emit('chat', { userData, msg, time })
    }
  })

  socket.on('join', ({ userName, roomName }: { userName: string, roomName: string }) => {

    const userData = userService.userDataInfoHandler(
      socket.id,
      userName,
      roomName = roomName
    )

    userService.addUser(userData)

    socket.join(userData.roomName)
    socket.broadcast.to(userData.roomName).emit('join', `${userName} 加入了 ${roomName}`)

  })

  socket.on('disconnect', () => {
    // 先取得是哪個使用者
    const userData = userService.getUser(socket.id)  // 拿到使用者的userData
    const userName = userData?.userName

    if (userName) {
      socket.broadcast.to(userData.roomName).emit('leave', `${userData.userName}離開了聊天室`)
    }

    // 6-7(7-1:src/index.ts) 使用者離開後便刪除使用者資訊
    userService.removeUser(socket.id)
  })
})

// 執行npm run dev本地開發 or 執行npm run start部署後啟動線上伺服器
if (process.env.NODE_ENV === "development") {
  devServer(app);
} else {
  prodServer(app);
}

server.listen(port, () => {
  console.log(`The application is running on port ${port}.`);
});