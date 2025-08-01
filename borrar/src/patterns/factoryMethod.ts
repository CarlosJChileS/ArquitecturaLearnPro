export interface Course {
  getTitle(): string;
}

export class MathCourse implements Course {
  getTitle(): string {
    return 'Mathematics 101';
  }
}

export class ScienceCourse implements Course {
  getTitle(): string {
    return 'Basic Science';
  }
}

export abstract class CourseFactory {
  abstract createCourse(): Course;
}

export class MathCourseFactory extends CourseFactory {
  createCourse(): Course {
    return new MathCourse();
  }
}

export class ScienceCourseFactory extends CourseFactory {
  createCourse(): Course {
    return new ScienceCourse();
  }
}
