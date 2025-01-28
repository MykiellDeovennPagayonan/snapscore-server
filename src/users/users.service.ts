import { Injectable } from '@nestjs/common';
import { prisma } from '../prisma';

@Injectable()
export class UsersService {
  async getAllUsers() {
    return prisma.user.findMany();
  }

  async getUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async createUser(data: { email: string }) {
    return prisma.user.create({
      data,
    });
  }

  async updateUser(
    id: string,
    data: { fullName?: string; email?: string; password?: string },
  ) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async deleteUser(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }
}
