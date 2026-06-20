# 🎪 Crew Arena.....
### The Ultimate Campus Event & Tournament Management Platform

<div align="center">

[![Next.js 16](https://img.shields.io/badge/Next.js-16.2.9-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?logo=supabase)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Status](https://img.shields.io/badge/Status-In%20Development-orange)]()

**One Arena. Every Event.**

*Your all-in-one platform for managing college events, tournaments, registrations, attendance, and certificates.*

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Documentation](#-documentation)

</div>

---

## 🌟 What is Crew Arena?

Crew Arena is a modern, all-in-one platform designed to revolutionize how colleges manage events, tournaments, and student engagement. Whether it's academic workshops, hackathons, sports tournaments, or esports competitions, Crew Arena provides a unified solution that eliminates spreadsheets, manual processes, and fragmented tools.

<div align="center">
  <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop" alt="Team Collaboration" width="100%" height="400">
  <p><em>Manage everything from registration to results in one unified platform</em></p>
</div>

---

## ✨ Key Features

### 📋 Event Management
- **Multi-Category Support**: Academic, Technical, Department, Club, Sports, and Esports events
- **Easy Event Creation**: Intuitive interface for organizers to create and manage events
- **Event Scheduling**: Manage multiple events with dates, venues, and speaker information
- **Event Analytics**: Track registrations, attendance, and engagement metrics

### 🎫 Smart Registration & Ticketing
- **Individual Registration**: Quick sign-up for individual participants
- **Team Registration**: Flexible team formation for hackathons, sports, and esports
- **Automatic QR Ticket Generation**: Unique tickets with QR codes for each participant
- **PDF Download**: Download tickets as PDF for offline access
- **Real-time Sync**: Instant registration status updates

<div align="center">
  <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop" alt="Ticketing System" width="100%" height="400">
  <p><em>Generate and manage tickets automatically with QR codes</em></p>
</div>

### ✅ Attendance Tracking
- **QR Code Scanning**: Fast one-scan attendance marking
- **Live Tracking**: Real-time attendance count and status
- **Duplicate Prevention**: Prevent duplicate attendance marks
- **Offline Support**: Works without internet connection
- **Export Reports**: Generate attendance reports in multiple formats

### 🏆 Tournament Management
**Sports Tournaments:**
- Knockout, Round Robin, League, and Group Stage formats
- Tournament brackets and fixtures
- Points tables and leaderboards
- Match results and team standings

**Esports Tournaments:**
- Support for BGMI, Free Fire Max, Valorant, and more
- Room ID management
- Score submission and live leaderboards
- Bracket generation

<div align="center">
  <img src="https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=800&h=400&fit=crop" alt="Tournament Brackets" width="100%" height="400">
  <p><em>Manage tournament brackets and track team performance</em></p>
</div>

### 🎓 Certificate Management
- **Automatic Generation**: Certificates auto-generated after event completion
- **Multiple Types**: Participation, Winner, Runner-up, Volunteer, and Organizer certificates
- **Template Support**: Customizable certificate templates
- **Instant Download**: Students download certificates immediately
- **Email Delivery**: Automated certificate delivery via email

### 📊 Analytics Dashboard
- Total events, registrations, and attendance metrics
- Department and club performance tracking
- Event popularity trends
- Registration patterns and predictions
- Custom report generation

### 🎨 Modern UI/UX
- **Light & Dark Modes**: Seamless theme switching
- **Theme Customization**: 6 pre-built themes (Blue, Emerald, Purple, Crimson, Orange, College)
- **Mobile-First Design**: Fully responsive on all devices
- **Fast Performance**: Sub-2-second load times with Lighthouse 95+ scores
- **PWA Support**: Progressive Web App for offline access

---

## 🏗️ Architecture

<div align="center">
  <img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=400&fit=crop" alt="Architecture" width="100%" height="400">
</div>

### User Roles & Permissions

| Role | Permissions | Use Cases |
|------|-------------|-----------|
| **Super Admin** | Platform control, user management, reports | College administration |
| **Department Admin** | Create department events, manage certificates | Academic departments |
| **Club Admin** | Create club events, verify attendance | Student clubs |
| **Tournament Admin** | Manage tournaments, upload fixtures, declare winners | Sports/Esports coordinators |
| **Student** | Register, join teams, download tickets, view certificates | All students |

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS 4** - Utility-first styling
- **ShadCN UI** - Beautiful component library
- **Framer Motion** - Smooth animations
- **Recharts** - Data visualization

### Backend
- **Next.js API Routes** - Server-side API endpoints
- **Server Actions** - Direct database mutations
- **Supabase Auth** - Authentication & authorization

### Database & Storage
- **Supabase PostgreSQL** - Relational database
- **Supabase Storage** - File storage for certificates and documents
- **Real-time Subscriptions** - Live data updates

### Additional Services
- **QR Code Generation** - `qrcode` library
- **QR Scanning** - `html5-qrcode` for mobile scanning
- **PDF Generation** - `jsPDF` for ticket and certificate generation
- **Email Service** - Resend for transactional emails
- **Hosting** - Vercel for deployment

### Development
- **ESLint** - Code quality
- **Tailwind CSS** - Styling framework

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and npm/yarn/pnpm/bun
- **Supabase Account** (for database and auth)
- **Resend Account** (for email service)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/arpit0381/crewSync.git
cd crewSync
