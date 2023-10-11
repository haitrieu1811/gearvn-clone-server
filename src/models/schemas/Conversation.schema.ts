import { ObjectId } from 'mongodb';

interface ConversationConstructor {
  _id?: ObjectId;
  user_ids: ObjectId[];
  created_at?: Date;
  updated_at?: Date;
}

class Conversation {
  _id?: ObjectId;
  user_ids: ObjectId[];
  created_at: Date;
  updated_at: Date;

  constructor({ _id, user_ids, created_at, updated_at }: ConversationConstructor) {
    const date = new Date();
    this._id = _id;
    this.user_ids = user_ids;
    this.created_at = created_at || date;
    this.updated_at = updated_at || date;
  }
}

export default Conversation;
