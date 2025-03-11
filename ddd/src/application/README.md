# Application Layer

The application layer orchestrates and coordinates the execution of domain logic. It acts as a mediator between the presentation layer (API routes, UI) and the domain layer, orchestrating high-level business flows.

## Services

This layer contains the following services:

### AuthService

Handles user authentication functionality:
- Signup
- Login
- Token verification

### ProfileService

Manages user profiles:
- Get profile by ID or user ID
- Create profile
- Update profile

### PostService

Handles post-related operations:
- Create, read, update, delete posts
- Like/unlike posts
- Get feed/timeline
- Get user's posts

### CommentService

Manages post comments:
- Create, read, update, delete comments
- Get comments for a post
- Count comments on a post

### LikeService

Handles post likes:
- Like/unlike posts
- Count likes on a post
- Check if a user has liked a post

### FollowService

Manages user relationships:
- Follow/unfollow users
- Get followers/following lists
- Check if a user is following another user
- Count followers/following

### SearchService

Provides search functionality:
- Search users by username or display name

## Usage

All services implement the use cases required by the application and orchestrate domain objects to fulfill business requirements. They handle the proper coordination between domain objects, validation, and error handling.

## Design Principles

- Services don't contain business rules - those belong in the domain layer
- Services encapsulate use cases and application-specific logic
- Each service is focused on a specific bounded context or feature area
- Services use repositories to persist and retrieve domain objects 