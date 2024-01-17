import mongoose from 'mongoose';

const mongo = {
    connect: async () => {
        const uri = process.env.MONGO_URI;
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true
        };
        mongoose.connect(uri, options)
            .then(() => {
                console.log('[MongoDB Status] | \x1b[32mConnected\x1b[0m');
            })
            .catch((err) => {
                console.error('[MongoDB Status | \x1b[31mFailed\x1b[0m \n', err);
            });
    },
}

export default mongo;