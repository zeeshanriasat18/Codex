import bot from './assets/bot.svg'
import user from './assets/user.svg'

// to target our html Query selector
const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')

let loadInterval

function loader(element) {
    element.textContent = ''

    loadInterval = setInterval(() => {
        // Update the text content of the loading indicator
        element.textContent += '.';

        // If the loading indicator has reached three dots, reset it
        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);
}

// type the word one by one 20 miliseconds each word
function typeText(element, text) {
    let index = 0

    let interval = setInterval(() => {

        //checking if index is less then text means we are still typing
        if (index < text.length) {
            element.innerHTML += text.charAt(index)
            index++
        } else {
            clearInterval(interval)
        }
    }, 20)
}

// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    //id generated
    return `id-${timestamp}-${hexadecimalString}`;
}

// function which check user req or bot response
// uses css classes for different colors and img aording to it
function chatStripe(isAi, value, uniqueId) {
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
    )
}

// event handling
const handleSubmit = async (e) => {
    //prevent default behaviour of browser
    e.preventDefault()
    //generating form data using our html form
    const data = new FormData(form)

    // user's chatstripe
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

    // to clear the textarea input 
    form.reset()

    // bot's chatstripe / isAi true
    const uniqueId = generateUniqueId()
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId)

    // to focus scroll to the bottom 
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // specific message div 
    const messageDiv = document.getElementById(uniqueId)

    // messageDiv.innerHTML = "..."
    loader(messageDiv)

    // getting and fetching response from backend
    const response = await fetch('http://localhost:5000', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            // data getting form the text area element form the screen
            prompt: data.get('prompt')
        })
    })

    //clear ... interval to set the data user typed in textarea
    clearInterval(loadInterval)
    messageDiv.innerHTML = " "

    if (response.ok) {
        //json responce coming from the backend
        const data = await response.json();
        // remove spaces from front and end/'\n' 
        const parsedData = data.bot.trim() 

        typeText(messageDiv, parsedData)
    } else {
        const err = await response.text()

        messageDiv.innerHTML = "Something went wrong"
        alert(err)
    }
}

form.addEventListener('submit', handleSubmit)
form.addEventListener('keyup', (e) => {
    // checking key code =. 13 means enter key
    if (e.keyCode === 13) {
        handleSubmit(e)
    }
})