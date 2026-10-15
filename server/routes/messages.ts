import { Router, Response } from 'express';
import { db, Message, User } from '../db.ts';
import { authenticateToken, AuthenticatedRequest } from '../auth.ts';
import { sanitizeUser } from './auth.ts';

const router = Router();

// GET /api/messages/contacts - get list of active conversations / available contacts
router.get('/contacts', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const currentUserId = req.user!.userId;
  const currentUserRole = req.user!.role;
  const allUsers = db.getUsers();
  const allMessages = db.getMessagesForUser(currentUserId);

  let contactCandidates: User[] = [];

  if (currentUserRole === 'USER') {
    // Athlete can message their assigned coach, other coaches, or admin
    contactCandidates = allUsers.filter(
      (u) => u.id !== currentUserId && (u.role === 'COACH' || u.role === 'ADMIN') && u.status === 'ACTIVE'
    );
  } else if (currentUserRole === 'COACH') {
    // Coach can message athletes assigned to them, or other athletes who messaged them, or admin
    const assignedUserIds = db.getAssignmentsByCoachId(currentUserId).map((a) => a.userId);
    const messagedUserIds = Array.from(
      new Set(allMessages.map((m) => (m.senderId === currentUserId ? m.receiverId : m.senderId)))
    );

    contactCandidates = allUsers.filter(
      (u) =>
        u.id !== currentUserId &&
        (assignedUserIds.includes(u.id) || messagedUserIds.includes(u.id) || u.role === 'ADMIN') &&
        u.status === 'ACTIVE'
    );
  } else {
    // Admin can message any active user or coach
    contactCandidates = allUsers.filter((u) => u.id !== currentUserId && u.status === 'ACTIVE');
  }

  // Format contacts with latest message and unread count
  const contacts = contactCandidates.map((c) => {
    const thread = allMessages.filter(
      (m) =>
        (m.senderId === c.id && m.receiverId === currentUserId) ||
        (m.senderId === currentUserId && m.receiverId === c.id)
    ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const latestMessage = thread[0] || null;
    const unreadCount = thread.filter((m) => m.senderId === c.id && !m.isRead).length;

    return {
      contact: sanitizeUser(c),
      latestMessage,
      unreadCount,
    };
  });

  // Sort contacts by latest message timestamp
  contacts.sort((a, b) => {
    const timeA = a.latestMessage ? new Date(a.latestMessage.createdAt).getTime() : 0;
    const timeB = b.latestMessage ? new Date(b.latestMessage.createdAt).getTime() : 0;
    return timeB - timeA;
  });

  res.json(contacts);
});

// GET /api/messages/:contactId - get messages with a specific contact
router.get('/:contactId', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const currentUserId = req.user!.userId;
  const contactId = req.params.contactId;

  const contact = db.getUserById(contactId);
  if (!contact) {
    return res.status(404).json({ error: 'Contact not found.' });
  }

  const conversation = db.getConversation(currentUserId, contactId);

  // Automatically mark unread messages from this contact as read
  db.markMessagesAsRead(contactId, currentUserId);

  res.json({
    contact: sanitizeUser(contact),
    messages: conversation,
  });
});

// POST /api/messages - send new message
router.post('/', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const currentUserId = req.user!.userId;
  const currentUser = db.getUserById(currentUserId);
  const { receiverId, content } = req.body;

  if (!receiverId || !content || !content.trim()) {
    return res.status(400).json({ error: 'Receiver ID and non-empty content are required.' });
  }

  const receiver = db.getUserById(receiverId);
  if (!receiver) {
    return res.status(404).json({ error: 'Recipient not found.' });
  }

  const newMsg: Message = {
    id: `msg-${Date.now()}`,
    senderId: currentUserId,
    senderName: currentUser ? currentUser.name : req.user!.name,
    senderRole: req.user!.role,
    receiverId,
    receiverName: receiver.name,
    content: content.trim(),
    createdAt: new Date().toISOString(),
    isRead: false,
  };

  db.addMessage(newMsg);
  res.status(201).json(newMsg);
});

// POST /api/messages/read/:contactId - mark messages from contact as read
router.post('/read/:contactId', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const currentUserId = req.user!.userId;
  const contactId = req.params.contactId;

  const count = db.markMessagesAsRead(contactId, currentUserId);
  res.json({ markedAsRead: count });
});

export default router;
