const express = require('express');
const app = express();
app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ msg: 'hello from backend' });
});

const PORT = process.env.PORT || 5000; // container ใช้ 5000
app.listen(PORT, () => console.log('Backend listening on', PORT));
