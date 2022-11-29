let messagesContainer = document.getElementById('messages')
messagesContainer.scrollTop = messagesContainer.scrollHeight

import { APP_ID } from './env.js'

let appID = APP_ID
let token = null
let uid = sessionStorage.getItem('display__id')

let urlParams = new URLSearchParams(window.location.search)

let displayName = sessionStorage.getItem('display__name')
let roomName = sessionStorage.getItem('room__name')

let room = urlParams.get('room')
if (room === null || displayName === null) {
    window.location = 'join.html?room=${room}'
}

let myAvatar = sessionStorage.getItem('avatar')

let initiate = async () => {
    let rtmClient = await AgoraRTM.createInstance(appID)
    await rtmClient.login({ uid, token })

    await rtmClient.addOrUpdateLocalUserAttributes({ 'name': displayName })
    await rtmClient.addOrUpdateLocalUserAttributes({ 'avatar': myAvatar })

    try {
        let attributes = await rtmClient.getChannelAttributesByKeys(room, ['room_name', 'avatar', 'host_name'])
        roomName = attributes.room_name.value
    } catch (error) {
        await rtmClient.setChannelAttributes(room, { 'room_name': room, 'avatar': myAvatar, 'host_name': displayName })
    }

    const channel = await rtmClient.createChannel(room)
    await channel.join()

    let lobbyChannel = await rtmClient.createChannel('lobby')
    await lobbyChannel.join()

    lobbyChannel.on('MemberJoined', async (memberId) => {
        let participants = await channel.getMembers()

        if (participants[0] === uid) {
            let lobbyMembers = await lobbyChannel.getMembers()

            for (let i = 0; i < lobbyMembers.length; i++) {
                rtmClient.sendMessageToPeer({ text: JSON.stringify({ 'room': room, 'type': 'room_added' }) }, lobbyMembers[i])
            }
        }
    })

    channel.on('MemberLeft', async (memberId) => {
        removeParticipantFromDom(memberId)

        let participants = await channel.getMembers()
        updateParticipantTotal(participants)
    })

    channel.on('MemberJoined', async (memberId) => {
        addParticipantToDom(memberId)

        let participants = await channel.getMembers()
        updateParticipantTotal(participants)
    })

    channel.on('ChannelMessage', async (messageData, memberId) => {
        let data = JSON.parse(messageData.text)
        let name = data.displayName
        let avatar = data.avatar

        addMessageToDom(data.message, memberId, name, avatar)

        let participants = await channel.getMembers()
        updateParticipantTotal(participants)
    })

    let addParticipantToDom = async (memberId) => {
        let { name } = await rtmClient.getUserAttributesByKeys(memberId, ['name'])
        let { avatar } = await rtmClient.getUserAttributesByKeys(memberId, ['avatar'])

        let membersWrapper = document.getElementById('participants__container')
        let memberItem =
            `<li class="person" data-chat="person1" id="member__${memberId}__wrapper">
                <div class="user">
                    <img src="${avatar}" alt="Retail Admin"/>
                    <span class="status online"></span>
                </div>
                <p class="name-time">
                    <span class="name">${name}</span>
                </p>
            </li>`
        membersWrapper.innerHTML += memberItem
    }

    let addMessageToDom = async (messageData, memberId, displayName, avatar) => {
        let created = new Date().toLocaleTimeString([], { hour: 'numeric', minute: 'numeric' })
        if (created.startsWith("0")) {
            created = created.substring(1)
        }
        let messagesWrapper = document.getElementById('messages')
        let messageItem

        if (memberId === uid) {
            messageItem =
                `<li class="chat-right">
                    <div class="chat-text">
                        <div class="chat-name">
                            <span class="fa fa-check-circle"></span>
                            ${displayName}
                        </div>
                        <div class="chat-hour" style="justify-content: right;">
                            ${created}
                        </div>
                        ${messageData}
                    </div>
                    <div class="chat-avatar">
                        <img
                            src="${avatar}"
                            alt="Retail Admin"
                        />
                    </div>
                </li>`
        } else {
            messageItem =
                `<li class="chat-left">
                    <div class="chat-avatar">
                        <img
                            src="${avatar}"
                            alt="Retail Admin"
                        />
                    </div>
                    <div class="chat-text">
                        <div class="chat-name">
                            ${displayName}
                            <span class="fa fa-check-circle"></span>
                        </div>
                        <div class="chat-hour" style="justify-content: left;">
                            ${created}
                        </div>
                        ${messageData}
                    </div>
                </li>`
        }
        messagesWrapper.insertAdjacentHTML('beforeend', messageItem)
        messagesContainer.scrollTop = messagesContainer.scrollHeight
    }

    let sendMessage = async (e) => {
        e.preventDefault()
        let message = e.target.message.value
        channel.sendMessage({ text: JSON.stringify({ 'message': message, 'displayName': displayName, 'avatar': myAvatar }) })
        addMessageToDom(message, uid, displayName, myAvatar)
        e.target.reset()
    }

    let updateParticipantTotal = (participants) => {
        let total = document.getElementById('member__count')

        if (participants.length <= 1) {
            total.innerText = participants.length + ' member'
        } else {
            total.innerText = participants.length + ' members'
        }
    }

    let getParticipants = async () => {
        let participants = await channel.getMembers()

        if (participants.length <= 1) {
            let lobbyMembers = await lobbyChannel.getMembers()

            for (let i = 0; i < lobbyMembers.length; i++) {
                rtmClient.sendMessageToPeer({ text: JSON.stringify({ 'room': room, 'type': 'room_added' }) }, lobbyMembers[i])
            }
        }

        updateParticipantTotal(participants)
        for (let i = 0; participants.length > i; i++) {
            addParticipantToDom(participants[i])
        }
    }

    let removeParticipantFromDom = (memberId) => {
        document.getElementById(`member__${memberId}__wrapper`).remove()
    }

    let leaveChannel = async () => {
        await channel.leave()
        rtmClient.logout()
    }

    window.addEventListener("beforeunload", leaveChannel)

    getParticipants()

    let messageForm = document.getElementById('message__form')
    messageForm.addEventListener('submit', sendMessage)
}

initiate()
