import app from './app.js';
import { ENV } from './config/env.js';

const PORT = ENV.PORT;

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Server Laundry NFC aktif di port: ${PORT}`);
  console.log(`🌍 Mode: ${ENV.NODE_ENV}`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`===============================================`);
});
