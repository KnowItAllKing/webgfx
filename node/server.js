const express = require('express');
const app = express();
const port = 3000; // You can use any port number

const cors = require('cors');
app.use(cors());


// Serve your static files (HTML, JS, CSS, etc.)
app.use(express.static('public'));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
