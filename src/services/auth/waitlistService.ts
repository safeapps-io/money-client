import { request } from '@/services/request';

export enum Prizes {
  disc30 = 30,
  disc50 = 50,
  disc90 = 90,
}

export class WaitlistService {
  private static prefix = '/waitlist/';

  static signup(data: { email: string; invite?: string }) {
    return request({
      method: 'POST',
      path: `${this.prefix}signup`,
      data,
    });
  }

  static validateEmail(emailToken: string) {
    return request<{ encryptedUserId: string; alreadyVerified: boolean }>({
      method: 'POST',
      path: `${this.prefix}validateEmail/${emailToken}`,
    });
  }

  static stats(encryptedUserId: string) {
    return request<{ prizes: Prizes[]; currentInviteCount: number; inviteLink: string }>({
      method: 'GET',
      path: `${this.prefix}stats/${encryptedUserId}`,
    });
  }
}
