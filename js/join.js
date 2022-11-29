let avatar

let lobbyForm = document.getElementById('lobby__form')
let uid = String(Math.floor(Math.random() * 232))

const queryString = window.location.search
const urlParams = new URLSearchParams(queryString);
const room = urlParams.get('room')

if (urlParams.has('room')) {
    document.getElementById('room').value = room
    let box = document.getElementById('room__field')
    box.style.display = 'none'
}

lobbyForm.addEventListener('submit', (e) => {
    e.preventDefault()

    if (!avatar) {
        alert('You must select an avatar before joining a room!')
        return
    }

    sessionStorage.setItem('display__name', e.target.name.value)
    sessionStorage.setItem('display__id', uid)
    window.location = `room.html?room=${e.target.room.value}`
})

let avatarOptions = document.getElementsByClassName('avatar__option')
for (let i = 0; i < avatarOptions.length; i++) {
    avatarOptions[i].addEventListener('click', (e) => {

        for (let i = 0; i < avatarOptions.length; i++) {
            avatarOptions[i].classList.remove('avatar__option__selected')
        }

        e.target.classList.add('avatar__option__selected')
        avatar = e.target.src
        sessionStorage.setItem('avatar', avatar)
    })
}

lobbyForm.room.addEventListener('keyup', (e) => {
    let cleaned_value = e.target.value.replace(' ', '-')
})
