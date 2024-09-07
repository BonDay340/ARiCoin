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

    // Восстанавливаем данные для пользователя
    function restoreUserData() {
        if (userId) {
            count = localStorage.getItem(`tapCount_${userId}`) ? parseInt(localStorage.getItem(`tapCount_${userId}`)) : 0;
            limit = localStorage.getItem(`tapLimit_${userId}`) ? parseInt(localStorage.getItem(`tapLimit_${userId}`)) : 1000;
        } else {
            count = 0;
            limit = 1000;
        }
        globalClicks = localStorage.getItem('globalClicks') ? parseInt(localStorage.getItem('globalClicks')) : 0;
        coinRate = localStorage.getItem('coinRate') ? parseFloat(localStorage.getItem('coinRate')) : 1.0;

        countDisplay.textContent = count;
        limitDisplay.textContent = limit;
        updateCoinRateDisplay();
    }

    // Сохраняем данные пользователя в localStorage
    function saveUserData() {
        if (userId) {
            localStorage.setItem(`tapCount_${userId}`, count);
            localStorage.setItem(`tapLimit_${userId}`, limit);
        }
        localStorage.setItem('globalClicks', globalClicks);
        localStorage.setItem('coinRate', coinRate);
    }

    // Обнуляем данные при выходе
    function resetUserData() {
        if (userId) {
            count = 0;
            localStorage.removeItem(`tapCount_${userId}`);
            localStorage.removeItem(`tapLimit_${userId}`);
        }
        countDisplay.textContent = count;
        localStorage.removeItem('globalClicks');
        localStorage.removeItem('coinRate');
        coinRate = 1.0;
        updateCoinRateDisplay(); // Обновляем отображение курса АрКоина
        saveUserData(); // Сохраняем обнулённые данные
    }

    // Обработчик клика по монете
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
            alert(`Вы достигли дневного лимита в ${limit} кликов. Пожалуйста, попробуйте завтра.`);
        }
        updateCoinRate();
    });

    function playSound(audioElement) {
        const soundClone = audioElement.cloneNode();
        soundClone.play();
    }

    function updateCoinRate() {
        coinRate = 1 + (globalClicks / 1000); // Увеличиваем курс АрКоина на 0.1 за каждые 1000 кликов
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
        resetUserData(); // Обнуляем клики и курс АрКоина при выходе
        localStorage.removeItem('avatarUrl');
        localStorage.removeItem('access_token');
        avatarImg.style.display = 'none';
        logoutButton.style.display = 'none';
        loginButton.style.display = 'block';
        alert('Вы успешно вышли из аккаунта.');
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

                localStorage.setItem('avatarUrl', avatarUrl);
                localStorage.setItem('access_token', accessToken);
                displayAvatar(avatarUrl);
                window.location.hash = ''; // Очищаем токен из URL
                restoreUserData(); // Восстанавливаем клики для пользователя
            })
            .catch(error => console.error('Error fetching Discord user data:', error));
        } else {
            const storedAvatarUrl = localStorage.getItem('avatarUrl');
            const storedAccessToken = localStorage.getItem('access_token');

            if (!storedAvatarUrl || !storedAccessToken) {
                loginButton.style.display = 'block';
                logoutButton.style.display = 'none';
                resetUserData(); // Обнуляем данные, если не залогинен
            } else {
                displayAvatar(storedAvatarUrl);
                restoreUserData();
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
