import { model, Schema } from 'mongoose';
import { IIndividualModule, IIndividualModuleModel } from './individual-module.interface';
import paginate from '../../../common/plugins/paginate';
import toJSON from '../../../common/plugins/toJSON';

const IndividualModuleSchema = new Schema<IIndividualModule>(
  {
    title: {
      type: String,
      required: [true, 'title is required'],
    },
    numberOfLessons: {
      type: Number,
      required: [true, 'numberOfLessons is required'],
      min: [0, 'numberOfLessons cannot be negative'],
    },
    estimatedTime: {
      type: String,
      required: [true, 'estimatedTime is required'],
    },
    thumbnail: {
      type: String,
      required: [false, 'thumbnail is not required'],
    },
    capsuleId: {
      type: Schema.Types.ObjectId,
      ref: 'IndividualCapsule',
      required: [true, 'capsuleId is required'],
    },
    orderNumber: {
      type: Number,
      required: [true, 'orderNumber is required'],
    },
    isDeleted: {
      type: Boolean,
      required: [false, 'isDeleted is not required'],
      default: false,
    },
  },
  { timestamps: true, versionKey: false },
);

IndividualModuleSchema.plugin(paginate);
IndividualModuleSchema.plugin(toJSON);

export const IndividualModule = model<
  IIndividualModule,
  IIndividualModuleModel
>('IndividualModule', IndividualModuleSchema);
