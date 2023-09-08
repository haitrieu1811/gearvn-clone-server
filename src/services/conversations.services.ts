import { ObjectId } from 'mongodb';

import { CONVERSATIONS_MESSAGES } from '~/constants/messages';
import { PaginationRequestQuery } from '~/models/requests/Common.requests';
import Conversation from '~/models/schemas/Conversation.schema';
import databaseService from './database.services';

class ConversationsService {
  // Thêm một tin nhắn mới;
  async addConversation({
    content,
    sender_id,
    receiver_id
  }: {
    content: string;
    sender_id: string;
    receiver_id: string;
  }) {
    await databaseService.conversations.insertOne(
      new Conversation({
        content,
        receiver_id: new ObjectId(receiver_id),
        sender_id: new ObjectId(sender_id),
        is_read: false
      })
    );
    return {
      message: CONVERSATIONS_MESSAGES.ADD_CONVERSATION_SUCCESS
    };
  }

  // Lấy danh sách tin nhắn
  async getConversations({
    receiver_id,
    sender_id,
    page,
    limit
  }: { receiver_id: string; sender_id: string } & PaginationRequestQuery) {
    // Phân trang
    const _page = Number(page) || 1;
    const _limit = Number(limit) || 20;
    const $match = {
      $or: [
        {
          sender_id: new ObjectId(receiver_id),
          receiver_id: new ObjectId(sender_id)
        },
        {
          sender_id: new ObjectId(sender_id),
          receiver_id: new ObjectId(receiver_id)
        }
      ]
    };
    const [conversations, total] = await Promise.all([
      databaseService.conversations
        .aggregate([
          {
            $match
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
              'sender.status': 0,
              'sender.role': 0,
              'sender.gender': 0,
              'sender.verify': 0,
              'sender.phoneNumber': 0,
              'sender.addresses': 0,
              'sender.date_of_birth': 0,
              'sender.email_verify_token': 0,
              'sender.forgot_password_token': 0,
              'sender.created_at': 0,
              'sender.updated_at': 0,
              'receiver.password': 0,
              'receiver.status': 0,
              'receiver.role': 0,
              'receiver.gender': 0,
              'receiver.verify': 0,
              'receiver.phoneNumber': 0,
              'receiver.addresses': 0,
              'receiver.date_of_birth': 0,
              'receiver.email_verify_token': 0,
              'receiver.forgot_password_token': 0,
              'receiver.created_at': 0,
              'receiver.updated_at': 0
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
      databaseService.conversations.countDocuments($match)
    ]);
    return {
      message: CONVERSATIONS_MESSAGES.GET_CONVERSATIONS_SUCCESS,
      data: {
        conversations,
        pagination: {
          page: _page,
          limit: _limit,
          total,
          page_size: Math.ceil(total / _limit)
        }
      }
    };
  }

  // Đọc tất cả tin nhắn
  async readConversations({ sender_id, receiver_id }: { sender_id: string; receiver_id: string }) {
    await databaseService.conversations.updateMany(
      {
        sender_id: new ObjectId(sender_id),
        receiver_id: new ObjectId(receiver_id),
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
    );
    return {
      message: CONVERSATIONS_MESSAGES.READ_ALL_MESSAGES_SUCCESS
    };
  }

  // Lấy danh sách người mà mình đã nhắn tin
  async getReceivers(user_id: string) {
    const receivers = await databaseService.conversations
      .aggregate([
        {
          $match: {
            sender_id: new ObjectId(user_id)
          }
        },
        {
          $sort: {
            updated_at: -1
          }
        },
        {
          $group: {
            _id: '$receiver_id',
            is_read_arr: {
              $push: '$is_read'
            },
            last_message: {
              $first: '$content'
            },
            updated_at: {
              $first: '$updated_at'
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
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
          $addFields: {
            unread_arr: {
              $filter: {
                input: '$is_read_arr',
                as: 'item',
                cond: {
                  $eq: ['$$item', false]
                }
              }
            }
          }
        },
        {
          $addFields: {
            'receiver.unread_count': {
              $size: '$unread_arr'
            },
            'receiver.updated_at': '$updated_at',
            'receiver.last_message': '$last_message'
          }
        },
        {
          $replaceRoot: {
            newRoot: '$receiver'
          }
        },
        {
          $project: {
            password: 0,
            status: 0,
            role: 0,
            gender: 0,
            verify: 0,
            phoneNumber: 0,
            addresses: 0,
            date_of_birth: 0,
            email_verify_token: 0,
            forgot_password_token: 0,
            created_at: 0
          }
        },
        {
          $group: {
            _id: '$_id',
            email: {
              $first: '$email'
            },
            fullName: {
              $first: '$fullName'
            },
            avatar: {
              $first: '$avatar'
            },
            unread_count: {
              $first: '$unread_count'
            },
            last_message: {
              $first: '$last_message'
            },
            updated_at: {
              $first: '$updated_at'
            }
          }
        },
        {
          $sort: {
            updated_at: -1
          }
        }
      ])
      .toArray();
    return {
      message: CONVERSATIONS_MESSAGES.GET_RECEIVERS_SUCCESS,
      data: {
        receivers
      }
    };
  }
}

const conversationsService = new ConversationsService();
export default conversationsService;
