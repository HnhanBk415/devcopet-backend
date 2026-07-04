import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';
import { UsersService } from '../../users/users.service';

@Injectable()
export class PasswordResetService {
  private readonly genericForgotMessage =
    'If an account can be reset, answer your pet name to continue.';
  private readonly genericInvalidMessage = 'Invalid reset information';

  constructor(private readonly usersService: UsersService) {}

  sendResetCode(email: string) {
    void email;
    return { message: this.genericForgotMessage, resetRequiresPetName: true };
  }

  async resetPassword(
    email: string,
    petName: string,
    newPassword: string,
    confirmPassword?: string,
  ) {
    if (confirmPassword !== undefined && confirmPassword !== newPassword) {
      throw new BadRequestException('Password confirmation does not match');
    }

    const user = await this.findUserForPetNameReset(email, petName);
    const passwordHash = await bcryptjs.hash(newPassword, 10);
    await this.usersService.updatePasswordHash(String(user._id), passwordHash);

    return { message: 'Password reset successfully' };
  }

  private async findUserForPetNameReset(email: string, petName: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPetName = this.normalizePetName(petName);
    const user = await this.usersService.findByEmail(normalizedEmail);

    if (
      !user?.authProviders?.includes('local') ||
      !user.passwordHash ||
      user.petProfileInitialized !== true ||
      !user.petName ||
      this.normalizePetName(user.petName) !== normalizedPetName
    ) {
      throw new BadRequestException(this.genericInvalidMessage);
    }

    return user;
  }

  private normalizePetName(value: string): string {
    return value.trim().replace(/\s+/g, ' ').toLowerCase();
  }
}
