import express, { Request, Response } from 'express';
import cors from 'cors';
import { connectDatabase } from './config/database.js';
import { Group, IGroup } from './models/Group.js';
import { emailService, NotificationData } from './emailService.js';
import { paymentService, Payment, PaymentRequest, PaymentVerification } from './paymentService.js';

interface GroupInput {
  name: string;
  description?: string;
  notificationEmails?: string[];
}

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDatabase();

/* Routes */
app.get('/groups', async (_req: Request, res: Response<IGroup[]>) => {
  try {
    const groups = await Group.find().sort({ createdAt: -1 });
    res.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json([]);
  }
});

app.post('/groups', async (req: Request, res: Response<IGroup | { error: string }>) => {
  try {
    const { name, description, notificationEmails } = req.body as GroupInput;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const newGroup = new Group({
      name,
      description: description || '',
      members: [],
      notificationEmails: notificationEmails || [],
    });

    const savedGroup = await newGroup.save();

    // Send notification emails if configured
    if (savedGroup.notificationEmails && savedGroup.notificationEmails.length > 0) {
      const notificationData: NotificationData = {
        groupName: savedGroup.name,
        groupDescription: savedGroup.description || '',
        actionType: 'group_created',
        timestamp: savedGroup.createdAt.toISOString(),
      };

      emailService.sendBulkNotification(savedGroup.notificationEmails, notificationData)
        .then(result => {
          console.log(`Group creation notification sent to ${result.sent} recipients, ${result.failed} failed`);
        })
        .catch(error => {
          console.error('Failed to send group creation notification:', error);
        });
    }

    return res.status(201).json(savedGroup);
  } catch (error) {
    console.error('Error creating group:', error);
    return res.status(500).json({ error: 'Failed to create group' });
  }
});

app.post('/groups/:groupId/members', async (req: Request, res: Response<IGroup | { error: string }>) => {
  try {
    const { groupId } = req.params;
    const { username } = req.body as { username?: string };

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (!group.members.includes(username)) {
      group.members.push(username);
      await group.save();

      // Send notification emails if configured
      if (group.notificationEmails && group.notificationEmails.length > 0) {
        const notificationData: NotificationData = {
          groupName: group.name,
          memberName: username,
          actionType: 'member_added',
          timestamp: new Date().toISOString(),
        };

        emailService.sendBulkNotification(group.notificationEmails, notificationData)
          .then(result => {
            console.log(`Member addition notification sent to ${result.sent} recipients, ${result.failed} failed`);
          })
          .catch(error => {
            console.error('Failed to send member addition notification:', error);
          });
      }
    }

    return res.json(group);
  } catch (error) {
    console.error('Error adding member:', error);
    return res.status(500).json({ error: 'Failed to add member' });
  }
});

app.delete('/groups/:groupId/members/:username', async (req: Request, res: Response<IGroup | { error: string }>) => {
  try {
    const { groupId, username } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const wasRemoved = group.members.includes(username);
    group.members = group.members.filter((m) => m !== username);
    await group.save();

    // Send notification emails if the member was actually removed and notifications are configured
    if (wasRemoved && group.notificationEmails && group.notificationEmails.length > 0) {
      const notificationData: NotificationData = {
        groupName: group.name,
        memberName: username,
        actionType: 'member_removed',
        timestamp: new Date().toISOString(),
      };

      emailService.sendBulkNotification(group.notificationEmails, notificationData)
        .then(result => {
          console.log(`Member removal notification sent to ${result.sent} recipients, ${result.failed} failed`);
        })
        .catch(error => {
          console.error('Failed to send member removal notification:', error);
        });
    }

    return res.json(group);
  } catch (error) {
    console.error('Error removing member:', error);
    return res.status(500).json({ error: 'Failed to remove member' });
  }
});

app.delete('/groups/:groupId', async (req: Request, res: Response<IGroup | { error: string }>) => {
  try {
    const { groupId } = req.params;
    
    const group = await Group.findByIdAndDelete(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Send notification emails if configured
    if (group.notificationEmails && group.notificationEmails.length > 0) {
      const notificationData: NotificationData = {
        groupName: group.name,
        actionType: 'group_deleted',
        timestamp: new Date().toISOString(),
      };

      emailService.sendBulkNotification(group.notificationEmails, notificationData)
        .then(result => {
          console.log(`Group deletion notification sent to ${result.sent} recipients, ${result.failed} failed`);
        })
        .catch(error => {
          console.error('Failed to send group deletion notification:', error);
        });
    }

    return res.json(group);
  } catch (error) {
    console.error('Error deleting group:', error);
    return res.status(500).json({ error: 'Failed to delete group' });
  }
});

/* Notification Management Routes */

// Update notification emails for a group
app.put('/groups/:groupId/notifications', async (req: Request, res: Response<IGroup | { error: string }>) => {
  try {
    const { groupId } = req.params;
    const { notificationEmails } = req.body as { notificationEmails?: string[] };

    if (!notificationEmails || !Array.isArray(notificationEmails)) {
      return res.status(400).json({ error: 'notificationEmails array is required' });
    }

    const group = await Group.findByIdAndUpdate(
      groupId, 
      { notificationEmails }, 
      { new: true }
    );
    
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    return res.json(group);
  } catch (error) {
    console.error('Error updating notifications:', error);
    return res.status(500).json({ error: 'Failed to update notifications' });
  }
});

// Test email configuration
app.get('/notifications/test-connection', async (req: Request, res: Response<{ success: boolean; message: string }>) => {
  try {
    const isConnected = await emailService.testConnection();
    if (isConnected) {
      return res.json({ success: true, message: 'Email service is configured and ready' });
    } else {
      return res.json({ success: false, message: 'Email service is not configured or connection failed' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error testing email connection' });
  }
});

// Send test notification
app.post('/notifications/test', async (req: Request, res: Response<{ success: boolean; message: string }>) => {
  const { email, groupName } = req.body as { email?: string; groupName?: string };

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  try {
    const testData: NotificationData = {
      groupName: groupName || 'Test Group',
      groupDescription: 'This is a test notification to verify your email configuration.',
      actionType: 'group_created',
      timestamp: new Date().toISOString(),
    };

    const success = await emailService.sendNotification(email, testData);
    
    if (success) {
      return res.json({ success: true, message: 'Test notification sent successfully' });
    } else {
      return res.json({ success: false, message: 'Failed to send test notification' });
    }
  } catch (error) {
    console.error('Test notification error:', error);
    return res.status(500).json({ success: false, message: 'Error sending test notification' });
  }
});

/* Payment Routes */

// Create a new payment order
app.post('/api/payments/create', async (req: Request, res: Response<Payment | { error: string }>) => {
  try {
    const paymentRequest: PaymentRequest = req.body;
    
    if (!paymentRequest.amount || !paymentRequest.description) {
      return res.status(400).json({ error: 'Amount and description are required' });
    }

    if (paymentRequest.amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    if (!paymentService.isConfigured()) {
      return res.status(500).json({ error: 'Payment service not configured. Please set Razorpay credentials.' });
    }

    const payment = await paymentService.createOrder(paymentRequest);
    res.status(201).json(payment);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
});

// Verify payment after successful completion
app.post('/api/payments/verify', async (req: Request, res: Response<Payment | { error: string }>) => {
  try {
    const verification: PaymentVerification = req.body;
    
    if (!verification.razorpay_order_id || !verification.razorpay_payment_id || !verification.razorpay_signature) {
      return res.status(400).json({ error: 'Missing required verification parameters' });
    }

    const payment = await paymentService.verifyPayment(verification);
    res.json(payment);
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(400).json({ error: 'Payment verification failed' });
  }
});

// Get payment status
app.get('/api/payments/:paymentId', async (req: Request, res: Response<Payment | { error: string }>) => {
  try {
    const { paymentId } = req.params;
    const payment = await paymentService.getPayment(paymentId);
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    res.json(payment);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

// Get all payments (for admin/dashboard)
app.get('/api/payments', async (req: Request, res: Response<Payment[] | { error: string }>) => {
  try {
    const payments = await paymentService.getAllPayments();
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Webhook endpoint for payment status updates
app.post('/api/payments/webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    
    if (!signature) {
      return res.status(400).json({ error: 'Missing webhook signature' });
    }

    await paymentService.handleWebhook(req.body, signature);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

// Get Razorpay public key for frontend
app.get('/api/payments/config', (req: Request, res: Response<{ keyId: string; configured: boolean }>) => {
  res.json({
    keyId: paymentService.getPublicKey(),
    configured: paymentService.isConfigured()
  });
});

/* Start server */
app.listen(PORT, () => {
  console.log(`Group server running on http://localhost:${PORT}`);
});