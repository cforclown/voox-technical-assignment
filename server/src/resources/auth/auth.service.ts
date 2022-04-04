import { sign, verify } from 'jsonwebtoken';
import { AccessToken, LoginPayload } from '.';
import { Role, RolesService, User, UsersService } from '..';
import { Environment } from '../../common';

export class AuthService {
  usersService: UsersService;
  rolesService: RolesService;

  constructor ({ usersService, rolesService }: { usersService: UsersService, rolesService: RolesService; }) {
    this.usersService = usersService;
    this.rolesService = rolesService;
  }

  async getUser (userId: string): Promise<User> {
    return this.usersService.get(userId, true);
  }

  async authenticate (payload: LoginPayload): Promise<User> {
    return this.usersService.authenticate(payload);
  }

  async login (payload: LoginPayload): Promise<AccessToken> {
    return this.generateAccessToken(await this.usersService.authenticate(payload));
  }

  async verify (user: User): Promise<AccessToken> {
    return this.generateAccessToken(user);
  }

  async refresh (refreshToken: string): Promise<AccessToken> {
    return this.generateAccessToken(await this.verifyRefreshToken(refreshToken));
  }

  generateAccessToken (user: User): AccessToken {
    const expiresIn = Environment.getAccessTokenExpIn();
    const accessToken = sign(user, Environment.getAccessTokenSecret(), { expiresIn });
    const refreshToken = sign(user, Environment.getRefreshTokenSecret(), {
      expiresIn: Environment.getAccessRefreshTokenExpIn()
    });

    user.role = {
      _id: (user.role as Role)._id,
      name: (user.role as Role).name,
      desc: (user.role as Role).desc
    };

    return {
      user,
      accessToken,
      refreshToken,
      expiresIn
    };
  }

  async verifyToken (token: string): Promise<User> {
    return this.usersService.get((verify(token, Environment.getAccessTokenSecret()) as User)._id);
  }

  async verifyRefreshToken (token: string): Promise<User> {
    const tokenData = verify(token, Environment.getRefreshTokenSecret());
    return this.usersService.get((tokenData as User)._id, true);
  }
}
