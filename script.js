document.addEventListener('DOMContentLoaded', () => {
    const coin = document.getElementById('coin');
    const countDisplay = document.getElementById('count');
    const limitDisplay = document.getElementById('limit'); 
    const clickSound = document.getElementById('click-sound');
    const specialSound = document.getElementById('special-sound');
    const coinRateDisplay = document.getElementById('coinRate'); 
    const loginButton = document.getElementById('login-button');
    const avatarImg = document.getElementById('avatar');

    let count = getCookie('tapCount') ? parseInt(getCookie('tapCount')) : 0;
    let limit = getCookie('tapLimit') ? parseInt(getCookie('tapLimit')) : 1000;
    let lastClickDate = getCookie('lastClickDate') ? new Date(getCookie('lastClickDate')) : new Date();
    const today = new Date();
    
    let userId = getCookie('userId') || generateUserId();
    setCookie('userId', userId, 365); // Сохраняем userId в куки

    let globalClicks = getCookie('globalClicks') ? parseInt(getCookie('globalClicks')) : 0; 
    let coinRate = getCookie('coinRate') ? parseFloat(getCookie('coinRate')) : 1.0;
    const minCoinRate = 0.1;

    if (today.toDateString() !== lastClickDate.toDateString()) {
        limit += 1000; 
        setCookie('tapLimit', limit, 1);
        setCookie('lastClickDate', today.toDateString(), 1);

        coinRate = Math.max(minCoinRate, coinRate - 0.5);
        setCookie('coinRate', coinRate, 365);
    }

    countDisplay.textContent = count;
    limitDisplay.textContent = limit;
    updateCoinRateDisplay();

    coin.addEventListener('click', (event) => {
        if (count < limit) {
            count++;
            countDisplay.textContent = count;
            setCookie('tapCount', count, 1);
            globalClicks++;
            setCookie('globalClicks', globalClicks, 365);

            // Отправка данных о клике на сервер
            sendClickData(userId, count);

            updateCoinRate();
            setCookie('coinRate', coinRate, 365);

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
        coinRate = 1 + (globalClicks / 1000);
        updateCoinRateDisplay();
    }

    function updateCoinRateDisplay() {
        coinRateDisplay.textContent = `Курс АрКоина: 100 АрК = ${coinRate.toFixed(2)} Ар`;
    }

    function sendClickData(userId, clicks) {
        fetch('/click', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, clicks }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Click data recorded:', data);
        })
        .catch(error => {
            console.error('Error recording click data:', error);
        });
    }

    function generateUserId() {
        return 'user-' + Math.random().toString(36).substr(2, 9);
    }

    loginButton.addEventListener('click', () => {
        const clientId = '1281660983651078244';
        const redirectUri = 'https://bonday340.github.io/ARiCoin/';
        const scope = 'identify';
        const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${scope}`;
        window.location.href = authUrl;
    });

    handleDiscordCallback();
});
