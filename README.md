# Family Journal

A family sharing application with photo upload and comment features.

## Prerequisites

- Python 3.8+
- Node.js 16+
- npm

## Installation

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```

3. Activate the virtual environment:
   ```bash
   # On macOS/Linux
   source venv/bin/activate

   # On Windows
   venv\Scripts\activate
   ```

4. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file with your Cloudinary credentials.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application

### Start the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Activate the virtual environment (if not already activated):
   ```bash
   source venv/bin/activate
   ```

3. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

The backend will be available at `http://localhost:8000`

### Start the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## Development

### Frontend Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run css:watch` - Watch Tailwind CSS changes
- `npm run css:build` - Build Tailwind CSS

### Backend

The backend uses FastAPI with SQLAlchemy and includes:
- User authentication
- Circle management
- Photo upload via Cloudinary
- Comments and likes
- Database migrations with Alembic

## Database

The application uses SQLite by default. The database file `circle_share.db` will be created automatically when you first run the backend.