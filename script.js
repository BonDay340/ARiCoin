document.addEventListener('DOMContentLoaded', () => {
    const coin = document.getElementById('coin');
    const countDisplay = document.getElementById('count');
    const clickSound = document.getElementById('click-sound');
    const specialSound = document.getElementById('special-sound');
    const loginButton = document.getElementById('login-button');
    const avatarImg = document.getElementById('avatar');

    let count = getCookie('tapCount') ? parseInt(getCookie('tapCount')) : 0;
    countDisplay.textContent = count;

    coin.addEventListener('click', (event) => {
        count++;
        countDisplay.textContent = count;
        setCookie('tapCount', count, 365);
        // Play sound with a chance of playing the special sound
        if (Math.random() < 0.00005) {
            playSound(specialSound);
        } else {
            playSound(clickSound);
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
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    loginButton.addEventListener('click', () => {
        const clientId = '1281660983651078244';
        const redirectUri = 'https://BonDay340.github.io/ari/';
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
