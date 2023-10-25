import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UsersService } from "./users.service";
import { User } from "./user.entity";

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>
  const user = {email: 'asdf@asdf.com', password: 'laskdjf'}
  
  beforeEach(async () => {
    // create fake copy of users service
    const users: User[] = []
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter(user => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const newUser = {email, password, id: Math.floor(Math.random() * 100000)} as User
        users.push(newUser);
        return Promise.resolve(newUser)
      }
    };
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();
  
    service = module.get(AuthService);
  })
  
  it('can create an instance of auth service', async () => expect(service).toBeDefined());

  it('can create a new user with salted and hashed password', async () => {
    const signedUpUser = await service.signup(user.email, user.password);
    expect(signedUpUser.password).not.toEqual(user.password);
    const [salt, hash] = signedUpUser.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });
  
  it('throws an error if user signs up with email that is in use', async () => {
    await service.signup(user.email, user.password);
    await expect(service.signup(user.email, user.password)).rejects.toThrow(BadRequestException);
  });

  it('throws an error if user signs in with an unused email', async () => {
    await expect(service.signin(user.email, user.password)).rejects.toThrow(NotFoundException);
  });

  it('throws an error if an invalid password is provided', async () => {
    await service.signup(user.email, user.password);
    await expect(service.signin(user.email, 'password')).rejects.toThrow(BadRequestException);
  });

  it('returns a user when correct password is provided', async () => {
    await service.signup(user.email, user.password);
    const signedInUser = await service.signin(user.email, user.password);
    expect(signedInUser).toBeDefined();
  })
})