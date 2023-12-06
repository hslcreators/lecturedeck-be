import app from '../../app'
import request from 'supertest'
import { expect } from 'expect'

describe('Testing POST/api/v1/auth/register', () => {
  it('should return status code 201 and send user data back on success', async () => {
    const data = {
      email: 'codepivotng@gmail.com',
      username: 'codepivot',
      password: 'codepivotpassword'
    }
    const response = await request(app).post('/api/v1/auth/register').send(data)

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('user')
    expect(response.body).toHaveProperty('token')
    expect(response.body.message).toBe('Successfully created the user.')
  })

  it('should return an error for wrong user input', async () => {
    const data = {
      email: 'notanemail',
      username: 'a',
      password: 'b'
    }
    const response = await request(app).post('/api/v1/auth/register').send(data)
    expect(response.status).toBe(400)
  })

  it('should return an error for duplicate email or username', async () => {
    const data = {
      email: 'codepivotng@gmail.com',
      username: 'codepivot',
      password: 'codepivotpassword'
    }
    const response = await request(app).post('/api/v1/auth/register').send(data)
    expect(response.status).toBe(500)
  })
})

describe('Testing POST/api/v1/auth/login', () => {
  it('should return status code 201 and send user data back on success', async () => {
    const data = {
      email: 'codepivotng@gmail.com',
      password: 'codepivotpassword'
    }

    const response = await request(app).post('/api/v1/auth/login').send(data)

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('user')
    expect(response.body).toHaveProperty('token')
    expect(response.body.message).toBe('Successfully logged in user.')
  })

  it('should return an error if user not found', async () => {
    const data = {
      email: 'notauser',
      password: 'notauserpassword'
    }

    const response = await request(app).post('/api/v1/auth/login').send(data)
    expect(response.status).toBe(401)
    expect(response.body.message).toBe('User could not be authorized')
  })

  it('should return an error if password is wrong', async () => {
    const data = {
      email: 'codepivotng@gmail.com',
      password: 'wrongpassword'
    }

    const response = await request(app).post('/api/v1/auth/login').send(data)
    expect(response.status).toBe(500)
  })
})

// E2E Testing will be done for the following routes:
// /api/v1/auth/password-reset
// /api/v1/auth/password-reset/:userId/:token


