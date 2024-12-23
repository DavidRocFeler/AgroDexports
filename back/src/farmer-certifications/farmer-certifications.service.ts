import { BadRequestException, Injectable } from '@nestjs/common';
import { FarmerCertificationRepository } from './farmer-certifications.repository'; 
import { CreateFarmerCertificationDto } from './farmer-certifications.dto';
import { CompanyProductsRepository } from '../company-products/company-products.repository';
import { CompanyRepository } from '../companies/companies.repository';
import { UpdateFarmerCertificationDto } from './update-farmer-certifications.dto';
import { OrderRepository } from 'src/orders/orders.repositiry';

@Injectable()
export class FarmerCertificationService {
    
    constructor(
        private readonly farmerCertificationRepository: FarmerCertificationRepository,
        private readonly companyProductsRepository: CompanyProductsRepository,
        private readonly companyRepository: CompanyRepository,
        private readonly orderReository: OrderRepository
    
    ) {}

    async createCertification(createFarmerCertificationDto: CreateFarmerCertificationDto) {
        const { company_id, company_product_ids, ...certificationData } = createFarmerCertificationDto;
        const company = await this.companyRepository.findById(company_id);
        const companyProduct = await this.companyProductsRepository.findProductsByIds(company_product_ids);

        if (companyProduct.length !== company_product_ids.length) {
            throw new BadRequestException('One or more product IDs are invalid');
        }

        const certification = await this.farmerCertificationRepository.create({
            company_id,
            ...certificationData,
            company_product_ids,
        });
    
        return certification;
    }

    async getCertificationsByFarmer(farmerId: string) {
        return await this.farmerCertificationRepository.findByFarmerId(farmerId);
    }

    async getFarmerByOrderIdService(orderId: string) {
        const order = await this.orderReository.getOrderByIdRepository(orderId);
        if(!order){
            throw new BadRequestException('The order does not exist');
        }
        return await this.farmerCertificationRepository.getFarmerByOrderIdRepository(orderId);
    }

    async updateCertification(farmerId: string, updateFarmerCertificationDto: UpdateFarmerCertificationDto) {
        return await this.farmerCertificationRepository.update(farmerId, updateFarmerCertificationDto);
    }

    async deleteCertification(farmerId: string) {
        return await this.farmerCertificationRepository.delete(farmerId);
    }
}
