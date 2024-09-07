const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Создаем базу данных или подключаемся к существующей
const db = new sqlite3.Database('./clicks.db');

// Создаем таблицу для хранения кликов пользователей
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS clicks (id INTEGER PRIMARY KEY, userId TEXT, clicks INTEGER, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
});

// Настраиваем парсинг данных JSON
app.use(bodyParser.json());

// Маршрут для записи кликов
app.post('/click', (req, res) => {
  const { userId, clicks } = req.body;

  if (!userId || !clicks) {
    return res.status(400).send('UserId and clicks are required');
  }

  // Добавляем запись кликов в базу данных
  db.run("INSERT INTO clicks (userId, clicks) VALUES (?, ?)", [userId, clicks], function (err) {
    if (err) {
      return res.status(500).send('Failed to record clicks');
    }
    res.status(200).send('Clicks recorded successfully');
  });
});

// Маршрут для получения данных о кликах
app.get('/clicks', (req, res) => {
  db.all("SELECT * FROM clicks", [], (err, rows) => {
    if (err) {
      return res.status(500).send('Failed to retrieve clicks');
    }
    res.json(rows);
  });
});

// Запускаем сервер
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
