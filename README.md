# Agent Tests

## Purpose

This repository contains implementations of a "Social Media Application with Posting Functionality" created under various methodological conditions to test and compare the capabilities of the Cursor Agent. The goal is to analyze how different development approaches and methodologies affect the quality, functionality, and implementation of the resulting applications.

## Project Structure

The repository is organized as follows:

- `boilerplate/` - The template project with basic setup and requirements
- `no-instructions/` - Implementation without specific methodology instructions
- `tdd/` - Implementation following Test-Driven Development principles
- `solid/` - Implementation adhering to SOLID design principles
- `ddd/` - Implementation based on Domain-Driven Design methodology

Each directory contains a separate implementation of the same social media application, created according to the specific methodology or approach.

## Test Conditions

For this experiment, we are testing the following specific conditions:
1. **No Instructions** - Basic implementation without specific methodology requirements
2. **Test-Driven Development (TDD)** - Following test-first approach
3. **SOLID Principles** - Adhering to the five SOLID object-oriented design principles
4. **Domain-Driven Design (DDD)** - Based on Eric Evans' methodology

## Application Requirements

Each implementation follows the same core requirements:

### Core Features
1. User authentication (signup, login, logout)
2. User profile management (view, edit)
3. Post creation, editing, and deletion
4. Timeline/feed to display posts from all users
5. Ability to like and comment on posts
6. Simple user search functionality
7. Follow/unfollow functionality
8. Pagination for the timeline/feed

### Technical Requirements
1. Next.js 15 with React 19
2. TailwindCSS 4 and shadcn/ui for styling
3. SQLite for the database
4. Proper API routes for data handling
5. Error handling and validation
6. Basic security measures (password hashing, authentication tokens)
7. API documentation
8. CHANGELOG.md to document changes and implementations

## Evaluation Criteria

The resulting applications are evaluated based on:
- Code quality and structure
- Functionality completeness
- Adherence to specifications
- Performance
- Security implementation
- Scalability considerations
- User experience design
- Testing coverage

## Experiment Process

Each implementation was created by:
1. Starting with the boilerplate project, then copying it to a separate directory and opening each directory in a new Cursor window to ensure the Cursor Agent wasn't aware it was part of a comparative experiment
2. Using the pre-configured `.cursor/rules` files that contained the specific methodology instructions for each implementation
3. Using the Cursor Composer Agent to implement the requirements with the following standardized prompts:
   - Initial Development Prompt: "Please implement the social media application according to the requirements in the README.md. Follow the technology stack and requirements exactly as specified. Feel free to use CHANGELOG.md throughout your work process for planning, refinement, and documenting your progress."
   - Chat Reset Prompt (when conversation window became too long): "The conversation window has become too long. Let's continue the development of the social media application. Please review what you've completed so far, identify what still needs to be implemented according to the README.md requirements, and continue from where you left off."
   - Completion Check Prompt: "Have all the requirements in README.md been fulfilled? Please review the implementation against each requirement listed in the README.md and answer with Yes/No only."
4. Allowing the Agent to work without human intervention, accepting all changes and requests made by the Agent without modification or rejection, until the Agent confirmed that all requirements had been fulfilled

## Results and Analysis

Analysis of the different implementations and their relative strengths and weaknesses will be documented as the experiments conclude.
