import { ObjectId } from 'mongodb';

import { NotificationType } from '~/constants/enum';
import { NOTIFICATIONS_MESSAGES } from '~/constants/messages';
import { PaginationRequestQuery } from '~/models/requests/Common.requests';
import Notification from '~/models/schemas/Notification.schema';
import databaseService from './database.services';

class NotificationsService {
  // Lấy danh sách thông báo
  async getNotifications({ user_id, page, limit }: { user_id: string } & PaginationRequestQuery) {
    // Phân trang
    const _page = Number(page) || 1;
    const _limit = Number(limit) || 10;
    const [notifications, total, unread_total] = await Promise.all([
      databaseService.notifications
        .aggregate<Notification>([
          {
            $match: {
              receiver_id: new ObjectId(user_id)
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
            $group: {
              _id: '$_id',
              type: {
                $first: '$type'
              },
              title: {
                $first: '$title'
              },
              content: {
                $first: '$content'
              },
              is_read: {
                $first: '$is_read'
              },
              path: {
                $first: '$path'
              },
              sender: {
                $first: '$sender'
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
              'sender.addresses': 0,
              'sender.date_of_birth': 0,
              'sender.email_verify_token': 0,
              'sender.forgot_password_token': 0,
              'sender.created_at': 0,
              'sender.updated_at': 0
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
      databaseService.notifications.countDocuments({ receiver_id: new ObjectId(user_id) }),
      databaseService.notifications.countDocuments({ receiver_id: new ObjectId(user_id), is_read: false })
    ]);
    return {
      message: NOTIFICATIONS_MESSAGES.GET_NOTIFICATION_LIST_SUCCEED,
      data: {
        unread_count: unread_total,
        notifications,
        pagination: {
          page: _page,
          limit: _limit,
          total: total,
          page_size: Math.ceil(total / _limit)
        }
      }
    };
  }

  // Xóa thông báo
  async deleteNotifications({ notification_id, user_id }: { notification_id?: string; user_id: string }) {
    if (!notification_id) {
      await databaseService.notifications.deleteMany({
        receiver_id: new ObjectId(user_id)
      });
    } else {
      await databaseService.notifications.deleteOne({
        _id: new ObjectId(notification_id),
        receiver_id: new ObjectId(user_id)
      });
    }
    return {
      message: NOTIFICATIONS_MESSAGES.DELETE_NOTIFICATION_SUCCEED
    };
  }

  // Đánh dấu đã đọc
  async readNotifications({ notification_id, user_id }: { notification_id?: string; user_id: string }) {
    if (!notification_id) {
      await databaseService.notifications.updateMany(
        {
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
      );
    } else {
      await databaseService.notifications.updateOne(
        {
          _id: new ObjectId(notification_id),
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
      );
    }
    return {
      message: NOTIFICATIONS_MESSAGES.MARK_AS_READ_NOTIFICATION_SUCCEED
    };
  }
}

const notificationsService = new NotificationsService();
export default notificationsService;
