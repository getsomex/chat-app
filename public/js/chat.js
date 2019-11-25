const socket = io();

// elements
const input = document.querySelector('.msg');
const btn = document.querySelector('.btn');
const sendLocation = document.querySelector('.send-location');
const messages = document.querySelector('#messages');

const sidebar = document.querySelector('.chat__sidebar')
// Templates

const messageTemplate = document.querySelector(".message-template").innerHTML;
const locationMessageTemplate = document.querySelector('.location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('.sidebar-template').innerHTML
// Options

const autoScroll = () => {
    // New message element
    const newMessage = messages.lastElementChild;

    // Height of the new message
    const newMessageStyles = getComputedStyle(newMessage);
    const newMessageMargin  = parseInt(newMessageStyles.marginBottom); 
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin;
    console.log(newMessageMargin);

    // Visible height
    const visibleHeight = messages.offsetHeight;

    // Height of messages container

    const containerHeight = messages.scrollHeight;

    // How far have i scrolled?

    const scrollOffset = messages.scrollTop + visibleHeight;

    if(containerHeight -newMessageHeight <= scrollOffset){
        messages.scrollTop = messages.scrollHeight

    }


}





const {username, room} = Qs.parse(location.search,{ignoreQueryPrefix:true})

socket.on('message',(message) =>{
    console.log(message);
    const html = Mustache.render(messageTemplate,{
        username : message.username,
         message: message.text,
         createdAt : moment(message.createdAt).format('h:mm a')

    });
    messages.insertAdjacentHTML('beforeend',html);
    autoScroll()
});


btn.addEventListener('click',e=>{
    e.preventDefault();

    btn.setAttribute('disabled','disabled')

    socket.emit('sendMessage',input.value, (error) =>{
        btn.removeAttribute('disabled');
        input.value = '';
        input.focus();
        
        if(error){
            return console.log(error)
        }
        console.log('The message was delivered')
    })
});


socket.on('locationMessage',(location) =>{
    const html = Mustache.render(locationMessageTemplate,{
       username: location.username,
       url : location.url,
       createdAt : moment(location.createdAt).format('h:mm a')
   });

    messages.insertAdjacentHTML('beforeend',html)  
    autoScroll();
});

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
  sidebar.innerHTML = html
})


sendLocation.addEventListener('click', ()=>{

    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser');
    }

    sendLocation.setAttribute('disabled','disabled');

    navigator.geolocation.getCurrentPosition(position => {
        socket.emit('sendLocation',{
            lat: position.coords.latitude,
            long : position.coords.longitude
        }, ()=>{
            sendLocation.removeAttribute('disabled')
            console.log('Location shared')
        }) 

    })

    
});
console.log(room)

socket.emit('join',{username,room}, (error) =>{
    if(error){
        alert(error);
        location.href = '/'
    }
});

