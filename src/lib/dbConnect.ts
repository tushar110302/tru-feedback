import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number
}
const connection: ConnectionObject = {}

async function dbConnect(): Promise<void>  {
    if (connection.isConnected) {
        console.log('Aready connected to database');
        return;
    }
    try {
        const db = await mongoose.connect(process.env.MONGO_URI || '', {})
        console.log(db)
        console.log(db.connections)
        connection.isConnected = db.connections[0].readyState;

        console.log("DB Connected Successfully");
    } catch (error) {
        console.log("Database connection error", error);
        process.exit(1);
    }

}

export default dbConnect