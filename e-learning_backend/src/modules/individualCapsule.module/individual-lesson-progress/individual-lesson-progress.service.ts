import { StatusCodes } from 'http-status-codes';
import { LessonProgress } from './individual-lesson-progress.model';
import { ILessonProgress } from './individual-lesson-progress.interface';
import { GenericService } from '../../_generic-module/generic.services';

export class IndividualLessonProgressService extends GenericService<
  typeof LessonProgress,
  ILessonProgress
> {
  constructor() {
    super(LessonProgress);
  }
}
