const mongoose = require('mongoose');

require('dotenv').config({path: 'variables.env'});

mongoose.Promise = global.Promise;
mongoose.connect(process.env.DB_NOTES, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

.then(db => console.log('Database connected'))
.catch(err => console.error(err));