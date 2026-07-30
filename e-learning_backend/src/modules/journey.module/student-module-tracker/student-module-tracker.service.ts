import { StatusCodes } from 'http-status-codes';
import { StudentModuleTracker } from './student-module-tracker.model';
import { IStudentModuleTracker } from './student-module-tracker.interface';
import { GenericService } from '../../_generic-module/generic.services';


export class StudentModuleTrackerService extends GenericService<
  typeof StudentModuleTracker,
  IStudentModuleTracker
> {
  constructor() {
    super(StudentModuleTracker);
  }
}
