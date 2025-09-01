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
2. **AI Integration**: Uses Groq API for AI responses with intelligent response type detection
3. **Client**: Next.js app with real-time chat interface and advanced formatting options
4. **Communication**: Client sends messages to server, server processes with AI, returns responses with metadata

## API Endpoints

- `POST /chat` - Send chat messages and get AI responses
  - **Request Body**: 
    ```json
    {
      "messages": [{"role": "user", "content": "Hello"}],
      "responseFormat": "json", // Optional: "text", "json", "code", "markdown", "mixed"
      "systemPrompt": "You are a helpful assistant" // Optional
    }
    ```
  - **Response**:
    ```json
    {
      "reply": "AI response content",
      "responseType": "detected_type",
      "metadata": {
        "language": "javascript",
        "isCode": true,
        "isJson": false,
        "isMarkdown": false
      },
      "usage": {"prompt_tokens": 10, "completion_tokens": 20, "total_tokens": 30},
      "model": "llama-3.3-70b-versatile"
    }
    ```
- `GET /health` - Health check endpoint

## Features

### Core Functionality
- Real-time chat interface
- AI-powered responses using Groq
- Conversation history
- Loading states
- Responsive design
- Dark/light theme support

### Response Type Handling
- **Automatic Detection**: AI automatically detects response types (text, JSON, code, markdown)
- **Format Selection**: Users can specify preferred response formats
- **Smart Rendering**: Different content types are rendered appropriately
- **Code Highlighting**: Programming code with language detection
- **JSON Formatting**: Pretty-printed JSON with metadata
- **Markdown Support**: Rich text formatting with headers, lists, code blocks
- **Mixed Content**: Support for combinations of different formats

### Advanced Options
- **System Prompts**: Custom instructions for AI behavior
- **Response Format Control**: Force specific output formats
- **Model Configuration**: Temperature, max tokens, and other Groq parameters
- **Metadata Extraction**: Language detection, JSON structure analysis
- **Usage Tracking**: Token usage monitoring

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
- **Character Counter**: Shows message length with visual feedback
- **Real-time Input Validation**: Instant validation with helpful placeholders
- **Loading Indicators**: During API calls with disabled states
- **Auto-resize Textarea**: Dynamic input sizing
- **Keyboard Shortcuts**: Enter to send, Shift+Enter for new lines
- **Copy to Clipboard**: One-click copying of code and JSON responses
- **Response Type Labels**: Visual indicators for different content types
- **Advanced Options Panel**: Collapsible settings for power users

## Response Types Supported

### 1. **Text** (Default)
- Plain text responses
- Natural language processing
- General conversation

### 2. **JSON**
- Structured data responses
- API responses
- Configuration data
- Database queries

### 3. **Code**
- Programming languages (JavaScript, Python, Java, Rust, etc.)
- Syntax highlighting
- Code blocks with language detection
- Function definitions and examples

### 4. **Markdown**
- Rich text formatting
- Headers and subheaders
- Lists and bullet points
- Code blocks and inline code
- Links and images

### 5. **Mixed**
- Combination of formats
- Text with embedded code
- Markdown with JSON examples
- Flexible content mixing

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

## Usage Examples

### Request JSON Response
```json
{
  "messages": [{"role": "user", "content": "Create a user profile object"}],
  "responseFormat": "json"
}
```

### Request Code Response
```json
{
  "messages": [{"role": "user", "content": "Write a function to sort an array"}],
  "responseFormat": "code",
  "systemPrompt": "You are a JavaScript expert. Always include comments."
}
```

### Request Markdown Response
```json
{
  "messages": [{"role": "user", "content": "Explain React hooks"}],
  "responseFormat": "markdown"
}
```

## Troubleshooting

- Make sure your Groq API key is valid
- Ensure the server is running before starting the client
- Check that ports 3000 (server) and 3001+ (client) are available
- Verify CORS settings if you encounter cross-origin issues
- Check browser console for detailed error information
- Ensure your messages are under 4000 characters
- Try the retry button if a message fails
- Use the advanced options to specify response formats if needed

## Development Notes

- The application automatically handles message retries
- Error messages are displayed both in chat and as toast notifications
- Input validation happens in real-time
- The UI automatically adapts to different error states
- All API calls include proper error handling and user feedback
- Response types are automatically detected and rendered appropriately
- Advanced options allow fine-tuning of AI responses
- System prompts can customize AI behavior for specific use cases
