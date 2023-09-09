import { Server as HttpServer } from 'http';
import { ObjectId } from 'mongodb';
import { Server } from 'socket.io';

import { ENV_CONFIG } from '~/constants/config';
import { NotificationType, UserVerifyStatus } from '~/constants/enum';
import HTTP_STATUS from '~/constants/httpStatus';
import { USERS_MESSAGES } from '~/constants/messages';
import { verifyAccessToken } from '~/middlewares/common.middlewares';
import { ErrorWithStatus } from '~/models/Errors';
import { TokenPayload } from '~/models/requests/User.requests';
import Conversation from '~/models/schemas/Conversation.schema';
import Notification from '~/models/schemas/Notification.schema';
import conversationsService from '~/services/conversations.services';
import databaseService from '~/services/database.services';
import notificationsService from '~/services/notifications.services';

const initSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: ENV_CONFIG.CLIENT_URL
    }
  });

  // Socket users
  const users: {
    [key: string]: {
      socket_id: string;
    };
  } = {};

  // Socket middleware
  io.use(async (socket, next) => {
    const { Authorization } = socket.handshake.auth;
    const access_token = Authorization.split(' ')[1];
    try {
      const decoded_authorization = await verifyAccessToken(access_token);
      const { verify } = decoded_authorization as TokenPayload;
      if (verify === UserVerifyStatus.Unverified) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.USER_IS_UNVERIFIED,
          status: HTTP_STATUS.FORBIDDEN
        });
      }
      socket.handshake.auth.decoded_authorization = decoded_authorization;
      socket.handshake.auth.access_token = access_token;
      next();
    } catch (error) {
      next({
        message: 'Unauthorized',
        name: 'UnauthorizedError',
        data: error
      });
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.id} connected`);

    const { user_id } = socket.handshake.auth.decoded_authorization as TokenPayload;
    if (user_id) {
      users[user_id] = {
        socket_id: socket.id
      };
    }

    // Có đánh giá mới
    socket.on('send_product_review', async (data) => {
      const { title, content, path, sender_id, receiver_id } = data;
      // Thêm thông báo vào database
      const { insertedId } = await databaseService.notifications.insertOne(
        new Notification({
          type: NotificationType.NewReview,
          title,
          content,
          path,
          sender_id: new ObjectId(sender_id),
          receiver_id: new ObjectId(receiver_id),
          is_read: false
        })
      );
      const new_notification = await notificationsService.getNotification(insertedId);
      // Hiển thị đánh giá mới ngay lập tức cho mọi người
      socket.broadcast.emit('receive_product_review');
      // Gửi thông báo đến người nhận
      if (!(receiver_id in users)) return;
      const receiver_socket_id = users[receiver_id].socket_id;
      socket.to(receiver_socket_id).emit('receive_notification', new_notification);
    });

    // Xóa đánh giá cũ
    socket.on('delete_product_review', () => {
      // Cập nhật lại danh sách đánh giá cho mọi người
      socket.broadcast.emit('receive_product_review');
    });

    // Có tin nhắn mới
    socket.on('send_message', async (data) => {
      const { content, sender_id, receiver_id } = data;
      // Thêm thông báo vào database
      const { insertedId } = await databaseService.conversations.insertOne(
        new Conversation({
          content,
          sender_id: new ObjectId(sender_id),
          receiver_id: new ObjectId(receiver_id),
          is_read: false
        })
      );
      const new_conversation = await conversationsService.getConversation(insertedId);
      // Gửi tin nhắn mới đến người nhận nếu người nhận đang online ở client
      if (!(sender_id in users) || !(receiver_id in users)) return;
      const sender_socket_id = users[sender_id].socket_id;
      const receiver_socket_id = users[receiver_id].socket_id;
      socket.to(sender_socket_id).to(receiver_socket_id).emit('receive_message', new_conversation);
    });

    socket.on('disconnect', () => {
      delete users[user_id];
      console.log(`User ${socket.id} disconnected`);
      console.log('Users connected: ', users);
    });

    console.log('Users connected: ', users);
  });
};

export default initSocket;
