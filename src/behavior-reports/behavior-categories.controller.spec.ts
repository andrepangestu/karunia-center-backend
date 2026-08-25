import { Test, TestingModule } from '@nestjs/testing';
import { BehaviorCategoriesController } from './behavior-categories.controller';
import { BehaviorCategoriesService } from './behavior-categories.service';

describe('BehaviorCategoriesController', () => {
  let controller: BehaviorCategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BehaviorCategoriesController],
      providers: [
        {
          provide: BehaviorCategoriesService,
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

    controller = module.get<BehaviorCategoriesController>(
      BehaviorCategoriesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
