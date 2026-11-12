require('dotenv').config(); //load .env
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const app = express() //create the app
app.use(cors()) //allow the mobile app to call us
app.use(express.json())  //read json sent in request bodies

app.get('/', (req, res) => { //test route
    res.json({ message: 'LMS API is running'});
});

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT, () => {
        console.log(`Server running on port ${process.env.PORT}`);
    })
})
.catch((err) => console.log('DB Connection failed: ',err.message));
