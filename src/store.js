import { createStore } from 'vuex';
import autobahn from 'autobahn-browser';
import CommonMethods from './CommonMethods';

const wampConn = new autobahn.Connection({
  url:'wss://api.outlawdesigns.io:9700/ws',
  realm:'realm1'
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
  playedSongs:[],
  unplayedSongs:[],
  playsAndAdditions:[],
  statsByColumn:[],
  firstTimeAndAll:[]
};

const actions = {
  subscribeToPlayedSongs({commit}){
    wampConn.session.subscribe('io.outlawdesigns.loe.song.played',(args)=>{
      commit('updateSongLists',args);
    });
  },
  getPlayedSongs({commit},period){
    commit('clearPlayedSongs');
    wampConn.session.call('io.outlawdesigns.loe.music.rpt_PlayedSong_ToDate',[period]).then((queryResponse)=>{
      //apply some error checking about wamp response (maybe not registered) or sql query
      queryResponse[0].map((s)=>{
        commit('addPlayedSong',s);
      });
    }).catch((err)=>{
      console.log('wamp error caught...', err);
    });
  },
  getUnplayedSongs({commit}){
    commit('clearUnplayedSongs');
    wampConn.session.call('io.outlawdesigns.loe.music.rpt_PlayedSong_Unplayed').then((queryResponse)=>{
      queryResponse[0].map((s)=>{
        commit('addUnplayedSong',s);
      });
    }).catch((err)=>{
      //how to bubble up to component?
      console.log('wamp error caught...', err);
    });
  },
  getPlaysAndAdditions({commit},period){
    wampConn.session.call('io.outlawdesigns.loe.music.rpt_PlayedSong_PlaysAndAdditionsToDate',[period]).then((queryResponse)=>{
      commit('clearPlaysAndAdditions');
      queryResponse[0].map((e)=>{
        commit('addPlaysAndAdditions',e);
      });
    }).catch((err)=>{
      console.log('wamp error caught...', err);
    });
  },
  getStatsByColumn({commit},payload){
    wampConn.session.call('io.outlawdesigns.loe.music.rpt_PlayedSong_StatsByColumnToDate',payload).then((queryResponse)=>{
      commit('clearStatsByColumn');
      queryResponse[0].map((e)=>{
        commit('addStatsByColumn',e);
      });
    }).catch((err)=>{
      console.log('store error caught...', err);
    });
  },
  getFirstTimePlays({commit},period){
    wampConn.session.call('io.outlawdesigns.loe.music.rpt_PlayedSong_FirstTimeAndAllToDate',[period]).then((queryResponse)=>{
      queryResponse[0].map((e)=>{
        commit('setFirstTimePlays',e);
      });
    }).catch((err)=>{
      console.log('store error caught...', err);
    });
  }
};

const mutations = {
  addPlayedSong(state,s){
    state.playedSongs.push(s);
  },
  clearPlayedSongs(state){
    state.playedSongs = [];
  },
  addUnplayedSong(state,s){
    state.unplayedSongs.push(s);
  },
  clearUnplayedSongs(state){
    state.unplayedSongs = [];
  },
  clearPlaysAndAdditions(state){
    state.playsAndAdditions = [];
  },
  addPlaysAndAdditions(state,payload){
    state.playsAndAdditions.push(payload);
  },
  clearStatsByColumn(state){
    state.statsByColumn = [];
  },
  addStatsByColumn(state,payload){
    state.statsByColumn.push(payload);
  },
  setFirstTimePlays(state,payload){
    state.firstTimeAndAll = [];
    state.firstTimeAndAll.push(payload);
  },
  updateSongLists(state,payload){
    let playedObj = payload[0];
    let songObj = payload[1];
    let removalIndex = state.unplayedSongs.findIndex( e => e.UID == playedObj.songId);
    state.unplayedSongs.splice(removalIndex,1);
    state.playedSongs.unshift({
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
  }
};

export default createStore({state,actions,mutations});
