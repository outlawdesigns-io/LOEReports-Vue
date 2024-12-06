import Repository from './Repository';

const baseDomain = 'https://api.outlawdesigns.io:9669';
const baseUrl = `${baseDomain}`
const song = '/song';
const played = '/playedSong';

export default{
  setDomain(){
    Repository.defaults.baseURL = baseUrl;
  },
  setAuthToken(auth_token){
    Repository.defaults.headers.get['auth_token'] = auth_token;
  },
  getSongs(){
    this.setDomain();
    return Repository.get(`${song}`);
  },
  getSong(songId){
    this.setDomain();
    return Repository.get(`${song}/${songId}`);
  }
}
