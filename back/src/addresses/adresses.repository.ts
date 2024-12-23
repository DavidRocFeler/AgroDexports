import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateShippingAddressDto } from './updateShippingAddress.dto';
import { CreateShippingAddressDto } from './createShippingAddress.dto';
import { Prisma, ShippingAddress } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AddressesRepository {

    constructor(
        private readonly prisma: PrismaService,
        private readonly notificationService: NotificationsService
    ) {}

    async getAll(): Promise<ShippingAddress[]> {
        return this.prisma.shippingAddress.findMany({
          include: {
            company: true, 
          },
        });
      }
    
      async getWithFilters(filters: any[]): Promise<ShippingAddress[]> {
        return this.prisma.shippingAddress.findMany({
          where: {
            AND: filters,
          },
          include: {
            company: {
              include: {
                user: {
                  include: {
                    credential: {
                      select: {
                        email: true, 
                      },
                    },
                  },
                },
              },
            },
          },
        });
      }
      
    
      async findById(addressId: string) {
        const address = await this.prisma.shippingAddress.findUnique({
          where: { shipping_address_id: addressId },
          include: {
            company: {
              include: {
                user: {
                  select: {
                    user_id: true,
                  },
                },
              },
            },
          },
        });
      
        if (!address || !address.isActive) {
          throw new NotFoundException('Address not found');
        }
      
        const userId = address.company?.user?.user_id;
      
        return { ...address, userId };
      }
      

      async findByAddress(address: string) {
        const shippingAddress = await this.prisma.shippingAddress.findFirst({
            where: { address },
            include: {
              company: {
                select: {
                  company_name: true,
                },
              },
            },
          });
      
        return shippingAddress;
      }
      
      async updateAddressByCompanyId(companyId: string, addressData: UpdateShippingAddressDto) {
        const address = await this.findAddressByCompanyId(companyId);
        
        if (!address) {
            throw new NotFoundException('Address not found for the given company.');
        }
    
        const userId = address.company?.user?.user_id;
    
        if (!userId) {
            throw new NotFoundException('User not found for the given address.');
        }
    
        const updatedAddress = await this.prisma.shippingAddress.update({
            where: { shipping_address_id: address.shipping_address_id },
            data: addressData,
        });
    
        if (updatedAddress) {
            await this.notificationService.createAndNotifyUser(
                userId,
                'Your address has been updated.',
                'ShippingAddressUpdate'
            );
        }
    
        return updatedAddress;
    }
    
      

      async create(shippingAddressData: CreateShippingAddressDto): Promise<ShippingAddress> {
        const { company_id, ...addressData } = shippingAddressData; // Extraemos company_id del objeto
    
        const data: Prisma.ShippingAddressCreateInput = {
            ...addressData,
            isActive: true,
            company: {
                connect: { company_id } 
            }
        };
    
        return this.prisma.shippingAddress.create({ data });
    }
    
    

      async softDelete(addressId: string) {
        await this.findById(addressId);
    
        return this.prisma.shippingAddress.update({
          where: { shipping_address_id: addressId },
          data: { isActive: false },
        });
      }

      async findAddressByCompanyId(company_id: string): Promise<any | null> {
        if (!company_id) {
            throw new Error("Company ID is required");
        }
    
        const shippingAddress = await this.prisma.shippingAddress.findUnique({
            where: { company_id },
            include: {
                company: {
                    select: {
                        user: {
                            select: {
                                user_id: true,
                            },
                        },
                    },
                },
            },
        });
    
        return shippingAddress || null;
    }
    
    
}