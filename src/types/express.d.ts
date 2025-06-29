import 'express';

import 'express';

declare module 'express' {
  export interface Request {
    file?: Express.Multer.File;
    files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
  }
}

/*
declare module 'express' {
  export interface Request {
    // If you're using a single file upload, use an object:
    file?: File;
    // If you are using multiple files:
    files?: File[] | { [fieldname: string]: File[] };
  }
}
*/
