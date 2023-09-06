import { ObjectId } from 'mongodb';
import { NotificationType } from '~/constants/enum';

interface NotificationConstructor {
  _id?: ObjectId;
  sender_id: ObjectId;
  receiver_id: ObjectId;
  type: NotificationType;
  title: string;
  content: string;
  is_read: boolean;
  path?: string;
  created_at?: Date;
  updated_at?: Date;
}

class Notification {
  _id?: ObjectId;
  sender_id: ObjectId;
  receiver_id: ObjectId;
  type: NotificationType;
  title: string;
  content: string;
  is_read: boolean;
  path: string;
  created_at: Date;
  updated_at: Date;

  constructor({
    _id,
    sender_id,
    receiver_id,
    type,
    title,
    content,
    is_read,
    path,
    created_at,
    updated_at
  }: NotificationConstructor) {
    const date = new Date();
    this._id = _id;
    this.sender_id = sender_id;
    this.receiver_id = receiver_id;
    this.type = type;
    this.title = title;
    this.content = content;
    this.is_read = is_read;
    this.path = path || '';
    this.created_at = created_at || date;
    this.updated_at = updated_at || date;
  }
}

export default Notification;
