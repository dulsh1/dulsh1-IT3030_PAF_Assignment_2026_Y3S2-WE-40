# Smart Campus Hub - Postman API Collection

This folder contains the complete Postman collection for testing all API endpoints of the Smart Campus Hub application.

## Files

- **Smart_Campus_Hub_API.postman_collection.json** - Complete API collection with all endpoints

## How to Use

### 1. Import the Collection into Postman

1. Open **Postman**
2. Click **Import** (top left)
3. Choose **Upload Files** tab
4. Select `Smart_Campus_Hub_API.postman_collection.json`
5. Click **Import**

### 2. Configure Variables

The collection uses the following variables that need to be configured:

| Variable | Default | Description |
| --- | --- | --- |
| `base_url` | `http://localhost:8080` | Backend API base URL |
| `jwt_token` | `your_jwt_token_here` | JWT authentication token (obtained after login) |
| `google_id_token` | `your_google_id_token_here` | Google OAuth ID token |

**To set variables:**
1. Click the **Variables** tab in the collection
2. Update the `Current Value` for each variable
3. Save the changes

### 3. Authentication Flow

**Step 1: Get Google ID Token**
- Use Google's OAuth 2.0 Playground or your frontend login to obtain an ID token

**Step 2: Authenticate via Google OAuth**
1. Go to **Authentication > Google OAuth Login**
2. Ensure `{{google_id_token}}` variable is set
3. Click **Send**
4. Copy the returned JWT token from the response

**Step 3: Set JWT Token**
1. Click **Variables** tab
2. Paste the JWT token as `jwt_token` value
3. All subsequent requests will use this token

### 4. Endpoint Organization

The collection is organized into logical folders:

#### **Authentication (Module E)**
- Google OAuth Login
- Get Current User
- Logout

#### **Resources (Module A)**
- List All Resources (with filtering)
- Get Resource Details
- Create Resource (ADMIN)
- Update Resource (ADMIN)
- Change Resource Status (ADMIN)
- Delete Resource (ADMIN)

#### **Bookings (Module B)**
- Create Booking
- Get User's Bookings
- Get All Bookings (ADMIN)
- Approve Booking (ADMIN)
- Reject Booking (ADMIN)
- Cancel Booking

#### **Tickets (Module C)**
- Create Ticket
- Get User's Tickets
- Get Ticket Details
- Update Ticket Status (ADMIN/TECHNICIAN)
- Assign Technician (ADMIN)
- Delete Ticket (ADMIN)
- Get All Tickets (ADMIN)
- Get Ticket Statistics (ADMIN)

#### **Ticket Comments (Module C)**
- Add Comment
- Edit Own Comment
- Delete Own Comment

#### **Notifications (Module D)**
- Get User Notifications
- Mark Notification as Read

## Testing Tips

### 1. Common Error Codes
- **401 Unauthorized** - JWT token expired or invalid; re-authenticate
- **403 Forbidden** - User lacks required role (ADMIN/TECHNICIAN)
- **404 Not Found** - Resource ID doesn't exist
- **400 Bad Request** - Invalid request body or parameters
- **409 Conflict** - Business logic conflict (e.g., overlapping booking times)

### 2. Testing Bookings with Conflict Detection
1. Create a booking for resource ID 1 on April 30, 10:00-12:00
2. Try creating another booking for the same resource, overlapping time (e.g., 11:00-13:00)
3. Should receive a conflict error

### 3. Testing Role-Based Access
1. Test ADMIN endpoints with a USER token → Should get 403 Forbidden
2. Test USER endpoints with ADMIN token → Should succeed
3. Verify proper authorization messages

### 4. Testing File Uploads (Tickets)
- When creating tickets, note that attachment uploads use multipart/form-data
- Maximum 3 attachments per ticket
- Supported formats: JPG, PNG, PDF (configure as needed)

### 5. Testing Comment Ownership
1. User A creates a comment on a ticket
2. User A can edit/delete their own comment
3. User B cannot edit/delete User A's comment

## Request Examples

### Example 1: Create Booking with Conflict Detection
```json
{
  "resourceId": 1,
  "startTime": "2026-04-30T10:00:00",
  "endTime": "2026-04-30T12:00:00",
  "purpose": "Team meeting",
  "expectedAttendees": 5
}
```

### Example 2: Create Ticket
```json
{
  "title": "Air conditioning not working",
  "description": "AC unit in Building A Room 101 not cooling properly",
  "category": "MAINTENANCE",
  "priority": "MEDIUM",
  "resourceId": 1,
  "preferredContact": "user@university.edu"
}
```

### Example 3: Reject Booking with Reason
```json
{
  "rejectionReason": "Resource already booked for that time period"
}
```

## Troubleshooting

| Issue | Solution |
| --- | --- |
| 401 Unauthorized on every request | JWT token expired; re-authenticate and update the token |
| 400 Bad Request | Check request body JSON syntax and required fields |
| 403 Forbidden | Verify user has required role (check current user endpoint) |
| 404 Not Found | Check if resource ID exists; list resources first |
| No response from server | Verify backend is running on `{{base_url}}` |

## Notes

- All timestamps should be in ISO 8601 format: `YYYY-MM-DDTHH:MM:SS`
- Role-based endpoints require appropriate user roles (check authorization on each endpoint)
- The collection includes sample request bodies; modify as needed for your data
- For production testing, use a staging environment URL instead of localhost

## Support

For questions about specific endpoints, refer to the main README.md documentation or check the API endpoint specifications table.
