import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import pick from '../../../shared/pick';
import { PostServices } from './post.service';
import { IPaginationOptions, IPostFilters } from './post.interface';

const createPost = catchAsync(async (req: Request, res: Response) => {
  const result = await PostServices.createPost(req.user, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Post created successfully',
    data: result,
  });
});

const getAllPosts = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ['searchTerm', 'type', 'bloodGroup', 'division', 'district', 'upazila']) as IPostFilters;
  const options = pick(req.query, ['page', 'limit', 'sortBy', 'sortOrder']) as IPaginationOptions;

  const result = await PostServices.getAllPosts(filters, options);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Posts retrieved successfully',
    meta: result.meta,
    data: result.data,
  });
});

const getSinglePost = catchAsync(async (req: Request, res: Response) => {
  const result = await PostServices.getSinglePost(req.params.id as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post retrieved successfully',
    data: result,
  });
});

const updatePost = catchAsync(async (req: Request, res: Response) => {
  const result = await PostServices.updatePost(req.params.id as string, req.user, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post updated successfully',
    data: result,
  });
});

const deletePost = catchAsync(async (req: Request, res: Response) => {
  const result = await PostServices.deletePost(req.params.id as string, req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post deleted successfully',
    data: result,
  });
});

const resolvePost = catchAsync(async (req: Request, res: Response) => {
  const result = await PostServices.resolvePost(req.params.id as string, req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post resolved successfully',
    data: result,
  });
});

const approvePost = catchAsync(async (req: Request, res: Response) => {
  const result = await PostServices.approvePost(req.params.id as string, req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post approved successfully',
    data: result,
  });
});

export const PostControllers = {
  createPost,
  getAllPosts,
  getSinglePost,
  updatePost,
  deletePost,
  resolvePost,
  approvePost,
};
