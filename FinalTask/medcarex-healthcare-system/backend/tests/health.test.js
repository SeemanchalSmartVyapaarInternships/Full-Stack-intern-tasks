const request = require("supertest");
const app = require("../src/app");

describe("MedCareX health endpoint", () => {
  it("returns service health", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe("healthy");
  });
});
