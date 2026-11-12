require('dotenv').config(); //load .env
const express = require('express')
const cors = require('cors')

const app = express() //create the app
app.use(cors()) //allow the mobile app to call us
app.use(express.json())  //read json sent in request bodies

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
app.get('/', (req, res) => { //test route
    res.json({ message: 'LMS API is running'});
});

const connectDB = require('./config/db');

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch((err) => console.log('DB connection failed:', err.message));
