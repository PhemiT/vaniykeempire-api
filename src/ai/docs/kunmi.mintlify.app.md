> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://kunmi.mintlify.app/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://kunmi.mintlify.app/introduction#content-area)

## [​](https://kunmi.mintlify.app/introduction\#what-is-vaniyk-empire-api)  What is Vaniyk Empire API?

Vaniyk Empire API is a full-featured digital content marketplace platform that enables creators to sell premium content (videos, PDFs, and other digital assets) to users. Built with modern technologies, it provides secure authentication, seamless payments, and robust content management.The API handles everything from user registration and authentication to content purchases and access control, making it easy to build a complete digital marketplace experience.

## [​](https://kunmi.mintlify.app/introduction\#key-features)  Key Features

## Supabase Authentication

Secure JWT-based authentication powered by Supabase with support for email/password login, email verification, and password reset flows.

## Stripe Payments

Integrated Stripe payment processing with webhook support for automatic purchase confirmation and access management.

## Content Management

Upload and manage videos, PDFs, and other digital content with Cloudinary integration for optimized storage and delivery.

## Access Control

Granular permissions system that ensures users can only access content they’ve purchased, with admin roles for content creators.

## [​](https://kunmi.mintlify.app/introduction\#how-it-works)  How It Works

The Vaniyk Empire API follows a simple workflow:

1

User Registration

Users sign up with email and password. The system creates accounts in both Supabase (for authentication) and MongoDB (for application data).

2

Browse Content

Users can browse published content, view details, and filter by category, type, or price range without authentication.

3

Purchase Content

Authenticated users create payment intents through Stripe to purchase content. Payments are processed securely via Stripe’s hosted payment flow.

4

Access Content

After successful payment confirmation via webhook, users gain permanent access to their purchased content and can stream or download it.

## [​](https://kunmi.mintlify.app/introduction\#technology-stack)  Technology Stack

The API is built with proven technologies that prioritize security, scalability, and developer experience.

- **Runtime**: Node.js with Express 5.2.1
- **Authentication**: Supabase Auth with JWT tokens
- **Database**: MongoDB with Mongoose ODM
- **Payments**: Stripe Payment Intents API
- **File Storage**: Cloudinary for media assets
- **Session Management**: Supabase session handling

## [​](https://kunmi.mintlify.app/introduction\#api-architecture)  API Architecture

The API is organized into several key modules:

```
/api/auth         → Authentication endpoints (signup, login, profile)
/api/content      → Content browsing and access
/api/categories   → Content categorization
/api/payments     → Payment processing and webhooks
```

All authenticated endpoints require a valid JWT token in the `Authorization` header with the `Bearer` scheme.

## [​](https://kunmi.mintlify.app/introduction\#core-concepts)  Core Concepts

### [​](https://kunmi.mintlify.app/introduction\#dual-database-architecture)  Dual Database Architecture

The API uses both Supabase and MongoDB:

- **Supabase**: Handles authentication, session management, and JWT token generation
- **MongoDB**: Stores application data including user profiles, content metadata, purchases, and categories

This architecture combines Supabase’s robust authentication features with MongoDB’s flexibility for complex business logic.

### [​](https://kunmi.mintlify.app/introduction\#purchase-based-access)  Purchase-Based Access

Content files are protected and only accessible after purchase:

1. Public endpoints show content metadata (title, description, price) but not file URLs
2. Users create payment intents to purchase specific content
3. Stripe webhooks confirm successful payments
4. Authenticated users can then access their purchased content via the `/api/content/:contentId/access` endpoint

### [​](https://kunmi.mintlify.app/introduction\#role-based-permissions)  Role-Based Permissions

The API supports two user roles:

- **User**: Can browse, purchase, and access content
- **Admin**: Can create, update, delete content and manage all purchases

## [​](https://kunmi.mintlify.app/introduction\#getting-started)  Getting Started

[**Quickstart Guide** \\
\\
Get up and running in 5 minutes with a complete example](https://kunmi.mintlify.app/quickstart)

[**Authentication** \\
\\
Learn how to authenticate users and secure API requests](https://kunmi.mintlify.app/authentication)

[**API Reference** \\
\\
Explore all available endpoints and parameters](https://kunmi.mintlify.app/api/auth/signup)

[**Webhooks** \\
\\
Set up Stripe webhooks for payment processing](https://kunmi.mintlify.app/guides/webhooks)

## [​](https://kunmi.mintlify.app/introduction\#base-url)  Base URL

The API is hosted at:

```
https://api.vaniykempire.com
```

All API requests must be made over HTTPS. HTTP requests will be rejected.

## [​](https://kunmi.mintlify.app/introduction\#rate-limiting)  Rate Limiting

The API implements rate limiting to ensure fair usage:

- **Public endpoints**: 100 requests per 15 minutes
- **Authenticated endpoints**: 1000 requests per 15 minutes
- **Admin endpoints**: 5000 requests per 15 minutes

## [​](https://kunmi.mintlify.app/introduction\#support)  Support

Need help? Here are your options:

- Check the [API Reference](https://kunmi.mintlify.app/api/auth/signup) for endpoint documentation
- Contact support at [support@vaniykempire.com](mailto:support@vaniykempire.com)