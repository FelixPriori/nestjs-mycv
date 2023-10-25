import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>
  const user = {email: 'asdf@asdf.com', password: 'laskdjf', id: Math.floor(Math.random() * 100000)} as User

  beforeEach(async () => {
    const users: User[] = [user]
    fakeUsersService = {
      findOne: (id: number) => {
        const foundUser = users.find(u => u.id === id);
        return Promise.resolve(foundUser)
      },
      // remove: () => {},
      // update: () => {},
      find: (email: string) => {
        const filteredUsers = users.filter(u=> u.email === email);
        return Promise.resolve(filteredUsers);
      },
    };

    fakeAuthService = {
      // signup: () => {},
      signin: (email: string, password: string) => {
        return Promise.resolve(user)
      }
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService
        },
        {
          provide: AuthService,
          useValue: fakeAuthService
        },
      ]
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should create an instance of the controller', () => expect(controller).toBeDefined());

  it('findAllUsers returns a list of users with the given email', async () => {
    const users = await controller.findAllUsers(user.email);
    expect(users.length).toEqual(1)
    expect(users[0].email).toEqual(user.email)
  });

  it('findUser returns a single user with the given id', async () => {
    const foundUser = await controller.findUser(user.id.toString());
    expect(foundUser).toBeDefined()
  });

  it('findUser throws an error if user with given id is not found', async () => {
    await expect(controller.findUser('1')).rejects.toThrow(NotFoundException);
  });

  it('signin updates session object and returns user', async () => {
    const session = { userId: -1 };
    await controller.signin({email: user.email, password: user.password}, session);

    expect(session.userId).toEqual(user.id);
  });
});
