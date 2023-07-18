const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const { AlbumModel } = require("../../utils");
const NotFoundError = require("../../exceptions/NotFoundError");
const InvariantError = require("../../exceptions/InvariantError");

class AlbumServices {
  constructor() {
    this._pool = new Pool();
  }

  async addAlbum({ name, year }) {
    const id = nanoid(16);
    const query = {
      text: "INSERT INTO albums (id, name, year) VALUES ($1, $2, $3) RETURNING id",
      values: [id, name, year],
    };
    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError("Album gagal ditambahkan");
    }
    return result.rows[0].id;
  }

  async getAlbums() {
    const result = await this._pool.query("SELECT * FROM albums");
    return result.rows.map(AlbumModel);
  }

  async getSongsByAlbumId(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE "albumId" = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    return result.rows.map((row) => ({
      id: row.id,
      title: row.title,
      performer: row.performer,
    }));
  }

  async getAlbumById(id) {
    const query = {
      text: "SELECT * FROM albums WHERE id=$1",
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      return null;
    }
    return AlbumModel(result.rows[0]);
  }

  async editAlbumById(id, { name, year }) {
    const query = {
      text: "UPDATE albums SET name=$1, year=$2 WHERE id=$3 RETURNING id",
      values: [name, year, id],
    };
    const result = await this._pool.query(query);
    if (result.rows.length === 0) {
      throw new NotFoundError("Gagal memperbarui Album. Id tidak ditemukan");
    }
    return result;
  }

  async deleteAlbumById(id) {
    const query = {
      text: "DELETE FROM albums WHERE id=$1 RETURNING id",
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Gagal menghapus, id tidak ditemukan");
    }
  }
}

module.exports = AlbumServices;
