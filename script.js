document.addEventListener('DOMContentLoaded', () => {
    const coin = document.getElementById('coin');
    const countDisplay = document.getElementById('count');
    const limitDisplay = document.getElementById('limit');
    const clickSound = document.getElementById('click-sound');
    const specialSound = document.getElementById('special-sound');
    const coinRateDisplay = document.getElementById('coinRate');
    const loginButton = document.getElementById('login-button');
    const avatarImg = document.getElementById('avatar');
    const consoleInput = document.getElementById('console-input');
    const executeButton = document.getElementById('execute-command');

    let count = getCookie('tapCount') ? parseInt(getCookie('tapCount')) : 0;
    let limit = getCookie('tapLimit') ? parseInt(getCookie('tapLimit')) : 1000;
    let lastClickDate = getCookie('lastClickDate') ? new Date(getCookie('lastClickDate')) : new Date();
    const today = new Date();

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

    coin.addEventListener('click', () => {
        if (count < limit) {
            count++;
            countDisplay.textContent = count;
            setCookie('tapCount', count, 1);
            globalClicks++;
            setCookie('globalClicks', globalClicks, 365);
            updateCoinRate();
            setCookie('coinRate', coinRate, 365);

            if (Math.random() < 0.00005) {
                playSound(specialSound);
            } else {
                playSound(clickSound);
            }
        } else {
            alert(`Вы достигли ежедневного лимита ${limit} кликов. Пожалуйста, повторите попытку завтра.`);
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

    executeButton.addEventListener('click', () => {
        const command = consoleInput.value.trim();
        consoleInput.value = ''; // Очистить поле после выполнения команды

        if (command.startsWith('werdex_')) {
            const action = command.slice(7); // Удалить префикс "werdex_"

            // Проверка и выполнение команд
            const commands = action.match(/ar[+-]\d+/g);
            if (commands) {
                commands.forEach(cmd => {
                    const amount = parseInt(cmd.slice(2), 10);
                    if (cmd.startsWith('ar-')) {
                        console.log(`Subtracting ${amount} clicks`); // Отладочное сообщение
                        count = Math.max(0, count - amount); // Убедитесь, что количество кликов не становится отрицательным
                    } else if (cmd.startsWith('ar+')) {
                        console.log(`Adding ${amount} clicks`); // Отладочное сообщение
                        count += amount;
                    }
                });

                countDisplay.textContent = count;
                setCookie('tapCount', count, 1);
            } else {
                alert('Неверный формат команды.');
            }
        } else {
            alert('Команда не верна.');
        }
    });
});
