import { StatusCodes } from 'http-status-codes';
import { IndividualLesson } from './individual-lesson.model';
import { IIndividualLesson } from './individual-lesson.interface';
import { GenericService } from '../../_generic-module/generic.services';
import { deleteFileFromDisk } from '../../../helpers/fileDeleteHelper';
import mongoose from 'mongoose';


export class IndividualLessonService extends GenericService<
  typeof IndividualLesson,
  IIndividualLesson
> {
  constructor() {
    super(IndividualLesson);
  }

  async deleteLesson(
    lessonId: string,
    session?: mongoose.ClientSession
  ) {
    const lesson = await IndividualLesson.findById(lessonId);
    if (lesson?.lessonVideo?.url) {
      deleteFileFromDisk(lesson.lessonVideo.url);
    }

    await IndividualLesson.findByIdAndDelete(
      lessonId,
      session ? { session } : {}
    );
  }
}
