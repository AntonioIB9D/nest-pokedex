import {
  /* ArgumentMetadata, */
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

/* The ParseMongoIdPipe class is a TypeScript Injectable that transforms a string value into a valid
MongoId or throws a BadRequestException if the value is not valid. */
@Injectable()
export class ParseMongoIdPipe implements PipeTransform {
  transform(value: string /* , metadata: ArgumentMetadata */) {
    /* console.log({ value, metadata }); */
    if (!isValidObjectId(value)) {
      throw new BadRequestException(`${value} is not a valid MongoId`);
    }
    return value;
  }
}
