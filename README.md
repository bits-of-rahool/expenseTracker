# Expense Tracker

A modern, full-stack expense tracking application built with React, Node.js, and MongoDB. Track your expenses, manage multiple accounts, and visualize your spending patterns with an intuitive dashboard.

![Expense Tracker](client/public/favicon.svg)

## Features

- 🔐 **User Authentication**: Secure login and registration system
- 💰 **Multi-Account Management**: Track expenses across different accounts
- 📊 **Interactive Dashboard**: Visualize your financial data with charts and graphs
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🎨 **Modern UI**: Clean, intuitive interface with dark mode support
- 🔄 **Real-time Updates**: Instant reflection of your financial changes

## Tech Stack

### Frontend
- React.js
- Material-UI
- Vite
- Axios
- React Router
- Chart.js

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Bcrypt

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/bits-of-rahool/expenseTracker.git
cd expense-tracker
```

2. Install dependencies
```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5001
```

4. Start the development servers
```bash
# Start the backend server (from root directory)
npm run dev

# Start the frontend server (from client directory)
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5001

## Project Structure

```
expense-tracker/
├── client/                 # Frontend React application
│   ├── public/            # Static files
│   └── src/               # React source code
│       ├── components/    # React components
│       ├── context/       # React context
│       └── utils/         # Utility functions
├── controllers/           # Route controllers
├── middleware/            # Custom middleware
├── models/               # Mongoose models
├── routes/               # API routes
└── server.js            # Entry point
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update user profile

### Accounts
- `GET /api/accounts` - Get all accounts
- `GET /api/accounts/:id` - Get account details
- `POST /api/accounts` - Create new account
- `PUT /api/accounts/:id` - Update account
- `DELETE /api/accounts/:id` - Delete account

### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/:id` - Get transaction details
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Material-UI for the component library
- Chart.js for data visualization
- MongoDB for the database
- All contributors and users of this application 
