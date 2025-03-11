# Changelog

## [Unreleased]

### Added
- Initial project structure with Domain-Driven Design architecture
- Created domain model definition with bounded contexts:
  - Identity and Access: User authentication and profiles
  - Social Graph: User relationships (following/followers)
  - Content: Posts, comments, and likes
  - Discovery: Search and content discovery
- Database setup with SQLite for all required data entities:
  - Users and profiles tables for authentication and user data
  - Posts, comments, and likes tables for content functionality
  - Follows table for social graph relationships
- Database utility functions for CRUD operations
- Domain entities with encapsulated business logic:
  - User: Authentication and user identity management
  - Profile: User profile data management
  - Post: Content creation and management
  - Comment: Discussion functionality
  - Like: Post engagement
  - Follow: Social relationships
- Repository interfaces for all entities following DDD principles
- Repository implementations for SQLite persistence:
  - UserRepository: User data management
  - ProfileRepository: Profile data management
  - PostRepository: Post data management
  - CommentRepository: Comment data management
  - LikeRepository: Like data management
  - FollowRepository: Follow relationship management
- Application services for business logic orchestration:
  - AuthService: Signup, login, token verification
  - ProfileService: Profile management
  - PostService: Post creation, editing, deletion, and engagement
  - CommentService: Comment management
  - FollowService: Follow relationships management
  - SearchService: User search functionality
- API routes for all core functionality:
  - Authentication endpoints (signup, login)
  - User profile endpoints (view, edit)
  - Post endpoints (create, view, edit, delete)
  - Comment endpoints (create, view, edit, delete)
  - Like endpoints (like, unlike)
  - Follow endpoints (follow, unfollow, get followers, get following)
  - Search endpoints (search users)
- JWT-based authentication with middleware for protected routes
- Frontend pages and components:
  - Authentication pages (login, signup)
  - User profile page with follow/unfollow functionality
  - Feed page with pagination for viewing posts
  - Post detail page with comments functionality
  - Post creation page
  - User search functionality
- Responsive UI with TailwindCSS and shadcn/ui components
- Optimistic updates for better user experience
- Accessibility improvements across all components

### Changed
- Updated layout to include navigation bar with authentication state

### Planning and Architecture
- Initial project structure assessment
- Planned DDD approach with defined bounded contexts
- Identified core domain entities and relationships
- Setup project structure following DDD principles

### To Be Implemented
- Complete UI implementation with TailwindCSS and shadcn/ui
- Database initialization script
- Unit and integration tests 