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

  async createUser(data: {
    email: string;
    firebaseId: string;
    fullName: string;
  }) {
    return prisma.user.create({
      data,
    });
  }

  async getUserByFirebaseId(firebaseId: string) {
    return prisma.user.findUnique({
      where: { firebaseId },
    });
  }

  async updateUser(id: string, data: { fullName: string }) {
    return await prisma.user.update({
      where: { id },
      data,
    });
  }

  async deleteUser(id: string) {
    return prisma.user.delete({
      where: { id },
    });
  }

  async doesEmailExist(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return !!user;
  }
}
