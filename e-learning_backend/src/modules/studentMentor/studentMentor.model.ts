//@ts-ignore
import { model, Schema } from 'mongoose';
import { IStudentMentor, IStudentMentorModel } from './studentMentor.interface';
import paginate from '../../common/plugins/paginate';


const StudentMentorSchema = new Schema<IStudentMentor>(
  {
    mentorId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'mentorId is required'],
    },
    studentId: { //🔗
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'studentId is required'],
    },

    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true }
);

StudentMentorSchema.plugin(paginate);

// Use transform to rename _id to _projectId
StudentMentorSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    (ret as any)._StudentMentorId = ret._id;
    delete (ret as any)._id;
    return ret;
  },
});

export const StudentMentor = model<
  IStudentMentor,
  IStudentMentorModel
>('StudentMentor', StudentMentorSchema) as any;
