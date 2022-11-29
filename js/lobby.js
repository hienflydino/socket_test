import { APP_ID } from './env.js'

let appID = APP_ID
let token = null
let uid = String(Math.floor(Math.random() * 1232))

let roomsData = {}

let initiate = async () => {
    let rtmClient = await AgoraRTM.createInstance(appID)
    await rtmClient.login({ uid, token })

    let lobbyChannel = await rtmClient.createChannel('lobby')
    await lobbyChannel.join()

    rtmClient.on('MessageFromPeer', async (message, peerId) => {
        let messageData = JSON.parse(message.text)
        let count = await rtmClient.getChannelMemberCount([messageData.room])

        roomsData[messageData.room] = { 'members': count }

        let rooms = document.getElementById('room__container')
        let room = document.getElementById(`room__${messageData.room}`)
        if (room === null) {
            room = await buildRoom(count, messageData.room)
            rooms.insertAdjacentHTML('beforeend', room)
        }
    })

    let buildRoom = async (count, room_id) => {
        let attributes = await rtmClient.getChannelAttributesByKeys(room_id, ['room_name', 'avatar', 'host_name'])
        let roomName = attributes.room_name.value
        let avatar = attributes.avatar.value
        let hostName = attributes.host_name.value

        let roomItem =
            `
                <div
                    class="card text-white card-has-bg click-col"
                    style="
                        background-image: url('../images/background.jpeg');
                    "
                    id="room__${room_id}"
                >
                        <div class="card-img-overlay d-flex flex-column">
                            <div class="card-body">
                                <i class="fa-regular fa-futbol">...</i>
                                <small class="card-meta mb-2"
                                    >Online</small
                                >
                                <h4 class="card-title mt-0">
                                    <a class="text-white" href="join.html?room=${room_id}">${roomName}</a>
                                </h4>
                                <small
                                    ><i class="fa-solid fa-users"></i>
                                    ${count} watching </small
                                >
                            </div>
                            <div class="card-footer">
                                <div class="media">
                                    <img
                                        class="mr-3 rounded-circle"
                                        src="${avatar}"
                                        alt="Generic placeholder image"
                                        style="max-width: 50px"
                                    />
                                    <div class="media-body">
                                        <h6
                                            class="my-0 text-white d-block"
                                        >
                                            ${hostName}
                                        </h6>
                                    </div>
                                </div>
                            </div>
                        </div>
                    <a href="join.html?room=${room_id}" class="middle" id="submit">
                        Join Room
                    </a>
                </div>`

        return roomItem
    }

    let checkHeartBeat = async () => {
        for (let room_id in roomsData) {
            let count = await rtmClient.getChannelMemberCount([room_id])

            if (count[room_id] < 1) {
                document.getElementById(`room__${room_id}`).remove()
                delete roomsData[room_id]
            }
            else {
                let newRoom
                let rooms = document.getElementById('room__container')
                newRoom = await buildRoom(count[room_id], room_id)
                document.getElementById(`room__${room_id}`).innerHTML = newRoom
            }
        }
    }

    let interval = setInterval(() => {
        checkHeartBeat()
    }, 2000)

    return () => clearInterval(interval)
}

initiate()
