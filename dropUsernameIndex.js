import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const dropUsernameIndex = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');
        
        // List all indexes
        const indexes = await usersCollection.indexes();
        console.log('Current indexes:', JSON.stringify(indexes, null, 2));

        // Try to drop username index
        try {
            await usersCollection.dropIndex('username_1');
            console.log('✓ Successfully dropped username_1 index');
        } catch (error) {
            if (error.code === 27) {
                console.log('✓ username_1 index does not exist (already removed)');
            } else {
                console.log('Error dropping username_1 index:', error.message);
            }
        }

        // List indexes after dropping
        const indexesAfter = await usersCollection.indexes();
        console.log('\nIndexes after cleanup:', JSON.stringify(indexesAfter, null, 2));

        await mongoose.connection.close();
        console.log('\n✓ Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

dropUsernameIndex();
