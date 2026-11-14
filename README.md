# LMS App

A mobile Learning Management System. Lecturers create courses, upload materials and run timed quizzes. Students enrol with a key, study, and take quizzes that are marked automatically.

**Stack:** React Native (Expo) · Node.js · Express 5 · MongoDB (Mongoose) · Cloudinary · JWT

## Features (backend)
- Register / login with JWT, roles: student, lecturer, admin
- Admin approves new lecturers
- Courses with an enrol key, enrolment
- Materials: file upload (PDF/Word/PPT to Cloudinary), YouTube videos, links
- Quizzes: draft/publish, answers hidden from students, one timed attempt, auto-marking

## Run the backend
```bash
cd backend
npm install
cp .env.example .env     # then fill in your own values
npm run seed:admin       # creates the admin account
npm run dev              # http://localhost:5001
```

## Main API routes
All routes except register and login need a `Authorization: Bearer <token>` header.

### Auth
| Method | Route | Who |
|---|---|---|
| POST | /api/auth/register | anyone |
| POST | /api/auth/login | anyone |
| GET | /api/auth/me | logged in |

### Users (admin)
| Method | Route | Who |
|---|---|---|
| GET | /api/users/pending-lecturers | admin |
| PUT | /api/users/approve-lecturer/:id | admin |

### Courses
| Method | Route | Who |
|---|---|---|
| GET | /api/courses | logged in |
| POST | /api/courses | lecturer |
| GET | /api/courses/my | student (own courses) |
| GET | /api/courses/:id | logged in |
| PATCH | /api/courses/:id | owner lecturer / admin |
| DELETE | /api/courses/:id | owner lecturer / admin |

### Enrolment
| Method | Route | Who |
|---|---|---|
| POST | /api/courses/:id/enrol | student (with enrol key) |
| DELETE | /api/courses/:id/enrol | student |
| GET | /api/courses/:id/students | owner lecturer / admin |

### Materials
| Method | Route | Who |
|---|---|---|
| GET | /api/courses/:id/materials | owner, admin, enrolled students |
| POST | /api/courses/:id/materials | owner lecturer / admin |
| DELETE | /api/courses/:id/materials/:materialId | owner lecturer / admin |

### Quizzes
| Method | Route | Who |
|---|---|---|
| GET | /api/courses/:id/quizzes | owner, admin, enrolled students (published only) |
| POST | /api/courses/:id/quizzes | owner lecturer / admin |
| GET | /api/quizzes/:quizId | owner, admin, enrolled students (no answers) |
| PATCH | /api/quizzes/:quizId | owner lecturer / admin (unpublished, no attempts) |
| DELETE | /api/quizzes/:quizId | owner lecturer / admin |
| PATCH | /api/quizzes/:quizId/publish | owner lecturer / admin |

### Quiz attempts
| Method | Route | Who |
|---|---|---|
| POST | /api/quizzes/:quizId/start | enrolled student |
| POST | /api/quizzes/:quizId/submit | student |
| GET | /api/quizzes/:quizId/my-attempt | student |
| GET | /api/quizzes/:quizId/attempts | owner lecturer / admin |

## Testing
Open the `postman/collections/LMS API` folder in Postman.

## Author
Abdullah — https://github.com/abdullah-alhar
