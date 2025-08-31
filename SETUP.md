# Chat Application Setup Guide

This guide will help you set up and run your MERN chat application with AI integration.

## Prerequisites

- Node.js (v18 or higher)
- pnpm (or npm/yarn)
- Groq API key (get one from [https://console.groq.com/](https://console.groq.com/))

## Server Setup

1. **Navigate to the server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Create environment file:**
   Create a `.env` file in the server directory with the following content:
   ```env
   NODE_ENV=development
   PORT=3000
   GROQ_API_KEY=your_actual_groq_api_key_here
   CORS_ORIGIN=
   ```

4. **Start the server:**
   ```bash
   pnpm dev
   ```
   
   The server will start on `http://localhost:3000`

## Client Setup

1. **Navigate to the client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Start the client:**
   ```bash
   pnpm dev
   ```
   
   The client will start on `http://localhost:3001` (or next available port)

## How It Works

1. **Server**: Express.js server with chat API endpoint at `/chat`
2. **AI Integration**: Uses Groq API for AI responses
3. **Client**: Next.js app with real-time chat interface
4. **Communication**: Client sends messages to server, server processes with AI, returns responses

## API Endpoints

- `POST /chat` - Send chat messages and get AI responses
- `GET /health` - Health check endpoint

## Features

### Core Functionality
- Real-time chat interface
- AI-powered responses using Groq
- Conversation history
- Loading states
- Responsive design
- Dark/light theme support

### Error Handling & Validation
- **Input Validation**: Message length limits (max 4000 characters), empty message prevention
- **Error Display**: User-friendly error messages with specific error types
- **Retry Mechanism**: Retry failed messages with a single click
- **Toast Notifications**: Non-intrusive notifications for various events
- **Error Banners**: Persistent error display for critical issues
- **Status Code Handling**: Specific handling for 400, 401, 403, 404, 429, 500 errors
- **Network Error Handling**: Connection issues, timeouts, and network problems
- **Message Parsing**: Robust parsing and validation of server responses

### User Experience
- Character count display
- Real-time input validation
- Loading indicators during API calls
- Disabled states during processing
- Auto-resize textarea
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)

## Error Types Handled

- **400**: Invalid request format
- **401**: Authentication required
- **403**: Access denied
- **404**: Service not found
- **429**: Rate limit exceeded
- **500**: Server errors
- **Network**: Connection issues
- **Timeout**: Request timeouts
- **Validation**: Input validation errors

## Troubleshooting

- Make sure your Groq API key is valid
- Ensure the server is running before starting the client
- Check that ports 3000 (server) and 3001+ (client) are available
- Verify CORS settings if you encounter cross-origin issues
- Check browser console for detailed error information
- Ensure your messages are under 4000 characters
- Try the retry button if a message fails

## Development Notes

- The application automatically handles message retries
- Error messages are displayed both in chat and as toast notifications
- Input validation happens in real-time
- The UI automatically adapts to different error states
- All API calls include proper error handling and user feedback
