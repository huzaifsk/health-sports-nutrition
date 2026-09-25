> This document is the **sole source of truth** for this project. It is the PRD as originally
> given, with the product renamed from "NutriForge" to **PeakProtein** per the decision made at
> kickoff (2026-09-26). Implementation status/phasing notes are not tracked in this file — see
> `git log` and the repo structure for current build state.

# PRD — PeakProtein

**Product:** PeakProtein
**Type:** Headless Protein E-Commerce & Commerce Management Platform
**Architecture:** Next.js + WooCommerce
**Primary Market:** Protein / sports nutrition e-commerce
**Initial Region:** India
**Primary Goal:** Build a production-style, WooCommerce-powered commerce platform with a completely custom frontend and advanced administration experience.

---

# 1. Product Vision

PeakProtein is a premium protein-commerce platform consisting of:

```text
                         PEAKPROTEIN
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
    Marketing Site      Storefront          Admin
          │                  │                  │
     Landing Page        Shopping           Operations
     About               Products            Dashboard
     Education           Cart                Inventory
     Offers              Checkout            Orders
                         Account             Customers
                             │
                             └────────┐
                                      ↓
                              Commerce Service
                                      │
                                      ↓
                               WooCommerce
                                      │
                         ┌────────────┼────────────┐
                         │            │            │
                      Products      Orders      Payments
                         │            │            │
                         └────────────┼────────────┘
                                      │
                                  WordPress
```

WooCommerce is the **commerce source of truth**.

PeakProtein provides the custom experience around it.

---

# 2. Product Objectives

### Primary

* Build a complete protein e-commerce storefront.
* Build a premium marketing landing page.
* Use WooCommerce for commerce operations.
* Create a custom Next.js frontend.
* Build a custom admin dashboard.
* Implement application-level RBAC.
* Provide advanced analytics.
* Implement custom inventory intelligence.
* Provide a scalable headless architecture.
* Support real payment integration through WooCommerce-compatible payment infrastructure.

### Portfolio Objective

The application should demonstrate:

* Next.js architecture
* React
* TypeScript
* Headless commerce
* API architecture
* WooCommerce integration
* RBAC
* caching
* server/client state separation
* payments
* inventory systems
* analytics
* performance optimization
* testing
* CI/CD

---

# 3. Technology Stack

## Frontend

```text
Next.js
React
TypeScript
TailwindCSS
shadcn/ui
TanStack Query
React Hook Form
Zod
Zustand
```

## Commerce

```text
WooCommerce
WordPress
WooCommerce REST API
WooCommerce Webhooks
WooCommerce Payment Gateway
```

## Application Backend

```text
Node.js
TypeScript
Fastify / Express
```

The backend acts as a **BFF / integration layer** where required rather than exposing WooCommerce credentials directly to the browser.

## Application Database

Use PostgreSQL for PeakProtein-specific data:

```text
User permissions
Audit logs
Analytics events
CMS configuration
Application settings
```

WooCommerce remains the source of truth for:

```text
Products
Orders
Customers
Inventory
Coupons
Payments
Shipping
```

## Tooling

```text
pnpm
Turborepo
GitHub
GitHub Actions
Playwright
Vitest
ESLint
Prettier
```

---

# 4. System Architecture

```text
                         Browser
                            │
                            ↓
                    Next.js Application
                            │
             ┌──────────────┼──────────────┐
             │              │              │
          Landing       Storefront       Admin
             │              │              │
             └──────────────┼──────────────┘
                            │
                            ↓
                    Commerce Service
                            │
              ┌─────────────┴─────────────┐
              │                           │
       WooCommerce API              Application API
              │                           │
              ↓                           ↓
       WooCommerce                   PostgreSQL
              │
       ┌──────┼──────┐
       │      │      │
    Orders Products Payments
```

---

# 5. Monorepo Structure

```text
peakprotein/
│
├── apps/
│   ├── web/
│   │   ├── landing/
│   │   ├── storefront/
│   │   └── account/
│   │
│   ├── admin/
│   │
│   └── api/
│
├── packages/
│   ├── ui/
│   ├── auth/
│   ├── woo-commerce/
│   ├── commerce/
│   ├── analytics/
│   ├── permissions/
│   ├── validation/
│   ├── config/
│   └── types/
│
├── docs/
│
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

---

# 6. User Types

## Customer

Can:

* browse products
* search
* filter
* add products to cart
* checkout
* pay
* manage addresses
* view orders
* track orders
* download invoices
* manage wishlist
* submit reviews

## Super Admin

Full access.

## Store Manager

Can manage:

* products
* orders
* customers
* discounts
* analytics

## Inventory Manager

Can manage:

* stock
* inventory adjustments
* inventory analytics
* low-stock settings

## Order Manager

Can manage:

* orders
* shipments
* returns
* refunds

## Marketing Manager

Can manage:

* landing page content
* promotions
* featured products
* campaigns
* blog/educational content

## Support Agent

Can:

* view customers
* view orders
* assist customers

---

# 7. RBAC

Permission structure:

```text
resource.action
```

Examples:

```text
products.read
products.create
products.update
products.delete

orders.read
orders.update
orders.refund

inventory.read
inventory.adjust

customers.read
customers.update

content.read
content.update

analytics.read
users.manage
roles.manage
```

Backend permissions are authoritative.

Frontend permissions control visibility and UX only.

---

# 8. Marketing Website

The landing page is a major product surface.

## Homepage

### Hero

```text
Premium protein.
Built for your next level.

[Shop Protein]
[Explore Products]
```

Features:

* product imagery
* CTA
* animated elements
* trust indicators

### Featured Products

Dynamic WooCommerce products.

```text
Best Sellers

Product
Rating
Price
Discount
Add to Cart
```

### Product Categories

```text
Whey Protein
Protein Isolate
Plant Protein
Creatine
Mass Gainer
Pre-Workout
```

### Brand Benefits

```text
Quality Ingredients
Transparent Nutrition
Secure Payments
Fast Delivery
```

### Promotional Section

Admin-controlled.

```text
20% OFF
FIRST ORDER

FIRST20

[Shop Now]
```

### Education

```text
Whey vs Isolate
How much protein do you need?
When should you take creatine?
```

### Testimonials

Connected to approved customer reviews or manually managed testimonials.

### FAQ

Dynamic content.

### Newsletter

Email subscription interface.

### Footer

Links to:

* Shop
* Categories
* About
* Contact
* FAQ
* Shipping
* Returns
* Privacy
* Terms

---

# 9. Storefront

## Product Listing

Features:

* search
* category filtering
* brand filtering
* price filtering
* dietary filtering
* availability
* rating
* sorting
* pagination

Sorting:

```text
Relevance
Price Low → High
Price High → Low
Newest
Best Selling
Rating
```

---

# 10. Product Detail

Display:

```text
Product Images
Product Name
Rating
Reviews
Price
MRP
Discount
Variants
Stock
Quantity
Add to Cart
Buy Now
```

Additional sections:

```text
Description
Nutrition Facts
Ingredients
Allergens
Usage Instructions
Storage
Reviews
FAQs
Related Products
```

---

# 11. Product Variants

WooCommerce variable products should be supported.

Example:

```text
Whey Protein

Chocolate
├── 1kg
└── 2kg

Vanilla
├── 1kg
└── 2kg
```

Each variation may have:

* SKU
* price
* stock
* weight
* image

---

# 12. Shopping Cart

Cart must support:

* quantity changes
* variant changes
* remove item
* coupon
* subtotal
* discount
* shipping estimate
* taxes
* final total

Cart data should remain synchronized with WooCommerce.

---

# 13. Checkout

Checkout flow:

```text
Cart
 ↓
Customer Information
 ↓
Address
 ↓
Shipping
 ↓
Payment
 ↓
Order Confirmation
```

Fields:

* name
* email
* phone
* address
* city
* state
* pincode

Support saved addresses for logged-in customers.

---

# 14. Payment Architecture

Payment should never be considered successful based solely on frontend state.

```text
Customer
   ↓
Payment Gateway
   ↓
WooCommerce
   ↓
Webhook
   ↓
PeakProtein
   ↓
Order State
```

Payment states:

```text
Pending
Processing
Paid
Failed
Refunded
Partially Refunded
```

The application should use a payment abstraction so payment providers can be replaced later.

---

# 15. Customer Account

Account sections:

```text
Profile
Orders
Addresses
Wishlist
Reviews
Invoices
Returns
Password
```

## Order Details

```text
Order Number
Date
Products
Payment
Shipping
Status
Tracking
Invoice
```

---

# 16. Wishlist

Customers can:

* add product
* remove product
* move to cart
* see price changes
* see stock availability

---

# 17. Product Reviews

Customers can submit:

```text
Rating
Title
Review
Images
```

Display:

```text
Average Rating
Rating Distribution
Verified Purchase
Customer Reviews
```

Admin moderation:

```text
Pending
Approved
Rejected
```

---

# 18. Admin Dashboard

Dashboard KPIs:

```text
Revenue
Orders
Customers
Average Order Value
Conversion Rate
Low Stock
Pending Orders
Refunds
```

Date filters:

```text
Today
7 Days
30 Days
90 Days
Custom
```

Charts:

* revenue
* orders
* customers
* top products
* product categories

---

# 19. Product Management

Admin can:

* create
* edit
* delete
* publish
* unpublish
* duplicate
* categorize
* manage images
* manage variations
* update pricing

Product editor:

```text
General
Pricing
Inventory
Variations
Images
SEO
Nutrition
Shipping
Advanced
```

Data ultimately synchronizes with WooCommerce.

---

# 20. Inventory Management

WooCommerce handles actual stock.

PeakProtein adds an **inventory intelligence layer**.

Dashboard:

```text
Total Stock
Low Stock
Out of Stock
Inventory Value
Fast Moving
Slow Moving
```

Inventory history:

```text
Product
Previous Stock
Change
New Stock
Reason
User
Timestamp
```

---

# 21. Inventory Intelligence

Calculate:

```text
Sales Velocity
Average Daily Sales
Days of Inventory Remaining
```

Example:

```text
Whey Chocolate 1kg

Stock: 42
Daily Sales: 5.2
Estimated Remaining: 8 days

Status: Reorder Soon
```

This should be clearly labelled as an application-level calculation rather than replacing WooCommerce inventory logic.

---

# 22. Low Stock System

Admin configures:

```text
Low Stock Threshold
Critical Stock Threshold
```

Dashboard:

```text
LOW STOCK

Whey 1kg       8
Creatine       5
Plant Protein  3
```

---

# 23. Order Management

Admin order table:

```text
Order
Customer
Items
Amount
Payment
Status
Date
```

Filters:

```text
Status
Payment
Date
Customer
Amount
```

Order detail:

```text
Customer
Products
Payment
Shipping
Timeline
Notes
Refunds
```

---

# 24. Order Timeline

Example:

```text
Order Placed
     ↓
Payment Confirmed
     ↓
Processing
     ↓
Packed
     ↓
Shipped
     ↓
Delivered
```

WooCommerce remains responsible for the underlying order state.

---

# 25. Shipping

Support:

* shipping zones
* shipping methods
* shipping charges
* free-shipping threshold
* estimated delivery
* tracking information

Admin can attach:

```text
Courier
Tracking ID
Tracking URL
```

---

# 26. Returns & Refunds

Customer:

```text
Order
 ↓
Select Item
 ↓
Return Reason
 ↓
Submit Request
```

Admin states:

```text
Pending
Approved
Rejected
Received
Refunded
```

Where supported, refund through the WooCommerce/payment provider flow.

---

# 27. Coupons & Promotions

Support WooCommerce coupons plus PeakProtein promotional presentation.

Types:

```text
Percentage
Fixed Amount
Product Discount
Category Discount
Free Shipping
Minimum Order
First Order
```

Admin can schedule:

```text
Start Date
End Date
Usage Limit
Per Customer Limit
```

---

# 28. Landing Page CMS

Marketing Manager can manage:

### Hero

```text
Heading
Description
Image
CTA
Link
```

### Featured Products

Select WooCommerce products.

### Promotional Banner

```text
Title
Description
Coupon
CTA
Start
End
```

### Categories

Select categories.

### Testimonials

Create/edit/delete.

### FAQ

Create/edit/delete/reorder.

### Educational Content

Create articles and nutrition guides.

---

# 29. Analytics

Track:

```text
Revenue
Orders
AOV
Conversion Rate
Product Views
Add-to-Cart
Checkout Starts
Purchases
Cart Abandonment
Customer Retention
```

Funnel:

```text
Product View
    ↓
Add to Cart
    ↓
Checkout
    ↓
Payment
    ↓
Purchase
```

---

# 30. Application Analytics Database

WooCommerce provides commerce data.

PeakProtein additionally stores analytics events:

```text
page_view
product_view
add_to_cart
remove_from_cart
checkout_started
payment_started
purchase
```

Use PostgreSQL for analytics/event data.

---

# 31. Audit Logs

Record sensitive admin operations.

Example:

```text
Admin
Changed product price

Product:
Whey Protein 1kg

Before:
₹2,999

After:
₹2,799

Timestamp:
...
```

Audit:

* product changes
* price changes
* inventory changes
* refunds
* permissions
* content changes
* settings

---

# 32. Notifications

Customer:

```text
Order Confirmation
Payment Confirmation
Shipping Update
Delivery
Refund
```

Admin:

```text
New Order
Low Stock
Payment Failure
Return Request
Refund Request
```

Build notifications behind an abstraction.

---

# 33. SEO

Landing pages and products must support:

* metadata
* canonical URLs
* OpenGraph
* sitemap
* robots.txt
* structured data

Product structured data:

```text
Product
Offer
Review
AggregateRating
```

Next.js should generate metadata dynamically.

---

# 34. Performance

Targets:

```text
Lighthouse Performance: 90+
```

Use:

* Server Components
* static generation where possible
* ISR
* image optimization
* lazy loading
* caching
* pagination
* TanStack Query caching
* optimized API requests

Do not turn the entire storefront into a client-side application.

---

# 35. Security

Implement:

* RBAC
* secure authentication
* API validation
* rate limiting
* input sanitization
* secure cookies
* payment verification
* webhook verification
* secret management
* audit logging

WooCommerce credentials must remain server-side.

---

# 36. API/BFF Layer

Expose PeakProtein-specific APIs where useful.

Example:

```text
/api/products
/api/categories
/api/cart
/api/checkout
/api/orders
/api/customers
/api/inventory
/api/analytics
/api/content
/api/admin
```

Internally:

```text
Next.js
   ↓
BFF/API
   ↓
WooCommerce REST API
```

This avoids exposing WooCommerce implementation details directly to the frontend.

---

# 37. WooCommerce Integration Layer

Create a dedicated package:

```text
packages/woo-commerce/
```

Example services:

```text
ProductService
CategoryService
CartService
OrderService
CustomerService
CouponService
PaymentService
InventoryService
ReviewService
```

The rest of the application should not directly call WooCommerce everywhere.

This creates a clean abstraction:

```text
UI
 ↓
Commerce Service
 ↓
WooCommerce Adapter
 ↓
WooCommerce API
```

---

# 38. Caching Strategy

Cache relatively stable data:

```text
Categories
Products
Product Details
Landing Page Content
```

Short/no cache:

```text
Cart
Checkout
Payment
Order status
Inventory-sensitive operations
```

Invalidate cache using WooCommerce webhooks where appropriate.

---

# 39. WooCommerce Webhooks

Use webhooks for events such as:

```text
Product Updated
Product Deleted
Order Created
Order Updated
Customer Created
Coupon Updated
```

Flow:

```text
WooCommerce
     ↓
Webhook
     ↓
PeakProtein API
     ↓
Invalidate Cache
     ↓
Update Analytics
     ↓
Update Application Data
```

---

# 40. Testing

## Unit

* business utilities
* permissions
* validation
* pricing calculations
* analytics calculations

## Integration

* WooCommerce API integration
* authentication
* webhooks
* payment flow

## E2E

Critical journey:

```text
Landing
 ↓
Product
 ↓
Cart
 ↓
Checkout
 ↓
Payment
 ↓
Order
 ↓
Admin
 ↓
Order Processing
```

Use:

```text
Vitest
React Testing Library
Playwright
```

---

# 41. CI/CD

```text
Pull Request
     │
     ├── ESLint
     ├── TypeScript
     ├── Unit Tests
     ├── Integration Tests
     ├── Build
     └── E2E
           ↓
        Deploy
```

---

# 42. MVP Scope

## Marketing

* Landing page
* Hero
* Featured products
* Categories
* Benefits
* Testimonials
* FAQ
* Promotional banners
* Footer

## Storefront

* Product listing
* Search
* Filters
* Product details
* Variants
* Cart
* Checkout
* Payment
* Customer account
* Orders
* Wishlist
* Reviews

## Admin

* Dashboard
* Products
* Orders
* Inventory
* Customers
* Coupons
* Reviews
* Content
* RBAC
* Audit logs

## Integration

* WooCommerce REST API
* WooCommerce webhooks
* Payment gateway
* PostgreSQL
* Authentication

---

# 43. Phase 2

Add:

* advanced analytics
* inventory forecasting
* returns
* refunds
* invoice generation
* email notifications
* educational CMS
* advanced promotions
* abandoned-cart tracking
* advanced shipping integration

---

# 44. Phase 3

Advanced commerce:

```text
Subscriptions
Bundles
Gift Cards
Loyalty Points
Affiliate System
Multiple Warehouses
Supplier Management
Recurring Orders
Product Recommendations
```

---

# 45. Definition of Done

A customer must be able to:

```text
Visit Landing Page
       ↓
Browse Products
       ↓
Filter/Search
       ↓
View Product
       ↓
Select Variant
       ↓
Add to Cart
       ↓
Checkout
       ↓
Pay
       ↓
Receive Order
       ↓
Track Order
       ↓
Review Product
```

An administrator must be able to:

```text
Login
 ↓
Manage Products
 ↓
Manage Inventory
 ↓
View Orders
 ↓
Process Orders
 ↓
Manage Customers
 ↓
Manage Promotions
 ↓
Manage Content
 ↓
View Analytics
 ↓
Manage Staff Permissions
```

And the entire system must use **WooCommerce as the commerce source of truth**, while PeakProtein provides the custom Next.js experience and additional application capabilities.

---

# 46. Portfolio Positioning

Do not describe this on your CV simply as:

> "Built a protein e-commerce website."

Position it as:

> **PeakProtein — Headless WooCommerce Commerce Platform**

Potential resume bullets after the implementation is actually complete:

> Architected a headless commerce platform using Next.js, TypeScript and WooCommerce, delivering a custom storefront, marketing CMS, customer account system and operations dashboard.

> Implemented application-level RBAC, WooCommerce webhook synchronization, payment lifecycle handling, inventory intelligence, audit logging and event-based commerce analytics.

> Built a performance-focused storefront using Server Components, caching, optimized data fetching and responsive UI, with automated unit, integration and Playwright E2E testing.

That positioning makes the project substantially more relevant to **senior frontend/full-stack frontend roles** than presenting it as a generic online protein store.
