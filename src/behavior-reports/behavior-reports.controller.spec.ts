import { Test, TestingModule } from '@nestjs/testing';
import { BehaviorReportsController } from './behavior-reports.controller';
import { BehaviorReportsService } from './behavior-reports.service';

describe('BehaviorReportsController', () => {
  let controller: BehaviorReportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BehaviorReportsController],
      providers: [
        {
          provide: BehaviorReportsService,
          useValue: {
            findByActivity: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BehaviorReportsController>(
      BehaviorReportsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
