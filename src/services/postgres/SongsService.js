const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const { SongModel } = require("../../utils");
const NotFoundError = require("../../exceptions/NotFoundError");

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({ title, year, performer, genre, duration, albumId }) {
    const id = `song-${nanoid(16)}`;

    const result = await this._pool.query({
      text: "INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id",
      values: [id, title, year, performer, genre, duration, albumId],
    });

    if (!result.rows[0].id) {
      throw new InvariantError("Lagu gagal ditambahkan");
    }

    return result.rows[0].id;
  }

  async getSongs(title, performer) {
    let query = "SELECT id, title, performer FROM songs";
    if (title && performer) {
      query +=
        " WHERE LOWER(title) LIKE LOWER($1) AND LOWER(performer) LIKE LOWER($2)";
      const result = await this._pool.query(query, [
        `%${title}%`,
        `%${performer}%`,
      ]);
      return result.rows;
    }

    if (title) {
      query += " WHERE LOWER(title) LIKE LOWER($1)";
      const result = await this._pool.query(query, [`%${title}%`]);
      return result.rows;
    }

    if (performer) {
      query += " WHERE LOWER(performer) LIKE LOWER($1)";
      const result = await this._pool.query(query, [`%${performer}%`]);
      return result.rows;
    }

    const result = await this._pool.query(query);
    return result.rows;
  }

  async getSongById(id) {
    const result = await this._pool.query({
      text: "SELECT * FROM songs WHERE id = $1",
      values: [id],
    });

    if (!result.rowCount) {
      throw new NotFoundError("Lagu tidak ditemukan");
    }

    return result.rows.map(SongModel)[0];
  }

  async editSongById(id, { title, year, performer, genre, duration, albumId }) {
    const result = await this._pool.query({
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, "albumId" = $6 WHERE id = $7 RETURNING id',
      values: [title, year, performer, genre, duration, albumId, id],
    });

    if (!result.rowCount) {
      throw new NotFoundError("Gagal memperbarui lagu. Id tidak ditemukan");
    }
  }

  async deleteSongById(id) {
    const result = await this._pool.query({
      text: "DELETE FROM songs WHERE id = $1 RETURNING id",
      values: [id],
    });

    if (!result.rowCount) {
      throw new NotFoundError("Lagu gagal dihapus. Id tidak ditemukan");
    }
  }
}

module.exports = SongsService;
