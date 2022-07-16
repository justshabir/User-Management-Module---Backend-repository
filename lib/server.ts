import app, { PORT } from './config/app';
import http from 'http';
http.createServer(app).listen(PORT, () => console.log(`Express server listening on port ${PORT}`));
