# Agent Tests

## Purpose

This repository is designed to test and compare the capabilities of the Cursor Agent when tasked with creating a "Social Media Application with Posting Functionality" under various conditions. The goal is to analyze how different specifications and constraints affect the quality, functionality, and implementation of the resulting applications.

## Methodology

Multiple instances of Cursor Agent will be prompted to create social media applications with similar core functionality but under different constraints and specifications. We will then compare the outcomes to identify patterns, strengths, and limitations in the agent's capabilities.

## Test Conditions

Various conditions that may be tested include:
- Different technology stacks (React, Vue, Svelte, etc.)
- Different database approaches (SQL, NoSQL, ORM usage)
- Different levels of specification detail
- Time constraints
- Feature set variations
- Architecture requirements
- Performance expectations
- Security requirements

For the initial experiment, we will test the following specific conditions:
1. No specific development methodology instructions
2. Test-Driven Development (TDD) approach
3. SOLID principles implementation
4. Domain-Driven Design (DDD) based on Eric Evans' methodology

## Evaluation Criteria

The resulting applications will be evaluated based on:
- Code quality and structure
- Functionality completeness
- Adherence to specifications
- Performance
- Security implementation
- Scalability considerations
- User experience design
- Testing coverage

## Experiment Procedure

1. Create a boilerplate project with basic requirements for a social media application
2. For each test condition:
   - Copy the boilerplate to a new directory
   - Configure the `.cursor/rules` file with the specific instructions for that condition
   - Open the directory in a new Cursor window (to ensure the experiment context isn't carried over)
   - Instruct the Cursor Composer Agent to implement the requirements specified in the README.md
   - Accept all changes and requests made by the Agent without human intervention
   - End the experiment when the Agent responds with "Yes" to the question: "Have all the requirements in README.md been fulfilled? Answer with Yes/No only"

No human changes will be made during the experiment process (except for the initial boilerplate and `.cursor/rules` configuration).

## Standardized Prompts

To ensure consistency across experiments, the following standardized prompts will be used with the Cursor Agent:

### 1. Initial Development Prompt
```
Please implement the social media application according to the requirements in the README.md. Follow the technology stack and requirements exactly as specified. As you work, please explain your approach and implementation decisions. Create the necessary files and implement the core functionality systematically.
```

### 2. Chat Reset Prompt
```
The conversation window has become too long. Let's continue the development of the social media application. Please review what you've completed so far, identify what still needs to be implemented according to the README.md requirements, and continue from where you left off.
```

### 3. Completion Check Prompt
```
Have all the requirements in README.md been fulfilled? Please review the implementation against each requirement listed in the README.md and answer with Yes/No only.
```

## Results

Results and analysis will be documented as the experiments progress.

## Repository Structure

Each experiment will be contained in a separate directory at the root level with clear documentation of the conditions and specifications provided to the agent.
