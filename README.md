# Job Portal Backend API

A comprehensive RESTful API for a job portal application built with Node.js, Express, and MongoDB.

## 🚀 Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (Job Seeker & Recruiter)
- Secure password hashing with bcrypt
- HTTP-only cookies for token storage

### User Management
- Complete user registration and login
- Profile management with photo upload
- Profile completeness tracking
- Last login tracking
- Account activation/deactivation

### Job Seeker Features
- **Profile Management**
  - Bio and skills
  - Resume upload
  - Work experience tracking
  - Education history
  - Certifications
  - Portfolio links (GitHub, LinkedIn, Website)
  - Language proficiency
  
- **Job Preferences**
  - Preferred job types
  - Desired locations
  - Remote work preferences
  - Salary expectations
  - Availability status

- **Job Application**
  - Apply to jobs
  - Track application status
  - View applied jobs history
  - Save jobs for later

### Recruiter Features
- **Company Profile**
  - Company information
  - Company size and industry
  - Position and department
  
- **Job Management**
  - Post new jobs
  - Edit job listings
  - View applicants
  - Update application status
  
- **Company Management**
  - Create and manage companies
  - Upload company logos
  - Company details

### Security Features
- Helmet.js for security headers
- MongoDB injection prevention
- Input validation and sanitization
- CORS configuration
- Rate limiting ready
- XSS protection

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for file uploads)

## 🛠️ Installation

1. Clone the repository
```bash
git clone <repository-url>
cd jop-partal
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGO_URI=your_mongodb_connection_string

# JWT Configuration
SECRET_KEY=your_jwt_secret_key

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=noreply@jobportal.com
```

4. Start the server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## 📚 API Endpoints

### Authentication

#### Register User
```http
POST /api/v1/user/register
Content-Type: multipart/form-data

{
  "fullname": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "password": "SecurePass123",
  "role": "student",
  "file": <profile_photo>
}
```

#### Login
```http
POST /api/v1/user/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "student"
}
```

#### Logout
```http
GET /api/v1/user/logout
```

### User Profile

#### Get Profile
```http
GET /api/v1/user/profile
Authorization: Bearer <token>
```

#### Update Basic Profile
```http
POST /api/v1/user/profile/update
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "fullname": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "bio": "Experienced developer",
  "skills": "JavaScript,React,Node.js",
  "file": <resume_file>
}
```

#### Update Profile Photo
```http
POST /api/v1/user/profile/photo
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "file": <photo_file>
}
```

#### Update Experience (Job Seekers)
```http
POST /api/v1/user/profile/experience
Authorization: Bearer <token>
Content-Type: application/json

{
  "experience": [
    {
      "title": "Software Developer",
      "company": "Tech Corp",
      "location": "New York",
      "startDate": "2020-01-01",
      "endDate": "2022-12-31",
      "current": false,
      "description": "Developed web applications"
    }
  ]
}
```

#### Update Education (Job Seekers)
```http
POST /api/v1/user/profile/education
Authorization: Bearer <token>
Content-Type: application/json

{
  "education": [
    {
      "institution": "University Name",
      "degree": "Bachelor of Science",
      "fieldOfStudy": "Computer Science",
      "startDate": "2016-09-01",
      "endDate": "2020-06-01",
      "grade": "3.8 GPA"
    }
  ]
}
```

#### Update Portfolio (Job Seekers)
```http
POST /api/v1/user/profile/portfolio
Authorization: Bearer <token>
Content-Type: application/json

{
  "portfolio": {
    "website": "https://johndoe.com",
    "github": "https://github.com/johndoe",
    "linkedin": "https://linkedin.com/in/johndoe"
  }
}
```

#### Update Preferences (Job Seekers)
```http
POST /api/v1/user/profile/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "preferences": {
    "jobTypes": ["Full-time", "Remote"],
    "locations": ["New York", "Remote"],
    "remoteWork": true,
    "salaryExpectation": {
      "min": 80000,
      "max": 120000,
      "currency": "USD"
    },
    "availability": "Immediate"
  }
}
```

#### Update Recruiter Profile
```http
POST /api/v1/user/profile/recruiter
Authorization: Bearer <token>
Content-Type: application/json

{
  "companyName": "Tech Corp",
  "companyWebsite": "https://techcorp.com",
  "companySize": "51-200",
  "industry": "Technology",
  "position": "HR Manager",
  "department": "Human Resources"
}
```

### Jobs

#### Get All Jobs
```http
GET /api/v1/job/get?keyword=developer
```

#### Get Job by ID
```http
GET /api/v1/job/get/:id
```

#### Post Job (Recruiters)
```http
POST /api/v1/job/post
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Senior Developer",
  "description": "We are looking for...",
  "requirements": "JavaScript,React,Node.js",
  "salary": 100000,
  "location": "New York",
  "jobType": "Full-time",
  "experience": 5,
  "position": 2,
  "companyId": "company_id_here"
}
```

#### Get Admin Jobs (Recruiters)
```http
GET /api/v1/job/getadminjobs
Authorization: Bearer <token>
```

### Applications

#### Apply for Job
```http
GET /api/v1/application/apply/:jobId
Authorization: Bearer <token>
```

#### Get Applied Jobs
```http
GET /api/v1/application/get
Authorization: Bearer <token>
```

#### Get Applicants (Recruiters)
```http
GET /api/v1/application/:jobId/applicants
Authorization: Bearer <token>
```

#### Update Application Status (Recruiters)
```http
POST /api/v1/application/status/:applicationId/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "accepted"
}
```

### Companies

#### Register Company
```http
POST /api/v1/company/register
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Tech Corp",
  "description": "Leading tech company",
  "website": "https://techcorp.com",
  "location": "New York"
}
```

#### Get Companies
```http
GET /api/v1/company/get
Authorization: Bearer <token>
```

#### Get Company by ID
```http
GET /api/v1/company/get/:id
Authorization: Bearer <token>
```

#### Update Company
```http
PUT /api/v1/company/update/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "name": "Tech Corp",
  "description": "Updated description",
  "website": "https://techcorp.com",
  "location": "New York",
  "file": <logo_file>
}
```

## 🏗️ Project Structure

```
jop-partal/
├── controllers/          # Request handlers
│   ├── user.controller.js
│   ├── job.controller.js
│   ├── company.controller.js
│   └── application.controller.js
├── middlewares/          # Custom middleware
│   ├── isAuthenticated.js
│   ├── mutler.js
│   ├── validation.js
│   └── error.js
├── models/              # Database models
│   ├── user.model.js
│   ├── job.model.js
│   ├── company.model.js
│   └── application.model.js
├── routes/              # API routes
│   ├── user.route.js
│   ├── job.route.js
│   ├── company.route.js
│   └── application.route.js
├── utils/               # Utility functions
│   ├── db.js
│   ├── cloudinary.js
│   ├── datauri.js
│   ├── errorHandler.js
│   └── catchAsyncErrors.js
├── .env                 # Environment variables
├── .gitignore
├── index.js            # Entry point
└── package.json
```

## 🔒 Security

- Passwords are hashed using bcrypt
- JWT tokens stored in HTTP-only cookies
- Input validation on all endpoints
- MongoDB injection prevention
- XSS protection with helmet
- CORS configured for specific origins
- Rate limiting ready for implementation

## 📊 Database Schema

### User Model
- Basic info (name, email, phone, password)
- Role (student/recruiter)
- Profile photo
- Bio and skills
- Experience, education, certifications
- Portfolio links
- Job preferences
- Saved jobs
- Profile completeness score

### Job Model
- Title, description, requirements
- Salary, location, job type
- Experience level
- Number of positions
- Company reference
- Applications array

### Company Model
- Name, description
- Website, location
- Logo
- Owner reference

### Application Model
- Job reference
- Applicant reference
- Status (pending/accepted/rejected)
- Timestamps

## 🚀 Deployment

### Environment Variables for Production
Set `NODE_ENV=production` and update CORS settings accordingly.

### Recommended Platforms
- Backend: Render, Railway, Heroku
- Database: MongoDB Atlas
- File Storage: Cloudinary

## 📝 License

ISC

## 👨‍💻 Author

Your Name

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
