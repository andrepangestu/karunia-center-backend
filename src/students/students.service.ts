import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, QueryFailedError, Repository } from 'typeorm';
import {
  PaginatedResult,
  buildPaginationMeta,
} from '../common/dto/pagination-meta.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { QueryStudentsDto } from './dto/query-students.dto';
import { StudentResponseDto } from './dto/student-response.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from './entities/student.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
  ) {}

  async create(dto: CreateStudentDto): Promise<StudentResponseDto> {
    const nis = this.normalizeNis(dto.nis);
    await this.assertNisAvailable(nis);

    const student = this.studentsRepository.create({
      name: dto.name.trim(),
      nis,
      className: dto.class.trim(),
      address: dto.address?.trim() ?? null,
      description: dto.description?.trim() ?? null,
    });

    const saved = await this.saveSafely(student);
    return this.toResponse(saved);
  }

  async findAll(
    query: QueryStudentsDto,
  ): Promise<PaginatedResult<StudentResponseDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'DESC';
    const where: FindOptionsWhere<Student>[] = [];

    if (query.search?.trim()) {
      const term = `%${query.search.trim()}%`;
      where.push({ name: ILike(term) }, { nis: ILike(term) });
    }

    const classFilter = query.class?.trim();
    const [students, total] = await this.studentsRepository.findAndCount({
      where: where.length
        ? where.map((item) =>
            classFilter ? { ...item, className: classFilter } : item,
          )
        : classFilter
          ? { className: classFilter }
          : undefined,
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: students.map((student) => this.toResponse(student)),
      meta: buildPaginationMeta(page, limit, total),
    };
  }

  async findById(id: string): Promise<StudentResponseDto> {
    return this.toResponse(await this.getEntityById(id));
  }

  async getEntityById(id: string): Promise<Student> {
    const student = await this.studentsRepository.findOne({ where: { id } });
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    return student;
  }

  async update(id: string, dto: UpdateStudentDto): Promise<StudentResponseDto> {
    const student = await this.getEntityById(id);

    if (dto.nis !== undefined) {
      const nis = this.normalizeNis(dto.nis);
      await this.assertNisAvailable(nis, id);
      student.nis = nis;
    }
    if (dto.name !== undefined) {
      student.name = dto.name.trim();
    }
    if (dto.class !== undefined) {
      student.className = dto.class.trim();
    }
    if (dto.address !== undefined) {
      student.address = dto.address?.trim() ?? null;
    }
    if (dto.description !== undefined) {
      student.description = dto.description?.trim() ?? null;
    }

    const saved = await this.saveSafely(student);
    return this.toResponse(saved);
  }

  async remove(id: string): Promise<void> {
    const student = await this.getEntityById(id);

    try {
      await this.studentsRepository.remove(student);
    } catch (error) {
      this.rethrowConstraint(error);
    }
  }

  toResponse(student: Student): StudentResponseDto {
    return {
      id: student.id,
      name: student.name,
      nis: student.nis,
      class: student.className,
      address: student.address,
      description: student.description,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    };
  }

  private normalizeNis(nis: string): string {
    return nis.trim();
  }

  private async assertNisAvailable(
    nis: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.studentsRepository.findOne({ where: { nis } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException('NIS is already registered');
    }
  }

  private async saveSafely(student: Student): Promise<Student> {
    try {
      return await this.studentsRepository.save(student);
    } catch (error) {
      this.rethrowConstraint(error);
    }
  }

  private rethrowConstraint(error: unknown): never {
    if (error instanceof QueryFailedError) {
      const driverError = error.driverError as { code?: string };
      if (driverError?.code === '23505') {
        throw new ConflictException('NIS is already registered');
      }
      if (driverError?.code === '23503') {
        throw new ConflictException(
          'Student cannot be deleted because related records still exist',
        );
      }
    }
    throw error;
  }
}
