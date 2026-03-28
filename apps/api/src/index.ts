import { config } from "./shared/config";
import { app } from "./app";

const port = config.port;
app.listen(port, () => {
  console.log(`API running on ${port}`);
});
