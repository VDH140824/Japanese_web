# AI Development Rules

This project is a Japanese Learning Platform.

Technology Stack

Backend

- Java 21
- Spring Boot 3
- Spring Security
- Spring Data JPA
- MySQL
- Maven

Frontend

- React
- Vite
- TypeScript
- TailwindCSS

Database

- MySQL

Architecture

Frontend

React
↓

REST API

↓

Spring Boot

↓

MySQL

===================================

GENERAL RULES

Always follow Clean Architecture.

Never expose Entity directly.

Always use DTO.

Always use Constructor Injection.

Never use Field Injection.

Never use SELECT \*.

Always validate Request DTO.

Always use Global Exception Handler.

Never duplicate business logic.

Always use meaningful names.

===================================

PACKAGE STRUCTURE

controller

service

service.impl

repository

entity

dto.request

dto.response

mapper

security

config

exception

util

===================================

DATABASE

Primary key

id

created_at

updated_at

deleted_at

Use snake_case.

===================================

API

Always use RESTful API.

Response format

{
"success": true,
"message": "...",
"data": {}
}

Error format

{
"success": false,
"message": "...",
"errors": []
}

===================================

SECURITY

JWT Authentication

OAuth2 Google

BCrypt Password

Role-based Authorization

===================================

FRONTEND

Use React Functional Component.

Use TypeScript.

Use TailwindCSS.

No Inline CSS.

Use Axios.

Use TanStack Query.

Use Zustand.

===================================

NAMING

Class

PascalCase

Method

camelCase

Variable

camelCase

Database

snake_case

===================================

When generating code, always follow these rules.
