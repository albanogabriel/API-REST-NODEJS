import {
  it,
  expect,
  test,
  beforeAll,
  afterAll,
  describe,
  beforeEach,
} from "vitest"
import { execSync } from "node:child_process" // we can execute
import request from "supertest"
import { app } from "../src/app"

describe("Transactions Routes", () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync("npm run knex migrate:rollback -all")
    execSync("npm run knex migrate:latest")
  })

  it("User can create a new transaction", async () => {
    await request(app.server)
      .post("/transactions")
      .send({
        title: "New Transaction",
        amount: 5000,
        type: "credit",
      })
      .expect(201)
  })

  it("should be able to list all transactions", async () => {
    const createdTransactionResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "New transaction",
        amount: 5000,
        type: "credit",
      })

    const cookies = createdTransactionResponse.get("Set-Cookie")
    // console.log(cookies)

    const listTransactionsResponse = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookies!)
      .expect(200)

    console.log(listTransactionsResponse.body)

    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: "New transaction",
        amount: 5000,
      }),
    ])
  })

  it("should be able to get specific transaction", async () => {
    const createdTransactionResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "New transaction",
        amount: 5000,
        type: "credit",
      })

    const cookies = createdTransactionResponse.get("Set-Cookie")

    const listTransactionsResponse = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookies!)
      .expect(200)

    const transactionId = listTransactionsResponse.body.transactions[0].id

    const getTransactionsResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set("Cookie", cookies!)
      .expect(200)

    expect(getTransactionsResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: "New transaction",
        amount: 5000,
      })
    )
  })

  it("should be able to get the summary", async () => {
    const createdTransactionResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "Credit transaction",
        amount: 5000,
        type: "credit",
      })

    const cookies = createdTransactionResponse.get("Set-Cookie")

    await request(app.server)
      .post("/transactions")
      .set("Cookie", cookies!)
      .send({
        title: "Debit transaction",
        amount: 3000,
        type: "debit",
      })

    const summaryResponse = await request(app.server)
      .get("/transactions/summary")
      .set("Cookie", cookies!)
      .expect(200)

    expect(summaryResponse.body.summary).toEqual({
      amount: 2000,
    })
  })
})
