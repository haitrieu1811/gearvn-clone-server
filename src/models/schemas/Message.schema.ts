import { ObjectId } from 'mongodb';

interface MessageConstructor {
  _id?: string;
  conversation_id: ObjectId;
  sender_id: ObjectId;
  receiver_id: ObjectId;
  content: string;
  is_read: boolean;
  created_at?: Date;
  updated_at?: Date;
}

class Message {
  _id?: string;
  conversation_id: ObjectId;
  sender_id: ObjectId;
  receiver_id: ObjectId;
  content: string;
  is_read: boolean;
  created_at?: Date;
  updated_at?: Date;
  constructor({
    _id,
    conversation_id,
    sender_id,
    receiver_id,
    content,
    is_read,
    created_at,
    updated_at
  }: MessageConstructor) {
    const date = new Date();
    this._id = _id;
    this.conversation_id = conversation_id;
    this.sender_id = sender_id;
    this.receiver_id = receiver_id;
    this.content = content;
    this.is_read = is_read;
    this.created_at = created_at || date;
    this.updated_at = updated_at || date;
  }
}

export default Message;
