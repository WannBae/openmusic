require("dotenv").config();
const Hapi = require("@hapi/hapi");
const songs = require("./api/songs");
const albums = require("./api/albums");
const SongsService = require("./services/postgres/SongsService");
const AlbumsService = require("./services/postgres/AlbumService");
const { AlbumsValidator, SongsValidator } = require("./validator/songs");
const ClientError = require("./exceptions/ClientError");

const init = async () => {
  const songsService = new SongsService();
  const albumsService = new AlbumsService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  await server.register([
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
  ]);

  server.ext("onPreResponse", (request, h) => {
    const { response } = request;
    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const new_Response = h.response({
          status: "fail",
          message: response.message,
        });
        new_Response.code(response.statusCode);
        return new_Response;
      }
      if (!response.isServer) {
        return h.continue;
      }
      const new_Response = h.response({
        status: "error",
        message: "Server mengalami error",
      });
      new_Response.code(500);
      return new_Response;
    }
    return h.continue;
  });
  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
