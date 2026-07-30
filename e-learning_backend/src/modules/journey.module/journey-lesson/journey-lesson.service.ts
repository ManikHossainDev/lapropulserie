import { JourneyLesson } from './journey-lesson.model';
import { IJourneyLesson } from './journey-lesson.interface';
import { GenericService } from '../../_generic-module/generic.services';
import { deleteFileFromDisk } from '../../../helpers/fileDeleteHelper';
import mongoose from 'mongoose';

export class JourneyLessonService extends GenericService<
  typeof JourneyLesson,
  IJourneyLesson
> {
  constructor() {
    super(JourneyLesson);
  }

  async deleteLesson(
    lessonId: string,
    session?: mongoose.ClientSession
  ) {
    const lesson = await JourneyLesson.findById(lessonId);
    if (lesson?.lessonVideo?.url) {
      deleteFileFromDisk(lesson.lessonVideo.url);
    }

    await JourneyLesson.findByIdAndDelete(
      lessonId,
      session ? { session } : {}
    );
  }
}
