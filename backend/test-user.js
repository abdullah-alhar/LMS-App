require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');

(async () => {
  await connectDB();

  const user = await User.create({
    name: '  Test User ',
    email: ' TEST@Mail.COM',
    password: '123456',
  });
  console.log('Created:', user);

  const found = await User.findById(user._id);
  console.log('Found:', found);

  await User.deleteOne({ _id: user._id });   // clean up
  process.exit();
})();