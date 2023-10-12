import { Server as HttpServer } from 'http';
import { ObjectId } from 'mongodb';
import { Server } from 'socket.io';

import { ENV_CONFIG } from '~/constants/config';
import { UserRole } from '~/constants/enum';
import { accessTokenValidator } from '~/middlewares/socket.middlewares';
import { TokenPayload } from '~/models/requests/User.requests';
import Message from '~/models/schemas/Message.schema';
import Notification from '~/models/schemas/Notification.schema';
import databaseService from '~/services/database.services';

const initSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: ENV_CONFIG.CLIENT_URL
    }
  });

  // Connnected users
  const users: {
    [key: string]: {
      socket_id: string;
    };
  } = {};

  // Middlewares
  io.use(accessTokenValidator);

  io.on('connection', (socket) => {
    console.log(`User ${socket.id} connected`);

    const { user_id } = socket.handshake.auth.decoded_authorization as TokenPayload;
    if (user_id) {
      users[user_id] = {
        socket_id: socket.id
      };
    }

    // Có tin nhắn mới
    socket.on('new_message', async (data) => {
      const { new_message } = data.payload;
      const { conversation_id, receiver_id, sender_id, content } = new_message;
      // Gửi tin nhắn mới đến người nhận nếu người nhận đang online
      if (receiver_id in users) {
        const receiver_socket_id = users[receiver_id].socket_id;
        socket.to(receiver_socket_id).emit('receive_message', {
          payload: {
            new_message: {
              ...new_message,
              is_sender: false
            }
          }
        });
      }
      // Thêm tin nhắn vào database
      await databaseService.messages.insertOne(
        new Message({
          conversation_id: new ObjectId(conversation_id),
          sender_id: new ObjectId(sender_id),
          receiver_id: new ObjectId(receiver_id),
          content,
          is_read: false
        })
      );
    });

    // Có thông báo mới
    socket.on('new_notification', async (data) => {
      const { new_notification } = data.payload;
      const { type, title, content, path, sender } = new_notification;
      const admins = await databaseService.users.find({ role: UserRole.Admin }, { projection: { _id: 1 } }).toArray();
      const admin_ids = admins.map((admin) => admin._id.toString());
      // Gửi thông báo đến người nhận (admin)
      const receiver_socket_ids = admin_ids
        .map((admin_id) => {
          const _admin_ids = admin_id.toString();
          if (!(_admin_ids in users)) return '';
          return users[_admin_ids].socket_id;
        })
        .filter((socket_id) => !!socket_id);
      socket.to(receiver_socket_ids).emit('receive_notification', {
        payload: {
          new_notification
        }
      });
      // Thêm thông báo vào database
      await Promise.all(
        admin_ids.map(
          async (admin_id) =>
            await databaseService.notifications.insertOne(
              new Notification({
                title,
                content,
                path,
                sender_id: new ObjectId(sender._id),
                receiver_id: new ObjectId(admin_id),
                is_read: false,
                type
              })
            )
        )
      );
    });

    // Ngắt kết nối
    socket.on('disconnect', () => {
      delete users[user_id];
      console.log(`User ${socket.id} disconnected`);
      console.log('Users connected: ', users);
    });

    console.log('Users connected: ', users);
  });
};

export default initSocket;
