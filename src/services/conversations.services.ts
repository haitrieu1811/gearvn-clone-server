import { ObjectId } from 'mongodb';

import { CONVERSATIONS_MESSAGES } from '~/constants/messages';
import { PaginationRequestQuery } from '~/models/requests/Common.requests';
import Conversation from '~/models/schemas/Conversation.schema';
import databaseService from './database.services';
import { UserRole } from '~/constants/enum';

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
      databaseService.conversations.countDocuments($match),
      databaseService.conversations.updateMany(
        {
          sender_id: new ObjectId(receiver_id),
          receiver_id: new ObjectId(sender_id)
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

  // Lấy một tin nhắn
  async getConversation(conversation_id: string) {
    const conversation = await databaseService.conversations
      .aggregate([
        {
          $match: {
            _id: new ObjectId(conversation_id)
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
        }
      ])
      .toArray();
    return conversation[0];
  }

  // Lấy danh sách người mà mình đã nhắn tin
  async getReceivers({ user_id, role }: { user_id: string; role: UserRole }) {
    const _role = role === UserRole.Admin ? UserRole.Customer : UserRole.Admin;
    const receivers = await databaseService.users
      .aggregate([
        {
          $match: {
            role: _role
          }
        },
        {
          $lookup: {
            from: 'conversations',
            localField: '_id',
            foreignField: 'sender_id',
            as: 'messages_send'
          }
        },
        {
          $lookup: {
            from: 'conversations',
            localField: '_id',
            foreignField: 'receiver_id',
            as: 'messages_receive'
          }
        },
        {
          $addFields: {
            messages_send_to_you: {
              $filter: {
                input: '$messages_send',
                as: 'item',
                cond: {
                  $eq: ['$$item.receiver_id', new ObjectId(user_id)]
                }
              }
            },
            messages_receive_from_you: {
              $filter: {
                input: '$messages_receive',
                as: 'item',
                cond: {
                  $eq: ['$$item.sender_id', new ObjectId(user_id)]
                }
              }
            }
          }
        },
        {
          $addFields: {
            messages_send_to_you_but_unread: {
              $filter: {
                input: '$messages_send_to_you',
                as: 'item',
                cond: {
                  $eq: ['$$item.is_read', false]
                }
              }
            }
          }
        },
        {
          $addFields: {
            unread_count: {
              $size: '$messages_send_to_you_but_unread'
            },
            messages_send_and_receive_with_you: {
              $concatArrays: ['$messages_send_to_you', '$messages_receive_from_you']
            }
          }
        },
        {
          $unwind: {
            path: '$messages_send_and_receive_with_you'
          }
        },
        {
          $sort: {
            messages_send_and_receive_with_you: -1
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
              $first: '$messages_send_and_receive_with_you'
            }
          }
        },
        {
          $project: {
            'last_message.sender_id': 0,
            'last_message.receiver_id': 0,
            'last_message.is_read': 0
          }
        },
        {
          $sort: {
            'last_message.created_at': -1
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
