# Split Easy - Expense Splitting Application

## Project Overview

**URL**: https://lovable.dev/projects/5885f59d-f015-482e-a528-0a3af452c709

SplitEasy is a modern web application designed to simplify bill splitting among friends, roommates, or groups. Whether you're dining out, traveling, or sharing expenses, Split Easy makes it effortless to track and settle shared costs transparently.

## Features

- 🏛️ **MongoDB Database Integration**: Secure data storage with MongoDB Atlas
- 👥 **User Management**: Registration, login, and profile management
- 📊 **Expense Tracking**: Add, edit, and categorize expenses
- 🔢 **Auto-Calculate**: Smart balance calculations and settlement suggestions
- 👨‍👩‍👧‍👦 **Group Management**: Create and manage expense groups
- 💳 **UPI Payment Integration**: Secure payments using Razorpay
- 📱 **Responsive Design**: Works on all devices
- 🤖 **AI Chatbot**: Interactive help and guidance
- 📧 **Email Notifications**: Group activity notifications
- 🔐 **Secure Authentication**: Encrypted password storage

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Payment Processing**: Razorpay
- **Email Service**: Nodemailer
- **Build Tool**: Vite
- **State Management**: React Hooks

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- Razorpay account (for payments)
- Email service credentials (for notifications)

### Installation

1. **Clone the repository**
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. **Install dependencies**
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend && npm install
```

3. **Environment Configuration**

Create a `.env` file in the project root:

```env
# MongoDB Configuration
MONGODB_URI=your_mongodb_atlas_connection_string

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET_HERE

# Server Configuration
PORT=3001

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com
```

4. **Start the development servers**

```bash
# Start backend server (from project root)
npm run server

# Start frontend development server (in another terminal)
npm run dev
```

## Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String,
  createdAt: Date
}
```

### Groups Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  members: [String],
  createdBy: ObjectId (ref: User),
  notificationEmails: [String],
  createdAt: Date
}
```

### Expenses Collection
```javascript
{
  _id: ObjectId,
  description: String,
  amount: Number,
  paidBy: String,
  participants: [String],
  date: String,
  settled: Boolean,
  createdBy: ObjectId (ref: User),
  groupId: ObjectId (ref: Group),
  createdAt: Date
}
```

### Messages Collection
```javascript
{
  _id: ObjectId,
  name: String,
  message: String,
  time: Date
}
```

## API Endpoints

### User Management
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `PUT /api/users/:userId` - Update user profile
- `PUT /api/users/:userId/password` - Change password

### Group Management
- `GET /api/groups?userId=:userId` - Get user's groups
- `POST /api/groups` - Create new group
- `PUT /api/groups/:groupId` - Update group
- `POST /api/groups/:groupId/members` - Add member to group
- `DELETE /api/groups/:groupId/members/:username` - Remove member
- `DELETE /api/groups/:groupId` - Delete group

### Expense Management
- `GET /api/expenses?userId=:userId&groupId=:groupId` - Get expenses
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:expenseId` - Update expense
- `DELETE /api/expenses/:expenseId` - Delete expense

### Messaging
- `GET /messages` - Get all messages
- `POST /messages` - Send new message

## Key Features Explained

### Auto-Calculate Balances
The application automatically calculates who owes money to whom and suggests the minimum number of transactions needed to settle all debts using a smart algorithm.

### Group Management
Users can create groups for different circles (roommates, trip buddies, etc.) and manage expenses within those groups. Each group can have notification emails for important updates.

### Secure Authentication
- Passwords are stored securely
- User sessions are managed properly
- API endpoints are protected

### UPI Payment Integration
- Integrated with Razorpay for secure payments
- Supports UPI, cards, net banking, and wallets
- Real-time payment verification
- it is not functional because payment server is not connected

### Email Notifications
- Group creation notifications
- Member addition/removal alerts
- Expense settlement confirmations

## Development

### Project Structure
```
├── src/                    # Frontend React application
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   └── hooks/             # Custom React hooks
├── backend/               # Backend Node.js application
│   ├── models/            # MongoDB models
│   └── server.js          # Express server
└── public/                # Static assets
```

### Available Scripts

- `npm run dev` - Start frontend development server
- `npm run server` - Start backend development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Security Features

- ✅ Password encryption
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ Environment variable protection
- ✅ Secure payment processing
- ✅ Database injection prevention

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Deployment

The application can be deployed to:
- **Frontend**: Vercel, Netlify, or any static hosting
- **Backend**: Heroku, Railway, or any Node.js hosting
- **Database**: MongoDB Atlas (already configured)

## AI Tools Used

- Lovable AI
- Grok AI
- Replit AI
- Bolt AI
- Cursor AI
- ChatGPT

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

---

**Made with ❤️ using modern web technologies**
