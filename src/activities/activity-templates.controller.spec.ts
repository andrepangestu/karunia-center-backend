import { Test, TestingModule } from '@nestjs/testing';
import { ActivityTemplatesController } from './activity-templates.controller';
import { ActivityTemplatesService } from './activity-templates.service';

describe('ActivityTemplatesController', () => {
  let controller: ActivityTemplatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityTemplatesController],
      providers: [
        {
          provide: ActivityTemplatesService,
          useValue: {
            findForm: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ActivityTemplatesController>(
      ActivityTemplatesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
