import { join } from 'path';
import { StatusCodes } from 'http-status-codes';
import { createReadStream, existsSync, statSync } from 'fs';

import pick from '../../shared/pick';
import ApiError from '../../errors/ApiError';
import { Attachment } from './attachment.model';
import catchAsync from '../../shared/catchAsync';
import sendResponse from '../../shared/sendResponse';
import { AttachmentService } from './attachment.service';

const attachmentService = new AttachmentService();

const createAttachment = catchAsync(async (req, res) => {
  let attachments = [];

  if ((req as any).files && ((req as any).files as any).attachments) {
    const files = (req.files as any).attachments as Express.Multer.File[];
    attachments.push(
      ...(await Promise.all(
        files.map(async (file: Express.Multer.File) => {
          const attachmentId = await attachmentService.uploadSingleAttachment(
            file,
            'folderNameSuplify',
          );
          return attachmentId;
        }),
      )),
    );
  }

  const result = await attachmentService.create(req.body);

  sendResponse(res, {
    code: StatusCodes.OK,
    data: attachments,
    message: 'Attachment created successfully',
    success: true,
  });
});

const getAAttachment = catchAsync(async (req, res) => {
  const result = await attachmentService.getById(
    req.params.attachmentId as string,
  );
  sendResponse(res, {
    code: StatusCodes.OK,
    data: result,
    message: 'Project retrieved successfully',
    success: true,
  });
});

const getAllAttachment = catchAsync(async (req, res) => {
  const result = await attachmentService.getAll();
  sendResponse(res, {
    code: StatusCodes.OK,
    data: result,
    message: 'All projects',
    success: true,
  });
});

const getAllAttachmentWithPagination = catchAsync(async (req, res) => {
  const filters = pick(req.query, ['projectName', '_id']);
  const options = pick(req.query, ['sortBy', 'limit', 'page', 'populate']);

  const result = await attachmentService.getAllWithPagination(filters, options);

  sendResponse(res, {
    code: StatusCodes.OK,
    data: result,
    message: 'All projects with Pagination',
    success: true,
  });
});

const updateById = catchAsync(async (req, res) => {
  const result = await attachmentService.updateById(
    req.params.attachmentId as string,
    req.body,
  );
  sendResponse(res, {
    code: StatusCodes.OK,
    data: result,
    message: 'Project updated successfully',
    success: true,
  });
});

//[🚧][🧑‍💻✅][🧪🆗]

const deleteById = catchAsync(async (req, res) => {
  const id = req.params.attachmentId as string;

  const deletedObject = await Attachment.findByIdAndDelete(id).select('-__v');
  if (!deletedObject) {
    throw new ApiError(StatusCodes.NOT_FOUND, `Object with ID ${id} not found`);
  }
  //   return res.status(StatusCodes.NO_CONTENT).json({});
  sendResponse(res, {
    code: StatusCodes.OK,
    data: deletedObject,
    message: `Attachment deleted successfully`,
  });
});

const streamAttachment = catchAsync(async (req, res) => {
  const { attachmentId } = req.params;

  // Get attachment metadata
  const attachment = await attachmentService.getById(attachmentId as string);

  if (!attachment) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Attachment not found');
  }

  // Construct file path (assuming uploads folder in project root)
  const filePath = join(process.cwd(), attachment.attachment);

  // Check if file exists
  if (!existsSync(filePath)) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'File not found');
  }

  // Get file stats
  const stat = statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    // Handle range requests for video seeking
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0] as string, 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
      res.status(416).send('Requested range not satisfiable');
      return;
    }

    const chunksize = end - start + 1;
    const file = createReadStream(filePath, { start, end });

    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': attachment.mimeType || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    // Stream entire file
    const head = {
      'Content-Length': fileSize,
      'Content-Type': attachment.mimeType || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    };

    res.writeHead(200, head);
    createReadStream(filePath).pipe(res);
  }
});

export const AttachmentController = {
  createAttachment,
  getAllAttachment,
  getAllAttachmentWithPagination,
  getAAttachment,
  updateById,
  deleteById,
  streamAttachment,
};
