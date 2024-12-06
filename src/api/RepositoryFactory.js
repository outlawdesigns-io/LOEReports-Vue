//import AuthRepository from './AuthRepository';
import SongRepository from './SongRepository';

const repositories = {
  //authorization:AuthRepository,
  song:SongRepository
};

export const RepositoryFactory = {
  get: name=>repositories[name]
}
