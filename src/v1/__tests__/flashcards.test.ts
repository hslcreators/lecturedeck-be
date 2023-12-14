import app from '../../app'
import request from 'supertest'
// for the token that is here replace with your own created user.
// i could i have used a beforeEach and then logged in but this is much simpler.
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMDUzNzAwOC05OGI0LTQxNzctYTQyNy03ZGVkZjg5YmIxOGEiLCJpYXQiOjE3MDI1NDI4NjgsImV4cCI6MTcwMjk3NDg2OH0.3oYF0sFBAUu1-X4ekKfJEqGb3aCU_nqMcy7xHgEBBQ4'
describe('Testing POST/api/v1/flashcards/manual-create', () => {
  // it should return status  201 and send flashcard data with correct color code.
  it('should return status 201 and send flashcard data with correct color code', async () => {
    const response = await request(app)
      .post('/api/v1/flashcards/manual-create')
      .set('x-auth-token', `Bearer ${token}`)
      .send({
        question: 'who is the founder of apple?',
        answer: 'Steve Jobs',
        topicId: '7b1028a0-45b0-4bea-9e1f-f4c09df6827e'
      })
      .expect(201)
    expect(response.body).toHaveProperty('flashcard')
    expect(response.body.flashcard).toHaveProperty(
      'question',
      'who is the founder of apple?'
    )
    expect(response.body.flashcard).toHaveProperty('answer', 'Steve Jobs')
    expect(response.body.flashcard).toHaveProperty('topicId', '7b1028a0-45b0-4bea-9e1f-f4c09df6827e')
    expect(response.body.flashcard).toHaveProperty('rating', 'NEUTRAL')
  })
  // it should return  status 401 when i send wrong data.
  it('should return status 401 when incorrect data is sent', async () => {
    await request(app)
      .post('/api/v1/flashcards/manual-create')
      .set('x-auth-token', `Bearer ${token}`)
      .send({
        question: 12345,
        answer: null,
        topicId: true
      })
      .expect(400)
  })
  // it should return status 404 when  the topicId i pass does not exist.
  it('should return status 404 when the topicId does not exist', async () => {
    await request(app)
      .post('/api/v1/flashcards/manual-create')
      .set('x-auth-token', `Bearer ${token}`)
      .send({
        question: 'Sample Question',
        answer: 'Sample Answer',
        topicId: 'j2i3d3h839fdu482b2k'
      })
      .expect(404)
  })
  // it should return status 404 when i don't own the topic.
  it("should return status 404 when the user doesn't own the topic", async () => {
    await request(app)
      .post('/api/v1/flashcards/manual-create')
      .set('x-auth-token', `Bearer ${token}`)
      .send({
        question: 'Sample Question',
        answer: 'Sample Answer',
        topicId: ''
      })
      .expect(404)
  })
})

 describe('Testing DELETE/api/v1/flashcards/:flashcardId', () => {
  // it should return status 202 and return the flashcardId.
  it('should return status 202 and return the flashcardId', async () => {
    const validFlashcardId = '444417f8-7e76-4f0e-ace9-74407665732f'
    const response = await request(app)
      .delete(`/api/v1/flashcards/${validFlashcardId}`)
      .set('x-auth-token', `Bearer ${token}`)
      .expect(202)
    expect(response.body).toHaveProperty('flashcardId', validFlashcardId)
    expect(response.body).toHaveProperty('status', 'success')
  })
  // it should return status 401 when i don't own the topic.
  it('should return status 401 when the user does not own the flashcard', async () => {
    const flashcardId = 'klor;fg;rote'

    await request(app)
      .delete(`/api/v1/flashcards/${flashcardId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(401)
  })
  // it should return status 404 when the flashcard cannot be found.
  it('should return status 404 when the flashcard cannot be found', async () => {
    const FlashcardId = 'jklrgtopyklby;'

    await request(app)
      .delete(`/api/v1/flashcards/${FlashcardId}`)
      .set('x-auth-token', `Bearer ${token}`)
      .expect(404)
  })

})

 describe('Testing PATCH/api/v1/flashcards/:flashcardId', () => {
  const flashcardId = 'a48310b2-628b-4198-964e-d11d47006b55'
  // it should return status 200  with the old data if i don't pass anything in the body.
  it("it should return status 200  with the old data if i don't pass anything in the body.", async () => {
    const response = await request(app)
      .patch(`/api/v1/flashcards/${flashcardId}`)
      .set('x-auth-token', `Bearer ${token}`)
      .expect(200)
    expect(response.body.flashcards).toHaveProperty('question')
    expect(response.body.flashcards).toHaveProperty('answer')
    expect(response.body.flashcards).toHaveProperty('updatedAt')
  })
  // it should return status 200  with the updated data.
  it('it should return status 200  with the updated data.', async () => {
    const response = await request(app)
      .patch(`/api/v1/flashcards/${flashcardId}`)
      .set('x-auth-token', `Bearer ${token}`)
      .send({
        question: 'Who is the Ceo of apple?',
        answer: 'Tim Cook'
      })
      .expect(200)
    expect(response.body.flashcards).toHaveProperty('question', 'Who is the Ceo of apple?')
    expect(response.body.flashcards).toHaveProperty('answer', 'Tim Cook')
  })
  // it should return status 200 when i pass in data that is wrongly formatted.
  // why 200 because if you pass nonsense the old data still remains
  it('it should return status 200 when i pass in data that is wrongly formatted.', async () => {
    await request(app)
      .patch(`/api/v1/flashcards/${flashcardId}`)
      .set('x-auth-token', `Bearer ${token}`)
      .send({
        question: 1234,
        answer: true
      })
      .expect(200)
  })
}) 
 
describe('Testing PATCH/api/v1/flashcards/:flashcardId/rating', () => {
  const flashcardId = 'a48310b2-628b-4198-964e-d11d47006b55'
  // it should return status 200 when i pass in the right rating.
  it('it should return status 200 when i pass in the right rating.', async () => {
    const response = await request(app)
      .patch(`/api/v1/flashcards/${flashcardId}/rating`)
      .set('x-auth-token', `Bearer ${token}`)
      .send({
        rating: 'GOOD'
      })
      .expect(200)
    expect(response.body).toHaveProperty('rating', 'GOOD')
  })
  // it should  return status 200 when i pass in the right rating but in a different case.
  it('it should  return status 200 when i pass in the right rating but in a different case.', async () => {
    const response = await request(app)
      .patch(`/api/v1/flashcards/${flashcardId}/rating`)
      .set('x-auth-token', `Bearer ${token}`)
      .send({
        rating: 'Bad'
      })
      .expect(200)
    expect(response.body).toHaveProperty('rating', 'BAD')
  })
  // it should return status 401 when i pass in the wrong rating
  it('it should return status 401 when i pass in the wrong rating', async () => {
    await request(app)
      .patch(`/api/v1/flashcards/${flashcardId}/rating`)
      .set('x-auth-token',`Bearer ${token}`)
      .send({
        rating: 'EASY'
      })
      .expect(400)
  })
})
