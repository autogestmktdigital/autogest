import { Router } from 'express';
import { conversationController } from '../controllers/conversation.controller';
import { authMiddleware } from '../middleware';

const router = Router();

router.get('/active', authMiddleware, conversationController.getActiveConversations);
router.get('/lead/:leadId', authMiddleware, conversationController.listByLead);
router.get('/:id/messages', authMiddleware, conversationController.getMessages);
router.post('/:id/messages', authMiddleware, conversationController.addMessage);
router.patch('/:id/handoff', authMiddleware, conversationController.setHumanHandoff);
router.patch('/:id/close', authMiddleware, conversationController.closeConversation);

export default router;
