import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";

describe("AppController (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply same pipes as main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    app.setGlobalPrefix("api/v1", {
      exclude: ["/"],
    });

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("/ (GET) - should return API information", () => {
    return request(app.getHttpServer())
      .get("/")
      .expect(200)
      .expect((res) => {
        // Response is wrapped by TransformInterceptor
        expect(res.body).toHaveProperty("success", true);
        expect(res.body).toHaveProperty("data");
        expect(res.body.data).toHaveProperty("name", "Stacks Academy API");
        expect(res.body.data).toHaveProperty("version");
        expect(res.body.data).toHaveProperty("status", "operational");
        expect(res.body.data).toHaveProperty("endpoints");
      });
  });

  it("/api/v1/courses (GET) - should return courses list", () => {
    return request(app.getHttpServer()).get("/api/v1/courses").expect(200);
  });
});
