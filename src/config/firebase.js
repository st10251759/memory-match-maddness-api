const admin = require('firebase-admin');
 
let serviceAccount;
 
// Check if we're in production (Render) or development (local)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Production: Use environment variable
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        console.log('✅ Using Firebase service account from environment variable');
    } catch (error) {
        console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT:', error.message);
        console.error('Make sure the JSON is properly formatted and on one line');
        process.exit(1);
    }
} else if (process.env.NODE_ENV === 'production') {
    // Production but no env var - error
    console.error('❌ FIREBASE_SERVICE_ACCOUNT environment variable is required in production');
    console.error('Please set it in your Render dashboard');
    process.exit(1);
} else {
    // Development: Use local file
    try {
        serviceAccount = require('../../serviceAccountKey.json');
        console.log('⚠️ Using Firebase service account from local file (development only)');
    } catch (error) {
        console.error('❌ No Firebase credentials found');
        console.error('For local development, place serviceAccountKey.json in the project root');
        console.error('For production, set FIREBASE_SERVICE_ACCOUNT environment variable');
        process.exit(1);
    }
}
 
// Initialize Firebase
try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL || `https://${serviceAccount.project_id}.firebaseio.com`
    });
 
    const db = admin.firestore();
    const auth = admin.auth();
 
    console.log('✅ Firebase initialized successfully');
    console.log(`📊 Project ID: ${serviceAccount.project_id}`);
 
    module.exports = { admin, db, auth };
} catch (error) {
    console.error('❌ Failed to initialize Firebase:', error.message);
    process.exit(1);
}
 