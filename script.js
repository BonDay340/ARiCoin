document.addEventListener('DOMContentLoaded', () => {
    const coin = document.getElementById('coin');
    const countDisplay = document.getElementById('count');
    const limitDisplay = document.getElementById('limit'); // Element to show the click limit
    const clickSound = document.getElementById('click-sound');
    const specialSound = document.getElementById('special-sound');
    const loginButton = document.getElementById('login-button');
    const avatarImg = document.getElementById('avatar');

    let count = getCookie('tapCount') ? parseInt(getCookie('tapCount')) : 0;
    let limit = getCookie('tapLimit') ? parseInt(getCookie('tapLimit')) : 1000; // Start with 1000 limit
    let lastClickDate = getCookie('lastClickDate') ? new Date(getCookie('lastClickDate')) : new Date();
    const today = new Date();

    // If the date has changed, only increase the limit by 1000 without resetting the count
    if (today.toDateString() !== lastClickDate.toDateString()) {
        limit += 1000; // Increase limit by 1000 each new day
        setCookie('tapLimit', limit, 1);
        setCookie('lastClickDate', today.toDateString(), 1);
    }

    countDisplay.textContent = count;
    limitDisplay.textContent = limit; // Display the current limit

    coin.addEventListener('click', (event) => {
        // Limit clicks per day
        if (count < limit) {
            count++;
            countDisplay.textContent = count;
            setCookie('tapCount', count, 1);
            // Play sound, with a chance to play the special sound
            if (Math.random() < 0.00005) {
                playSound(specialSound);
            } else {
                playSound(clickSound);
            }
        } else {
            alert(`You have reached the daily limit of ${limit} clicks. Please try again tomorrow.`);
        }
    });

    function playSound(audioElement) {
        const soundClone = audioElement.cloneNode();
        soundClone.play();
    }

    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }

    function getCookie(name) {
        const nameEQ = name + "=";
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let c = cookies[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    loginButton.addEventListener('click', () => {
        const clientId = '1281660983651078244';
        const redirectUri = 'https://bonday340.github.io/ARiCoin/';
        const scope = 'identify';
        const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${scope}`;
        window.location.href = authUrl;
    });

    // Handle the Discord redirect directly on the main page
    function handleDiscordCallback() {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');

        if (accessToken) {
            fetch('https://discord.com/api/users/@me', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            })
            .then(response => response.json())
            .then(data => {
                const avatarUrl = data.avatar 
                    ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`
                    : `https://cdn.discordapp.com/embed/avatars/${data.discriminator % 5}.png`;

                setCookie('avatarUrl', avatarUrl, 365);
                displayAvatar(avatarUrl);
                // Clear the hash after processing
                window.location.hash = '';
            })
            .catch(error => console.error('Error fetching Discord user data:', error));
        } else {
            const storedAvatarUrl = getCookie('avatarUrl');
            if (storedAvatarUrl) {
                displayAvatar(storedAvatarUrl);
            }
        }
    }

    function displayAvatar(avatarUrl) {
        avatarImg.src = avatarUrl;
        avatarImg.style.display = 'block';
        loginButton.style.display = 'none';
    }

    // Call this function on the main page
    handleDiscordCallback();
});
