import { ParamsDictionary } from 'express-serve-static-core';
import { AddressType } from '~/constants/enum';

export interface AddAddressRequestBody {
  province: string;
  district: string;
  ward: string;
  street: string;
  type: AddressType;
}

export interface GetAddressRequestParams extends ParamsDictionary {
  address_id: string;
}

export interface UpdateAddressRequestBody {
  province: string;
  district: string;
  ward: string;
  street: string;
  type: AddressType;
  is_default: boolean;
}

export interface UpdateAddressRequestParams extends ParamsDictionary {
  address_id: string;
}

export interface DeleteAddressRequestParams extends ParamsDictionary {
  address_id: string;
}

export interface SetDefaultAddressRequestParams extends ParamsDictionary {
  address_id: string;
}
