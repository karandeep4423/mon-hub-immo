# Chat Attachments

This adds file attachments to chat without breaking existing text messaging.

Highlights:

- Supported: images (jpeg/png/webp), PDF, Word (doc/docx)
- Storage: AWS S3 under `chat/<userId>/<filename>`
- Transport: existing `/api/message/send/:id` now accepts `attachments` array
- Real-time: unchanged; new messages emit as before

Server changes:

- Model: `server/src/models/Chat.ts` adds `attachments[]`
- Upload: `POST /api/upload/chat-file` (auth required), field: `file`
- S3: `S3Service.uploadObject()` and `chat` folder keying

Client changes:

- Types: `client/types/chat.ts` extends `ChatMessage` and `SendMessageData`
- API: `ChatApi.uploadChatFile(file)` helper
- UI: `MessageInput` gets an attach button; `MessageBubble` renders images inline and others as links

Request/response shapes:

- Send message: `{ text?: string, attachments?: [{ url, name, mime, size, type? }] }`
- Message: includes `attachments?: [{ url, name, mime, size, type, thumbnailUrl? }]`

Notes:

- File size limited by server multer limits (5MB default)
- Existing image field remains for backwards compatibility
- Reused existing Socket.IO events, no client changes required
- Server currently caps to 20 files per request (multer limits)

Quick usage:

- Upload: client posts FormData with field `file` to `/api/upload/chat-file`, receives `{ url, name, mime, size }`. The UI supports selecting multiple files and will send them as a single message with multiple attachments.
- Send: call existing sendMessage with `{ text?, attachments: [{ url, name, mime, size }] }`.

---

Troubleshooting:

- 401 on upload: ensure you are authenticated
- 415/400: file type not allowed; use supported mimes
- Missing previews: Next/Image requires valid external domains in next.config if using a different CDN
