declare namespace NodeJS {
    interface ProcessEnv {
      JWT_SECRET: string;
      FRONTEND_URL: string;
      RESEND_API_KEY: string;
      DATABASE_URL: string;
    }
  }