import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AdminGuard } from 'src/guards/admin.guard';
import { AuthGuard } from 'src/guards/auth.guard';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { CurrentUser } from 'src/users/decorators/currentUser.decorator';
import { User } from 'src/users/user.entity';
import { ApproveReportDto } from './dto/approveReport.dto';
import { CreateReportDto } from './dto/createReport.dto';
import { GetEstimateDto } from './dto/getEstimate.dto';
import { ReportDto } from './dto/report.dto';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('/estimate')
  getEstimate(@Query() query: GetEstimateDto) {
    return this.reportsService.getEstimate(query);
  }

  @Get('/')
  @UseGuards(AuthGuard)
  getReports() {
    return this.reportsService.getAll();
  }

  @Post('/create')
  @UseGuards(AuthGuard)
  @Serialize(ReportDto)
  createReport(
    @Body() body: CreateReportDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.reportsService.createReport(body, currentUser);
  }

  @Patch('/:id')
  @UseGuards(AuthGuard)
  @UseGuards(AdminGuard)
  updateReport(@Param('id') id: string, @Body() body: ApproveReportDto) {
    return this.reportsService.changeApproval(parseInt(id), body.approved);
  }
}
