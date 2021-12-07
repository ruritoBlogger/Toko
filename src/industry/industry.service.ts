import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Industry } from 'src/entities/industry.entity'
import { Repository } from 'typeorm'

@Injectable()
export class IndustryService {
  constructor(
    @InjectRepository(Industry)
    private readonly industryRepository: Repository<Industry>,
  ) {}

  addIndustry(name: string) {
    const industry = new Industry(name)
    return this.industryRepository.insert(industry)
  }

  getIndustyList() {
    return this.industryRepository.find()
  }
}
