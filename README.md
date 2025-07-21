# ⏰ Alarmy - Smart Task-Based Alarm App

Alarmy is a powerful and creative alarm app built with **React Native (Expo)** that ensures you never oversleep again. It can only be dismissed by completing a **pre-set task** like scanning a QR code or taking a photo of a registered object — making it perfect for heavy sleepers or anyone trying to build better habits.

---

## 🚀 Features

### 🔒 Task-Based Alarm Dismissal
- **QR Code Mode**: Register a QR code, and scan it in the morning to turn off the alarm.
- **Photo Mode**: Register a photo of an object/location (e.g., your sink or book) — replicate it to stop the alarm.

### 📱 Simple, Intuitive UI
- Minimalist design
- Easy navigation and onboarding
- Dark/light mode support (optional)

### ⏰ Alarm Features
- Set multiple alarms with custom labels
- Customizable ringtone & vibration
- Repeat on specific days of the week
- Alarm rings even if the phone is locked or the app is closed

### 📷 Camera & Storage Permissions
- Requests camera access for photo-based tasks
- Stores registered photo or QR code in local storage

---

## 🛠️ Tech Stack

- **React Native + Expo**
- **TypeScript**
- **Expo Camera API** – for photo/QR capture
- **SecureStore / AsyncStorage** – to store alarm data & task images
- **Expo Notifications** – for scheduling alarms
- **React Navigation** – for screen transitions

---

## 📦 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/alarmy.git
cd alarmy
