import { ParamsDictionary } from 'express-serve-static-core';

// Thêm 1 đánh giá mới
export interface AddReviewRequestBody {
  rating: number;
  comment?: string;
  parent_id?: string;
  images?: string[];
}

export interface ReviewIdRequestParams extends ParamsDictionary {
  review_id: string;
}
