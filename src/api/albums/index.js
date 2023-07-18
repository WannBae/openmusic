const AlbumHandler = require("./Albumhandler");
const routes = require("./Albumroutes");

module.exports = {
  name: "albums",
  version: "1.0.0",
  register: async (server, { service, validator }) => {
    const albumhandler = new AlbumHandler(service, validator);
    server.route(routes(albumhandler));
  },
};
