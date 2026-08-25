import { ActivityTypeResponseDto } from '../dto/activity-type-response.dto';

export type ActivityGate = {
  isComplete: boolean;
  completedTypes: ActivityTypeResponseDto[];
  missingTypes: ActivityTypeResponseDto[];
};

export const buildActivityGate = (
  requiredTypes: ActivityTypeResponseDto[],
  completedTypeIds: Iterable<string>,
): ActivityGate => {
  const completed = new Set(completedTypeIds);
  const ordered = [...requiredTypes].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.code.localeCompare(b.code),
  );

  return {
    isComplete: ordered.every((type) => completed.has(type.id)),
    completedTypes: ordered.filter((type) => completed.has(type.id)),
    missingTypes: ordered.filter((type) => !completed.has(type.id)),
  };
};

export const sortActivitiesByType = <
  T extends { activityType?: { sortOrder: number; code?: string } },
>(
  activities: T[],
): T[] =>
  [...activities].sort((a, b) => {
    const orderDiff =
      (a.activityType?.sortOrder ?? 99) - (b.activityType?.sortOrder ?? 99);
    if (orderDiff !== 0) {
      return orderDiff;
    }
    return (a.activityType?.code ?? '').localeCompare(b.activityType?.code ?? '');
  });
