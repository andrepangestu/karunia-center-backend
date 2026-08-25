import { Test, TestingModule } from '@nestjs/testing';
import { ActivityTypesController } from './activity-types.controller';
import { ActivityTypesService } from './activity-types.service';

describe('ActivityTypesController', () => {
  let controller: ActivityTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivityTypesController],
      providers: [
        {
          provide: ActivityTypesService,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ActivityTypesController>(ActivityTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
