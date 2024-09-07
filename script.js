document.addEventListener('DOMContentLoaded', () => {
    const coin = document.getElementById('coin');
    const countDisplay = document.getElementById('count');
    const limitDisplay = document.getElementById('limit');
    const clickSound = document.getElementById('click-sound');
    const specialSound = document.getElementById('special-sound');
    const coinRateDisplay = document.getElementById('coinRate'); // Element to display the coin rate
    const loginButton = document.getElementById('login-button');
    const avatarImg = document.getElementById('avatar');

    let count = getCookie('tapCount') ? parseInt(getCookie('tapCount')) : 0;
    let limit = getCookie('tapLimit') ? parseInt(getCookie('tapLimit')) : 1000;
    let lastClickDate = getCookie('lastClickDate') ? new Date(getCookie('lastClickDate')) : new Date();
    const today = new Date();

    let globalClicks = getCookie('globalClicks') ? parseInt(getCookie('globalClicks')) : 0; // Global click count
    let coinRate = getCookie('coinRate') ? parseFloat(getCookie('coinRate')) : 1.0; // Start rate at 1 Ар
    const minCoinRate = 0.1; // Set a minimum coin rate

    // If the date has changed, increase the limit by 1000 and reduce coin rate by 0.5
    if (today.toDateString() !== lastClickDate.toDateString()) {
        limit += 1000; 
        setCookie('tapLimit', limit, 1);
        setCookie('lastClickDate', today.toDateString(), 1);

        // Reduce coin rate by 0.5, but don't let it fall below 0.1
        coinRate = Math.max(minCoinRate, coinRate - 0.5);
        setCookie('coinRate', coinRate, 365); // Save the updated coin rate
    }

    countDisplay.textContent = count;
    limitDisplay.textContent = limit;
    updateCoinRateDisplay(); // Initial display of the coin rate

    coin.addEventListener('click', (event) => {
        if (count < limit) {
            count++;
            countDisplay.textContent = count;
            setCookie('tapCount', count, 1);
            globalClicks++;
            setCookie('globalClicks', globalClicks, 365); // Save global clicks
            updateCoinRate(); // Update coin rate based on global clicks
            setCookie('coinRate', coinRate, 365); // Save the updated coin rate

            // Play sound with a small chance of playing the special sound
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

    function updateCoinRate() {
        // Increase coin rate based on global clicks
        coinRate = 1 + (globalClicks / 1000); // 0.1% increase for every 1000 clicks
        updateCoinRateDisplay();
    }

    function updateCoinRateDisplay() {
        coinRateDisplay.textContent = `Курс АрКоина: 100 АрК = ${coinRate.toFixed(2)} Ар`;
    }

    loginButton.addEventListener('click', () => {
        const clientId = '1281660983651078244';
        const redirectUri = 'https://bonday340.github.io/ARiCoin/';
        const scope = 'identify';
        const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${scope}`;
        window.location.href = authUrl;
    });

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

    handleDiscordCallback();
});
