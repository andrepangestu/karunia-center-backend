import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getFirstTest(): string {
    return 'Backend karunia Center!';
  }
}
