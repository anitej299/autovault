import { beforeEach, afterAll, describe, it, expect } from 'vitest';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { app } from '../src/app.js';
const db = new PrismaClient();
const credentials = {email:'driver@example.com',password:'SecurePass123!'};
beforeEach(async()=>{await db.purchase.deleteMany();await db.vehicle.deleteMany();await db.user.deleteMany();});
afterAll(()=>db.$disconnect());
describe('authentication',()=>{
 it('registers normalized email, hashes password, and never exposes hash',async()=>{const r=await request(app).post('/api/auth/register').send({...credentials,email:' DRIVER@EXAMPLE.COM '});expect(r.status).toBe(201);expect(r.body.user.email).toBe(credentials.email);expect(r.body.user.role).toBe('USER');expect(r.body.user.passwordHash).toBeUndefined();expect(r.body.token).toBeTypeOf('string');expect((await db.user.findUniqueOrThrow({where:{email:credentials.email}})).passwordHash).not.toBe(credentials.password);});
 it('rejects duplicate email',async()=>{await request(app).post('/api/auth/register').send(credentials);expect((await request(app).post('/api/auth/register').send(credentials)).status).toBe(409);});
 it.each([{...credentials,password:'weak'},{...credentials,role:'ADMIN'},{...credentials,email:'bad'}])('rejects unsafe registration %j',async body=>{expect((await request(app).post('/api/auth/register').send(body)).status).toBe(400);});
 it('logs in successfully',async()=>{await request(app).post('/api/auth/register').send(credentials);const r=await request(app).post('/api/auth/login').send(credentials);expect(r.status).toBe(200);expect(r.body.token).toBeTruthy();expect(r.body.user.passwordHash).toBeUndefined();});
 it('uses identical errors for missing user and incorrect password',async()=>{await request(app).post('/api/auth/register').send(credentials);const a=await request(app).post('/api/auth/login').send({...credentials,password:'WrongPass123!'});const b=await request(app).post('/api/auth/login').send({...credentials,email:'missing@example.com'});expect(a.status).toBe(401);expect(b.status).toBe(401);expect(a.body).toEqual(b.body);});
});
