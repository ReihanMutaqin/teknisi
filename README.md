# EBIS Task Tracker 🚀

![EBIS Tracker Banner](https://img.shields.io/badge/EBIS-Task%20Tracker-1e40af?style=for-the-badge)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Firebase](https://img.shields.io/badge/firebase-a08021?style=for-the-badge&logo=firebase&logoColor=ffcd34)

**EBIS Task Tracker** is a modern, real-time web application designed to streamline the workflow between field technicians and managers. It provides a centralized platform for tracking work orders, monitoring technician progress, and analyzing overall performance through an interactive dashboard.

## ✨ Key Features

### 👨‍🔧 For Technicians
- **Live Task Board**: Browse and claim pending work orders effortlessly.
- **Progress Tracking**: Update status in real-time (`On Progress`, `Completed`, `Kendala`, `Cancel`).
- **Notes System**: Leave specific notes or issues encountered on the field for managers to review immediately.

### 📊 For Managers
- **Real-Time Dashboard**: Get a bird's-eye view of all operations.
- **Interactive Analytics**: Visual distribution of task statuses and STO (Sentral Telepon Otomat) performance using dynamic charts.
- **Issue Tracking**: Dedicated feeds to monitor recent technical issues (`Kendala`) and technician activities.
- **Advanced Export**: Export filtered data to beautifully formatted Excel (`.xlsx`) files with automatic color-coding based on task status.

### 🔄 System Operations
- **Data Import**: Seamlessly import JSON data exported from the main EBIS system to sync the database.
- **Google reCAPTCHA Enterprise**: Enterprise-grade security to prevent abuse.
- **AdSense Ready**: Built-in Google AdSense integration.

## 🛠️ Tech Stack

- **Frontend Framework**: React 18 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend / Database**: Firebase Realtime Database
- **Data Visualization**: Recharts
- **Excel Generation**: ExcelJS
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js and npm installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ebis-task-tracker.git
   ```

2. Navigate to the project directory:
   ```bash
   cd ebis-task-tracker
   ```

3. Install the dependencies:
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env` file in the root directory and add your specific configurations:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_DATABASE_URL=your_firebase_database_url

# Google AdSense
VITE_ADSENSE_CLIENT_ID=your_adsense_id

# Google reCAPTCHA Enterprise
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_key
```

### Running the App Locally

Start the Vite development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

## 📦 Deployment

This project is optimized for deployment on Vercel. 
Ensure you add the environment variables defined in `.env` into your Vercel Project Settings before deploying.

```bash
npm run build
```

---
*Built with ❤️ for Telkom Indonesia Technicians.*
