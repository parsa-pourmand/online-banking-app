const fs = require('fs');
const path = require('path');
const { generateKeyPairSync } = require('crypto');

const keysDir = path.join(__dirname, 'keys');

if (!fs.existsSync(path.join(keysDir, 'private.pem'))) {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
  });

  if (!fs.existsSync(keysDir)) fs.mkdirSync(keysDir);
  fs.writeFileSync(path.join(keysDir, 'public.pem'), publicKey);
  fs.writeFileSync(path.join(keysDir, 'private.pem'), privateKey);
  console.log('✅ RSA keys auto-generated');
}

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const router = require('./routes/routes');

const app = express();
dotenv.config();

app.use(express.json());

app.use('/onlinebanking/', router);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});

