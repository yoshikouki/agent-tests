# API Documentation

This document outlines all the available API endpoints for the social media application.

## Authentication

### Register a New User

- **URL**: `/api/auth/signup`
- **Method**: `POST`
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "username": "user123",
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
- **Success Response**: Status 201
  ```json
  {
    "message": "User registered successfully",
    "user": {
      "id": "123",
      "username": "user123",
      "email": "user@example.com"
    },
    "token": "jwt-token-string"
  }
  ```
- **Error Responses**:
  - Status 400: Missing required fields
  - Status 409: User with this email already exists/Username already taken
  - Status 500: Server error

### Login

- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "emailOrUsername": "user123",
    "password": "securepassword"
  }
  ```
- **Success Response**: Status 200
  ```json
  {
    "message": "Login successful",
    "user": {
      "id": "123",
      "username": "user123",
      "email": "user@example.com"
    },
    "token": "jwt-token-string"
  }
  ```
- **Error Responses**:
  - Status 400: Missing required fields
  - Status 401: Invalid credentials
  - Status 500: Server error

## User Profiles

### Get Current User Profile

- **URL**: `/api/users/me`
- **Method**: `GET`
- **Authentication**: Bearer Token
- **Success Response**: Status 200
  ```json
  {
    "user": {
      "id": "123",
      "username": "user123",
      "email": "user@example.com"
    },
    "profile": {
      "id": "456",
      "displayName": "User Name",
      "bio": "User bio",
      "avatarUrl": "https://example.com/avatar.jpg",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-02T00:00:00.000Z"
    }
  }
  ```
- **Error Responses**:
  - Status 401: Unauthorized
  - Status 404: Profile not found
  - Status 500: Server error

### Update Current User Profile

- **URL**: `/api/users/me`
- **Method**: `PATCH`
- **Authentication**: Bearer Token
- **Request Body**:
  ```json
  {
    "displayName": "Updated Name",
    "bio": "Updated bio",
    "avatarUrl": "https://example.com/new-avatar.jpg"
  }
  ```
- **Success Response**: Status 200/201
  ```json
  {
    "message": "Profile updated successfully",
    "profile": {
      "id": "456",
      "displayName": "Updated Name",
      "bio": "Updated bio",
      "avatarUrl": "https://example.com/new-avatar.jpg",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-03T00:00:00.000Z"
    }
  }
  ```
- **Error Responses**:
  - Status 401: Unauthorized
  - Status 500: Server error

## Posts

### Create a Post

- **URL**: `/api/posts`
- **Method**: `POST`
- **Authentication**: Bearer Token
- **Request Body**:
  ```json
  {
    "content": "This is a new post!"
  }
  ```
- **Success Response**: Status 201
  ```json
  {
    "message": "Post created successfully",
    "post": {
      "id": "789",
      "content": "This is a new post!",
      "userId": "123",
      "createdAt": "2023-01-03T00:00:00.000Z",
      "updatedAt": "2023-01-03T00:00:00.000Z"
    }
  }
  ```
- **Error Responses**:
  - Status 400: Content is required
  - Status 401: Unauthorized
  - Status 500: Server error

### Get Post Feed

- **URL**: `/api/posts?page=1&limit=10`
- **Method**: `GET`
- **Authentication**: Optional
- **Success Response**: Status 200
  ```json
  {
    "posts": [
      {
        "id": "789",
        "content": "This is a post!",
        "userId": "123",
        "createdAt": "2023-01-03T00:00:00.000Z",
        "updatedAt": "2023-01-03T00:00:00.000Z",
        "likeCount": 5,
        "commentCount": 3
      },
      // More posts...
    ],
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
  ```
- **Error Responses**:
  - Status 500: Server error

### Get a Single Post

- **URL**: `/api/posts/{postId}`
- **Method**: `GET`
- **Authentication**: Optional
- **Success Response**: Status 200
  ```json
  {
    "post": {
      "id": "789",
      "content": "This is a post!",
      "userId": "123",
      "createdAt": "2023-01-03T00:00:00.000Z",
      "updatedAt": "2023-01-03T00:00:00.000Z",
      "likeCount": 5,
      "commentCount": 3,
      "userHasLiked": false
    }
  }
  ```
- **Error Responses**:
  - Status 404: Post not found
  - Status 500: Server error

### Update a Post

- **URL**: `/api/posts/{postId}`
- **Method**: `PATCH`
- **Authentication**: Bearer Token
- **Request Body**:
  ```json
  {
    "content": "This is an updated post!"
  }
  ```
- **Success Response**: Status 200
  ```json
  {
    "message": "Post updated successfully",
    "post": {
      "id": "789",
      "content": "This is an updated post!",
      "userId": "123",
      "createdAt": "2023-01-03T00:00:00.000Z",
      "updatedAt": "2023-01-04T00:00:00.000Z"
    }
  }
  ```
- **Error Responses**:
  - Status 400: Content is required
  - Status 401: Unauthorized
  - Status 403: Not authorized to update this post
  - Status 404: Post not found
  - Status 500: Server error

### Delete a Post

- **URL**: `/api/posts/{postId}`
- **Method**: `DELETE`
- **Authentication**: Bearer Token
- **Success Response**: Status 200
  ```json
  {
    "message": "Post deleted successfully"
  }
  ```
- **Error Responses**:
  - Status 401: Unauthorized
  - Status 403: Not authorized to delete this post
  - Status 404: Post not found
  - Status 500: Server error

## Post Interactions

### Like a Post

- **URL**: `/api/posts/{postId}/like`
- **Method**: `POST`
- **Authentication**: Bearer Token
- **Success Response**: Status 200
  ```json
  {
    "message": "Post liked successfully",
    "likeCount": 6
  }
  ```
- **Error Responses**:
  - Status 401: Unauthorized
  - Status 404: Post not found
  - Status 409: Post already liked
  - Status 500: Server error

### Unlike a Post

- **URL**: `/api/posts/{postId}/like`
- **Method**: `DELETE`
- **Authentication**: Bearer Token
- **Success Response**: Status 200
  ```json
  {
    "message": "Post unliked successfully",
    "likeCount": 5
  }
  ```
- **Error Responses**:
  - Status 401: Unauthorized
  - Status 404: Post not liked yet
  - Status 500: Server error

### Add a Comment to a Post

- **URL**: `/api/posts/{postId}/comments`
- **Method**: `POST`
- **Authentication**: Bearer Token
- **Request Body**:
  ```json
  {
    "content": "This is a comment!"
  }
  ```
- **Success Response**: Status 201
  ```json
  {
    "message": "Comment created successfully",
    "comment": {
      "id": "321",
      "content": "This is a comment!",
      "postId": "789",
      "userId": "123",
      "createdAt": "2023-01-04T00:00:00.000Z",
      "updatedAt": "2023-01-04T00:00:00.000Z"
    }
  }
  ```
- **Error Responses**:
  - Status 400: Content is required
  - Status 401: Unauthorized
  - Status 404: Post not found
  - Status 500: Server error

### Get Comments for a Post

- **URL**: `/api/posts/{postId}/comments?page=1&limit=10`
- **Method**: `GET`
- **Authentication**: Optional
- **Success Response**: Status 200
  ```json
  {
    "comments": [
      {
        "id": "321",
        "content": "This is a comment!",
        "postId": "789",
        "userId": "123",
        "createdAt": "2023-01-04T00:00:00.000Z",
        "updatedAt": "2023-01-04T00:00:00.000Z"
      },
      // More comments...
    ],
    "total": 20,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
  ```
- **Error Responses**:
  - Status 404: Post not found
  - Status 500: Server error

### Update a Comment

- **URL**: `/api/comments/{commentId}`
- **Method**: `PATCH`
- **Authentication**: Bearer Token
- **Request Body**:
  ```json
  {
    "content": "This is an updated comment!"
  }
  ```
- **Success Response**: Status 200
  ```json
  {
    "message": "Comment updated successfully",
    "comment": {
      "id": "321",
      "content": "This is an updated comment!",
      "postId": "789",
      "userId": "123",
      "createdAt": "2023-01-04T00:00:00.000Z",
      "updatedAt": "2023-01-05T00:00:00.000Z"
    }
  }
  ```
- **Error Responses**:
  - Status 400: Content is required
  - Status 401: Unauthorized
  - Status 403: Not authorized to update this comment
  - Status 404: Comment not found
  - Status 500: Server error

### Delete a Comment

- **URL**: `/api/comments/{commentId}`
- **Method**: `DELETE`
- **Authentication**: Bearer Token
- **Success Response**: Status 200
  ```json
  {
    "message": "Comment deleted successfully"
  }
  ```
- **Error Responses**:
  - Status 401: Unauthorized
  - Status 403: Not authorized to delete this comment
  - Status 404: Comment not found
  - Status 500: Server error

## User Relationships

### Follow a User

- **URL**: `/api/follows`
- **Method**: `POST`
- **Authentication**: Bearer Token
- **Request Body**:
  ```json
  {
    "userId": "456"
  }
  ```
- **Success Response**: Status 200
  ```json
  {
    "message": "Successfully followed user",
    "followerCount": 10,
    "followingCount": 5
  }
  ```
- **Error Responses**:
  - Status 400: User ID to follow is required / Cannot follow yourself
  - Status 401: Unauthorized
  - Status 404: User not found
  - Status 409: Already following this user
  - Status 500: Server error

### Unfollow a User

- **URL**: `/api/follows?userId=456`
- **Method**: `DELETE`
- **Authentication**: Bearer Token
- **Success Response**: Status 200
  ```json
  {
    "message": "Successfully unfollowed user",
    "followerCount": 9,
    "followingCount": 4
  }
  ```
- **Error Responses**:
  - Status 400: User ID to unfollow is required
  - Status 401: Unauthorized
  - Status 404: Not following this user / User not found
  - Status 500: Server error

### Get User's Followers

- **URL**: `/api/users/{userId}/followers?page=1&limit=10`
- **Method**: `GET`
- **Authentication**: Optional
- **Success Response**: Status 200
  ```json
  {
    "followers": [
      {
        "id": "123",
        "username": "user123"
      },
      // More followers...
    ],
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
  ```
- **Error Responses**:
  - Status 404: User not found
  - Status 500: Server error

### Get User's Following

- **URL**: `/api/users/{userId}/following?page=1&limit=10`
- **Method**: `GET`
- **Authentication**: Optional
- **Success Response**: Status 200
  ```json
  {
    "following": [
      {
        "id": "456",
        "username": "user456"
      },
      // More following...
    ],
    "total": 30,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
  ```
- **Error Responses**:
  - Status 404: User not found
  - Status 500: Server error

## Search

### Search for Users

- **URL**: `/api/search/users?q=searchterm&page=1&limit=10`
- **Method**: `GET`
- **Authentication**: Optional
- **Success Response**: Status 200
  ```json
  {
    "users": [
      {
        "id": "123",
        "username": "user123"
      },
      // More users...
    ],
    "total": 15,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
  ```
- **Error Responses**:
  - Status 400: Search query is required / Search query cannot be empty
  - Status 500: Server error 