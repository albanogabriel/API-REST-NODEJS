import { app } from "./app"
import { env } from "./env"

app
  .listen({
    port: env.PORT,
    host: "0.0.0.0", // Isso permitirá que o servidor escute conexões externas
  })
  .then(() => {
    console.log("HTTTP Server Running")
  })
