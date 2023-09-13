import { ObjectId, WithId } from 'mongodb';

import { USERS_MESSAGES } from '~/constants/messages';
import { AddAddressRequestBody, UpdateAddressRequestBody } from '~/models/requests/Address.requests';
import Address from '~/models/schemas/Address.schema';
import User from '~/models/schemas/User.schema';
import databaseService from './database.services';

class AddressesService {
  // Thêm địa chỉ nhận hàng
  async addAddress({ payload, user_id }: { payload: AddAddressRequestBody; user_id: string }) {
    const user = await databaseService.users.findOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        projection: {
          _id: 0,
          addresses: 1
        }
      }
    );
    const addresses = (user as WithId<User>).addresses;
    const is_default = addresses.length <= 0 ? true : false;
    const { insertedId } = await databaseService.addresses.insertOne(
      new Address({
        ...payload,
        is_default
      })
    );
    await databaseService.users.findOneAndUpdate(
      {
        _id: new ObjectId(user_id)
      },
      {
        $push: {
          addresses: insertedId
        },
        $currentDate: {
          updated_at: true
        }
      }
    );
    return {
      message: USERS_MESSAGES.ADD_ADDRESS_SUCCEED
    };
  }

  // Lấy danh sách tất cả địa chỉ của người dùng
  async getAddresses(user_id: string) {
    const addresses = await databaseService.users
      .aggregate([
        {
          $match: {
            _id: new ObjectId(user_id)
          }
        },
        {
          $lookup: {
            from: 'addresses',
            localField: 'addresses',
            foreignField: '_id',
            as: 'addresses'
          }
        },
        {
          $unwind: {
            path: '$addresses'
          }
        },
        {
          $replaceRoot: {
            newRoot: '$addresses'
          }
        },
        {
          $sort: {
            created_at: -1
          }
        }
      ])
      .toArray();
    return {
      message: USERS_MESSAGES.GET_ADDRESSES_SUCCEED,
      data: {
        addresses
      }
    };
  }

  // Lấy thông tin địa chỉ nhận hàng
  async getAddress(address_id: string) {
    const address = await databaseService.addresses.findOne({
      _id: new ObjectId(address_id)
    });
    return {
      message: USERS_MESSAGES.GET_ADDRESS_SUCCEED,
      data: {
        address
      }
    };
  }

  // Cập nhật địa chỉ nhận hàng
  async updateAddress({ payload, address_id }: { payload: UpdateAddressRequestBody; address_id: string }) {
    const { value: updated_address } = await databaseService.addresses.findOneAndUpdate(
      {
        _id: new ObjectId(address_id)
      },
      {
        $set: payload,
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after'
      }
    );
    return {
      message: USERS_MESSAGES.UPDATE_ADDRESS_SUCCEED,
      data: {
        address: updated_address
      }
    };
  }

  // Xóa địa chỉ nhận hàng
  async deleteAddress(address_id: string) {
    await Promise.all([
      databaseService.addresses.deleteOne({
        _id: new ObjectId(address_id)
      }),
      databaseService.users.updateOne(
        {
          addresses: new ObjectId(address_id)
        },
        {
          $pull: {
            addresses: new ObjectId(address_id)
          },
          $currentDate: {
            updated_at: true
          }
        }
      )
    ]);
    return {
      message: USERS_MESSAGES.DELETE_ADDRESS_SUCCEED
    };
  }

  // Đặt địa chỉ thành mặc định
  async setDefaultAddress(address_id: string) {
    // Tìm ra user có địa chỉ cần đặt làm mặc định
    const user = await databaseService.users.findOne({
      addresses: new ObjectId(address_id)
    });
    // Tìm ra danh sách địa chỉ hiện tại của user
    const addresses = (user as WithId<User>).addresses;
    await Promise.all([
      databaseService.addresses.updateOne(
        {
          is_default: true,
          _id: {
            $ne: new ObjectId(address_id),
            $in: addresses
          }
        },
        {
          $set: {
            is_default: false
          },
          $currentDate: {
            updated_at: true
          }
        }
      ),
      databaseService.addresses.updateOne(
        {
          _id: new ObjectId(address_id)
        },
        {
          $set: {
            is_default: true
          },
          $currentDate: {
            updated_at: true
          }
        }
      )
    ]);
    return {
      message: USERS_MESSAGES.SET_DEFAULT_ADDRESS_SUCCEED
    };
  }
}

const addressesService = new AddressesService();
export default addressesService;
