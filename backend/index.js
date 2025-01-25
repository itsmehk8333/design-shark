const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const auth = require('./routes/auth.js');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000;
const dotenv = require('dotenv');
const task = require('./routes/task.js');
const user = require('./routes/users.js');
// Middleware
app.use(bodyParser.json());
dotenv.config();

// MongoDB connection

const db_url = process.env.MONGODB_URL;
console.log(process.env.MONGODB_URL);
mongoose.connect(db_url);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define a simple schema and model


// Routes
app.use(cors())
app.use('/api/auth',auth);
app.use("/api/tasks", task)
app.use("/api/users", user)

app.get('/', (req, res) => {
  res.send('Hello World!');
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});