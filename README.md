# LMS App

A mobile Learning Management System. Lecturers create courses, upload materials and run timed quizzes. Students enrol with a key, study, and take quizzes that are marked automatically.

**Stack:** React Native (Expo) · Node.js · Express 5 · MongoDB (Mongoose) · Cloudinary · JWT

## Project structure

```text
backend/   Express API, database models, authentication, and file handling
mobile/    Expo React Native app for iPhone and Android (the frontend)
postman/   API requests for manual testing
```

There is one client application, so it lives in `mobile/`. A separate `frontend/` folder is only needed if this project later gets a web app too.

## Features (backend)
- Register / login with JWT, roles: student, lecturer, admin
- Admin approves new lecturers
- Courses with an enrol key, enrolment
- Materials: file upload (PDF/Word/PPT to Cloudinary), YouTube videos, links
- Quizzes: draft/publish, answers hidden from students, one timed attempt, auto-marking
- Assignments: lecturers set deadlines and marks; students submit text or files; lecturers grade with feedback

## Run the backend
```bash
cd backend
npm install
cp .env.example .env     # then fill in your own values
npm run seed:admin       # creates the admin account
npm run dev              # http://localhost:5001
```

## Run the mobile app

In a second terminal, from the repository root:

```bash
cd mobile
npm install
```

Set `EXPO_PUBLIC_API_URL` in `mobile/.env` to the backend address followed by `/api`. On a physical phone, use your Mac's current local network IP instead of `localhost`, for example `http://192.168.1.20:5001/api`. The phone and Mac must be on the same network, and the backend must be running.

Then start Expo:

```bash
npx expo start
```

Scan the QR code with Expo Go. After changing `mobile/.env`, restart Expo so it loads the new address.

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

### Assignments
| Method | Route | Who |
|---|---|---|
| GET | /api/courses/:id/assignments | course owner, admin, enrolled students |
| POST | /api/courses/:id/assignments | course owner lecturer / admin |
| GET | /api/assignments/:assignmentId | course owner, admin, enrolled students |
| PATCH | /api/assignments/:assignmentId | course owner lecturer / admin |
| DELETE | /api/assignments/:assignmentId | course owner lecturer / admin |
| POST | /api/assignments/:assignmentId/submit | enrolled student (before deadline) |
| GET | /api/assignments/:assignmentId/my-submission | enrolled student |
| GET | /api/assignments/:assignmentId/submissions | course owner lecturer / admin |
| PATCH | /api/assignments/submissions/:submissionId/grade | course owner lecturer / admin |

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
