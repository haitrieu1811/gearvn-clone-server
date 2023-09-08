import { ObjectId } from 'mongodb';

interface ConversationConstructor {
  _id?: string;
  sender_id: ObjectId;
  receiver_id: ObjectId;
  content: string;
  is_read: boolean;
  created_at?: Date;
  updated_at?: Date;
}

class Conversation {
  _id?: string;
  sender_id: ObjectId;
  receiver_id: ObjectId;
  content: string;
  is_read: boolean;
  created_at: Date;
  updated_at: Date;

  constructor({ _id, sender_id, receiver_id, content, is_read, created_at, updated_at }: ConversationConstructor) {
    const date = new Date();
    this._id = _id;
    this.sender_id = sender_id;
    this.receiver_id = receiver_id;
    this.content = content;
    this.is_read = is_read;
    this.created_at = created_at || date;
    this.updated_at = updated_at || date;
  }
}

export default Conversation;
