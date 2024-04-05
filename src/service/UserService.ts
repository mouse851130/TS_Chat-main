export type UserData = {
    id: string
    userName: string
    roomName: string
}

export default class UserSevice {
    private userMap: Map<string, UserData> 
    constructor() {
        // 建立userMap，並記錄使用者的資訊
        this.userMap = new Map()
    }
    // 新增使用者資料
    addUser(data: UserData) {
        this.userMap.set(data.id, data)
    }

    // 從聊天室移除使用者:判斷是不是有這個ID
    removeUser(id: string) {
        if (this.userMap.has(id)) {
            this.userMap.delete(id)
        }
    }

    // 讓外面的人拜訪使用者的資料
    getUser(id: string) {
        if (!this.userMap.has(id)) return null
        const data = this.userMap.get(id)
        if (data) {
            return data
        }

        return null // 如果沒有該使用者，就回傳null
    }

    // 提供一個製作userData的api
    userDataInfoHandler(id: string, userName: string, roomName: string): UserData {
        return {
            id,
            userName,
            roomName
        }
    }

}