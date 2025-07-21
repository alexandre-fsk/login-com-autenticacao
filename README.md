# JWT Authentication System with Vue.js

A complete login/logout system with JWT authentication built using Vue.js, Metro UI CSS, and Font Awesome with mobile-first responsive design.

## Features

- 🔐 **JWT Authentication**: Secure token-based authentication
- 📱 **Mobile-First Design**: Responsive interface optimized for mobile devices
- 🎨 **Modern UI**: Beautiful interface using Metro UI CSS and Font Awesome icons
- 🔒 **Password Security**: Password strength indicator and validation
- 📝 **Form Validation**: Real-time validation with error messages
- 🔄 **Auto-login**: Remembers user session using localStorage
- 📢 **Notifications**: Toast notifications for user feedback
- 🚀 **Vue.js 3**: Modern reactive framework

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Demo Credentials
- **Email**: admin@example.com
- **Password**: password123

## Project Structure

```
login-com-autenticacao/
├── index.html              # Main HTML file with Vue.js app
├── assets/
│   ├── css/
│   │   └── arquivo.css     # Custom styles with Metro UI integration
│   └── js/
│       └── arquivo.js      # Vue.js application with JWT logic
├── server.js               # Express.js backend server
├── package.json            # Node.js dependencies
└── README.md              # This file
```

## API Endpoints

- `POST /api/login` - User login
- `POST /api/register` - User registration
- `GET /api/profile` - Get user profile (protected)
- `POST /api/logout` - User logout

## JWT Implementation

The system uses JSON Web Tokens for secure authentication:

- **Token Storage**: Tokens are stored in localStorage
- **Auto-refresh**: Tokens are validated on app startup
- **Secure Logout**: Tokens are removed on logout
- **Protected Routes**: API endpoints require valid JWT

## Mobile-First Features

- Responsive design that works on all screen sizes
- Touch-friendly interface elements
- Optimized form inputs for mobile devices
- Adaptive navigation and layout

## Security Features

- Password hashing with bcrypt
- JWT token expiration
- Input validation and sanitization
- CORS protection
- Secure password requirements

## Customization

### Styling
The system uses Metro UI CSS framework with custom styles. You can modify `assets/css/arquivo.css` to customize the appearance.

### API Configuration
Update the `baseURL` in `assets/js/arquivo.js` to point to your backend server.

### JWT Secret
Set the `JWT_SECRET` environment variable for production use.

## Production Deployment

1. Set environment variables:
```bash
export JWT_SECRET=your-secure-secret-key
export PORT=3000
```

2. Install production dependencies:
```bash
npm install --production
```

3. Start the server:
```bash
npm start
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT License - feel free to use this project for your own applications.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

If you encounter any issues or have questions, please open an issue on the repository.
