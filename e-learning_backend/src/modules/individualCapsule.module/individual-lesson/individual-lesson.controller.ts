import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { GenericController } from '../../_generic-module/generic.controller';
import { IndividualLesson } from './individual-lesson.model';
import { IIndividualLesson } from './individual-lesson.interface';
import { IndividualLessonService } from './individual-lesson.service';

export class IndividualLessonController extends GenericController<
  typeof IndividualLesson,
  IIndividualLesson
> {
  IndividualLessonService = new IndividualLessonService();

  constructor() {
    super(new IndividualLessonService(), 'IndividualLesson');
  }

  // add more methods here if needed or override the existing ones 
}
