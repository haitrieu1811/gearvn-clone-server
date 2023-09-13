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
import conversationsService from '~/services/conversations.services';
import notificationsService from '~/services/notifications.services';
import userService from '~/services/users.services';

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
    socket.on('new_review', async (data) => {
      const { title, content, path, sender_id, receiver_id } = data;
      // Thêm thông báo vào database
      const new_notification = await notificationsService.addNotification({
        title,
        content,
        path,
        type: NotificationType.NewReview,
        sender_id: new ObjectId(sender_id),
        receiver_id: new ObjectId(receiver_id)
      });
      // Hiển thị đánh giá mới ngay lập tức cho mọi người
      socket.broadcast.emit('receive_product_review');
      // Gửi thông báo đến người nhận
      if (!(receiver_id in users)) return;
      const receiver_socket_id = users[receiver_id].socket_id;
      socket.to(receiver_socket_id).emit('receive_notification', {
        payload: {
          new_notification
        }
      });
    });

    // Có tin nhắn mới
    socket.on('new_message', async (data) => {
      const { content, sender_id, receiver_id } = data;
      // Thêm thông báo vào database
      const new_conversation = await conversationsService.addConversation({
        content,
        sender_id: new ObjectId(sender_id),
        receiver_id: new ObjectId(receiver_id)
      });
      // Gửi tin nhắn mới đến người nhận nếu người nhận đang online ở client
      if (!(receiver_id in users)) return;
      const receiver_socket_id = users[receiver_id].socket_id;
      socket.to(receiver_socket_id).emit('receive_message', new_conversation);
    });

    // Có đơn hàng mới
    socket.on('new_order', async (data) => {
      const { sender, content, title } = data.payload;
      // Thêm thông báo vào database
      const admin_ids = await userService.getAdminIds();
      const [new_notification] = await Promise.all(
        admin_ids.map(
          async (admin_id) =>
            await notificationsService.addNotification({
              title,
              content,
              type: NotificationType.NewOrder,
              sender_id: new ObjectId(sender._id),
              receiver_id: admin_id
            })
        )
      );
      // Gửi thông báo đến người nhận (admin)
      const receiver_socket_ids = admin_ids
        .map((admin_id) => {
          const _admin_id = admin_id.toString();
          if (!(_admin_id in users)) return '';
          return users[_admin_id].socket_id;
        })
        .filter((socket_id) => !!socket_id);
      socket.to(receiver_socket_ids).emit('receive_notification', {
        payload: {
          new_notification
        }
      });
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
