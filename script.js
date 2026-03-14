// --- FAKE AUTHENTICATION SYSTEM (LocalStorage) ---

function getAllUsers() {
    const users = localStorage.getItem('authUsers');
    return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
    localStorage.setItem('authUsers', JSON.stringify(users));
}

function isUserLoggedIn() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentUser = getCurrentUser();
    
    // Only return true if both logged in flag is set AND the user exists
    return isLoggedIn && currentUser !== undefined;
}

function setLoginStatus(status) {
    if (status) {
        localStorage.setItem('isLoggedIn', 'true');
    } else {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
    }
}

function getCurrentUser() {
    const email = localStorage.getItem('currentUser');
    const users = getAllUsers();
    return users.find(u => u.email === email);
}

function setCurrentUser(email) {
    localStorage.setItem('currentUser', email);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function clearError(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = '';
        element.classList.remove('show');
    }
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.classList.add('show');
    }
}

// Registration logic
function handleRegister() {
    const username = document.getElementById('username')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const password = document.getElementById('password')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;

    clearError('usernameError');
    clearError('emailError');
    clearError('passwordError');
    clearError('confirmPasswordError');

    let isValid = true;

    if (!username) {
        showError('usernameError', 'Username is required');
        isValid = false;
    }

    if (!email || !isValidEmail(email)) {
        showError('emailError', !email ? 'Email is required' : 'Invalid email format');
        isValid = false;
    }

    if (!password || password.length < 6) {
        showError('passwordError', !password ? 'Password is required' : 'Min 6 characters');
        isValid = false;
    }

    if (!confirmPassword) {
        showError('confirmPasswordError', 'Please confirm your password');
        isValid = false;
    } else if (password !== confirmPassword) {
        showError('confirmPasswordError', 'Passwords do not match');
        isValid = false;
    }

    if (!isValid) return;

    const users = getAllUsers();
    if (users.some(user => user.email === email)) {
        showError('emailError', 'Email already registered');
        return;
    }

    const newUser = {
        username: username,
        email: email,
        password: password,
        createdAt: new Date().toLocaleDateString()
    };

    users.push(newUser);
    saveUsers(users);

    // Initialize empty chat data for this new user
    const newUserChatData = {
        rooms: [
            {
                id: 1,
                name: '🚀 General',
                icon: '🚀',
                code: '#GEN2024',
                members: ['You', '🌸 Lily', '🦋 Sophie'],
                messages: [
                    { id: 1, sender: '🌸 Lily', text: 'Hey everyone! 👋', timestamp: '14:20', type: 'other' },
                    { id: 2, sender: '🦋 Sophie', text: 'Hi Lily! ✨', timestamp: '14:22', type: 'other' }
                ]
            },
            {
                id: 2,
                name: '🎉 Celebrations',
                icon: '🎉',
                code: '#CELEB2024',
                members: ['You', '🌙 Luna', '🎀 Bella', '💖 Rose'],
                messages: [
                    { id: 1, sender: '🎀 Bella', text: 'Let\'s celebrate! 🎊', timestamp: '15:10', type: 'other' },
                    { id: 2, sender: 'You', text: 'Yay! 🎉', timestamp: '15:11', type: 'own' }
                ]
            },
            {
                id: 3,
                name: '🚀 Boys',
                icon: '🚀',
                code: '#BOYS2026',
                members: ['You', '🌸 Aniket', '🦋 Chetan'],
                messages: [
                    { id: 1, sender: '🌸 Aniket', text: 'Hey! How are you? ✨', timestamp: '14:25', type: 'other' },
                    { id: 2, sender: 'You', text: 'I\'m doing amazing! 😊', timestamp: '14:26', type: 'own' },
                    { id: 3, sender: '🦋 Chetan', text: 'That\'s so sweet! 🎉', timestamp: '14:27', type: 'other' }
                ]
            }
        ],
        nextRoomId: 4,
        nextMessageId: {}
    };
    newUserChatData.rooms.forEach(room => {
        newUserChatData.nextMessageId[room.id] = Math.max(...room.messages.map(m => m.id)) + 1;
    });
    localStorage.setItem('chatHub_data_' + email, JSON.stringify(newUserChatData));

    alert('✨ Registration successful! You can now login. ✨');
    showLogin();
}

// Login logic
function handleLogin() {
    const email = document.getElementById('loginEmail')?.value.trim();
    const password = document.getElementById('loginPassword')?.value;

    clearError('loginEmailError');
    clearError('loginPasswordError');
    clearError('loginError');

    if (!email || !isValidEmail(email)) {
        showError('loginEmailError', !email ? 'Email is required' : 'Invalid email format');
        return;
    }

    if (!password) {
        showError('loginPasswordError', 'Password is required');
        return;
    }

    const users = getAllUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        showError('loginError', 'Invalid email or password 🥺');
        return;
    }

    setLoginStatus(true);
    setCurrentUser(email);
    
    // Load user's chat data
    loadChatData();

    // Reset forms
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';

    showChatInterface();
    renderRooms(); // To refresh user status if needed
}

// Logout logic
function handleLogout() {
    const confirmed = confirm('Are you sure you want to leave? 🥺');
    if (!confirmed) return;

    setLoginStatus(false);
    showAuthModal();
}

// Profile Page Logic
let passwordVisible = false;

function openProfile() {
    const user = getCurrentUser();
    if (!user) return;

    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileAvatarLarge = document.getElementById('profileAvatarLarge');
    const profileJoinedDate = document.getElementById('profileJoinedDate');
    const profilePassword = document.getElementById('profilePassword');
    const profileRoomsCount = document.getElementById('profileRoomsCount');

    if (profileName) profileName.textContent = user.username;
    if (profileEmail) profileEmail.textContent = user.email;
    if (profileAvatarLarge) {
        profileAvatarLarge.textContent = user.username.charAt(0).toUpperCase();
    }
    if (profileJoinedDate) profileJoinedDate.textContent = user.createdAt || 'N/A';

    // Mask password initially
    if (profilePassword) profilePassword.textContent = '••••••••';
    passwordVisible = false;

    // Count and list rooms joined
    const joinedRooms = chatData.rooms.filter(r => r.members && r.members.includes('You'));
    if (profileRoomsCount) profileRoomsCount.textContent = joinedRooms.length;

    const roomsListContainer = document.getElementById('profileJoinedRoomsList');
    if (roomsListContainer) {
        roomsListContainer.innerHTML = '';
        if (joinedRooms.length === 0) {
            roomsListContainer.innerHTML = '<p style="text-align: center; color: #888; font-size: 13px;">No rooms joined yet 🥺</p>';
        } else {
            joinedRooms.forEach(room => {
                const roomItem = document.createElement('div');
                roomItem.className = 'profile-room-item';
                roomItem.innerHTML = `
                    <div class="p-room-info">
                        <span>${room.icon || '🌸'}</span>
                        <span>${room.name}</span>
                    </div>
                    <div class="p-room-code">${room.code}</div>
                `;
                roomsListContainer.appendChild(roomItem);
            });
        }
    }

    const profileOverlay = document.getElementById('profileOverlay');
    if (profileOverlay) profileOverlay.classList.add('active');
}

function closeProfile() {
    const profileOverlay = document.getElementById('profileOverlay');
    if (profileOverlay) profileOverlay.classList.remove('active');
}

function toggleProfilePassword() {
    const user = getCurrentUser();
    const passElement = document.getElementById('profilePassword');
    if (!user || !passElement) return;

    passwordVisible = !passwordVisible;
    passElement.textContent = passwordVisible ? user.password : '••••••••';

    const btn = document.querySelector('.btn-show-pass');
    if (btn) btn.textContent = passwordVisible ? '🙈' : '👁️';
}

// --- CHAT DATA PERSISTENCE ---
function saveChatData() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        const key = 'chatHub_data_' + currentUser.email;
        localStorage.setItem(key, JSON.stringify(chatData));
    }
}

function loadChatData() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        const key = 'chatHub_data_' + currentUser.email;
        const savedData = localStorage.getItem(key);
        if (savedData) {
            const parsed = JSON.parse(savedData);
            // Sync the global object
            chatData.rooms = parsed.rooms;
            chatData.nextRoomId = parsed.nextRoomId;
            chatData.nextMessageId = parsed.nextMessageId;
        }
    }
}

const chatData = {
    rooms: [
        {
            id: 1,
            name: '🚀 General',
            icon: '🚀',
            code: '#GEN2024',
            members: ['You', '🌸 Lily', '🦋 Sophie'],
            messages: [
                { id: 1, sender: '🌸 Lily', text: 'Hey everyone! 👋', timestamp: '14:20', type: 'other' },
                { id: 2, sender: '🦋 Sophie', text: 'Hi Lily! ✨', timestamp: '14:22', type: 'other' }
            ]
        },
        {
            id: 2,
            name: 'Besties',
            icon: '⭐',
            code: '#BEST2024',
            members: ['You', '✨ Emma', '🌙 Luna'],
            messages: [
                { id: 1, sender: '✨ Emma', text: 'Hi guys! ✨', timestamp: '13:45', type: 'other' },
                { id: 2, sender: 'You', text: 'Hi there! 🥰', timestamp: '13:46', type: 'own' }
            ]
        },
        {
            id: 3,
            name: '🚀 Boys',
            icon: '🚀',
            code: '#BOYS2026',
            members: ['You', '🌸 Aniket', '🦋 Chetan'],
            messages: [
                { id: 1, sender: '🌸 Aniket', text: 'Hey! How are you? ✨', timestamp: '14:25', type: 'other' },
                { id: 2, sender: 'You', text: 'I\'m doing amazing! 😊', timestamp: '14:26', type: 'own' },
                { id: 3, sender: '🦋 Chetan', text: 'That\'s so sweet! 🎉', timestamp: '14:27', type: 'other' }
            ]
        }
    ],
    nextRoomId: 4,
    nextMessageId: {}
};

// Initial setup for nextMessageId if not already set
chatData.rooms.forEach(room => {
    chatData.nextMessageId[room.id] = Math.max(...room.messages.map(m => m.id)) + 1;
});

// Load any existing saved data
loadChatData();


const randomSenderNames = ['🌸 Lily', '🦋 Sophie', '✨ Emma', '🌙 Luna', '🎀 Bella', '💖 Rose', '🎨 Mia', '🎵 Zoe'];

let currentRoomId = null;
let isTyping = false;
let typingInterval = null;
let emojiPickerOpen = false;

function getTimeAgo(minutesAgo) {
    const now = new Date();
    const time = new Date(now.getTime() - minutesAgo * 60000);

    const hours = String(time.getHours()).padStart(2, '0');
    const minutes = String(time.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
}

function getRandomSender() {
    return randomSenderNames[Math.floor(Math.random() * randomSenderNames.length)];
}

function linkifyText(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function (url) {
        return `<a href="${url}" target="_blank">${url}</a>`;
    });
}

function playNotificationSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        console.log('Audio context not available');
    }
}

function formatTime(timestamp) {
    return timestamp;
}

function renderRooms() {
    const roomsList = document.getElementById('roomsList');
    if (!roomsList) return;
    roomsList.innerHTML = '';

    // Only show rooms that the user is a member of
    const joinedRooms = chatData.rooms.filter(room => room.members && room.members.includes('You'));

    if (joinedRooms.length === 0) {
        roomsList.innerHTML = '<div class="no-rooms-hint">No rooms joined yet! ✨</div>';
        return;
    }

    joinedRooms.forEach(room => {
        const roomDiv = document.createElement('div');
        roomDiv.className = `room-item ${room.id === currentRoomId ? 'active' : ''}`;
        roomDiv.onclick = () => selectRoom(room.id);

        const lastMessage = room.messages[room.messages.length - 1];
        const preview = lastMessage ? lastMessage.text.substring(0, 30) : 'No messages yet';

        roomDiv.innerHTML = `
            <span class="room-name">${room.icon} ${room.name}</span>
            <span class="room-preview">${preview}${preview.length >= 30 ? '...' : ''}</span>
        `;

        roomsList.appendChild(roomDiv);
    });
}

function renderMessages() {
    const messagesContainer = document.getElementById('messagesContainer');

    if (currentRoomId === null) {
        messagesContainer.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-emoji">🎉</div>
                <h3>✨ Welcome to ChatHub! ✨</h3>
                <p>Create a new room or select an existing one to start chatting ✨</p>
                <div class="heart-animation">✨ ✨ ✨</div>
            </div>
        `;
        return;
    }

    const room = chatData.rooms.find(r => r.id === currentRoomId);
    if (!room) return;

    messagesContainer.innerHTML = '';

    room.messages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.type}`;

        const linkedText = linkifyText(message.text);

        messageDiv.innerHTML = `
            <div class="message-bubble">
                <div class="message-sender">${message.sender}</div>
                <p class="message-content">${linkedText}</p>
                <div class="message-time">${message.timestamp}</div>
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
    });

    scrollToBottom();
}

function scrollToBottom() {
    const messagesContainer = document.getElementById('messagesContainer');
    setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 0);
}

function updateRoomHeader() {
    const roomTitle = document.getElementById('roomTitle');
    const roomMembers = document.getElementById('roomMembers');

    if (currentRoomId === null) {
        roomTitle.textContent = 'Select a room';
        roomMembers.textContent = 'No room selected';
        return;
    }

    const room = chatData.rooms.find(r => r.id === currentRoomId);
    if (room) {
        roomTitle.textContent = room.name;
        const memberCount = room.members ? room.members.length : 0;
        roomMembers.textContent = `${room.messages.length} messages • ${memberCount} members • ${room.code}`;
    }
}

function selectRoom(roomId) {
    currentRoomId = roomId;
    stopTypingAnimation();
    renderRooms();
    renderMessages();
    updateRoomHeader();

    // On mobile, hide sidebar when room is selected
    if (window.innerWidth <= 850) {
        toggleSidebar(false);
    }

    document.getElementById('messageInput').focus();
}

function toggleSidebar(show) {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    if (show) {
        sidebar.classList.add('active');
        document.body.classList.add('sidebar-active');
    } else {
        sidebar.classList.remove('active');
        document.body.classList.remove('sidebar-active');
    }
}

function createNewRoom() {
    openRoomPage('create');
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();

    if (text === '') {
        input.focus();
        return;
    }

    if (currentRoomId === null) {
        alert('Please select or create a room first!');
        return;
    }

    const room = chatData.rooms.find(r => r.id === currentRoomId);
    if (!room) return;

    const currentUser = getCurrentUser();
    const senderName = currentUser ? currentUser.username : 'You';

    const newMessage = {
        id: chatData.nextMessageId[currentRoomId]++,
        sender: senderName,
        text: text,
        timestamp: getTimeAgo(0),
        type: 'own'
    };

    room.messages.push(newMessage);

    input.value = '';
    input.style.height = 'auto';

    renderMessages();
    saveChatData();

    startTypingAnimation();

    const delay = Math.random() * 2000 + 2000;
    setTimeout(() => {
        simulateIncomingMessage();
    }, delay);
}

function simulateIncomingMessage() {
    if (currentRoomId === null) return;

    const room = chatData.rooms.find(r => r.id === currentRoomId);
    if (!room) return;

    const responses = [
        '😍 That\'s adorable!',
        '✨ You\'re so sweet!',
        '🥰 Great energy!',
        '✨ Amazing vibes!',
        '🎉 This is so cute!',
        '✨ Shine on!',
        '🌸 So beautiful!',
        '😊 You made my day!',
        '🦋 Absolutely precious!',
        '🌟 Totally agree!',
        '😂 Hahahaha dying!',
        '🎨 So creative!',
        '✨ This is perfect!',
        '✨ You\'re amazing!',
        '🥺 So wholesome!'
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    const sender = getRandomSender();

    const newMessage = {
        id: chatData.nextMessageId[currentRoomId]++,
        sender: sender,
        text: randomResponse,
        timestamp: getTimeAgo(0),
        type: 'other'
    };

    room.messages.push(newMessage);

    playNotificationSound();

    stopTypingAnimation();

    renderMessages();
    saveChatData();
}

function startTypingAnimation() {
    if (isTyping) return;

    isTyping = true;
    const typingIndicator = document.getElementById('typingIndicator');
    typingIndicator.style.display = 'flex';

    let dotCount = 0;
    typingInterval = setInterval(() => {
        dotCount = (dotCount + 1) % 4;
        document.getElementById('typingDot').textContent = '.'.repeat(dotCount);
    }, 300);

    scrollToBottom();
}

function stopTypingAnimation() {
    if (!isTyping) return;

    isTyping = false;
    clearInterval(typingInterval);
    document.getElementById('typingIndicator').style.display = 'none';
    document.getElementById('typingDot').textContent = '.';
}

function handleKeyPress(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }

    if (event.target.tagName === 'TEXTAREA' || event.target.className === 'message-input') {
        event.target.style.height = 'auto';
        event.target.style.height = Math.min(event.target.scrollHeight, 120) + 'px';
    }
}

function toggleEmojiPicker() {
    const emojiPicker = document.getElementById('emojiPicker');
    emojiPickerOpen = !emojiPickerOpen;

    if (emojiPickerOpen) {
        emojiPicker.classList.add('active');
    } else {
        emojiPicker.classList.remove('active');
    }
}

function insertEmoji(emoji) {
    const input = document.getElementById('messageInput');
    input.value += emoji;
    input.focus();

    emojiPickerOpen = false;
    document.getElementById('emojiPicker').classList.remove('active');
}

document.addEventListener('click', (e) => {
    const emojiPicker = document.getElementById('emojiPicker');
    const emojiBtn = document.querySelector('.emoji-btn');

    if (!e.target.closest('.emoji-btn') && !e.target.closest('.emoji-picker')) {
        emojiPicker.classList.remove('active');
        emojiPickerOpen = false;
    }
});

function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');

    setTheme(theme);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    const themeToggle = document.querySelector('.theme-toggle');
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

function setupThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleRoomInfo() {
    if (currentRoomId === null) {
        alert('Please select a room first!');
        return;
    }
    const room = chatData.rooms.find(r => r.id === currentRoomId);
    if (room) {
        const members = room.members ? room.members.join(', ') : 'No members';
        alert(`Room: ${room.name}\n\nRoom Code: ${room.code}\nMembers: ${members}\nMessages: ${room.messages.length}`);
    }
}

function handleLeaveRoom() {
    if (currentRoomId === null) return;
    const room = chatData.rooms.find(r => r.id === currentRoomId);
    if (!room) return;

    if (confirm(`Are you sure you want to leave "${room.name}"? ✨`)) {
        // Remove 'You' from members
        room.members = room.members.filter(m => m !== 'You');

        // Deselect room
        currentRoomId = null;

        // Refresh UI
        renderRooms();
        renderMessages();
        updateRoomHeader();
        saveChatData();

        alert(`You have left "${room.name}". Bye bye! 👋`);
    }
}

function handleReportRoom() {
    if (currentRoomId === null) return;
    const room = chatData.rooms.find(r => r.id === currentRoomId);
    if (!room) return;

    const reason = prompt(`What is the reason for reporting "${room.name}"? ✨`, "Spam or inappropriate content");
    if (reason) {
        alert(`Thank you for your report! ✨ Our cute team will review "${room.name}" shortly.`);
    }
}

function handleBlockRoom() {
    if (currentRoomId === null) return;
    const room = chatData.rooms.find(r => r.id === currentRoomId);
    if (!room) return;

    if (confirm(`Do you want to block and hide "${room.name}"? You won't see it in your list anymore. 🚫`)) {
        // Remove 'You' from members to hide it
        room.members = room.members.filter(m => m !== 'You');

        // Deselect
        currentRoomId = null;

        // Refresh UI
        renderRooms();
        renderMessages();
        updateRoomHeader();
        saveChatData();

        alert(`"${room.name}" has been blocked and removed from your view. ✨`);
    }
}

function handleEditRoom() {
    if (currentRoomId === null) return;
    const room = chatData.rooms.find(r => r.id === currentRoomId);
    if (!room) return;

    const newName = prompt(`Enter new name for "${room.name}": ✨`, room.name);
    if (!newName || newName.trim() === "") return;

    const newIcon = prompt(`Enter new emoji icon for "${newName}": ✨`, room.icon);
    if (!newIcon || newIcon.trim() === "") return;

    room.name = newName.trim();
    room.icon = newIcon.trim();

    // Refresh everything
    renderRooms();
    renderMessages();
    updateRoomHeader();
    saveChatData();

    alert(`Room updated successfully! ✨ Welcome to ${room.icon} ${room.name}!`);
}

function handleDeleteRoom() {
    if (currentRoomId === null) return;
    const roomIndex = chatData.rooms.findIndex(r => r.id === currentRoomId);
    if (roomIndex === -1) return;

    const roomName = chatData.rooms[roomIndex].name;
    if (confirm(`⚠️ Are you sure you want to PERMANENTLY delete "${roomName}"? This cannot be undone! 🗑️`)) {
        // Remove from array
        chatData.rooms.splice(roomIndex, 1);

        // Deselect
        currentRoomId = null;

        // Refresh UI
        renderRooms();
        renderMessages();
        updateRoomHeader();
        saveChatData();

        alert(`"${roomName}" has been deleted forever. ✨`);
    }
}

function openJoinModal() {
    openRoomPage('join');
}

function openRoomPage(tab) {
    const overlay = document.getElementById('roomPageOverlay');
    if (overlay) {
        overlay.classList.add('active');
        switchRoomTab(tab);
        if (tab === 'join') {
            populatePageAvailableRooms();
        }
    }
}

function closeRoomPage() {
    const overlay = document.getElementById('roomPageOverlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
}

function switchRoomTab(tabId) {
    const tabs = document.querySelectorAll('.room-tab');
    const contents = document.querySelectorAll('.room-tab-content');

    tabs.forEach(tab => {
        if (tab.innerText.toLowerCase().includes(tabId)) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    contents.forEach(content => {
        if (content.id === `tab${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });

    if (tabId === 'join') {
        populatePageAvailableRooms();
    }
}

function populatePageAvailableRooms() {
    const availableRoomsDiv = document.getElementById('pageAvailableRooms');
    if (!availableRoomsDiv) return;

    availableRoomsDiv.innerHTML = '';

    chatData.rooms.forEach(room => {
        const roomButton = document.createElement('button');
        roomButton.className = 'available-room-item';
        const memberCount = room.members ? room.members.length : 0;
        const isJoined = room.members && room.members.includes('You');

        roomButton.innerHTML = `
            <div>
                <div style="font-weight: bold; font-size: 15px; color: #ff6b9d;">${room.icon || '🌸'} ${room.name}</div>
                <div style="font-size: 12px; color: #888; margin-top: 5px;">
                    📝 Code: <strong>${room.code}</strong> • 👥 ${memberCount} members ${isJoined ? ' ✅' : ''}
                </div>
            </div>
        `;

        roomButton.onclick = () => {
            if (isJoined) {
                alert('You\'re already in this room!');
                selectRoom(room.id);
                closeRoomPage();
            } else {
                joinRoom(room.id);
                closeRoomPage();
            }
        };

        availableRoomsDiv.appendChild(roomButton);
    });
}

function joinRoomFromPageCode() {
    const codeInput = document.getElementById('roomPageCodeInput');
    if (!codeInput) return;

    const code = codeInput.value.trim().toUpperCase();

    if (!code) {
        alert('Please enter a room code! 💕\n\nTry checking the available rooms tab.');
        codeInput.focus();
        return;
    }

    const room = chatData.rooms.find(r => r.code === code);

    if (!room) {
        alert('Room code not found! 🥺\n\nPlease check the code and try again.');
        codeInput.focus();
        return;
    }

    if (room.members && room.members.includes('You')) {
        alert('You\'re already in this cute room! ✨');
        selectRoom(room.id);
        closeRoomPage();
        return;
    }

    joinRoom(room.id);
    closeRoomPage();
}

function handleCreateRoom() {
    const nameInput = document.getElementById('createRoomName');
    const iconInput = document.getElementById('createRoomIcon');
    const codeInput = document.getElementById('createRoomCode');

    const name = nameInput.value.trim();
    let icon = iconInput.value.trim() || '🌸';
    let code = codeInput.value.trim().toUpperCase();

    if (!name) {
        alert('Please give your room an cute name! 🎀');
        nameInput.focus();
        return;
    }

    if (!code) {
        const randomNum = Math.floor(Math.random() * 9000) + 1000;
        code = '#' + name.replace(/\\s+/g, '').substring(0, 4).toUpperCase() + randomNum;
    } else if (!code.startsWith('#')) {
        code = '#' + code;
    }

    if (chatData.rooms.find(r => r.code === code)) {
        alert('This room code is already taken! Try another one 😘');
        codeInput.focus();
        return;
    }

    const newRoom = {
        id: chatData.nextRoomId++,
        name: name,
        icon: icon,
        code: code,
        members: ['You'],
        messages: [
            { id: 1, sender: '✨ System', text: `✨ Welcome to your new room "${name}"! ✨`, timestamp: getTimeAgo(0), type: 'own' }
        ]
    };

    chatData.nextMessageId[newRoom.id] = 2;
    chatData.rooms.push(newRoom);

    nameInput.value = '';
    iconInput.value = '';
    codeInput.value = '';

    renderRooms();
    selectRoom(newRoom.id);
    closeRoomPage();
    playNotificationSound();
    saveChatData();

    alert(`Yay! 🎉 You created ${icon} ${name}!\n\nRoom Code: ${code}\nShare this code with friends! ✨`);
}

function joinRoom(roomId) {
    const room = chatData.rooms.find(r => r.id === roomId);
    if (!room) {
        return;
    }

    if (room.members && room.members.includes('You')) {
        alert('You\'re already in this room!');
        selectRoom(room.id);
        closeRoomPage();
        return;
    }

    if (!room.members) room.members = [];
    room.members.push('You');

    if (!chatData.nextMessageId[room.id]) {
        chatData.nextMessageId[room.id] = (room.messages.length || 0) + 1;
    }

    const joinMessage = {
        id: chatData.nextMessageId[room.id]++,
        sender: '✨ System',
        text: 'You joined the room! Welcome! ✨',
        timestamp: getTimeAgo(0),
        type: 'other'
    };
    room.messages.push(joinMessage);

    renderRooms();
    selectRoom(room.id);
    closeRoomPage();
    playNotificationSound();
    saveChatData();

    alert(`Welcome to ${room.name}! ✨`);
}

function initializeApp() {
    initializeTheme();
    setupThemeToggle();

    // Force check if user is actually valid
    const currentUser = getCurrentUser();
    const isLoggedInFlag = localStorage.getItem('isLoggedIn') === 'true';
    
    // If login flag is set but user doesn't exist, clear it
    if (isLoggedInFlag && !currentUser) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        showAuthModal();
        showLogin();
    } else if (!isUserLoggedIn()) {
        showAuthModal();
        showLogin();
    } else {
        showChatInterface();
        renderRooms(); // Ensure rooms are rendered if logged in
    }
}

function showLogin() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authTabs = document.querySelectorAll('.auth-tab');

    if (loginForm && registerForm && authTabs.length >= 2) {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        authTabs[0].classList.add('active');
        authTabs[1].classList.remove('active');
    }
}

function showRegister() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authTabs = document.querySelectorAll('.auth-tab');

    if (loginForm && registerForm && authTabs.length >= 2) {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        authTabs[0].classList.remove('active');
        authTabs[1].classList.add('active');
    }
}

function showChatInterface() {
    const currentUser = getCurrentUser();
    const infoBar = document.getElementById('userInfoBar');
    const nameDisplay = document.getElementById('userNameDisplay');
    const avatar = document.getElementById('userAvatar');

    if (currentUser) {
        if (infoBar) infoBar.style.display = 'flex';
        if (nameDisplay) nameDisplay.textContent = currentUser.username;
        if (avatar) avatar.textContent = currentUser.username.charAt(0).toUpperCase();
    }

    document.getElementById('authModal').style.display = 'none';
    document.querySelector('.app-container').style.display = 'flex';

    // On mobile, show sidebar on first login if no room is selected
    if (window.innerWidth <= 850 && currentRoomId === null) {
        toggleSidebar(true);
    }

    renderRooms();
}

function showAuthModal() {
    const infoBar = document.getElementById('userInfoBar');
    if (infoBar) infoBar.style.display = 'none';

    document.getElementById('authModal').style.display = 'flex';
    document.querySelector('.app-container').style.display = 'none';
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        createNewRoom();
    }

    if (e.key === 'Escape') {
        document.getElementById('emojiPicker').classList.remove('active');
        emojiPickerOpen = false;

        const roomPage = document.getElementById('roomPageOverlay');
        if (roomPage && roomPage.classList.contains('active')) {
            closeRoomPage();
        }

        const profilePage = document.getElementById('profileOverlay');
        if (profilePage && profilePage.classList.contains('active')) {
            closeProfile();
        }
    }
});

console.log(`
╔═══════════════════════════════════════════════════╗
║  Welcome to ChatHub!                             ║
║  Your Adorable Chat Application                  ║
║  Made with HTML, CSS & JavaScript                ║
║                                                   ║
║  Keyboard Shortcuts:                             ║
║  • Ctrl/Cmd + N → Create New Room                ║
║  • Shift + Enter → New Line                      ║
║  • Escape → Close Emoji Picker                   ║
║                                                   ║
║  Have a pawsome time chatting!                  ║
╚═══════════════════════════════════════════════════╝
`);

