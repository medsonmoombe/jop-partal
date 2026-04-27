import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Temporary route to fix database indexes - REMOVE AFTER USE
router.get('/fix-username-index', async (req, res) => {
    try {
        const db = mongoose.connection.db;
        const usersCollection = db.collection('users');
        
        // List all indexes
        const indexes = await usersCollection.indexes();
        console.log('Current indexes:', indexes);

        // Try to drop username index
        try {
            await usersCollection.dropIndex('username_1');
            return res.json({ 
                success: true, 
                message: 'Successfully dropped username_1 index',
                indexes: await usersCollection.indexes()
            });
        } catch (error) {
            if (error.code === 27) {
                return res.json({ 
                    success: true, 
                    message: 'username_1 index does not exist',
                    indexes: await usersCollection.indexes()
                });
            }
            throw error;
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

export default router;
