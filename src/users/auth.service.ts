import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(email: string, password: string) {
    //   check email exists
    const user = await this.usersService.find(email);

    if (user.length) {
      throw new BadRequestException('user already exists');
    }

    // generate hash for password
    const salt = randomBytes(8).toString('hex');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    const hashedPassword = `${salt}.${hash.toString('hex')}`;

    // create new user
    const newUser = this.usersService.create({
      email,
      password: hashedPassword,
    });

    // return the user
    return newUser;
  }

  async signin(email: string, password: string) {
    //   check user exists

    const [user] = await this.usersService.find(email);

    if (!user) {
      throw new NotFoundException('no user found');
    }

    // compare passwords
    const [salt, storedHash] = user.password.split('.');

    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (hash.toString('hex') !== storedHash) {
      throw new BadRequestException('invalid credentials');
    }

    //  cookie

    // return the user
    return user;
  }
}
