// const express = require('express');
// const app = express();
// const connectDB = require('./db/database');
// require('dotenv').config();

// // Connect to the database
// connectDB();

// app.use(express.json());

// // Routes
// const authRoutes = require('./routes/authRoutes');
// app.use('/api/auth', authRoutes);

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });

const express = require('express');
const app = express();

require("dotenv").config()
const PORT = process.env.PORT || 3000;

//middleware
app.use(express.json());


const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const connectWithDb = require("./db/database");
connectWithDb();



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});