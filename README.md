# Online Banking Web Application

A secure full-stack online banking platform where users can sign up, log in, manage their account balance, perform e-transfers, and update personal details — all with encrypted communication between client and server.

This project was built using **React**, **Node.js**, **Express**, and **MongoDB**, and is **deployed on Microsoft Azure**.

---

## Features

- **Client-side RSA encryption** for all sensitive user data
- **JWT-based authentication** with protected routes
- **Real-time balance updates** after deposits or e-transfers
- **E-transfer between users** by email
- **Editable account profile**, excluding card number
- **Secure password hashing** using bcrypt
- **Error handling and validation** for all API routes
- **Deployed on Microsoft Azure** using cloud services and MongoDB Atlas

---

## Tech Stack

| Frontend | Backend | Security | Database | Deployment |
|----------|---------|----------|----------|------------|
| React    | Node.js + Express | RSA Encryption (node-forge) | MongoDB Atlas | Microsoft Azure App Service |
| React Router | JWT Auth | bcrypt | Mongoose | Azure Blob for frontend |
| CSS Modules | REST APIs | HTTPS | Cloud-hosted DB | |

---

## Folder Structure

BankWebApp/

  ├── Backend/
  
     ├── index.js
   
     ├── routes/

     ├── controllers/

     └── models/

  ├── Frontend/

     ├── src/

     ├── pages/

     ├── components/

     └── App.js

     └── public/

├── .gitignore

├── README.md


---

## ⚙️ Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/signup` | Register new user |
| POST   | `/login`  | Authenticate and return JWT |
| GET    | `/balance/:id` | Get account balance |
| POST   | `/deposit/:id` | Deposit funds |
| POST   | `/etransfer/:id` | Send money to another user |
| GET    | `/getinfo/:id` | Fetch user profile |
| PUT    | `/saveinfo/:id` | Update user profile |

All routes (except `/signup` and `/login`) require a valid **JWT token** in the `Authorization` header.

---

## Security Architecture

- All sensitive fields (card number, password, personal info) are **encrypted in the browser** using an RSA public key via `node-forge`
- Data is **decrypted server-side** using the corresponding private key
- Passwords are **hashed with bcrypt** before being stored
- **JWT tokens** are used to authorize protected routes

---

## Future Improvements

- Transaction history tracking
- Email verification and password reset
- Admin dashboard to manage users
- Mobile responsiveness and accessibility enhancements

---

## Author

**Parsa Pourmand**  
Graduate Software Engineer from Toronto Metropolitan University  
[parsapourmand.com](https://parsapourmand.com)  
[LinkedIn](https://www.linkedin.com/in/parsa-pourmand) • [GitHub](https://github.com/parsa-pourmand)

---

## License

This project is licensed under the MIT License.

