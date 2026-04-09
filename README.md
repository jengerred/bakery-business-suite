# 🧁 Bakery Business Suite
A Modular, Full‑Stack System for Running an Entire Bakery Operation
<br>

![Status](https://img.shields.io/badge/status-active-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Stripe](https://img.shields.io/badge/Stripe-Integrated-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)
![License](https://img.shields.io/badge/license-MIT-lightgrey) <br>
<br>

# 📌 Repository Description
This repository is the master monorepo for the Bakery Business Suite — a scalable, modular system designed to run every part of a bakery business, including:

- POS (cashier‑facing)
- Manager Dashboard
- Inventory & Ingredient Tracking
- Employee System
- Scheduling & Payroll
- Customer Rewards
- Analytics & Reporting
- Online Ordering
- In‑Store Kiosk
- Kitchen Display System

Each module is designed to be independent, extensible, and production‑ready, following clean architecture principles.  
<br>

## 🧭 SDLC Phase & Progress Tracker
This project follows a full SDLC lifecycle. Below is the current status.

### SDLC Phase (Current)
**SDLC Phase 4 — Implementation (Iterative MVP Build)**
<br>

### Completed SDLC Work
🟢 **Planning**  
Defined scope, goals, constraints, and bakery‑specific requirements.  
<br>

🟢 **Analysis**  
Identified functional requirements, workflows, and data needs.  
<br>

🟢 **Design**  
Created ERD, workflows, UI architecture, and module boundaries.  
<br>

🟡 **Implementation (Current)**  
Building POS MVP, Online Ordering MVP, Manager Dashboard, and shared architecture.  
<br>

⚪ **Testing (Upcoming)**  
Unit tests, integration tests, UI tests, payment flow tests.  
<br>

⚪ **Deployment (Upcoming)**  
Deploy to Vercel + backend services (Railway dev → Azure production).  
<br>

⚪ **Maintenance (Future)**  
Add new modules, fix bugs, optimize performance.  
<br>

| Module | Status | Notes |
| --- | --- | --- |
| **POS System** | 🟡 In Progress | Basic mockup UI + Stripe checkout working; needs customer login, employee login, loyalty |
| **Manager Dashboard** | 🟡 In Progress | Basic UI shell; real data + charts not implemented yet |
| **Inventory System** | ⚪ Not Started | Ingredient deduction + real‑time tracking |
| **Employee System** | ⚪ Not Started | Login, roles, time tracking |
| **Scheduling & Payroll** | ⚪ Not Started | Manager‑facing |
| **Customer Rewards** | ⚪ Not Started | Loyalty points + history |
| **Online Ordering** | 🟡 In Progress | Basic mockup UI + Stripe checkout working; needs customer login, loyalty, order history |
| **In‑Store Kiosk** | ⚪ Not Started | Touch‑friendly ordering |
| **Kitchen Display System** | ⚪ Not Started | Order queue for kitchen |
| **Cloud Backend** | 🟡 In Progress | C#/.NET 8 API, Supabase PostgreSQL, Railway dev → Azure prod |
<br>

## 🛠️ Current Modules

### ✔ POS System (In Progress)
Located in `/app/pos` (subtree)
<br>

 👉 Repo: https://github.com/jengerred/bakery-pos
<br>

**A cashier‑facing POS**
<br>

**Current state:**
- Basic mockup UI (will continue to evolve)
- Product grid
- Cart system
- Checkout modal
- Stripe payments fully working
- Receipt printing
- Reader simulation

**Not yet implemented:**
- Customer login
- Loyalty system
- Employee login
- Inventory tracking
- Search 

<br>

### ✔ Online Ordering (In Progress)
Located in `/app/shop` (subtree)
 <br>

👉 Repo: https://github.com/jengerred/bakery-shop

**Current state:**
- Basic mockup UI (will continue to evolve)
- Product listing (live from backend)
- Stripe checkout working
- Connected to Railway backend
- Order history

**Not yet implemented:**
- Customer login
- Loyalty integration
- Category filtering 
- Inventory tracking
- Search 
<br>

### ✔ Manager Dashboard (Placeholder)
Located in `/app/manager`

**Current state:**
- Phase 1 UI shell only
- Summary cards + layout
- Placeholder data

**Not yet implemented:**
- Real metrics
- Charts
- Inventory alerts
- Employee performance

<br>

## 🧱 Architecture Overview
### High‑Level ASCII Architecture Diagram

```txt
                   ┌──────────────────────────────┐
                   │      Bakery Business Suite   │
                   └──────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐  
        │                       │                       │   
┌──────────────┐      ┌────────────────┐       ┌──────────────────┐  
│   POS (UI)   │      │ Manager Dash   │       │  Online Ordering │  
│ Next.js/TS   │      │ Next.js/TS     │       │ Next.js/TS       │ 
└──────────────┘      └────────────────┘       └──────────────────┘ 
        │                       │                       │
        └──────────────┬────────┴──────────────┬────────┘
                       ▼                       ▼
              ┌──────────────────────────┐
              │  API Layer               │
              │  C# / .NET 8 Web API     │
              │  Railway (Dev/Staging)   │
              │  Azure (Production)      │
              └──────────────────────────┘
                       │
                       ▼
              ┌──────────────────────────┐
              │ Supabase PostgreSQL DB   │
              │ Core Business Data       │
              └──────────────────────────┘
```
<br>

## 🚀 Roadmap

### Phase 1 — POS + Online Ordering (Current)
🟡 **POS UI complete (basic mockup — will continue to evolve and expand)**  
🟡 **Online shop UI complete (basic mockup — will continue to evolve and expand)**  
⚪ Customer login  
⚪ Employee login  
⚪ Cart + checkout  
⚪ Loyalty integration  
<br>

### Phase 2 — Inventory System
⚪ Ingredient deduction  
⚪ Real‑time inventory  
⚪ Auto‑reorder logic  
⚪ Ingredient usage analytics  
<br>

### Phase 3 — Employee System
⚪ Login system  
⚪ Hours tracking  
⚪ Role permissions  
<br>

### Phase 4 — Manager Dashboard Expansion
⚪ Sales charts  
⚪ Inventory alerts  
⚪ Employee performance  
⚪ Scheduling  
⚪ Payroll  
<br>

### Phase 5 — Customer Features
⚪ Rewards  
⚪ Order history  
⚪ Messaging  
<br><br>

## 📸 Screenshots (Coming Soon)
- POS UI  
- Checkout modal  
- Receipt  
- Manager Dashboard  
- Online Shop  
<br>

## 🤝 Contributing
Contributions are welcome!  
To contribute:

1. Fork the repository  
2. Create a feature branch  
3. Commit your changes  
4. Open a pull request  

Please follow clean architecture principles and modular design patterns.  
<br>

## 🧑‍💻 Tech Stack
- Next.js 14  
- React  
- TypeScript  
- TailwindCSS  
- Stripe Elements  
- C# / .NET 8 Backend  
- Supabase PostgreSQL (core business data)  
<br>

## 📝 License
MIT License  
<br>

## 👩‍💻 Author
Jennifer Gerred  
Full‑stack developer specializing in modular, scalable business systems.  
<br>

