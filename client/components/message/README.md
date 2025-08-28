# Message Components 📬

This directory contains all components related to the chat/messaging functionality, organized in a modular, maintainable structure.

## 🏗️ Architecture Overview

The message components follow a **modular, single-responsibility** design pattern where each component has a focused purpose and can be tested/maintained independently.

## 📁 Component Structure

### **Main Components**

- **`ChatPage.tsx`** - Main chat page container
- **`ChatMessages.tsx`** - Message list with infinite scroll and real-time updates
- **`ChatSidebar.tsx`** - User list and conversation management
- **`MessageInput.tsx`** - Composed message input interface
- **`SocketWrapper.tsx`** - Socket.IO connection wrapper

### **Modular Sub-Components**

- **`MessageBubble.tsx`** - Individual message display with read receipts
- **`MessageStatus.tsx`** - User status and read receipt components
- **`TypingIndicator.tsx`** - Real-time typing animations

### **Micro UI Components** (ui/)

- **`LoadingSpinner.tsx`** - Reusable loading spinners (various sizes)
- **`UserAvatar.tsx`** - User avatar with initials and online status
- **`EmptyStates.tsx`** - Empty state components (no conversation, loading, etc.)
- **`AnimatedDots.tsx`** - Animated typing dots
- **`UnreadBadge.tsx`** - Unread message count badge
- **`MessageTime.tsx`** - Message timestamp formatting

### **Utilities**

- **`messageUtils.ts`** - Pure utility functions for message handling
- **`index.ts`** - Centralized component exports
- **`ui/index.ts`** - Micro component exports

## 🎯 Component Responsibilities

### MessageInput (Composed Component)

```typescript
MessageInput
├── TypingIndicator    // Shows when others are typing
├── Input Form         // Handles input and submission (integrated)
└── MessageStatus      // Displays user status
```

**Features:**

- ✅ Modular composition
- ✅ Real-time typing indicators
- ✅ Message validation
- ✅ User status display

### MessageBubble (Display Component)

```typescript
MessageBubble
├── MessageContent     // Text and image display
├── MessageTimestamp   // Time formatting
└── ReadReceipt       // Delivery status
```

**Features:**

- ✅ WhatsApp-style design
- ✅ Read receipt indicators
- ✅ Image support
- ✅ Responsive layout

### TypingIndicator (Animation Component)

```typescript
TypingIndicator
├── TypingDots        // Animated bouncing dots
└── UserName         // Display name logic
```

**Features:**

- ✅ Smooth animations
- ✅ Staggered dot timing
- ✅ User name display

### MessageStatus (Status Component)

```typescript
MessageStatus
├── OnlineIndicator   // Real-time status dot
├── ReadReceipt      // Message delivery status
└── MessageTimestamp // Time formatting
```

**Features:**

- ✅ Online/offline indicators
- ✅ Last seen timestamps
- ✅ Read receipt display

## 🛠️ Utility Functions

### messageUtils.ts

**Pure functions for:**

- 📝 **User Management**: Display names, initials, status
- ✅ **Message Validation**: Content validation, sending checks
- 🕐 **Time Formatting**: Timestamps, relative time
- 📊 **Message Processing**: Sorting, deduplication, grouping
- 📏 **Scroll Utilities**: Position detection, pagination
- 🔔 **Notifications**: Message alerts, notification text
- ⌨️ **Keyboard**: Shortcut detection
- 📋 **Array Operations**: Merging, finding, counting

## 📦 Usage Examples

### Basic Usage

```typescript
import { MessageInput, MessageBubble, TypingIndicator } from '@/components/message';

// Composed message input
<MessageInput maxLength={1000} />

// Individual message
<MessageBubble message={msg} isMyMessage={true} />

// Typing indicator
<TypingIndicator selectedUser={user} typingUsers={typingList} />
```

### With Utilities

```typescript
import {
	formatMessageTime,
	isMyMessage,
	getUserDisplayName,
	canSendMessage,
} from '@/components/message';

const time = formatMessageTime(message.createdAt);
const isMine = isMyMessage(message, currentUserId);
const name = getUserDisplayName(user);
const canSend = canSendMessage(text, image, selectedUser);
```

## 🎨 Design Principles

### 1. **Single Responsibility**

Each component has one clear purpose and handles one aspect of functionality.

### 2. **Composition over Inheritance**

Components are composed together rather than extending from base classes.

### 3. **Pure Functions**

Utility functions are pure, testable, and side-effect free.

### 4. **Functional Programming**

Uses modern functional patterns with React hooks and closures.

### 5. **Performance Optimized**

- `React.memo` for component memoization
- `useCallback` and `useMemo` for expensive operations
- Minimal re-renders

### 6. **Accessibility**

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support

## 🔄 Real-time Features

### Socket Integration

- ✅ **New Messages**: Real-time message delivery
- ✅ **Typing Indicators**: Live typing status
- ✅ **Read Receipts**: Message read confirmations
- ✅ **User Status**: Online/offline updates

### State Management

- ✅ **Functional Store**: Modern state management
- ✅ **Event Handling**: Composed event handlers
- ✅ **Side Effects**: Separated into focused hooks

## 🧪 Testing Strategy

### Component Testing

```typescript
// Test individual components
describe('MessageBubble', () => {
	it('displays message content correctly', () => {
		// Test message rendering
	});

	it('shows read receipts for own messages', () => {
		// Test read receipt logic
	});
});
```

### Utility Testing

```typescript
// Test pure functions
describe('messageUtils', () => {
	it('formats timestamps correctly', () => {
		expect(formatMessageTime(timestamp)).toBe('10:30 AM');
	});

	it('validates message content', () => {
		expect(canSendMessage('hello', null, user)).toBe(true);
	});
});
```

## 🚀 Performance Benefits

### Before (Monolithic)

- ❌ Large, complex components
- ❌ Frequent re-renders
- ❌ Difficult to test
- ❌ Hard to maintain

### After (Modular)

- ✅ Small, focused components
- ✅ Optimized re-renders
- ✅ Easy to test
- ✅ Maintainable code
- ✅ Reusable parts

## 🔮 Future Enhancements

### Planned Features

- 📎 **File Attachments**: Document and media sharing
- 🎙️ **Voice Messages**: Audio recording and playback
- 🌙 **Dark Mode**: Theme switching
- 🔍 **Message Search**: Full-text search
- 📱 **Push Notifications**: Browser notifications
- 🔐 **Message Encryption**: End-to-end security

### Scalability

The modular architecture makes it easy to:

- Add new message types
- Implement new features
- Replace individual components
- Scale to more complex chat features

---

## 📖 Quick Reference

### Key Files

- `MessageInput.tsx` → Main input interface
- `MessageBubble.tsx` → Individual message display
- `messageUtils.ts` → Utility functions
- `index.ts` → Component exports

### Key Features

- 🎯 Modular architecture
- ⚡ Real-time updates
- 📱 Responsive design
- ♿ Accessibility support
- 🧪 Testable code
- 🚀 Performance optimized
