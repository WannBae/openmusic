const SongModel = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  albumId,
});

const AlbumModel = ({ id, name, year }) => ({ id, name, year });

module.exports = { SongModel, AlbumModel };
