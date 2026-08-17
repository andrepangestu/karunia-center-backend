import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BehaviorReport } from './entities/behavior-report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BehaviorReport])],
  exports: [TypeOrmModule],
})
export class BehaviorReportsModule {}
