import app from "./app";
import { env } from "./config/env";

app.listen(env.port, () => {
  console.log(`Server e mlaku dek http://localhost:${env.port}`);
});
