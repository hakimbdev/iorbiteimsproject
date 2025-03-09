# iOrbit eISM - Real Estate Information Management System

A professional web application for real estate companies to manage properties, clients, and analytics in a centralized location.

## Features

- Property Management (CRUD operations)
- Client Relationship Management (CRM)
- Basic Analytics Dashboard
- Firebase Firestore Integration
- Responsive Design

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Firebase/Firestore
- Tailwind CSS

## Prerequisites

- Node.js 18.x or later
- npm or yarn
- Firebase account with Firestore enabled

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── properties/        # Property management pages
├── components/            # Reusable components
├── lib/                   # Utility functions and Firebase config
└── types/                 # TypeScript type definitions
```

## Data Structure

### Firestore Collections

1. `companies`
   - Company information
   - Subscription details
   - User roles

2. `properties`
   - Property details
   - Status
   - Images
   - Documents

3. `clients`
   - Client information
   - Property interests
   - Communication history

## Security

- Firebase Authentication for user management
- Firestore Security Rules for data access control
- Input validation and sanitization
- Error handling and logging

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request # iorbiteimsproject
