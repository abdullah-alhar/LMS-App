require('dotenv').config(); //load .env
const express = require('express')
const cors = require('cors')

const app = express() //create the app
app.use(cors()) //allow the mobile app to call us
app.use(express.json())  //read json sent in request bodies

//login and register routes
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
app.get('/', (req, res) => { //test route
    res.json({ message: 'LMS API is running'});
});

//user routes
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

//course routes
const courseRoutes = require('./routes/courseRoutes');
app.use('/api/courses', courseRoutes);

//error handling middleware (always LAST, after every route)
const {notFound, errorHandler} = require('./middleware/errorMiddleware');
app.use(notFound); //catch 404 errors
app.use(errorHandler); //catch all other errors

const connectDB = require('./config/db');

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch((err) => console.log('DB connection failed:', err.message));
