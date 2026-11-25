
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("Please define MONGODB_URI in .env.local");
}

type MongooseCache = {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
};

declare global {
    // eslint-disable-next-line no-var
    var mongooseCache: MongooseCache | undefined;
}

const cached = global.mongooseCache ?? {
    conn: null,
    promise: null,
};

global.mongooseCache = cached;

async function connectDB(): Promise<typeof mongoose> {
    // Reuse only a connection to the expected database
    if (
        cached.conn &&
        mongoose.connection.readyState === 1 &&
        mongoose.connection.name === "quickbook"
    ) {
        return cached.conn;
    }

    // Discard a stale connection or promise
    if (
        mongoose.connection.readyState === 1 &&
        mongoose.connection.name !== "quickbook"
    ) {
        await mongoose.disconnect();
    }

    cached.conn = null;
    cached.promise = null;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI!, {

            dbName: "quickbook",
            bufferCommands: false,
        });
        cached.conn = await cached.promise;

        console.log("Database Name:", mongoose.connection.name);
    }

    try {
        cached.conn = await cached.promise;

        console.log("MongoDB connected database:", mongoose.connection.name);

        return cached.conn;
    } catch (error) {
        cached.promise = null;
        cached.conn = null;
        throw error;
    }
}

export default connectDB;
