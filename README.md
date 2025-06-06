MesArat is a web application for secure messaging that leverages modern cryptographic algorithms and real-time communication via GraphQL subscriptions. This repository contains the frontend part of the project.

🚀 Features
🔑 User registration and login

💬 Create and participate in chats

✉️ Send messages and files

♻️ Delete messages

🕒 Real-time communication — messages and notifications are delivered instantly via GraphQL Subscriptions

🛡️ Message encryption using DES

🤝 Key exchange via the Diffie-Hellman algorithm

✍️ Digital signatures using RSA

🔔 Notifications for new messages and events

📁 Send attachments together with messages

🔐 Security
The project uses a hybrid approach to secure communication:

DES (Data Encryption Standard) — symmetric encryption for messages and files

Diffie-Hellman — used to securely exchange DES symmetric keys between users

RSA — used to generate digital signatures to verify message authenticity

All messages and files are encrypted on the client-side before sending and decrypted on the client-side after receiving.

🛠️ Tech Stack
React + TypeScript

GraphQL + Apollo Client

Web Crypto API — used for encryption and decryption with DES.
Other algorithms (RSA, Diffie-Hellman) are implemented manually without external libraries

TailwindCSS — for UI styling

Next.js
