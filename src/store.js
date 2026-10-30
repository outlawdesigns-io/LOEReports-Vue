import { createStore } from 'vuex';
import autobahn from 'autobahn-browser';
import CommonMethods from './CommonMethods';
import { RepositoryFactory } from './api/RepositoryFactory';

const wampConn = new autobahn.Connection({
  url:'wss://wamprouter.example.com/ws',
  realm:'anonymous'
});
wampConn.onopen = (session) => {
  console.log('connected to wamp router!');
  // session.call('io.outlawdesigns.loe.music.rpt_PlayedSong_PlaysAndAdditionsToDate',['mtd']).then(console.log);
}

wampConn.onclose = (reason,details) => {
  console.error('WAMP connection closed:',reason, details);
}


wampConn.open();

const state = {
  Song:{
    songs:[],
    played:[],
    unplayed:[],
    rated:[],
    libraryConsumptionData:{
      percent_consumed:0,
      played:0,
      total:0
    }
  },
  playsAndAdditions:[]
};

const actions = {
  subscribeToPlayedSongs({commit}){
    return wampConn.session.subscribe('io.outlawdesigns.loe.song.played',(args)=>{
      commit('updateSongLists',args);
    }).catch((err)=>{
      return Promise.reject(err);
    });
  },
  getSongs({commit},payload){
    commit('clearSongs');
    return wampConn.session.call('io.outlawdesigns.loe.music.rpt_Song_ToDate',[payload.startDate,payload.endDate]).then((queryResponse)=>{
      queryResponse[0].map((s)=>{
        commit('addSong',s);
      });
    }).catch(err => Promise.reject(err));
  },
  getPlayedSongs({commit},payload){
    commit('clearPlayedSongs');
    return wampConn.session.call('io.outlawdesigns.loe.music.rpt_PlayedSong_ToDate',[payload.startDate,payload.endDate]).then((queryResponse)=>{
      queryResponse[0].map((s)=>{
        commit('addPlayedSong',s);
      });
    }).catch(err => Promise.reject(err));
  },
  getUnplayedSongs({commit}){
    commit('clearUnplayedSongs');
    return wampConn.session.call('io.outlawdesigns.loe.music.rpt_PlayedSong_Unplayed').then((queryResponse)=>{
      queryResponse[0].map((s)=>{
        commit('addUnplayedSong',s);
      });
    }).catch((err)=>{
      return Promise.reject(err);
    });
  },
  getSongPlaysAndAdditions({commit},payload){
    return wampConn.session.call('io.outlawdesigns.loe.music.rpt_PlayedSong_PlaysAndAdditionsToDate',[payload.startDate,payload.endDate]).then((queryResponse)=>{
      commit('clearPlaysAndAdditions');
      queryResponse[0].map((e)=>{
        commit('addPlaysAndAdditions',e);
      });
    }).catch((err)=>{
      return Promise.reject(err);
    });
  },
  getLibraryConsumptionData({commit},payload){
    return wampConn.session.call('io.outlawdesigns.loe.music.rpt_PlaySong_LibraryConsumedToDate',[payload.startDate,payload.endDate]).then((queryResponse)=>{
      commit('setLibraryConsumptionData',queryResponse[0][0]);
    }).catch(err => Promise.reject(err));
  },
  getSongRatings({commit}, payload){
    return wampConn.session.call('io.outlawdesigns.loe.music.rpt_RatedSong_ToDate',[payload.startDate, payload.endDate]).then((queryResponse)=>{
      commit('clearRatedSongs');
      queryResponse[0].map((s)=>{
        commit('addRatedSong',s);
      });
    }).catch(err => Promise.reject(err));
  }
};

const mutations = {
  addSong(state,s){
    state.Song.songs.push(s);
  },
  clearSongs(state){
    state.Song.songs = [];
  },
  addPlayedSong(state,s){
    state.Song.played.push(s);
  },
  clearPlayedSongs(state){
    state.Song.played = [];
  },
  addUnplayedSong(state,s){
    state.Song.unplayed.push(s);
  },
  clearUnplayedSongs(state){
    state.Song.unplayed = [];
  },
  clearPlaysAndAdditions(state){
    state.playsAndAdditions = [];
  },
  addPlaysAndAdditions(state,payload){
    state.playsAndAdditions.push(payload);
  },
  addRatedSong(state,s){
    state.Song.rated.push(s);
  },
  clearRatedSongs(state){
    state.Song.rated = [];
  },
  updateSongLists(state,payload){
    let playedObj = payload[0];
    let songObj = payload[1];
    let removalIndex = state.Song.unplayed.findIndex( e => e.UID == playedObj.songId);
    state.Song.unplayed.splice(removalIndex,1);
    state.Song.played.unshift({
      title:songObj.title,
      track_number:songObj.track_number,
      album:songObj.album,
      artist:songObj.artist,
      genre:songObj.genre,
      publisher:songObj.publisher,
      year:songObj.year,
      artist_country:songObj.artist_country,
      daysInLibrary:CommonMethods.daysInLibrary(playedObj.playDate,songObj.created_date),
      cover_path:songObj.cover_path,
      isFirstTimePlay: removalIndex == -1 ? 0:1
    });
    state.playsAndAdditions[state.playsAndAdditions.length - 1].play_events++;
    state.Song.libraryConsumptionData.played++;
    let newPercent = ((state.Song.libraryConsumptionData.played / state.Song.libraryConsumptionData.total) * 100).toFixed(2);
    console.log(newPercent);
    console.log(state.Song.libraryConsumptionData.percent_consumed);
    state.Song.libraryConsumptionData.percent_consumed = (newPercent == state.Song.libraryConsumptionData.percent_consumed) ? state.Song.libraryConsumptionData.percent_consumed:newPercent;
  },
  setLibraryConsumptionData(state,payload){
    state.Song.libraryConsumptionData.total = parseInt(payload.total) || 0;
    state.Song.libraryConsumptionData.played = parseInt(payload.played) || 0;
    state.Song.libraryConsumptionData.percent_consumed = parseFloat(payload.percent_consumed) || 0;
  }
};

export default createStore({state,actions,mutations});
