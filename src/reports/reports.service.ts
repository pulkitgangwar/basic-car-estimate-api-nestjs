import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { CreateReportDto } from './dto/createReport.dto';
import { GetEstimateDto } from './dto/getEstimate.dto';
import { Report } from './report.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report) private reportsRepo: Repository<Report>,
  ) {}

  async getEstimate({ make, model, lng, lat, year, mileage }: GetEstimateDto) {
    return this.reportsRepo
      .createQueryBuilder()
      .select('AVG(price)', 'price')
      .where('make = :make', { make })
      .andWhere('model = :model', { model })
      .andWhere('lng - :lng BETWEEN -5 AND 5', { lng })
      .andWhere('lat - :lat BETWEEN -5 AND 5', { lat })
      .andWhere('year - :year BETWEEN -3 AND 3 ', { year })
      .orderBy('ABS(mileage - :mileage)', 'DESC')
      .setParameters({ mileage })
      .limit(3)
      .getRawOne();
  }

  getAll() {
    return this.reportsRepo.find();
  }

  findOne(id: number) {}

  findReportsByUser(userId: number) {
    return this.reportsRepo.find({ where: { user: { id: userId } } });
  }

  createReport(report: CreateReportDto, user: User) {
    const newReport = this.reportsRepo.create({
      lat: report.lat,
      lng: report.lng,
      make: report.make,
      model: report.model,
      mileage: report.mileage,
      price: report.price,
      year: report.year,
      user,
    });

    return this.reportsRepo.save(newReport);
  }

  async changeApproval(reportId: number, approved: boolean) {
    const report = await this.reportsRepo.findOne({ where: { id: reportId } });
    if (!report) throw new NotFoundException('report not found');

    report.approved = approved;

    return this.reportsRepo.save(report);
  }
}
