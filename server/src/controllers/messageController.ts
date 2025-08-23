import { Response } from 'express';
import { AuthRequest } from '../types/auth';
import { User } from '../models/User';
import Message from '../models/Message';
import { getReceiverSocketId, io } from '../server';
import { Types } from 'mongoose';

export const getUsersForSidebar = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const loggedInUserId = new Types.ObjectId(req.userId);
    
    // Get all users except current user
    const allUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select('-password');

    // Get conversation data for each user
    const conversationsWithUsers = await Promise.all(
      allUsers.map(async (user) => {
        // Get last message between current user and this user
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: loggedInUserId, receiverId: user._id },
            { senderId: user._id, receiverId: loggedInUserId },
          ],
        }).sort({ createdAt: -1 });

        // Get unread message count
        const unreadCount = await Message.countDocuments({
          senderId: user._id,
          receiverId: loggedInUserId,
          isRead: false,
        });

        return {
          ...user.toObject(),
          lastMessage: lastMessage ? {
            text: lastMessage.text,
            createdAt: lastMessage.createdAt,
            senderId: lastMessage.senderId,
          } : null,
          unreadCount,
        };
      })
    );

    // Sort by last message time (most recent first)
    const sortedConversations = conversationsWithUsers.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt || a.createdAt || new Date(0);
      const bTime = b.lastMessage?.createdAt || b.createdAt || new Date(0);
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });

    res.status(200).json(sortedConversations);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error in getUsersForSidebar: ', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id: userToChatId } = req.params;
    const myId = new Types.ObjectId(req.userId);

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log('Error in getMessages controller: ', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { text } = req.body;
    const { id: receiverId } = req.params;
    const senderId = new Types.ObjectId(req.userId);
    let imageUrl: string | undefined;

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      isRead: false,
    });

    await newMessage.save();

    // Get sender info for notification
    const sender = await User.findById(senderId).select('firstName lastName name email');
    const messageWithSender = {
      ...newMessage.toObject(),
      senderName: sender ? (sender.firstName ? `${sender.firstName} ${sender.lastName}` : sender.firstName || sender.email) : 'Someone'
    };

    const receiverSocketId = getReceiverSocketId(receiverId);
    const senderSocketId = getReceiverSocketId(senderId.toString());

    if (receiverSocketId) {
      console.log('Emitting to receiver!');
      io.to(receiverSocketId).emit('newMessage', messageWithSender);
    }

    if (senderSocketId) {
      console.log('Emitting to sender!');
      io.to(senderSocketId).emit('newMessage', messageWithSender);
    }

    res.status(201).json(newMessage);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log('Error in sendMessage controller: ', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const markMessagesAsRead = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id: senderId } = req.params;
    const receiverId = new Types.ObjectId(req.userId);

    console.log('📖 Marking messages as read from:', senderId, 'to:', receiverId.toString());

    // Mark all messages from sender as read
    const result = await Message.updateMany(
      { 
        senderId: senderId, 
        receiverId: receiverId, 
        isRead: false 
      },
      { 
        isRead: true,
        readAt: new Date()
      }
    );

    console.log('✅ Marked', result.modifiedCount, 'messages as read');

    // Emit read receipt to sender
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId && result.modifiedCount > 0) {
      console.log('📤 Emitting read receipt to sender:', senderId);
      io.to(senderSocketId).emit('messagesRead', {
        readBy: receiverId.toString(),
        senderId: senderId
      });
    }

    res.status(200).json({ 
      message: 'Messages marked as read', 
      count: result.modifiedCount 
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
