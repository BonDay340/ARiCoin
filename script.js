document.addEventListener('DOMContentLoaded', () => {
    const coin = document.getElementById('coin');
    const countDisplay = document.getElementById('count');
    const limitDisplay = document.getElementById('limit');
    const clickSound = document.getElementById('click-sound');
    const specialSound = document.getElementById('special-sound');
    const coinRateDisplay = document.getElementById('coinRate');
    const loginButton = document.getElementById('login-button');
    const avatarImg = document.getElementById('avatar');
    const logoutButton = document.getElementById('logout-button');

    let userId = null;
    let count = 0;
    let limit = 1000;
    let globalClicks = 0;
    let coinRate = 1.0;

    // Функция обнуления данных при выходе или обновлении
    function resetUserData() {
        count = 0;
        limit = 1000;
        globalClicks = 0;
        countDisplay.textContent = count;
        limitDisplay.textContent = limit;
        updateCoinRateDisplay();
    }

    // Восстанавливаем данные для пользователя (если залогинен)
    function restoreUserData(userId) {
        count = getCookie(`tapCount_${userId}`) ? parseInt(getCookie(`tapCount_${userId}`)) : 0;
        limit = getCookie(`tapLimit_${userId}`) ? parseInt(getCookie(`tapLimit_${userId}`)) : 1000;
        globalClicks = getCookie('globalClicks') ? parseInt(getCookie('globalClicks')) : 0;
        coinRate = getCookie('coinRate') ? parseFloat(getCookie('coinRate')) : 1.0;

        countDisplay.textContent = count;
        limitDisplay.textContent = limit;
        updateCoinRateDisplay();
    }

    // Сохраняем данные пользователя в куки
    function saveUserData() {
        if (userId) {
            setCookie(`tapCount_${userId}`, count, 365);
            setCookie(`tapLimit_${userId}`, limit, 365);
            setCookie('globalClicks', globalClicks, 365);
            setCookie('coinRate', coinRate, 365);
        }
    }

    coin.addEventListener('click', (event) => {
        if (count < limit) {
            count++;
            countDisplay.textContent = count;
            globalClicks++;
            saveUserData();

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

    function deleteCookie(name) {
        document.cookie = name + '=; Max-Age=-99999999; path=/'; // Удаляем куки
    }

    function updateCoinRate() {
        coinRate = 1 + (globalClicks / 1000);
        updateCoinRateDisplay();
    }

    function updateCoinRateDisplay() {
        coinRateDisplay.textContent = `Курс АрКоина: 100 АрК = ${coinRate.toFixed(2)} Ар`;
    }

    // Логика входа через Discord
    loginButton.addEventListener('click', () => {
        const clientId = '1281660983651078244';
        const redirectUri = 'https://bonday340.github.io/ARiCoin/';
        const scope = 'identify';
        const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${scope}`;
        window.location.href = authUrl;
    });

    // Логика выхода из аккаунта Discord
    logoutButton.addEventListener('click', () => {
        resetUserData(); // Обнуляем данные пользователя
        deleteCookie('avatarUrl');
        deleteCookie('access_token');
        avatarImg.style.display = 'none';
        logoutButton.style.display = 'none';
        loginButton.style.display = 'block';
        alert('You have logged out successfully.');
    });

    // Проверяем наличие токена и аватара при загрузке
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
                userId = data.id;  // Привязываем данные к userId
                const avatarUrl = data.avatar
                    ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`
                    : `https://cdn.discordapp.com/embed/avatars/${data.discriminator % 5}.png`;

                setCookie('avatarUrl', avatarUrl, 365);
                setCookie('access_token', accessToken, 365);
                displayAvatar(avatarUrl);
                window.location.hash = ''; // Очищаем токен из URL
                restoreUserData(userId); // Восстанавливаем клики для пользователя
            })
            .catch(error => console.error('Error fetching Discord user data:', error));
        } else {
            resetUserData(); // Если пользователь не залогинен, обнуляем данные
            const storedAvatarUrl = getCookie('avatarUrl');
            const storedAccessToken = getCookie('access_token');

            if (!storedAvatarUrl || !storedAccessToken) {
                loginButton.style.display = 'block';
                logoutButton.style.display = 'none';
            } else {
                displayAvatar(storedAvatarUrl);
            }
        }
    }

    function displayAvatar(avatarUrl) {
        avatarImg.src = avatarUrl;
        avatarImg.style.display = 'block';
        loginButton.style.display = 'none';
        logoutButton.style.display = 'block';
    }

    handleDiscordCallback();
});
