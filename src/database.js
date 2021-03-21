const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/comandas-db-app', {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

.then(db => console.log('Database connected'))
.catch(err => console.error(err));