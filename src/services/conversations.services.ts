import { ObjectId } from 'mongodb';

import { CONVERSATIONS_MESSAGES } from '~/constants/messages';
import { PaginationRequestQuery } from '~/models/requests/Common.requests';
import Conversation from '~/models/schemas/Conversation.schema';
import Message from '~/models/schemas/Message.schema';
import databaseService from './database.services';

class ConversationsService {
  // Tạo một cuộc trò chuyện mới
  async createConversation(user_ids: string[]) {
    await databaseService.conversations.insertOne(
      new Conversation({
        user_ids: user_ids.map((user_id) => new ObjectId(user_id))
      })
    );
    return {
      message: CONVERSATIONS_MESSAGES.CREATE_CONVERSATION_SUCCEED
    };
  }

  // Lấy danh sách cuộc trò chuyện của một người dùng
  async getConversations({ query, user_id }: { query: PaginationRequestQuery; user_id: string }) {
    const { page, limit } = query;
    const _page = Number(page) || 1;
    const _limit = Number(limit) || 10;
    const [conversations, total] = await Promise.all([
      databaseService.conversations
        .aggregate([
          {
            $match: {
              user_ids: {
                $in: [new ObjectId(user_id)]
              }
            }
          },
          {
            $addFields: {
              receiver: {
                $filter: {
                  input: '$user_ids',
                  as: 'item',
                  cond: {
                    $ne: ['$$item', new ObjectId(user_id)]
                  }
                }
              }
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'receiver',
              foreignField: '_id',
              as: 'receiver'
            }
          },
          {
            $unwind: {
              path: '$receiver'
            }
          },
          {
            $lookup: {
              from: 'messages',
              localField: '_id',
              foreignField: 'conversation_id',
              as: 'messages'
            }
          },
          {
            $addFields: {
              message_count: {
                $size: '$messages'
              },
              unread_message_count: {
                $size: {
                  $filter: {
                    input: '$messages',
                    as: 'item',
                    cond: {
                      $and: [
                        {
                          $eq: ['$$item.is_read', false]
                        },
                        {
                          $eq: ['$$item.receiver_id', new ObjectId(user_id)]
                        }
                      ]
                    }
                  }
                }
              },
              latest_message: {
                $last: '$messages'
              }
            }
          },
          {
            $group: {
              _id: '$_id',
              message_count: {
                $first: '$message_count'
              },
              unread_message_count: {
                $first: '$unread_message_count'
              },
              receiver: {
                $first: '$receiver'
              },
              latest_message: {
                $first: '$latest_message'
              },
              created_at: {
                $first: '$created_at'
              },
              updated_at: {
                $first: '$updated_at'
              }
            }
          },
          {
            $project: {
              'receiver.password': 0,
              'receiver.addresses': 0,
              'receiver.email_verify_token': 0,
              'receiver.forgot_password_token': 0,
              'latest_message.conversation_id': 0,
              'latest_message.sender_id': 0,
              'latest_message.receiver_id': 0
            }
          },
          {
            $sort: {
              'latest_message.created_at': -1
            }
          },
          {
            $skip: (_page - 1) * _limit
          },
          {
            $limit: _limit
          }
        ])
        .toArray(),
      databaseService.conversations.countDocuments({
        user_ids: {
          $in: [new ObjectId(user_id)]
        }
      })
    ]);
    return {
      message: CONVERSATIONS_MESSAGES.GET_CONVERSATIONS_SUCCEED,
      data: {
        conversations,
        pagination: {
          total,
          page: _page,
          limit: _limit,
          page_size: Math.ceil(total / _limit)
        }
      }
    };
  }

  // Thêm một tin nhắn mới (chỉ dùng ở server)
  async createMessage({
    conversation_id,
    content,
    sender_id,
    receiver_id
  }: {
    conversation_id: ObjectId;
    content: string;
    sender_id: ObjectId;
    receiver_id: ObjectId;
  }) {
    const { insertedId } = await databaseService.messages.insertOne(
      new Message({
        conversation_id,
        content,
        receiver_id,
        sender_id,
        is_read: false
      })
    );
    const messages = await databaseService.messages
      .aggregate([
        {
          $match: {
            _id: insertedId
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'sender_id',
            foreignField: '_id',
            as: 'sender'
          }
        },
        {
          $unwind: {
            path: '$sender'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'receiver_id',
            foreignField: '_id',
            as: 'receiver'
          }
        },
        {
          $unwind: {
            path: '$receiver'
          }
        },
        {
          $group: {
            _id: '$_id',
            conversation_id: {
              $first: '$conversation_id'
            },
            content: {
              $first: '$content'
            },
            is_read: {
              $first: '$is_read'
            },
            sender: {
              $first: '$sender'
            },
            receiver: {
              $first: '$receiver'
            },
            created_at: {
              $first: '$created_at'
            },
            updated_at: {
              $first: '$updated_at'
            }
          }
        },
        {
          $project: {
            'sender.password': 0,
            'sender.addresses': 0,
            'sender.email_verify_token': 0,
            'sender.forgot_password_token': 0,
            'receiver.password': 0,
            'receiver.addresses': 0,
            'receiver.email_verify_token': 0,
            'receiver.forgot_password_token': 0
          }
        }
      ])
      .toArray();
    return messages[0];
  }

  // Lấy danh sách tin nhắn
  async getMessages({
    conversation_id,
    user_id,
    query
  }: {
    conversation_id: string;
    user_id: string;
    query: PaginationRequestQuery;
  }) {
    const { page, limit } = query;
    // Phân trang
    const _page = Number(page) || 1;
    const _limit = Number(limit) || 20;
    const [messages, total] = await Promise.all([
      databaseService.messages
        .aggregate([
          {
            $match: {
              conversation_id: new ObjectId(conversation_id)
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'sender_id',
              foreignField: '_id',
              as: 'sender'
            }
          },
          {
            $unwind: {
              path: '$sender'
            }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'receiver_id',
              foreignField: '_id',
              as: 'receiver'
            }
          },
          {
            $unwind: {
              path: '$receiver'
            }
          },
          {
            $group: {
              _id: '$_id',
              conversation_id: {
                $first: '$conversation_id'
              },
              content: {
                $first: '$content'
              },
              is_read: {
                $first: '$is_read'
              },
              sender: {
                $first: '$sender'
              },
              receiver: {
                $first: '$receiver'
              },
              created_at: {
                $first: '$created_at'
              },
              updated_at: {
                $first: '$updated_at'
              }
            }
          },
          {
            $project: {
              'sender.password': 0,
              'sender.addresses': 0,
              'sender.email_verify_token': 0,
              'sender.forgot_password_token': 0,
              'receiver.password': 0,
              'receiver.addresses': 0,
              'receiver.email_verify_token': 0,
              'receiver.forgot_password_token': 0
            }
          },
          {
            $sort: {
              created_at: -1
            }
          },
          {
            $skip: (_page - 1) * _limit
          },
          {
            $limit: _limit
          }
        ])
        .toArray(),
      databaseService.messages.countDocuments({ conversation_id: new ObjectId(conversation_id) }),
      databaseService.messages.updateMany(
        {
          conversation_id: new ObjectId(conversation_id),
          receiver_id: new ObjectId(user_id),
          is_read: false
        },
        {
          $set: {
            is_read: true
          },
          $currentDate: {
            updated_at: true
          }
        }
      )
    ]);
    return {
      message: CONVERSATIONS_MESSAGES.GET_CONVERSATIONS_SUCCESS,
      data: {
        messages,
        pagination: {
          page: _page,
          limit: _limit,
          total,
          page_size: Math.ceil(total / _limit)
        }
      }
    };
  }
}

const conversationsService = new ConversationsService();
export default conversationsService;
