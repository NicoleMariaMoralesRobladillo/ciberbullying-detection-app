const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: "https://b3e2-34-126-191-125.ngrok-free.app",
  },
});
