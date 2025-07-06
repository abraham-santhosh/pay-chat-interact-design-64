# MongoDB Migration Documentation

## Overview

The local data storage system has been successfully converted from JSON file storage to MongoDB database. This migration provides better scalability, reliability, and performance for the application.

## What Was Changed

### Before Migration
- **Storage**: Local JSON file (`server/groups.json`)
- **Data Persistence**: File system read/write operations
- **Scalability**: Limited by file system performance
- **Concurrent Access**: Potential data corruption with multiple writes

### After Migration
- **Storage**: MongoDB database with Mongoose ODM
- **Data Persistence**: MongoDB collections with proper schema validation
- **Scalability**: Highly scalable with MongoDB's distributed architecture
- **Concurrent Access**: ACID transactions and proper concurrency handling

## Technical Changes

### 1. Dependencies Added
```json
{
  "mongoose": "^8.16.1"
}
```

### 2. New Files Created
- `server/config/database.ts` - MongoDB connection configuration
- `server/models/Group.ts` - TypeScript MongoDB schema for groups
- `server/scripts/migrate-data.ts` - Data migration script

### 3. Updated Files
- `server/server.ts` - Converted from file operations to MongoDB operations
- `package.json` - Added migration and server scripts

## Database Schema

### Group Model
```typescript
interface IGroup extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  members: string[];
  createdBy?: mongoose.Types.ObjectId;
  notificationEmails?: string[];
  createdAt: Date;
}
```

## Migration Process

The migration was completed using the automated script:

```bash
npm run migrate
```

### Migration Results
- ✅ Successfully migrated: 1 group
- ⏭️ Skipped (duplicates): 0 groups
- 📊 Total processed: 1 group

The original data from `groups.json` has been successfully transferred to MongoDB.

## Running the Application

### Option 1: MongoDB-Powered TypeScript Server (Recommended)
```bash
npm run server:ts
```
- **Port**: 4000
- **Database**: MongoDB
- **Features**: Full API functionality with MongoDB persistence

### Option 2: Original JavaScript Server (Still Available)
```bash
npm run server
```
- **Port**: 3001
- **Database**: MongoDB (same database, different server implementation)

## API Endpoints

All existing API endpoints remain the same:

### Groups
- `GET /groups` - Fetch all groups
- `POST /groups` - Create a new group
- `POST /groups/:groupId/members` - Add member to group
- `DELETE /groups/:groupId/members/:username` - Remove member from group
- `DELETE /groups/:groupId` - Delete group
- `PUT /groups/:groupId/notifications` - Update notification emails

### Notifications
- `GET /notifications/test-connection` - Test email configuration
- `POST /notifications/test` - Send test notification

### Payments
- `POST /api/payments/create` - Create payment order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/:paymentId` - Get payment status
- `GET /api/payments` - Get all payments
- `POST /api/payments/webhook` - Payment webhook
- `GET /api/payments/config` - Get payment configuration

## Data Format

### Before (JSON File)
```json
{
  "id": "1751705488734",
  "name": "Development Team",
  "description": "Our awesome dev team",
  "members": ["john.doe"],
  "createdAt": "2025-07-05T08:51:28.734Z",
  "notificationEmails": ["hr@example.com"]
}
```

### After (MongoDB Document)
```json
{
  "_id": "686a768938de82c98422f4d6",
  "name": "Development Team",
  "description": "Our awesome dev team",
  "members": ["john.doe"],
  "createdAt": "2025-07-05T08:51:28.734Z",
  "notificationEmails": ["hr@example.com"],
  "__v": 0
}
```

## Environment Configuration

The MongoDB connection can be configured using environment variables:

```bash
MONGODB_URI=mongodb+srv://your-credentials@your-cluster.mongodb.net/your-database
```

If not provided, it defaults to the existing MongoDB Atlas connection.

## Backup and Recovery

### Backup Recommendation
The original `groups.json` file should be kept as a backup until you're confident the MongoDB migration is working correctly.

### Recovery Process
If needed, the original file-based system can be restored by:
1. Reverting the `server/server.ts` file
2. Restoring file-based operations
3. Using the backed-up `groups.json` file

## Benefits of MongoDB Migration

1. **Scalability**: Handle thousands of groups and members
2. **Performance**: Indexed queries for fast data retrieval
3. **Reliability**: Built-in replication and failover
4. **Consistency**: ACID transactions prevent data corruption
5. **Advanced Queries**: Complex filtering and aggregation capabilities
6. **Real-time Features**: Change streams for real-time updates
7. **Schema Validation**: Enforced data structure and types

## Troubleshooting

### Common Issues

1. **Connection Error**
   - Check MongoDB Atlas credentials
   - Verify network connectivity
   - Ensure IP whitelist includes your server

2. **Migration Failed**
   - Check if `groups.json` exists
   - Verify file permissions
   - Ensure MongoDB connection is established

3. **Data Not Appearing**
   - Verify migration ran successfully
   - Check MongoDB Atlas database browser
   - Confirm server is using correct database

### Verification Commands

```bash
# Test server is running
curl http://localhost:4000/groups

# Re-run migration if needed
npm run migrate

# Start TypeScript server
npm run server:ts
```

## Next Steps

1. ✅ Migration completed successfully
2. ✅ Server tested and working
3. 📋 Monitor application performance
4. 🗑️ Consider removing `groups.json` after confirming stability
5. 🚀 Take advantage of MongoDB's advanced features

The migration to MongoDB provides a solid foundation for future enhancements and improved application performance.