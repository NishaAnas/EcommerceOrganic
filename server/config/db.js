const mongoose = require('mongoose');
// Disable strict mode for query filters (optional, depending on your needs)
mongoose.set('strictQuery' , false);
const connectDB = async()=> {
    try {
        // Attempt to establish a connection to the database using the connection string from environment variables
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        
        // Log a success message with the host name of the connected database
        console.log(`DataBase Connected: ${conn.connection.host}`);
    } catch (error) {
        // Log any errors that occur during the connection attempt
        console.error(error);
    }
}

module.exports = connectDB;// should not use function call 