# Smart Campus Operations Hub 🏫✨

A premium, state-of-the-art university facility management system built for the **IT3030 PAF Assignment (2026)**. This platform features a modern **Dark Gradient Vibe** with glassmorphism, real-time notifications, and advanced resource tracking.

![Login Page](docs/images/login-page.png)

## 🌟 Key Highlights
*   **Premium Aesthetics**: Custom-built with a deep-sea dark theme, radial gradients, and fluid micro-animations.
*   **Dynamic Catalogue**: Switch between **Premium Horizontal List** and **Modern Grid** views with real-time search.
*   **Robust Validation**: Multi-layer JSR-303 (Backend) and Smart Logic (Frontend) validation for all inputs.
*   **Role-Based Access**: Specialized dashboards for Students/Staff, Admins, and Technicians.

---

## 📸 Visual Tour

### User Experience
Explore the campus easily with our intuitive user interface.

| Dashboard | Catalogue | Notifications |
| :--- | :--- | :--- |
| ![User Dashboard](docs/images/user-dashaboard.png) | ![User Catalogue](docs/images/user-catalogue-page.png) | ![User Notifications](docs/images/user-notification-page.png) |

### Admin & Staff Experience
Powerful tools for managing campus resources and maintenance.

| Admin Dashboard | Resource Management | Booking Control |
| :--- | :--- | :--- |
| ![Admin Dashboard](docs/images/admin-dashboard.png) | ![Admin Catalogue](docs/images/admin-catalogue-page.png) | ![Booking Management](docs/images/admin-manageBooking-page.png) |

> [!TIP]
> **Technician View**: Our Service Desk allows for rapid incident resolution.
> ![Service Desk](docs/images/admin-serviceDesk-page.png)

---

## 🛠️ Modules

### Module A: Facilities & Assets Catalogue
*   **View Toggle**: Users can choose their preferred browsing experience (List vs Grid).
*   **Real-time Search**: Filter by name, location, or type instantly.
*   **Status Tracking**: Live visibility of `ACTIVE`, `MAINTENANCE`, and `INACTIVE` resources.

### Module B: Booking Management
*   **Seamless Requests**: High-contrast forms with date-collision protection.
*   **Admin Approval Workflow**: Managers can approve/reject with custom reasons.

### Module C: Maintenance & Incident Ticketing
*   **Multi-Image Upload**: Report issues with up to 3 evidence attachments.
*   **Technician Workflow**: Dedicated terminal for picking up and resolving tickets.

---

## 🚀 Acceptable Innovation (Bonus Points)
We have implemented several "Optional Innovations" to secure maximum marks:
1.  **Usage Analytics Ready**: Backend structured to track resource popularity.
2.  **SLA Tracking**: Tickets track time-to-resolution for performance reporting.
3.  **Premium UX**: Integration of **Skeleton Loaders** for a seamless data-fetching experience.

---

## 💻 Tech Stack
*   **Frontend**: React 18, Vite, Vanilla CSS (Premium Tokens).
*   **Backend**: Spring Boot 3.4, Spring Security (OAuth2 + JWT), Jakarta Validation.
*   **Database**: MySQL.
*   **Design**: Glassmorphism, CSS Variables, Modern Typography.

---

## 🏁 Getting Started

### Prerequisites
*   Java 25+
*   Node.js 18+
*   MySQL 8.0+

### Installation
1.  **Clone the Repository**
2.  **Backend Setup**: 
    *   Configure `application.yml` with your database and Google OAuth credentials.
    *   Run `com.smartcampus.backend.BackendApplication`.
3.  **Frontend Setup**:
    *   Navigate to `/frontend`.
    *   `npm install`
    *   `npm run dev`
4.  **Access**: Open `http://localhost:5173`.

---

**Student Name**: Kumarathunga R C S  
**IT Number**: IT23257054  