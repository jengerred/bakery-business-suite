# 🔌 Backend API — Architecture & Implementation Plan
Version 1.0 — C# / .NET 8 + PostgreSQL (Supabase)  
Bakery Business Suite

---

## ⭐ 1. Overview

The backend provides a unified, secure, scalable API for all modules of the Bakery Business Suite:

- POS (cashier‑facing)
- Online Ordering (customer‑facing)
- Manager Dashboard (admin‑facing)
- Customer Accounts & Loyalty
- Inventory System
- Employee System
- Order Processing
- Stripe Payments & Webhooks

The backend is implemented as a C# / .NET 8 REST API connected to a PostgreSQL database hosted on Supabase.
The backend runs across three environments — Local, Development (Railway), and Production (Azure) — all sharing the same codebase and Supabase PostgreSQL database.

All business logic, authentication, and data integrity live in this backend.

---

## ⭐ 2. Tech Stack

### Backend
- C# / .NET 8 Web API
- Entity Framework Core 8
- ASP.NET Identity (customized) or custom JWT auth
- MediatR (optional, for clean CQRS patterns)
- FluentValidation (optional, for request validation)

### Database
- PostgreSQL (Supabase)
- EF Core Migrations
- Row‑level security (RLS) for customer data (optional)

### Auth
- JWT tokens
- Refresh tokens
- Role‑based permissions
- Customer login
- Employee login (PIN or password)

### Integrations
- Stripe Webhooks
- Email (SendGrid or Supabase SMTP)
- Optional: Twilio SMS for order updates

---

## ⭐ 3. Core Data Models

These models form the backbone of the bakery system.

### Customer
- Id  
- Name  
- Email  
- Phone  
- PasswordHash  
- LoyaltyPoints  
- CreatedAt  

### Employee
- Id  
- Name  
- Role (Cashier, Manager, Admin)  
- PinHash (for POS login)  
- PasswordHash (for dashboard login)  
- Active  
- CreatedAt  

### Product
- Id  
- Name  
- Price  
- Category  
- ImageUrl  
- Description  
- Active  

### Order
- Id  
- CustomerId (nullable for guest checkout)  
- EmployeeId (nullable for online orders)  
- Total  
- Method (Pickup / Shipping / In‑Person)  
- Status (Pending, Paid, Preparing, Ready, Completed)  
- CreatedAt  

### OrderItem
- Id  
- OrderId  
- ProductId  
- Quantity  
- PriceAtPurchase  

### Inventory
- ProductId  
- Stock  
- LowStockThreshold  

### LoyaltyTransaction
- Id  
- CustomerId  
- Points  
- Reason  
- CreatedAt  

### TillSession
- Id  
- EmployeeId  
- OpenedAt  
- ClosedAt  
- OpeningAmount  
- ClosingAmount  
- ExpectedAmount  
- Notes  

---

## ⭐ 4. API Endpoints

### Authentication

#### Customers
- POST /auth/customer/register  
- POST /auth/customer/login  
- POST /auth/customer/refresh  

#### Employees
- POST /auth/employee/login (PIN or password)  
- POST /auth/employee/refresh  

---

### Products
- GET /products  
- GET /products/{id}  
- POST /products (manager/admin)  
- PATCH /products/{id} (manager/admin)  
- DELETE /products/{id} (admin)  

---

### Orders

#### POS + Online Ordering
- POST /orders  
- GET /orders/{id}  
- GET /orders/customer/{customerId}  
- GET /orders/today (manager)  
- PATCH /orders/{id}/status  

#### Stripe
- POST /webhooks/stripe  

---

### Customers
- GET /customers/{id}  
- GET /customers/lookup?phone=xxx  
- POST /customers  
- PATCH /customers/{id}  

---

### Employees
- GET /employees (manager/admin)  
- POST /employees (admin)  
- PATCH /employees/{id}  

---

### Inventory
- GET /inventory  
- PATCH /inventory/update  
- GET /inventory/usage  
- GET /inventory/low-stock  

---

### Loyalty
- GET /loyalty/{customerId}  
- POST /loyalty/add  
- POST /loyalty/redeem  

---

### Till Sessions
- POST /till/open  
- POST /till/close  
- GET /till/today  
- GET /till/{id}  

---

## ⭐ 5. Authentication & Authorization

### JWT Tokens
- Access token (15–30 min)  
- Refresh token (7–30 days)  

### Roles
- Customer  
- Cashier  
- Manager  
- Admin  

### Permissions

| Role     | Can Place Orders | Can Manage Products | Can View Reports | Can Manage Employees |
|----------|------------------|---------------------|------------------|----------------------|
| Customer | ✔                | ✘                   | ✘                | ✘                    |
| Cashier  | ✔                | ✘                   | ✘                | ✘                    |
| Manager  | ✔                | ✔                   | ✔                | ✘                    |
| Admin    | ✔                | ✔                   | ✔                | ✔                    |

---

## ⭐ 6. Stripe Integration

### Online Ordering
- PaymentIntent created client‑side  
- Confirmed via Stripe Elements  
- Webhook updates order status  

### POS
- Card reader integration (future)  
- Manual card entry fallback  
- Cash payments tracked in TillSession  

---

## ⭐ 7. Deployment Plan

The backend supports three environments: **Local**, **Development/Staging**, and **Production**.  
Each environment uses the same codebase but different environment variables, deployment targets, and API base URLs.

---

## 🔧 7.1 Environments

### **Local Development**
- Run API with `dotnet run`
- Uses `appsettings.Development.json`
- Connects to Supabase dev database (or local Postgres if needed)
- Frontends point to:
http://localhost:xxxx/api

---

### **Development / Staging — Railway**
**Current primary backend for testing and preview deployments**

- Repo: `bakery-backend`
- Railway auto‑deploys on push to `main` (or `dev`)
- Environment variables stored in Railway:
- `ASPNETCORE_ENVIRONMENT=Production` (or `Staging`)
- `SUPABASE_DB_CONNECTION_STRING`
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- Used by:
- Local frontends for real API testing
- Vercel preview deployments
- QA / staging environment

**API Base URL (example):**
https://bakery-backend-xxxx.up.railway.app/api (bakery-backend-xxxx.up.railway.app in Bing)

---

### **Production — Azure App Service (Planned)**
**Long‑term, business‑grade production backend**

- Deployment target: Azure App Service
- CI/CD options:
  - GitHub Actions → Azure App Service
  - Azure DevOps pipeline
- Separate production environment variables:
  - `ASPNETCORE_ENVIRONMENT=Production`
  - Production Supabase connection string
  - Stripe **live mode** keys
- Railway remains the staging environment

**API Base URL (planned):**
https://api.bakery-suite.com/api


---

## 🗄️ 7.2 Database

### **Primary Database: Supabase PostgreSQL**
- Shared across environments initially
- `public` schema for core tables
- Automated backups enabled
- Optional:
  - Separate schemas for dev/prod
  - Separate Supabase projects later
  - Row‑level security for customer‑facing data

---

## 🚀 7.3 Deployment Flow

### **Short‑Term (Current Workflow)**
1. Develop backend locally  
2. Push to `bakery-backend` repo  
3. Railway auto‑deploys  
4. Test via:
   - Railway API URL
   - Vercel preview deployments  
5. Frontends use Railway as the “live” backend until Azure is ready

---

### **Long‑Term (With Azure Production)**
1. Feature branch → test locally  
2. Merge to `dev` → deploy to Railway (staging)  
3. Promote to `main` → deploy to Azure (production)  
4. Vercel:
   - Preview deployments → Railway  
   - Production deployment → Azure  

---

## 🌐 7.4 Frontend Deployment

### **Platform: Vercel (Next.js)**

Apps:
- `/pos` → POS terminal  
- `/shop` → Online ordering  
- `/manager` (future) → Manager dashboard  

Environment variables:
- `NEXT_PUBLIC_API_BASE_URL`  
  - Local: `http://localhost:xxxx/api`
  - Dev: Railway API URL
  - Prod: Azure API URL

---

## ⭐ 7.5 Summary of Deployment Architecture

| Layer        | Local Dev | Staging (Dev) | Production |
|--------------|-----------|---------------|------------|
| Backend API  | Localhost | Railway       | Azure App Service |
| Database     | Supabase  | Supabase      | Supabase (prod schema or separate project) |
| Frontend     | Localhost | Vercel Preview | Vercel Production |
| Payments     | Stripe Test | Stripe Test | Stripe Live |

This setup provides:
- Fast iteration (Railway)
- Stable production (Azure)
- Clean separation of environments
- Zero downtime deployments
- Clear upgrade path as the bakery gr
### Frontend
- Vercel (Next.js)  

---

## ⭐ 8. Future Enhancements

- Real‑time order updates (SignalR)  
- Kitchen Display System integration  
- SMS notifications  
- Multi‑store support  
- Advanced inventory forecasting  
- Payroll + scheduling module  

---

## ⭐ 9. Summary

This backend architecture is:

- Scalable  
- Secure  
- Enterprise‑grade  
- Perfect for a real bakery  
- Perfect for POS + online ordering  
- Perfect for tutorials  
- Perfect for long‑term growth  