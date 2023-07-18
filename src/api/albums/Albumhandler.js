const autoBind = require("auto-bind");
const ClientError = require("../../exceptions/ClientError");
class AlbumHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    autoBind(this);
  }

  async postAlbumHandler(request, h) {
    try {
      const { name = "name", year } = request.payload;
      const albumId = await this._service.addAlbum({ name, year });
      const response = h.response({
        status: "success",
        message: "Album berhasil ditambahkan",
        data: {
          albumId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      const response = h.response({
        status: "fail",
        message: error.message,
      });
      response.code(400);
      console.error(response);
      return response;
    }
  }

  async getAlbumsHandler(h) {
    try {
      const albums = await this._service.getAlbums();
      const response = h.response({
        status: "success",
        data: {
          albums,
        },
      });
      response.code(200);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      } else {
        const response = h.response({
          status: "error",
          message: "Maaf, terjadi kegagalan pada server kami.",
        });
        response.code(500);
        console.error(error);
        return response;
      }
    }
  }

  async getAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const album = await this._service.getAlbumById(id);

      if (!album) {
        const response = h.response({
          status: "fail",
          message: "Album tidak ditemukan",
        });
        response.code(404);
        return response;
      }

      const songs = await this._service.getSongsByAlbumId(id); // Menambahkan pemanggilan method getSongsByAlbumId

      const response = h.response({
        status: "success",
        data: {
          album: {
            id: album.id,
            name: album.name,
            year: album.year,
            songs: songs.map((song) => ({
              id: song.id,
              title: song.title,
              performer: song.performer,
            })), // Menggunakan variabel songs yang berisi daftar lagu
          },
        },
      });
      response.code(200);
      return response;
    } catch (error) {
      const response = h.response({
        status: "error",
        message: "Maaf, terjadi kegagalan pada server kami.",
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async putAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const { name, year } = request.payload;

      if (typeof year !== "number") {
        const response = h
          .response({
            status: "fail",
            message: "Maaf, payload album tidak valid",
          })
          .code(400);
        return response;
      }

      await this._service.editAlbumById(id, { name, year });

      return {
        status: "success",
        message: "Album berhasil diperbarui",
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h
          .response({
            status: "fail",
            message: "Maaf, perubahan gagal",
          })
          .code(error.statusCode);
        return response;
      }
      const response = h
        .response({
          status: "fail",
          message: "Maaf, terjadi kegagalan pada server kami",
        })
        .code(500);
      return response;
    }
  }

  async deleteAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this._service.deleteAlbumById(id);
      return {
        status: "success",
        message: "Album berhasil dihapus",
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }
    }
    const response = h.response({
      status: "fail",
      message: "Maaf, terjadi kegagalan pada server kami",
    });
    response.code(500);
    return response;
  }
}

module.exports = AlbumHandler;
